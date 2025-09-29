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

import { Layout, Sidebar, Content } from "./styled";
import { Dashboard } from "./Dashboard";
import { Students } from "./Students";
import { Teachers } from "./Teachers";
import { Classes } from "./Classes";
import { Attendance } from "./Attendance";
import { Grades } from "./Grades";
import { Finance } from "./Finance";
import { Reports } from "./Reports";

export default function PortalLayout() {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowLogoutPopup(false);
    navigate("/login");
  };

  const handleCancel = () => {
    setShowLogoutPopup(false);
    navigate("/dashboard");
  };

  return (
    <Layout>
      <Sidebar>
        <h1>School Portal</h1>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/students">Students</Link>
        <Link to="/teachers">Teachers</Link>
        <Link to="/classes">Classes</Link>
        <Link to="/attendance">Attendance</Link>
        <Link to="/grades">Grades</Link>
        <Link to="/finance">Finance</Link>
        <Link to="/reports">Reports</Link>
        <Button colorScheme="red" onClick={() => setShowLogoutPopup(true)}>
          Logout
        </Button>
      </Sidebar>

      <Content>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/finance" element={<Finance />} />
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