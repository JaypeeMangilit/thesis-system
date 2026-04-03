import express from 'express';
import { poolPromise, sql } from '../db.js';

const router = express.Router();

// GET: Fetch list of archived students
router.get('/archive-list', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM ArchivedStudents ORDER BY DateArchived DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// POST: Perform Move and Delete Transaction
router.post('/archive-students', async (req, res) => {
    const { lrns } = req.body;
    if (!lrns || !Array.isArray(lrns) || lrns.length === 0) {
        return res.status(400).send("No Valid LRNs provided");
    }

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Fix: Consistently use 'studentLRN' to avoid 'not defined' errors
            for (const studentLRN of lrns) {
                const lrnString = String(studentLRN).trim();

                // 1. Move to Archive (Joining split tables)
                // We pull Password from StudentAccount (A) and Names from StudentInformation (I)
                await transaction.request()
                    .input('lrnParam', sql.NVarChar, lrnString)
                    .query(`
                        INSERT INTO ArchivedStudents (
                            LRN, Password, Status, DateArchived,
                            FirstName, MiddleName, LastName, Age, DOB, Address,
                            GuardianName, Occupation, GuardianContactNumber, SectionID, 
                            Gender, Citizenship, Religion, GuardianEmail, 
                            GeneralAverage, CurrentSchoolYear
                        )
                        SELECT 
                            A.LRN, 
                            A.PasswordParam, 
                            I.Status, 
                            GETDATE(), -- This matches DateArchived
                            I.FirstName, 
                            I.MiddleName, 
                            I.LastName, 
                            I.Age, 
                            I.DOB, 
                            I.Address, 
                            I.GuardianName, 
                            I.Occupation, 
                            I.GuardianContactNumber, 
                            I.SectionID, 
                            I.Gender, 
                            I.Citizenship, 
                            I.Religion, 
                            I.GuardianEmail, 
                            I.GeneralAverage, 
                            I.CurrentSchoolYear
                        FROM StudentAccount A
                        INNER JOIN StudentInformation I ON A.LRN = I.LRN
                        WHERE A.LRN = @lrnParam
                    `);

                // 2. Delete Credentials (Child table first)
                await transaction.request()
                    .input('lrnParam', sql.NVarChar, lrnString)
                    .query('DELETE FROM StudentAccount WHERE LRN = @lrnParam');

                // 3. Delete Profile (Parent table second)
                await transaction.request()
                    .input('lrnParam', sql.NVarChar, lrnString)
                    .query('DELETE FROM StudentInformation WHERE LRN = @lrnParam');
            }

            await transaction.commit();
            res.status(200).send("Archived successfully");
        } catch (err) {
            await transaction.rollback();
            console.error("SQL Error:", err.message);
            res.status(500).send("Database error: " + err.message);
        }
    } catch (err) {
        res.status(500).send("Connection failed: " + err.message);
    }
});


// POST: Restore student from Archive to Active tables
router.post('/restore-students', async (req, res) => {
    const { lrns } = req.body;
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            for (const lrn of lrns) {
                // Restore to Information table (Splitting name back)
                await transaction.request()
                    .input('lrn', sql.NVarChar, lrn)
                    .query(`
                        INSERT INTO StudentInformation (
                            LRN, FirstName, MiddleName, LastName, Age, DOB, Address, GuardianName, Status,
                            Occupation, GuardianContactNumber, SectionID, Gender, Citizenship,
                            Religion, GuardianEmail, GeneralAverage, CurrentSchoolYear
                        )
                        SELECT 
                            LRN, FirstName, MiddleName, LastName, Age, DOB, Address, GuardianName, Status,
                            Occupation, GuardianContactNumber, SectionID, Gender, Citizenship,
                            Religion, GuardianEmail, GeneralAverage, CurrentSchoolYear
                        FROM ArchivedStudents
                        WHERE LRN = @lrn
                    `);
                // Restore to Account table
                await transaction.request()
                    .input('lrn', sql.NVarChar, lrn)
                    .query(`INSERT INTO StudentAccount (LRN, PasswordParam) SELECT LRN, Password FROM ArchivedStudents WHERE LRN = @lrn`);
                // Delete from Archive
                await transaction.request().input('lrn', sql.NVarChar, lrn).query('DELETE FROM ArchivedStudents WHERE LRN = @lrn');
            }
            await transaction.commit();
            res.status(200).send("Restored successfully");
        } catch (err) {
            await transaction.rollback();
            res.status(500).send(err.message);
        }
    } catch (err) { res.status(500).send(err.message); }
});

// POST: Admin manually updates a student's password
router.post('/change-password', async (req, res) => {
    const { lrn, newPassword } = req.body;

    if (!lrn || !newPassword) {
        return res.status(400).send("LRN and new password are required.");
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('lrn', sql.NVarChar, lrn)
            .input('password', sql.NVarChar, newPassword)
            .query('UPDATE StudentAccount SET PasswordParam = @password WHERE LRN = @lrn');

        res.status(200).send("Password updated successfully");
    } catch (err) {
        res.status(500).send("Database error: " + err.message);
    }
});

export default router;