import express from 'express';
import { poolPromise, sql } from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const d = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input('SchoolYear', sql.NVarChar, d.SchoolYear || '')
            .input('LRN', sql.NVarChar, d.LRN || '')
            .input('LastName', sql.NVarChar, d.LastName || '')
            .input('FirstName', sql.NVarChar, d.FirstName || '')
            .input('MiddleName', sql.NVarChar, d.MiddleName || '')
            .input('Age', sql.Int, parseInt(d.Age) || 0)
            .input('GradeLevel', sql.NVarChar, d.GradeLevel || '')
            .input('Sex', sql.NVarChar, d.Sex || '')
            .input('Email', sql.NVarChar, d.Email || '')
            .input('ContactNumber', sql.NVarChar, d.ContactNumber || '')
            .input('StudentAddress', sql.NVarChar, d.StudentAddress || '')
            .input('MotherName', sql.NVarChar, d.MotherName || '')
            .input('MotherOccupation', sql.NVarChar, d.MotherOccupation || '')
            .input('FatherName', sql.NVarChar, d.FatherName || '')
            .input('FatherOccupation', sql.NVarChar, d.FatherOccupation || '')
            .input('GuardianName', sql.NVarChar, d.GuardianName || '')
            .input('GuardianOccupation', sql.NVarChar, d.GuardianOccupation || '')
            .input('GuardianEmail', sql.NVarChar, d.GuardianEmail || '')
            .input('GuardianContact', sql.NVarChar, d.GuardianContact || '')
            .input('GuardianFacebook', sql.NVarChar, d.GuardianFacebook || '')
            .input('Birthplace', sql.NVarChar, d.BirthPlace || '')
            // Bits
            .input('HasForm137', sql.Bit, d.HasForm137 === 1)
            .input('HasCard138', sql.Bit, d.HasCard138 === 1)
            .input('HasGoodMoral', sql.Bit, d.HasGoodMoral === 1)
            .input('HasNsoPsa', sql.Bit, d.HasNsoPsa === 1)
            .input('HasIdPic', sql.Bit, d.HasIdPic === 1)
            .input('HasDiploma', sql.Bit, d.HasDiploma === 1)
            .input('HasIndigency', sql.Bit, d.HasIndigency === 1)
            .query(`
                INSERT INTO StudentEnrollments 
                (SchoolYear, LRN, LastName, FirstName, MiddleName, Age, GradeLevel, Sex, Email, ContactNumber, StudentAddress,
                 MotherName, MotherOccupation, FatherName, FatherOccupation, GuardianName, GuardianOccupation, GuardianEmail,
                 GuardianContact, GuardianFacebook,Birthplace, 
                 HasForm137, HasCard138, HasGoodMoral, HasNsoPsa, HasIdPic, HasDiploma, HasIndigency)
                VALUES 
                (@SchoolYear, @LRN, @LastName, @FirstName, @MiddleName, @Age, @GradeLevel, @Sex, @Email, @ContactNumber, @StudentAddress,
                 @MotherName, @MotherOccupation, @FatherName, @FatherOccupation, @GuardianName, @GuardianOccupation,
                 @GuardianEmail, @GuardianContact, @GuardianFacebook,@Birthplace,
                 @HasForm137, @HasCard138, @HasGoodMoral, @HasNsoPsa, @HasIdPic, @HasDiploma, @HasIndigency)
            `);

        res.status(200).json({ message: "Success" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB Error", details: err.message });
    }
});

export default router;