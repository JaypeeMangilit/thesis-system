import { Routes, Route, Navigate } from "react-router-dom";
import PortalLayout from "./PortalLayout"; // This is your Admin Layout

// Login/Base Views 
import StudentLogin from "./StudentLogin";
import Login from "./Login"; 

// Student Portal
import StudentPortal from "./StudentPortal";
import StudentDashboard from "./StudentDashboard";
import StudentSchedule from "./StudentSchedule";
import StudentGrades from "./StudentGrades";
import StudentProfile from "./StudentProfile";

// Registrar Portal 
import RegistrarPortal from "./RegistrarPortal";
import RegistrarDashboard from "./RegistrarDashboard";
import RegistrarStudentList from "./RegistrarStudentList";
import RegistrarStudentTable from "./RegistrarStudentTable";
import RegistrarEnrollment from "./RegistrarEnrollment";
import RegistrarGradeSections from "./RegistrarStudentGradeSections";
import RegistrarAddStudentInformation from "./RegistrarAddStudentInformation";
import StudentOnboarding from "./StudentOnboarding";
import ResgistrarCertifications from "./RegistrarCertificate";

// Teacher Portal
import TeacherPortal from "./TeacherPortal";
import TeacherDashboard from "./TeacherDashboard";
import TeacherMasterList from "./TeacherMasterList";
import TeacherStudentAttendance from "./TeacherStudentAttendance";
import TeacherSchedule from "./TeacherSchedule";
import MasterListTable from "./MasterListTable";
import TeacherProfile from "./TeacherProfile";
import TeacherPublishGrades from "./TeacherPublishGrades";

// Department Portal
import DepartmentPortal from "./DepartmentPortal";
import DepartmentDashboard from "./DepartmentDashboard";
import DepartmentElementary from "./DepartmentElementary";
import DepartmentJuniorHigh from "./DepartmentJuniorHigh";
import DepartmentAssign from "./DepartmentAssign";

// Admin Components (Used inside PortalLayout)
import Dashboard from "./Dashboard";
import AdminStudents from "./AdminStudentAccounts";
import AdminTeacherAccounts from "./AdminTeacherAccounts";
import AdminAccountSetting from "./AdminAccountSetting";
import AdminReports from "./AdminReport";

export default function App() {
  return (
    <Routes>
      {/* 1. Base / Auth Routes */}
      <Route path="/" element={<Navigate to="/student-login" replace />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/login" element={<Login />} />

      {/* 2. Student Portal */}
      <Route path="/studentportal" element={<StudentPortal />}>
        <Route index element={<StudentDashboard />}/>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="schedule" element={<StudentSchedule />} />
        <Route path="grades" element={<StudentGrades />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* 3. Registrar Portal (FIXED: Added double params for students) */}
      <Route path="/registrar" element={<RegistrarPortal />}>
        <Route index element={<RegistrarDashboard />} />
        <Route path="registrardashboard" element={<RegistrarDashboard />} />
        <Route path="studentlist" element={<RegistrarStudentList />}/>
        {/* This route now matches RegistrarStudentTable's expectations */}
        <Route path="students/:gradeLevel/:sectionName" element={<RegistrarStudentTable />}/>
        <Route path="sections/:gradeId" element={<RegistrarGradeSections />}/>
        <Route path="enrollment" element={<RegistrarEnrollment />}/>
        <Route path="AddstudentInformation" element={<RegistrarAddStudentInformation />}/>
        <Route path="registrarcert" element={<ResgistrarCertifications />}/>
      </Route>

      {/* 4. Teacher Portal */}
      <Route path="/teacher" element={<TeacherPortal />}>
        <Route index element={<TeacherDashboard />}/>
        <Route path="teacherdashboard" element={<TeacherDashboard />}/>
        <Route path="teachermasterlist" element={<TeacherMasterList />}/>
        <Route path="teacherstudentattandance" element={<TeacherStudentAttendance />}/>
        <Route path="teacherschedule" element={<TeacherSchedule/>}/>
        <Route path="masterlist-table/:sectionId" element={<MasterListTable />}/>
        <Route path="teacherprofile" element={<TeacherProfile />}/>
        <Route path="teacherpublishgrades" element={<TeacherPublishGrades />} />
      </Route>

      {/* 5. Department Portal */}
      <Route path="/department" element={<DepartmentPortal />}>
        <Route index element={<DepartmentDashboard />}/>
        <Route path="departmentdashboard" element={<DepartmentDashboard />}/>
        <Route path="departmentelementary" element={<DepartmentElementary />}/>
        <Route path="departmentjuniorhigh" element={<DepartmentJuniorHigh />}/>
        <Route path="departmentassign" element={<DepartmentAssign/>}/>
      </Route>

      {/* 6. Admin Portal (FIXED: Nested properly to avoid hijacking) */}
      <Route path="/admin" element={<PortalLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="adminstudents" element={<AdminStudents />} />
        <Route path="teacheraccount" element={<AdminTeacherAccounts />}/>
        <Route path="accountsetting" element={<AdminAccountSetting />}/>
        <Route path="report" element={<AdminReports />}/>
      </Route>

      {/* 7. Onboarding */}
      <Route path="/onboard/:token" element={<StudentOnboarding />}/>

      {/* 8. Global Catch-all (FIXED: Redirect to login, NOT the Admin layout) */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};