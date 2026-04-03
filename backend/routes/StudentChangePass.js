import express from 'express';
import { poolPromise, sql } from '../db.js';

const router = express.Router();

// POST: Admin manually updates a student's password
router.post('/change-password', async (req, res) => {
    // Log the body to see what exactly the frontend is sending
    console.log("Received data:", req.body); 

    const { lrn, newPassword } = req.body;

    // Check if lrn is actually present
    if (!lrn) {
        return res.status(400).send("Database error: lrn is not defined");
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('lrn', sql.NVarChar, lrn.toString()) // Convert to string to be safe
            .input('password', sql.NVarChar, newPassword)
            .query('UPDATE StudentAccount SET PasswordParam = @password WHERE LRN = @lrn');

        res.status(200).send("Password updated successfully");
    } catch (err) {
        res.status(500).send("Database error: " + err.message);
    }
});


export default router;