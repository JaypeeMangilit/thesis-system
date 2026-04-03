import express from 'express';
import { poolPromise, sql } from '../db.js';

const router = express.Router();

router.get('/search-student/:id', async (req, res) => {
    const searchTerm = req.params.id; // This is the value from the URL
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('searchVariable', sql.VarChar, searchTerm) // We name it 'searchVariable' here
            .query(`
                SELECT 
                    SI.LRN, 
                    SI.FirstName, 
                    SI.LastName, 
                    SI.Address, 
                    SI.Status,
                    SI.DOB, 
                    SI.GuardianName, 
                    SI.GuardianContactNumber, 
                    SI.Gender,
                    SI.Citizenship,
                    SI.Religion, 
                    SI.SectionID,
                    S.SectionName, 
                    S.GradeLevel
                FROM dbo.StudentInformation SI
                LEFT JOIN dbo.Sections S ON SI.SectionID = S.SectionID
                WHERE CAST(SI.LRN AS VARCHAR) = @searchVariable
                OR SI.FirstName LIKE '%' + @searchVariable + '%'
                OR SI.LastName LIKE '%' + @searchVariable + '%'
                OR (SI.FirstName + ' ' + SI.LastName) LIKE '%' + @searchVariable + '%'
            `); // Use @searchVariable to match the .input() above

        if (result.recordset.length > 0) {
            const s = result.recordset[0];

            // This cleans up the "many zeros" in the Date of Birth
            const formattedDOB = s.DOB ? new Date(s.DOB).toISOString().split('T')[0] : '---';

            res.json({
                id: s.LRN,
                name: `${s.FirstName} ${s.LastName}`.trim(),
                status: s.Status || 'N/A', 
                section: s.SectionName || 'Unassigned',
                dob: formattedDOB,
                gradeLevel: s.GradeLevel || 'N/A',
                address: s.Address || 'N/A',
                sex: s.Gender || '---', 
                guardian: s.GuardianName || 'N/A',
                citizenship: s.Citizenship || '---',
                religion: s.Religion || '---',
                guardianContact: s.GuardianContactNumber || '---',
            });
        } else {
            res.status(404).json({ message: "Student not found" });
        }
    } catch (err) {
        console.error("SQL ERROR:", err.message); 
        res.status(500).json({ error: "Database error during search" });
    }
});

export default router;