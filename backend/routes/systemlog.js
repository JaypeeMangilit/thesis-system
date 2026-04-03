import express from 'express';
import { poolPromise } from '../db.js'; // Use poolPromise for mssql

const router = express.Router();

// Endpoint to get logs for the Dashboard
router.get('/system-logs', async (req, res) => {
    try {
        const pool = await poolPromise; // Wait for connection
        const result = await pool.request()
            .query('SELECT TOP 10 Activity, Timestamp FROM SystemLogs ORDER BY Timestamp DESC');
        
        res.json(result.recordset);
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(500).send(err.message);
    }
});

export default router;