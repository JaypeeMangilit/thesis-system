import express from 'express';
import { poolPromise, sql } from '../db.js';

const router = express.Router();

// STUDENT LOGIN ROUTE
router.post('/login', async (req, res) => {
    const { LRN, password } = req.body;

    if (!LRN || !password) {
        return res.status(400).json({ error: "Missing LRN or password" });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("LRN", sql.Numeric, LRN)
            .input("PasswordParam", sql.NVarChar, password)
            .query(`
                SELECT
                    A.LRN,
                    I.FirstName,
                    I.LastName,
                    I.MiddleName
                FROM StudentAccount A
                INNER JOIN StudentInformation I on A.LRN = I.LRN
                WHERE A.LRN = @LRN AND A.PasswordParam = @PasswordParam
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        await pool.request()
            .input("UserRole", sql.NVarChar, 'Student')
            .input("LRN", sql.Numeric, LRN)
            .query(`
                INSERT INTO LoginLogs (UserRole, LoginDate)
                VALUES (@UserRole, GETDATE())    
            `);

        const user = result.recordset[0];

        res.status(200).json({
            message: "Login successful",
            user: {
                LRN: user.LRN,
                fullName: `${user.FirstName} ${user.LastName}`.trim()
            }
        });

    } catch (err) {
        console.error("Student Login Error:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

//Schedule of the student
router.get('/schedule/:lrn', async (req, res) => {
    const { lrn } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            // Switch to VarChar to avoid Numeric precision issues
            .input("LRN", sql.VarChar, lrn.toString()) 
            .query(`
                SELECT 
                    LTRIM(RTRIM(Sched.TimeSlot)) AS TimeSlot, 
                    UPPER(LTRIM(RTRIM(Sched.DayOfWeek))) AS DayOfWeek, 
                    Sched.SubjectName, 
                    Sched.TeacherName,
                    Sched.SectionName,
                    Sched.RoomName
                FROM StudentInformation Stu
                INNER JOIN Sections Sec ON Stu.SectionID = Sec.SectionID
                INNER JOIN AcademicSchedules Sched 
                    -- This forces "Aristotle" to match "Grade 7-Aristotle"
                    ON UPPER(LTRIM(RTRIM(Sched.SectionName))) LIKE '%' + UPPER(LTRIM(RTRIM(Sec.SectionName))) + '%'
                WHERE CAST(Stu.LRN AS VARCHAR) = @LRN
            `);
        
        console.log(`DEBUG: Found ${result.recordset.length} rows for LRN: ${lrn}`);
        res.json(result.recordset);
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});


//Grades for Student User
router.get('/grades/:lrn', async (req, res) => {
    const { lrn } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("LRN", sql.VarChar, lrn) // LRN is VarChar in image_e5a323
            .query(`
                SELECT 
                    S.SubjectName,
                    -- You might want to JOIN with a Subjects table here to get the real Name
                    MAX(CASE WHEN G.Quarter = '1st Quarter' THEN G.GradeValue END) AS Q1,
                    MAX(CASE WHEN G.Quarter = '2nd Quarter' THEN G.GradeValue END) AS Q2,
                    MAX(CASE WHEN G.Quarter = '3rd Quarter' THEN G.GradeValue END) AS Q3,
                    MAX(CASE WHEN G.Quarter = '4th Quarter' THEN G.GradeValue END) AS Q4,
                    CAST(AVG(G.GradeValue) AS DECIMAL(10,2))FinalGrade
                FROM StudentGrades G
                INNER JOIN Subjects S on G.SubjectID = S.SubjectID
                WHERE G.LRN = @LRN
                GROUP BY S.SubjectName
            `);
        
        console.log(`Grades found for ${lrn}:`, result.recordset.length);
        res.json(result.recordset);
    } catch (err) {
        console.error("Grades Error:", err.message);
        res.status(500).json({ error: "Server error fetching grades" });
    }
});


export default router;