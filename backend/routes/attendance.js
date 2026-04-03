import express from 'express';
import sql from 'mssql';

const router = express.Router();

// 1. UPLOAD: Final path becomes /api/attendance/upload
router.post('/upload', async (req, res) => {
    try {
        const { teacher_name, file_name, file_data } = req.body;
        
        const pool = await sql.connect(); 
        await pool.request()
            .input('teacher_name', sql.NVarChar, teacher_name)
            .input('file_name', sql.NVarChar, file_name)
            .input('file_data', sql.VarChar(sql.MAX), file_data)
            .query("INSERT INTO student_attendance (teacher_name, file_name, file_data) VALUES (@teacher_name, @file_name, @file_data)");

        res.status(200).send({ message: "File imported successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Backend Error: Could not save file");
    }
});

// 2. GET: Final path becomes /api/attendance/:teacherName
router.get('/:teacherName', async (req, res) => {
    try {
        const { teacherName } = req.params;
        const pool = await sql.connect();
        const result = await pool.request()
            .input('teacherName', sql.NVarChar, teacherName)
            .query("SELECT id, file_name, import_date, file_data FROM student_attendance WHERE teacher_name = @teacherName ORDER BY import_date DESC");

        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Backend Error: Could not fetch files");
    }
});

// 3. DELETE: Final path becomes /api/attendance/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect();
        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM student_attendance WHERE id = @id");

        res.status(200).send("Deleted successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Backend Error: Could not delete record");
    }
});

export default router;