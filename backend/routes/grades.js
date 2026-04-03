import express from 'express';
import{poolPromise, sql }from '../db.js';

const router = express.Router();

router.get('/students-for-grades/:empID', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('empID', sql.VarChar, req.params.empID)
            .query(`
                SELECT 
                    s.LRN, 
                    CONCAT(s.LastName, ', ', s.FirstName) AS FullName, 
                    s.Gender,
                    sec.SectionName
                FROM StudentInformation s
                JOIN Sections sec ON s.SectionID = CAST(sec.SectionID AS VARCHAR)
                WHERE sec.AdviserID = @empID -- Using ID for accuracy
                ORDER BY s.Gender DESC, s.LastName ASC -- Groups Male first, then Alphabetical
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//teacher avisory class
router.get('/advisory-students/:empID', async (req, res) => {
    try {
        const pool = await poolPromise;
        // Simplified query to ensure it doesn't fail on missing columns
        const result = await pool.request()
            .input('empID', sql.VarChar, req.params.empID)
            .query(`
                SELECT 
                    s.LRN, s.FirstName, s.LastName, s.Gender, 
                    sec.SectionName
                FROM StudentInformation s
                JOIN Sections sec ON CAST(s.SectionID AS VARCHAR) = CAST(sec.SectionID AS VARCHAR)
                WHERE sec.Adviser = @empID
                ORDER BY s.LastName ASC
            `);
        
        // Always return an array, even if empty, to stop the .filter error
        res.json(result.recordset || []); 
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(500).json([]); // Return empty array on error
    }
});

// GET subjects based on a Section's Grade Level
router.get('/subjects/:sectionName', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('sectionName', sql.VarChar, req.params.sectionName)
            .query(`
                SELECT s.SubjectID, s.SubjectName 
                FROM Subjects s
                JOIN GradeLevelSubjects gls ON s.SubjectID = gls.SubjectID
                JOIN Sections sec ON gls.GradeLevel = sec.GradeLevel
                WHERE sec.SectionName = @sectionName
            `);
        
        res.json(result.recordset); // Returns [{SubjectID: 1, SubjectName: 'Math'}, ...]
    } catch (err) {
        res.status(500).send(err.message);
    }
});


//publish grades
router.post('/publish', async (req, res) => {
    const { grades } = req.body;

    if (!grades || !Array.isArray(grades)) {
        return res.status(400).json({ message: "Invalid data format" });
    }

    try {
        const pool = await sql.connect(); // Use your existing DB config

        for (const item of grades) {
            // This query inserts or updates (upserts) the grade for that specific quarter
            await pool.request()
                .input('LRN', sql.VarChar, item.lrn)
                .input('SubjectID', sql.Int, item.subjectId)
                .input('Quarter', sql.VarChar, item.quarter)
                .input('GradeValue', sql.Decimal(5, 2), parseFloat(item.grade)) // Match DB Column
                .input('SchoolYear', sql.VarChar, item.schoolYear)
                .query(`
                    IF EXISTS (SELECT 1 FROM StudentGrades WHERE LRN = @LRN AND SubjectID = @SubjectID AND Quarter = @Quarter)
                    BEGIN
                        UPDATE StudentGrades 
                        SET GradeValue = @GradeValue, SchoolYear = @SchoolYear 
                        WHERE LRN = @LRN AND SubjectID = @SubjectID AND Quarter = @Quarter
                    END
                    ELSE
                    BEGIN
                        INSERT INTO StudentGrades (LRN, SubjectID, Quarter, GradeValue, SchoolYear)
                        VALUES (@LRN, @SubjectID, @Quarter, @GradeValue, @SchoolYear)
                    END
                `);
        }

        res.status(200).json({ message: "Grades published successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});

//Subjects per Grade Level
router.get('/grades/:lrn', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('lrn', sql.NVarChar, req.params.lrn)
            .query(`
                SELECT 
                    S.SubjectName,
                    G.Q1, G.Q2, G.Q3, G.Q4, G.FinalGrade
                FROM Subjects S
                -- 1. Connect Subjects to GradeLevel (assuming Subjects table has GradeLevel)
                INNER JOIN Sections SEC ON SEC.GradeLevel = S.GradeLevel
                -- 2. Connect Sections to the Student via SectionID
                INNER JOIN StudentInformation SI ON SI.SectionID = SEC.SectionID
                -- 3. Left Join Grades so subjects show up even if empty
                LEFT JOIN StudentGrades G ON G.SubjectID = S.SubjectID AND G.LRN = SI.LRN
                WHERE SI.LRN = @lrn
            `);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

export default router;