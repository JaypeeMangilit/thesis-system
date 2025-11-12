import {
  AlertRoot,
  AlertTitle,
  AlertDescription,
  AlertIndicator,
  Button,
  Stack,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, Routes, Route, Link } from "react-router-dom";
import { HiMail } from 'react-icons/hi';
import { FaGraduationCap } from 'react-icons/fa';
import { BsPersonLinesFill } from 'react-icons/bs';
import { FaSchool } from 'react-icons/fa6';
import { FaBullhorn } from 'react-icons/fa';
import { FaMedal } from 'react-icons/fa6';
import { FaPesoSign } from 'react-icons/fa6';
import { HiDocumentReport } from 'react-icons/hi';
import { Layout, Sidebar, Content } from "./styled";
import { Dashboard } from "./Dashboard";
import  Students  from "./Students";
import  Employee  from "./Employee";
import { Classes } from "./Classes";
import { Announcement } from "./Announcement";
import { Grades } from "./Grades";
import { Payment } from "./Payment";
import { Reports } from "./Reports";

export default function PortalLayout() {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowLogoutPopup(false);
    navigate("/student-login");
  };

  const handleCancel = () => {
    setShowLogoutPopup(false);
    navigate("/dashboard");
  };

  return (
    <Layout>
      <Sidebar>
        <h1>School Portal</h1>
        <Link to="/dashboard"><HiMail/>Dashboard</Link>
        <Link to="/students"><FaGraduationCap/>Students</Link>
        <Link to="/employee"><BsPersonLinesFill/>Employee</Link>
        <Link to="/classes"><FaSchool/>Classes</Link>
        <Link to="/announcement"><FaBullhorn/>Announcement</Link>
        <Link to="/grades"><FaMedal/>Grades</Link>
        <Link to="/payment"><FaPesoSign/>Accounts</Link>
        <Link to="/reports"><HiDocumentReport/>Reports</Link>
        <Button colorScheme="red" maxW={450} onClick={() => setShowLogoutPopup(true)}>
          Logout
        </Button>
      </Sidebar>

      <Content>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/employee" element={<Employee />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/announcement" element={<Announcement />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Content>

      {showLogoutPopup && (
        <Box
          position="fixed"
          top="0"
          left="0"
          w="100vw"
          h="100vh"
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="overlay"
        >
          <AlertRoot
            status="warning"
            variant="subtle"
            bg="white"
            borderRadius="md"
            p={6}
            w={{ base: "90%", sm: "400px" }}
            boxShadow="xl"
          >
            <AlertIndicator />
            <Box flex="1">
              <AlertTitle fontSize="lg">Are you sure?</AlertTitle>
              <AlertDescription mt={2}>
                You're about to log out of the School Portal.
              </AlertDescription>
              <Stack direction="row" justify="flex-end" mt={6}>
                <Button colorScheme="orange" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleLogout}>
                  Confirm Logout
                </Button>
              </Stack>
            </Box>
          </AlertRoot>
        </Box>
      )}
    </Layout>
  );
};