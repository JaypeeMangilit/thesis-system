import { Routes, Route, Navigate } from "react-router-dom";
import PortalLayout from "./PortalLayout"; // Admin layout
import StudentLogin from "./StudentLogin";
import Login from "./Login";
import StudentPortal from "./StudentPortal";
import StudentDashboard from "./StudentDashboard";
import StudentSchedule from "./StudentSchedule";
import StudentGrades from "./StudentGrades";
import StudentAccounts from "./StudentAccounts";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/student-login" replace />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/login" element={<Login />} />

      {/* Student Portal with nested routes */}
      <Route path="/studentportal" element={<StudentPortal />}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="schedule" element={<StudentSchedule />} />
        <Route path="grades" element={<StudentGrades />} />
        <Route path="accounts" element={<StudentAccounts />} />
      </Route>

      {/* Admin Portal */}
      <Route path="/*" element={<PortalLayout />} />
    </Routes>
  );
};