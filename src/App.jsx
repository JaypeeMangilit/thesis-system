import { Routes, Route, Navigate } from "react-router-dom";
import PortalLayout from "./PortalLayout";
import StudentLogin from "./StudentLogin";
import Login from "./Login";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/student-login" replace />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="login" element={<Login />} />
      <Route path="/*" element={<PortalLayout/>}/>
    </Routes>
  );
};