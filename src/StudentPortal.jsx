import { useNavigate, Link, Outlet } from "react-router-dom";
import { AlertRoot,Box, AlertIndicator, AlertDescription, Stack, AlertTitle, Button, HStack, Avatar, Text} from "@chakra-ui/react";
import { useState } from "react";
import { Layout, Sidebar, Content } from "./styled";
import { HiMail } from 'react-icons/hi';
import { FaMedal } from 'react-icons/fa6';
import { FaCalendarCheck } from 'react-icons/fa';
import { FaPesoSign } from 'react-icons/fa6';


export default function StudentPortal(){
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowLogoutPopup(false);
    navigate("/student-login");
  };

  const handleCancel = () => {
    setShowLogoutPopup(false);
    navigate("/studentportal");
  };

    return (
        <Layout>
            <Sidebar>
                <h1>PathFinder</h1>
                <Link to="dashboard"><HiMail/>Dashboard</Link>
                <Link to="schedule"><FaCalendarCheck/>Schedule</Link>
                <Link to="grades"><FaMedal/>Grades</Link>
                <Link to="accounts"><FaPesoSign/>Accounts</Link>
                
                    <Box>
                        <Text fontSize="sm">(fullname)</Text>
                        <Text fontSize="xs" color="gray.300">Administrator</Text>
                    </Box>
                    <Button size="sm" colorScheme="red" onClick={() => setShowLogoutPopup(true)}>
                        Logout
                    </Button>
            </Sidebar>

            <Content>
                <Outlet/>
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