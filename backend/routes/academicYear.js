import express from 'express';
import { poolPromise } from '../db.js'; 

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const pool = await poolPromise; 

        // 1. Fetch the latest record to check if a year is currently active
        const currentResult = await pool.request().query(`
            SELECT TOP 1 StartMonth, StartYear, EndMonth, EndYear 
            FROM AcademicYearSettings 
            ORDER BY UpdatedAt DESC
        `);
        
        const settings = currentResult.recordset[0];

        // 2. Fetch the last 5 records for the "Recent Updates" history list
        // We use SQL to create the 'AY_Range' string your frontend needs
        const historyResult = await pool.request().query(`
            SELECT TOP 5 
                CAST(StartYear AS VARCHAR) + '-' + CAST(EndYear AS VARCHAR) AS AY_Range, 
                UpdatedAt AS PublishedDate, 
                'Admin' AS AdminName 
            FROM AcademicYearSettings 
            ORDER BY UpdatedAt DESC
        `);

        // Check if we should unlock the "Publish" button
        if (!settings || !settings.StartYear || settings.StartYear === "") {
            return res.json({ 
                current: null, 
                history: historyResult.recordset || [] 
            });
        }

        // Send both the active year and the history array
        res.json({ 
            current: settings, 
            history: historyResult.recordset || [] 
        });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// --- PUBLISH NEW ACADEMIC YEAR ---
router.post("/publish", async (req, res) => {
    const { startMonth, startYear, endMonth, endYear } = req.body;

    try {
        const pool = await poolPromise;
        
        // Insert the new academic year settings
        await pool.request()
            .input('sm', startMonth)
            .input('sy', startYear)
            .input('em', endMonth)
            .input('ey', endYear)
            .query(`
                INSERT INTO AcademicYearSettings (StartMonth, StartYear, EndMonth, EndYear, UpdatedAt)
                VALUES (@sm, @sy, @em, @ey, GETDATE())
            `);

        res.status(200).json({ message: "Academic Year Published Successfully" });
    } catch (err) {
        console.error("Publish Error:", err.message);
        res.status(500).json({ error: "Failed to publish academic year" });
    }
});

export default router;