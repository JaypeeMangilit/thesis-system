import express from 'express';
import { poolPromise, sql } from '../db.js';


const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT
                A.Employee_ID,
                A.Password,
                I.FirstName,
                I.LastName,
                I.MiddleName,
                I.Position,
                I.Status
            FROM EmployeeAccounts A
            INNER JOIN EmployeeInformation I ON A.Employee_ID = I.Employee_ID
        `);

        const employee = result.recordset.map(row => ({
            Employee_ID: row.Employee_ID,
            Password: row.Password,
            Name: `${row.FirstName} ${row.MiddleName ? row.MiddleName + '' : ''} ${row.LastName}`.trim(),
            Position: row.Position,
            Status: row.Status
        }));

        res.status(200).json(employee);
    } catch (err) {
        console.error("Error Fecthing Employee Accounts:", err.message);
        res.status(500).json({ error: "Server Error"});
    }
});

export default router;