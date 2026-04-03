import express, { request } from 'express';
import { poolPromise, sql } from '../db.js';

const router = express.Router();

// 5. All section for the dropdown in the AddStudentInformation
router.get('/all-sections', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT SectionID, SectionName, GradeLevel
            FROM Sections
        `);
        console.log("Sections Found:", result.recordset);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// 1. GET SECTIONS BY GRADE ID Level
router.get('/:gradeId', async (req, res) => {
    try {
        const { gradeId } = req.params; 
        const level = parseInt(gradeId.replace("Grade", "")); 

        const pool = await poolPromise;
        const result = await pool.request()
            .input('level', sql.Int, level)
            .query("SELECT * FROM dbo.Sections WHERE GradeLevel = @level");
            
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. Delete student bt lrn
router.delete('/delete-student/:lrn', async (req, res) => {
    const {lrn} = req.params;

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        await transaction.begin();
        try {
            await transaction.request()
            .input('lrn', sql.Numeric, lrn)
            .query("DELETE FROM StudentAccount WHERE LRN = @lrn");

            await transaction.request()
            .input('lrn', sql.Numeric, lrn)
            .query("DELETE FROM StudentInformation WHERE LRN = @lrn");

            await transaction.commit();
            res.status(200).json({message: "Student Deleted Successfully"});
        } catch (err) {
            await transaction.rollback()
            throw err;
        }
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// 2. STUDENTS BY SECTION NAME
router.get('/students-by-section/:gradeLevel/:sectionName', async (req, res) => {
    const { gradeLevel, sectionName } = req.params;
    
    try {
        // Clean the gradeLevel: change "Grade3" into "3"
        const cleanGrade = gradeLevel.replace("Grade", "").trim();
        
        const pool = await poolPromise; 
        const result = await pool.request()
            .input('targetSection', sql.NVarChar, sectionName)
            .input('gradeLevel', sql.Int, cleanGrade) // Now this is just "3", which works as an Int
            .query(`
                SELECT 
                    si.LRN, 
                    si.LastName + ' ' + si.FirstName AS FullName, 
                    si.Status,
                    si.GeneralAverage
                FROM StudentInformation si
                INNER JOIN Sections s ON si.SectionID = s.SectionID
                WHERE s.SectionName = @targetSection
                    AND s.GradeLevel = @gradeLevel
            `);

        res.json(result.recordset);
    } catch (err) {
        // This is where that "Conversion failed" error was coming from
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 3. CREATE NEW ADVISORY
router.post('/', async (req, res) => {
    const { SectionName, GradeLevel, Adviser } = req.body;
    try {
        const pool = await poolPromise;
        const checkResult = await pool.request()
            .input('adviser', sql.VarChar, Adviser)
            .query("SELECT COUNT(*) as count FROM dbo.Sections WHERE Adviser = @adviser");

        if (checkResult.recordset[0].count >= 2) {
            return res.status(400).json({ error: "Maximum limit reached." });
        }

        const result = await pool.request()
            .input('name', sql.VarChar, SectionName)
            .input('grade', sql.Int, GradeLevel)
            .input('adviserId', sql.VarChar, Adviser)
            .query(`
                INSERT INTO dbo.Sections (SectionName, GradeLevel, Adviser) 
                OUTPUT INSERTED.SectionID, INSERTED.SectionName, INSERTED.GradeLevel, INSERTED.Adviser 
                VALUES (@name, @grade, @adviserId)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. DELETE SECTION
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query(`DELETE FROM dbo.Sections WHERE SectionID = @id`);
        res.status(200).json({ message: "Section Deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//6. Registrar Add Student Information
router.post('/add-student', async (req, res) => {
    const data = req.body;
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        
        await transaction.begin();
        try {
            const fullAddress = `${data.houseNo} ${data.barangay} ${data.municipality}, ${data.province}`;

            // 1. Insert into StudentInformation
            await transaction.request()
                .input('lrn', sql.VarChar, data.lrn)
                .input('fname', sql.VarChar, data.firstName)
                .input('mname', sql.NVarChar, data.middleName)
                .input('lname', sql.VarChar, data.lastName)
                .input('address', sql.VarChar, fullAddress)
                .input('gender', sql.VarChar, data.gender)
                .input('age', sql.Int, parseInt(data.age) || 0)
                .input('dob', sql.Date, data.dob)
                .input('citizenship', sql.NVarChar, data.citizenship)
                .input('religion', sql.NVarChar, data.religion)
                .input('gName', sql.VarChar, data.guardianName)
                .input('gContact', sql.VarChar, data.guardianContact)
                .input('gEmail', sql.VarChar, data.guardianEmail)
                .input('status', sql.NVarChar, 'Enrolled')
                .input('sectionId', sql.Int, data.sectionId)
                .query(`
                    INSERT INTO StudentInformation (LRN, FirstName, MiddleName, LastName, Address, Gender, Age, DOB, Citizenship, Religion, GuardianName, GuardianContactNumber, GuardianEmail, Status, SectionID)
                    VALUES (@lrn, @fname, @mname, @lname, @address, @gender, @age, @dob, @citizenship, @religion, @gName, @gContact, @gEmail, @status, @sectionId)
                `);

            // 2. Insert into StudentAccounts
            await transaction.request()
                .input('lrn', sql.VarChar, data.lrn)
                .input('pass', sql.VarChar, data.password || '1234')
                .query(`
                    INSERT INTO StudentAccount (LRN, PasswordParam)
                    VALUES (@lrn, @pass)
                `);

            await transaction.commit();
            res.status(200).json({ success: true, message: "Student and Account Created!" });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

//Promotion of the Students Every School Year
router.post('/promote-section-students', async (req, res) => {
    const { currentSectionName } = req.body;
    try {
        const pool = await poolPromise;
        
        // 1. Get students in this section
        const students = await pool.request()
            .input('sectionName', sql.NVarChar, currentSectionName)
            .query(`
                SELECT si.LRN, si.GeneralAverage 
                FROM StudentInformation si
                JOIN Sections s ON si.SectionID = s.SectionID
                WHERE s.SectionName = @sectionName 
                ORDER BY si.GeneralAverage DESC
            `);

        // 2. Execute Batch Update
        for (let i = 0; i < students.recordset.length; i++) {
            const student = students.recordset[i];
            const currentLRN = student.LRN || student.lrn;

            if (!currentLRN) {
                console.error("Skipping: No LRN found for row", i);
                continue;
            }

            const avg = student.GeneralAverage || 0;
            let priority = 5; 
            if (avg >= 94) priority = 1;
            else if (avg >= 91) priority = 2;
            else if (avg >= 88) priority = 3;
            else if (avg >= 86) priority = 4;

            // 3. Update Request - Added 'sectionName' input here!
            await pool.request()
                .input('lrn', sql.VarChar, String(currentLRN))
                .input('prio', sql.Int, priority)
                .input('sectionName', sql.NVarChar, currentSectionName) // <--- THIS WAS MISSING
                .query(`
                    UPDATE StudentInformation 
                    SET SectionID = (
                        SELECT TOP 1 SectionID FROM Sections 
                        WHERE RankPriority = @prio AND GradeLevel = (
                            SELECT GradeLevel + 1 FROM Sections WHERE SectionName = @sectionName
                        )
                    ),
                    CurrentSchoolYear = '2027-2028'
                    WHERE LRN = @lrn
                `);
        }
        res.json({ success: true, message: "Promotion Complete!" });
    } catch (error) {
        console.error("Promotion Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

//Create Section Logic API
router.post('/create', async (req, res) => {
    const { sectionName, gradeLevel, adviser } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, sectionName)
            .input('grade', sql.Int, gradeLevel)
            .input('adviser', sql.NVarChar, adviser)
            .query(`
                INSERT INTO Sections (SectionName, GradeLevel, Adviser)
                VALUES (@name, @grade, @adviser)
            `);
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//delete Sections inside the grade Level
router.delete('/:sectionId', async (req, res) => {
    const { sectionId } = req.params;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, sectionId)
            .query("DELETE FROM Sections WHERE SectionID = @id");
        
        res.json({ success: true, message: "Section deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// sections.js

router.post('/promote-individual/:lrn', async (req, res) => {
    const { lrn } = req.params;

    try {
        const pool = await poolPromise;

        // 1. First, check if the student actually qualifies (75+) 
        // and isn't already promoted.
        const checkStudent = await pool.request()
            .input('lrn', sql.Numeric, lrn) // Your LRN is Numeric
            .query(`
                SELECT GeneralAverage, Status, GradeLevel 
                FROM StudentInformation 
                WHERE LRN = @lrn
            `);

        if (checkStudent.recordset.length === 0) {
            return res.status(404).json({ error: "Student not found." });
        }

        const student = checkStudent.recordset[0];

        if (student.GeneralAverage < 75) {
            return res.status(400).json({ 
                error: `Student has an average of ${student.GeneralAverage}. They must have 75+ to be promoted.` 
            });
        }

        if (student.Status === 'Promoted') {
            return res.status(400).json({ error: "Student is already promoted." });
        }

        // 2. Perform the promotion
        // We increment GradeLevel and flip Status to 'Promoted'
        await pool.request()
            .input('lrn', sql.Numeric, lrn)
            .query(`
                UPDATE StudentInformation
                SET GradeLevel = GradeLevel + 1,
                    Status = 'Promoted'
                WHERE LRN = @lrn;

                -- Also update the history if you have one for the current year
                UPDATE AcademicYearHistory
                SET Status = 'Promoted',
                    GradeLevel = GradeLevel + 1
                WHERE LRN = @lrn 
                AND AcademicYear = (SELECT TOP 1 CAST(StartYear AS VARCHAR) + '-' + CAST(EndYear AS VARCHAR) FROM AcademicYearSettings);
            `);

        res.json({ message: "Student promoted successfully!" });

    } catch (err) {
        console.error("Manual Promotion Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;