import express from 'express';
import sql from 'mssql';

const router = express.Router();

// 1. FOR DEPARTMENT HEAD: Assign the Teacher to a Section
router.put('/assign', async (req, res) => {
    const { teacherName, sectionID, gradeLevel } = req.body; 
    
    // Debugging: Log this to see what the frontend is actually sending
    console.log("Assigning:", { teacherName, sectionID, gradeLevel });

    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('teacher', sql.VarChar, teacherName.trim())
            .input('grade', sql.Int, parseInt(gradeLevel))
            .input('id', sql.Int, parseInt(sectionID)) // Ensure it's an INT
            .query('UPDATE Sections SET Adviser = @teacher, GradeLevel = @grade WHERE SectionID = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Section ID not found in database." });
        }
        res.status(200).send({ message: "Adviser assigned successfully" });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// NEW ROUTE: For the "Card" component - Fetches just the section info
router.get('/my-sections/:teacherName', async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('teacher', sql.VarChar, req.params.teacherName)
            .query(`SELECT SectionID, SectionName, GradeLevel FROM Sections WHERE Adviser = @teacher`);
        res.json(result.recordset); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Fetch students for a SPECIFIC section only
router.get('/class-list/:teacherName/:sectionName', async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('teacher', sql.VarChar, req.params.teacherName)
            .input('section', sql.VarChar, req.params.sectionName)
            .query(`
                SELECT s.LRN, 
                       CONCAT(s.LastName, ', ', s.FirstName, ' ', ISNULL(s.MiddleName, '')) AS FullName, 
                       s.Gender, s.Status
                FROM StudentInformation s
                JOIN Sections sec ON s.SectionID = CAST(sec.SectionID AS VARCHAR)
                WHERE sec.Adviser = @teacher
                AND sec.SectionName = @section
                ORDER BY s.Gender DESC, s.LastName ASC
            `);
        res.json(result.recordset || []);
    } catch (err) {
        res.status(500).json([]);
    }
});

// 3. GET: Fetch all sections that have an assigned adviser
router.get('/list', async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query(`
            SELECT SectionID, SectionName, GradeLevel, Adviser 
            FROM Sections 
            
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// 4. PUT: "Delete" (Clear) the adviser from a section
router.put('/remove/:id', async (req, res) => {
    try {
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('UPDATE Sections SET Adviser = NULL WHERE SectionID = @id');
        res.status(200).send({ message: "Advisory removed" });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

export default router;