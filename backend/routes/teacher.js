import express from 'express';
import {poolPromise, sql }from '../db.js';

const router = express.Router();

//NEW VERIFY ROUTE 
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 2) return res.json([]); 

        const pool = await poolPromise;
        const result = await pool.request()
            .input('term', sql.VarChar, `%${query}%`)
            .query(`
                SELECT TOP 5 
                    (LastName + ', ' + FirstName + ' ' + MiddleName) AS FullName,
                    Employee_ID
                FROM EmployeeInformation
                WHERE LastName LIKE @term 
                   OR FirstName LIKE @term
                   OR (FirstName + ' ' + LastName) LIKE @term
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/verify', async (req, res) => {
    try {
        const { name } = req.query;
        const pool = await poolPromise; 

        const result = await pool.request()
            .input('name', sql.VarChar, `%${name}%`) // Use wildcards
            .query(`
                SELECT Employee_ID 
                FROM EmployeeInformation
                WHERE 
                    (LastName + ', ' + FirstName + ' ' + MiddleName) LIKE @name 
                    OR (FirstName + ' ' + LastName) LIKE @name
                    OR (FirstName + ' ' + MiddleName + ' ' + LastName) LIKE @name
            `);

        if (result.recordset.length > 0) {
            res.json({ exists: true });
        } else {
            res.status(404).json({ message: "Teacher not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//profile of the user
router.get('/profile/:name', async (req, res) => {
    try {
        // Wait for the pool connection to be established
        const pool = await poolPromise; 
        
        const result = await pool.request()
            .input('name', sql.VarChar, req.params.name)
            .query(`
                SELECT 
                    Employee_ID, LastName, FirstName, MiddleName,
                    Age, DOB, ContactNum, Position,
                    Address
                FROM EmployeeInformation
                WHERE CONCAT(FirstName, ' ', LastName) = @name 
                OR FirstName = @name
            `);

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ message: "Teacher profile not found" });
        }
    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Assign Dropdown Department Head
router.get('/list', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT 
                    Employee_ID, 
                    (FirstName + ' ' + LastName) AS FullName 
                FROM EmployeeInformation
                WHERE Position = 'Teacher' 
                   OR Position LIKE '%Teacher%'
                   OR Position = 'Department Head'
                ORDER BY FullName ASC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error("DETAILED DATABASE ERROR:", err.message); 
        res.status(500).json({ 
            error: "Failed to fetch teacher list", 
            details: err.message 
        });
    }
});

export default router;