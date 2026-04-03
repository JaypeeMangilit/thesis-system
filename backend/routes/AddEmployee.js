import express from 'express';
import { poolPromise, sql } from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { 
        employeeId, password, lastName, firstName, middleName, 
        age, address, position, dob, status, contactNum 
    } = req.body;

    try {
        const pool = await poolPromise;
        // Start a transaction to ensure both tables are updated together
        const transaction = new sql.Transaction(pool);
        
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);

            // 1. Insert into EmployeeAccounts (Login Details)
            await request
                .input('EID', sql.VarChar, employeeId)
                .input('PW', sql.VarChar, password)
                .query(`
                    INSERT INTO EmployeeAccounts (Employee_ID, Password)
                    VALUES (@EID, @PW)
                `);

            // 2. Insert into EmployeeInformation (Personal Details)
            await request
                .input('LN', sql.VarChar, lastName)
                .input('FN', sql.VarChar, firstName)
                .input('MN', sql.VarChar, middleName)
                .input('AgeVal', sql.Int, age)
                .input('Addr', sql.VarChar, address)
                .input('Pos', sql.VarChar, position)
                .input('Birth', sql.Date, dob)
                .input('Stat', sql.VarChar, status)
                .input('Contact', sql.VarChar, contactNum)
                .query(`
                    INSERT INTO EmployeeInformation 
                    (Employee_ID, LastName, FirstName, MiddleName, Age, Address, Position, DOB, Status, ContactNum)
                    VALUES 
                    (@EID, @LN, @FN, @MN, @AgeVal, @Addr, @Pos, @Birth, @Stat, @Contact)
                `);

            await transaction.commit();
            res.status(200).json({ message: "Employee registered in both tables successfully!" });

        } catch (err) {
            await transaction.rollback();
            throw err; // Send to the outer catch block
        }

    } catch (err) {
        console.error("Database Error:", err.message);
        // Provide specific error info to help debugging
        res.status(500).json({ error: "Failed to register employee: " + err.message });
    }
});

//delete accounts API
router.delete('/delete', async (req, res) => {
    const { employeeIds } = req.body;

    // Fixed the logic flip: 
    // Error if IDs don't exist OR if it's NOT an array OR if array is empty
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
        return res.status(400).json({ error: "No Employee ID Provided" });
    }

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // We create the request INSIDE the loop or reset it 
            // to ensure parameters are fresh for each ID
            for (const id of employeeIds) {
                const request = new sql.Request(transaction);
                
                // Use a consistent parameter name
                request.input('TargetID', sql.VarChar, id);

                // 1. Delete from Information table
                await request.query(`DELETE FROM EmployeeInformation WHERE Employee_ID = @TargetID`);

                // 2. Delete from Accounts table
                await request.query(`DELETE FROM EmployeeAccounts WHERE Employee_ID = @TargetID`);
            }

            await transaction.commit();
            res.status(200).json({ message: "Accounts Deleted Successfully." });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error("Delete SQL Error:", err.message);
        res.status(500).json({ error: "Failed to Delete Record: " + err.message });
    }
});

export default router;