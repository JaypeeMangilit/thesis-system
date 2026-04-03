import express from 'express';
import { poolPromise, sql } from '../db.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const router = express.Router();

// 1. GENERATE LINK & SEND EMAIL WITH BUTTON
router.post('/batch-upload-students', async (req, res) => {
    const { students } = req.body;
    const pool = await poolPromise;
    
    let addedCount = 0;
    let skippedCount = 0;
    const errors = [];

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: 'jaypeemangilit001@gmail.com', pass: 'ydzgesdgoinnowno' }
        });

        for (const student of students) {
            try {
                // 1. DATA CLEANING: Handle Excel formatting quirks
                const cleanLrn = student.lrn ? student.lrn.toString().trim() : "";
                const sectionName = student.Section || student.sectionId; // Support both column names

                // 2. DUPLICATE CHECK: Skip if LRN exists
                const checkRes = await pool.request()
                    .input('lrn', sql.VarChar, cleanLrn)
                    .query("SELECT LRN FROM StudentInformation WHERE LRN = @lrn");

                if (checkRes.recordset.length > 0) {
                    skippedCount++;
                    continue; 
                }

                // 3. SECTION LOOKUP: Convert "Thales" to SectionID (e.g., 10)
                const sectionLookup = await pool.request()
                    .input('sname', sql.NVarChar, String(sectionName).trim())
                    .input('grade', sql.Int, parseInt(student.Grade))
                    .query("SELECT SectionID FROM Sections WHERE SectionName = @sname AND GradeLevel = @grade");

                if (sectionLookup.recordset.length === 0) {
                    errors.push(`LRN ${cleanLrn}: Section '${sectionName}' not found in database.`);
                    skippedCount++;
                    continue;
                }

                const dbSectionId = sectionLookup.recordset[0].SectionID;
                const token = crypto.randomUUID();
                const expiry = new Date();
                expiry.setHours(expiry.getHours() + 24);

                // 4. INSERT INTO StudentInformation
                await pool.request()
                    .input('lrn', sql.VarChar, cleanLrn)
                    .input('fn', sql.NVarChar, student.firstName)
                    .input('mn', sql.NVarChar, student.middleName || '')
                    .input('ln', sql.NVarChar, student.lastName)
                    .input('sid', sql.Int, dbSectionId)
                    .input('token', sql.UniqueIdentifier, token)
                    .input('expiry', sql.DateTime, expiry)
                    .query(`INSERT INTO StudentInformation 
                            (LRN, FirstName, LastName, MiddleName, SectionID, OnboardingToken, TokenExpiry, IsOnboarded) 
                            VALUES (@lrn, @fn, @ln, @mn, @sid, @token, @expiry, 0)`);

                // 5. INSERT INTO StudentAccount
                await pool.request()
                    .input('lrn', sql.VarChar, cleanLrn)
                    .query(`INSERT INTO StudentAccount (LRN, PasswordParam) VALUES (@lrn, '1234')`);

                // 6. SEND EMAIL
                const frontendUrl = process.env.VITE_FRONTEND_URL || 'https://controlled-participants-fairy-psychiatry.trycloudflare.com';
                const onboardingLink = `${frontendUrl}/onboard/${token}`;

                await transporter.sendMail({
                    from: '"Patnubay Academy Registrar" <jaypeemangilit001@gmail.com>',
                    to: student.guardianEmail,
                    subject: "Welcome to Patnubay Academy - Complete Your Enrollment",
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
                            <h2 style="color: #6B46C1;">Welcome, ${student.firstName}!</h2>
                            <p>To finalize your student profile, please click the button below to set your password:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${onboardingLink}" 
                                   style="background-color: #6B46C1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                    Start Onboarding Form
                                </a>
                            </div>
                            <p style="font-size: 11px; color: #999;">This link expires in 24 hours.</p>
                        </div>`
                });

                addedCount++;

            } catch (studentErr) {
                console.error(`Error processing LRN ${student.lrn}:`, studentErr.message);
                errors.push(`LRN ${student.lrn}: ${studentErr.message}`);
            }
        }

        res.json({ 
            success: true, 
            message: `Batch complete: ${addedCount} added, ${skippedCount} skipped.`,
            details: { addedCount, skippedCount, errors }
        });

    } catch (err) {
        console.error("Critical Batch Error:", err);
        res.status(500).json({ error: "Server failed to process the request." });
    }
});


// 2. VALIDATE TOKEN
router.get('/validate-token/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('token', sql.UniqueIdentifier, token)
            .query(`SELECT FirstName, TokenExpiry, IsOnboarded 
                    FROM StudentInformation 
                    WHERE OnboardingToken = @token`);

        if (result.recordset.length === 0) return res.status(404).json({ error: "Invalid link." });

        const student = result.recordset[0];
        if (student.IsOnboarded) return res.status(400).json({ error: "Already onboarded." });
        if (new Date() > student.TokenExpiry) return res.status(400).json({ error: "Link expired." });

        res.json({ student });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. FINALIZE ONBOARDING
router.post('/finalize-onboarding', async (req, res) => {
    const { token, personalInfo } = req.body;
    try {
        const pool = await poolPromise;
        const fullAddress = `${personalInfo.houseNo}, ${personalInfo.barangay}, ${personalInfo.municipality}, ${personalInfo.province}`;
        
        await pool.request()
            .input('token', sql.UniqueIdentifier, token)
            .input('addr', sql.NVarChar, fullAddress)
            .input('gender', sql.VarChar, personalInfo.gender)
            .input('age', sql.Int, personalInfo.age)
            .input('dob', sql.Date, personalInfo.dob)
            .input('gName', sql.NVarChar, personalInfo.guardianname)
            .input('cite', sql.NVarChar, personalInfo.citizenship)
            .input('rel', sql.NVarChar, personalInfo.religion)
            .input('gOcc', sql.NVarChar, personalInfo.occupation)
            .input('gCon', sql.VarChar, personalInfo.guardiancontactnum)
            .query(`UPDATE StudentInformation 
                    SET Address = @addr, Gender = @gender,Age = @age ,DOB = @dob,
                        Citizenship = @cite, Religion = @rel,
                        GuardianName = @gName, Occupation = @gOcc, 
                        GuardianContactNumber = @gCon, IsOnboarded = 1
                    WHERE OnboardingToken = @token`);

        res.json({ success: true, message: "Onboarding complete!" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 4. UPDATE PASSWORD
router.post('/update-password', async (req, res) => {
    const { token, password } = req.body;
    try {
        const pool = await poolPromise;
        const userCheck = await pool.request()
            .input('token', sql.UniqueIdentifier, token)
            .query("SELECT LRN FROM StudentInformation WHERE OnboardingToken = @token");

        if (userCheck.recordset.length > 0) {
            const rawLrn = userCheck.recordset[0].LRN;
            await pool.request()
                .input('lrn', sql.VarChar, String(rawLrn).trim())
                .input('pw', sql.NVarChar, password)
                .query("UPDATE StudentAccount SET PasswordParam = @pw WHERE LRN = @lrn");
            res.json({ success: true });
        } else {
            res.status(404).json({ error: "Student not found." });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;