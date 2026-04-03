import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import cron from 'node-cron';
import { poolPromise, sql } from './db.js';

// --- ROUTER IMPORTS ---
import employeeAccountsRouter from './routes/user.routes.js';
import StudentAccountRouter from './routes/StudentAccount.js';
import EnrollmentRouter from './routes/enrollment.js';
import SectionRouter from './routes/sections.js';
import AttendanceRouter from './routes/attendance.js';
import AdminStudentAccount from './routes/AdminStudentAccount.js';
import AdminTeacherAccount from './routes/AdminTeacherAccount.js';
import SearchStudentInformation from './routes/search.js';
import AddEmployee from './routes/AddEmployee.js';
import SchdeleMaker from './routes/schedule.js';
import AdvisoryRouter from './routes/advisory.js';
import teacherRouter from './routes/teacher.js';
import gradesRouter from './routes/grades.js';
import OnboardingStudents from './routes/registration.js';
import StudentRouter from './routes/student.js';
import Archivestudent from './routes/archivestudent.js';
import passwordRoutes from './routes/StudentChangePass.js';
import SystemLogs from './routes/systemlog.js';
import AcademicYearDisplay from './routes/academicYear.js';
import { error } from 'console';

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// --- AUDIT LOGGER (System Trail) ---
const auditLogger = async (req, res, next) => {
    const monitoredMethods = ['POST', 'PUT', 'DELETE'];
    if (monitoredMethods.includes(req.method)) {
        res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const user = req.user?.name || req.headers['x-user-name'] || 'System User';
                    const role = req.user?.role || req.headers['x-user-role'] || 'Staff';
                    const endpoint = req.originalUrl.split('/').pop();
                    const activityLabels = {
                        'archive-students': 'Archived Student Records',
                        'restore-students': 'Restored Student Records',
                        'change-password': 'Updated User Password',
                        'Login': 'Logged into the System',
                        'enroll': 'Processed New Enrollment',
                        'promote-individual': 'Manually Promoted Student',
                        'publish': 'Publish New Academic Year'
                    };
                    const action = activityLabels[endpoint] || `Modified ${endpoint}`;
                    const finalActivity = `${user} (${role}): ${action}`;

                    const pool = await poolPromise;
                    await pool.request()
                        .input('activity', finalActivity)
                        .input('userType', role)
                        .input('performer', user)
                        .query(`INSERT INTO SystemLogs (Activity, UserType, PerformedBy, Timestamp) 
                                VALUES (@activity, @userType, @performer, GETDATE())`);
                } catch (err) {
                    console.error("Audit Logger Error:", err.message);
                }
            }
        });
    }
    next();
};
app.use(auditLogger);

app.get('/api/system-logs', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT TOP 15
                    Activity,
                    UserType,
                    PerformedBy,
                    Timestamp
                FROM SystemLogs
                ORDER BY Timestamp DESC    
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Fetch Logs Error:", err.message);
        res.status(500).json({error: "Failed to Fetch system Logs"});
    }
});

// --- API ROUTES ---
app.use('/api/employee-accounts', employeeAccountsRouter);
app.use('/api/student-account', StudentAccountRouter);
app.use('/api/enroll', EnrollmentRouter);
app.use('/api/sections', SectionRouter);
app.use('/api/attendance', AttendanceRouter);
app.use('/api/admin', AdminStudentAccount);
app.use('/api/subadmin', AdminTeacherAccount);
app.use('/api/add-employee', AddEmployee);
app.use('/api/schedule', SchdeleMaker);
app.use('/api/advisory', AdvisoryRouter);
app.use('/api/teachers', teacherRouter);
app.use('/api/grades', gradesRouter);
app.use('/api/registration', OnboardingStudents);
app.use('/api/student', StudentRouter);
app.use('/api/academic-year', AcademicYearDisplay); // Centralized route for SY
app.use('/api/search', SearchStudentInformation);
app.use('/api/archive', Archivestudent);
app.use('/api/password', passwordRoutes);
app.use('/api/logs', SystemLogs);

// --- AUTOMATED PROMOTION ENGINE ---
const checkAndRunPromotion = async () => {
    console.log("⏰ [System] Checking Academic Year status...");
    try {
        const pool = await poolPromise;
        const settingsRes = await pool.request().query(`
            SELECT TOP 1 StartYear, EndMonth, EndYear FROM AcademicYearSettings 
            ORDER BY UpdatedAt DESC
        `);

        if (settingsRes.recordset.length === 0) return;

        const { EndMonth, EndYear } = settingsRes.recordset[0];
        const today = new Date(); 
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const isExpired = today.getFullYear() > EndYear || (today.getFullYear() === EndYear && today.getMonth() >= months.indexOf(EndMonth));

        if (isExpired) {
            // 1. Fetch students by combining their name parts into one 'FullName' alias
            const students = await pool.request().query(`
                SELECT si.LRN, 
                       si.LastName + ', ' + si.FirstName + ' ' + ISNULL(si.MiddleName, '') AS FullName,
                       si.GeneralAverage, s.GradeLevel 
                FROM StudentInformation si
                JOIN Sections s ON si.SectionID = s.SectionID
                WHERE si.GeneralAverage >= 75
            `);

            for (const s of students.recordset) {
                const currentGrade = parseInt(s.GradeLevel);
                
                if (currentGrade >= 10) {
                    // ARCHIVE GRADUATES
                    await pool.request()
                        .input('lrn', sql.VarChar, String(s.LRN))
                        .input('name', sql.NVarChar, s.FullName)
                        .query(`
                            INSERT INTO ArchivedStudents (LRN, FullName, DateArchived)
                            VALUES (@lrn, @name, GETDATE());
                            DELETE FROM StudentInformation WHERE LRN = @lrn;
                        `);
                } else {
                    // PROMOTE UNDERGRADS
                    const nextGrade = currentGrade + 1;
                    await pool.request()
                        .input('lrn', sql.VarChar, String(s.LRN))
                        .input('nextGrade', sql.Int, nextGrade)
                        .input('newSY', sql.NVarChar, `${EndYear}-${EndYear + 1}`)
                        .query(`
                            UPDATE StudentInformation 
                            SET SectionID = (SELECT TOP 1 SectionID FROM Sections WHERE GradeLevel = @nextGrade),
                                CurrentSchoolYear = @newSY,
                                GeneralAverage = 0 
                            WHERE LRN = @lrn
                        `);
                }
            }
            console.log("✅ [System] Promotion Task Finished.");
        }
    } catch (err) {
        console.error("❌ Automation Error:", err.message);
    }
};

// --- LOGIN ANALYTICS FOR REPORTS ---
app.get('/api/admin-stats', async (req, res) => {
    try {
        const pool = await poolPromise;

        const settingsRes = await pool.request().query(`
            SELECT TOP 1 StartMonth, StartYear, EndMonth, EndYear 
            FROM AcademicYearSettings 
            ORDER BY UpdatedAt DESC
        `);
        
        const settings = settingsRes.recordset[0];
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Check if we actually have valid strings to parse
        const hasValidData = settings && settings.StartYear && settings.StartYear !== "";

        const startDate = hasValidData 
            ? new Date(parseInt(settings.StartYear), months.indexOf(settings.StartMonth), 1)
            : new Date(new Date().getFullYear(), 0, 1); // Fallback to Jan 1st

        const endDate = hasValidData 
            ? new Date(parseInt(settings.EndYear), months.indexOf(settings.EndMonth), 1)
            : new Date(); // Fallback to today

        const studentRes = await pool.request().query("SELECT COUNT(*) as total FROM StudentInformation");
        const teacherRes = await pool.request().query("SELECT COUNT(*) as total FROM EmployeeAccounts");

        const loginRes = await pool.request()
            .input('start', startDate)
            .input('end', endDate)
            .query(`
                SELECT 
                    FORMAT(Timestamp, 'MMM') as monthName,
                    COUNT(CASE WHEN UserType = 'Student' THEN 1 END) as students,
                    COUNT(CASE WHEN UserType = 'Teacher' THEN 1 END) as teachers
                FROM SystemLogs
                WHERE Timestamp >= @start AND Timestamp <= @end
                AND Activity LIKE '%Logged into%'
                GROUP BY FORMAT(Timestamp, 'MMM'), MONTH(Timestamp)
                ORDER BY MONTH(Timestamp) ASC;
            `);

        res.json({
            totalStudents: studentRes.recordset[0].total || 0,
            totalTeachers: teacherRes.recordset[0].total || 0,
            loginHistory: loginRes.recordset || [], // Prevents .length error on frontend
            isExpired: hasValidData ? (new Date() > endDate) : false
        });

    } catch (err) {
        console.error("Admin Stats Error:", err.message);
        // Always return an empty array for loginHistory so the frontend doesn't white-screen
        res.status(500).json({ error: "Internal Server Error", loginHistory: [] });
    }
});


// --- SERVER INITIALIZATION ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Run the check immediately on boot
    checkAndRunPromotion(); 
});

// Schedule check to run every day at midnight
cron.schedule('0 0 * * *', checkAndRunPromotion);