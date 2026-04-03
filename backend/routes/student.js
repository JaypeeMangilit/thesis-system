import express from 'express';
import { poolPromise, sql } from '../db.js';

const router = express.Router();

router.get('/profile/:name', async (req, res) => {
    try {
        const pool = await poolPromise;
        const studentName = decodeURIComponent(req.params.name).trim(); 

        const result = await pool.request()
            .input('studentName', sql.NVarChar, studentName)
            .query(`
                SELECT TOP 1
                    Stu.LRN, Stu.FirstName, Stu.LastName, ISNULL(Stu.MiddleName, '') AS MiddleName,
                    Stu.Age, Stu.DOB, Stu.Gender, Stu.Citizenship, Stu.Religion,
                    Stu.Address, 
                    Stu.GuardianName, Stu.GuardianContactNumber, Stu.GuardianEmail,
                    Sec.SectionName, Sec.GradeLevel
                FROM StudentInformation Stu
                LEFT JOIN Sections Sec ON Stu.SectionID = Sec.SectionID
                WHERE (Stu.FirstName + ' ' + Stu.LastName) = @studentName
                OR (Stu.FirstName + ' ' + ISNULL(Stu.MiddleName, '') + ' ' + Stu.LastName) = @studentName
            `);

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ message: "Student not found" });
        }
    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;