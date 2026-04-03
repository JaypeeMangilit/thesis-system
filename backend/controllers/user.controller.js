import { poolPromise, sql } from "../db.js";
import jwt from 'jsonwebtoken';

// Role mapping logic
const roleMap = {
    'MTCNOVAD': 'admin',
    'MTCNOVREG': 'registrar',
    'MTCNOVTC': 'teacher',
    'MTCNOVDH': 'department',
};

const getRoleFromEmployeeId = (employeeId) => {
    for (const prefix in roleMap) {
        if (employeeId.toUpperCase().startsWith(prefix)) {
            return roleMap[prefix];
        }
    }
    return null;
};

// Login Function
export const loginEmployee = async (req, res) => {
    const { Employee_ID, password } = req.body;

    if (!Employee_ID || !password) {
        return res.status(400).json({ message: "Employee ID and password are required." });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("Employee_ID", sql.NVarChar, Employee_ID)
            .input("Password", sql.NVarChar, password) 
            .query(`
                SELECT
                    A.Employee_ID,
                    ISNULL(CONCAT(I.FirstName, ' ', I.LastName), 'Unknown Employee') AS FullName
                FROM EmployeeAccounts A
                LEFT JOIN EmployeeInformation I ON A.Employee_ID = I.Employee_ID
                WHERE A.Employee_ID = @Employee_ID
                AND TRIM(A.Password) = @Password;
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const employee = result.recordset[0];
        const role = getRoleFromEmployeeId(employee.Employee_ID);
        
        if (!role) {
             return res.status(403).json({ message: 'Employee ID does not have an assigned role prefix.' });
        }

        //LoginLogs Logic
        const roleLabels = {
            'admin' : 'Admin',
            'teacher' : 'Teacher',
            'department' : 'Department Head',
            'registrar' : 'Registrar'
        };

        const graphRole = roleLabels[role] || 'Staff';

        await pool.request()
            .input("UserRole", sql.NVarChar, graphRole)
            .query(`
                INSERT INTO LoginLogs (UserRole, LoginDate)
                VALUES (@UserRole, GETDATE())    
            `);

        // FIX: Added 'name' so the Audit Logger knows who you are
        const token = jwt.sign(
            { 
                employeeId: employee.Employee_ID, 
                name: employee.FullName, 
                role: role 
            },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            employeeId: employee.Employee_ID,
            fullName: employee.FullName,
            role: role,
            token: token,
        });
        
    } catch (err) {
        console.error('LOGIN ERROR:', err.message); 
        res.status(500).json({ message: 'Server error during login.' });
    }
};

export const getAdminDashboardData = (req, res) => {
    res.status(200).json({
        message: `Welcome to the Admin Dashboard, ${req.user.name}.`,
        role: req.user.role
    });
};