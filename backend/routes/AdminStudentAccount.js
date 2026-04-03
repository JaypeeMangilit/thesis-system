import express from 'express';
import { poolPromise, sql } from '../db.js';

const router = express.Router();

// GET ALL STUDENT ACCOUNTS WITH NAMES
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                A.LRN, 
                A.PasswordParam AS Password, 
                I.FirstName, 
                I.LastName,
                I.Status, 
                I.MiddleName
            FROM StudentAccount A
            INNER JOIN StudentInformation I ON A.LRN = I.LRN
        `);

        // Format the data so it's easy for the frontend to use
        const students = result.recordset.map(row => ({
            LRN: row.LRN,
            Password: row.Password,
            Name: `${row.FirstName} ${row.MiddleName ? row.MiddleName + ' ' : ''}${row.LastName}`.trim(),
            status: row.Status
        }));

        res.status(200).json(students);
    } catch (err) {
        console.error("Error fetching student accounts:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;