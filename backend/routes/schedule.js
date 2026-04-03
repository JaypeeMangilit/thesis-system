import express from 'express';
import {poolPromise, sql }from '../db.js';

const router = express.Router();

// POST: Publish the schedule to the database
router.post('/publish', async (req, res) => {
    const { schedule } = req.body; 

    try {
        // Assuming your DB pool is globally accessible or imported
        const transaction = new sql.Transaction();
        await transaction.begin();

        try {
            for (const item of schedule) {
                const request = new sql.Request(transaction);
                await request
                    .input('time', sql.VarChar, item.time_slot)
                    .input('day', sql.VarChar, item.day)
                    .input('subject', sql.VarChar, item.subject)
                    .input('section', sql.VarChar, item.section)
                    .input('teacher', sql.VarChar, item.teacher)
                    .input('room', sql.VarChar, item.room)
                    .query(`
                        INSERT INTO AcademicSchedules (TimeSlot, DayOfWeek, SubjectName, SectionName, TeacherName, RoomName)
                        VALUES (@time, @day, @subject, @section, @teacher, @room)
                    `);
            }
            await transaction.commit();
            res.status(200).send({ message: "Schedule Published successfully!" });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Database transaction failed" });
    }
});

router.get('/:teacherName', async (req, res) => {
    try {
        const pool = await poolPromise;
        const nameParts = req.params.teacherName.split(' '); // Splits "Mhelric Banaag" into ["Mhelric", "Banaag"]
        
        // We take the first and last word to use as search terms
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];

        const result = await pool.request()
            .input('first', sql.NVarChar, `%${firstName}%`)
            .input('last', sql.NVarChar, `%${lastName}%`)
            .query(`
                SELECT DayOfWeek, TimeSlot, SubjectName, SectionName, TeacherName, RoomName
                FROM AcademicSchedules
                WHERE TeacherName LIKE @first 
                  AND TeacherName LIKE @last
            `); 

        console.log(`Searching for: ${firstName} AND ${lastName}`);
        console.log("Rows found:", result.recordset.length);

        res.json(result.recordset || []);
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(500).json({error: err.message});
    }
});

export default router;