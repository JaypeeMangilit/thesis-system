import express from 'express';
const router = express.Router();
import {loginEmployee, getAdminDashboardData} from '../controllers/user.controller.js';
import {protect, restrictTo} from '../middleware/auth.middleware.js';

//Public Route for Login
router.post('/Login', loginEmployee);

// Protected Routes with Role Restriction

//Admin Dashboard route
router.get(
    '/dashboard',
    protect, //Token Verification
    restrictTo(['admin']), //Role checking
    getAdminDashboardData
);

//Department Head Dashboard Route
router.get(
    '/department/departmentdashboard',
    protect,
    restrictTo(['admin', 'department']),
    (req, res) => res.status(200).json({message: "Department Head Dashboard."})
);

//Teacher Dashboard Route
router.get(
    '/teacher/dashboard',
    protect,
    restrictTo(['teacher']),
    (req, res) => res.status(200).json({message: "Teacher Dashboard."})
);

//Registrar Dashboard Route
router.get(
    '/registrar/dashboard',
    protect,
    restrictTo(['registrar', 'admin']),
    (req, res) => res.status(200).json({message: "Registrar student records."})
);


export default router;