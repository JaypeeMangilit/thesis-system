import {
  AlertRoot,
  AlertTitle,
  AlertDescription,
  AlertIndicator,
  Button,
  Stack,
  Box,
  Spacer,
  Image,
  Avatar,
  HStack,
  Circle,
  Float,
  Text,
  Heading
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, Link, Outlet } from "react-router-dom"; // ADDED: Outlet
import { IoHome } from "react-icons/io5";
import { MdOutlineSecurity, MdAccountCircle } from "react-icons/md";
import { GiTeacher } from "react-icons/gi";
import { Layout, Sidebar, Content } from "./styled";

export default function PortalLayout() {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Employee");

  const handleLogout = () => {
    setShowLogoutPopup(false);
    localStorage.clear(); // Clear session data
    navigate("/login");
  };

  const handleCancel = () => {
    setShowLogoutPopup(false);
  };

  const Footer = () => (
    <Box
      as="footer"
      width="100%"
      py="4"
      borderTop="1px solid"
      borderColor="gray.200"
      mt="auto"
      textAlign="center"
    >
      <Text fontSize="xs" color="gray.500">
        @ 2026 Patnubay School Portal. All Rights Reserved.
      </Text>
    </Box>
  );

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  return (
    <Layout>
      <Sidebar>
        <Image
          src="/PATNUBAY.jpeg"
          alt="Patnubay Logo"
          boxSize="50px"
          borderRadius="full"
          style={{ marginLeft: "80px" }}
        />
        <Heading
          style={{ marginLeft: '55px' }}
          fontSize="22px"
          fontWeight="bold"
          textShadow="-1px -1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, 1px 1px 0 #000"
        >
          Patnubay
        </Heading>

        <Text
          fontSize="xl"
          fontWeight="bold"
          style={{ marginLeft: "25px" }}
          textShadow="-1px -1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, 1px 1px 0 #000"
        >
          Admin Portal
        </Text>

        <Spacer />
        {/* FIXED: Links now include the /admin/ prefix to match App.jsx */}
        <Link to="/admin/dashboard"><IoHome /> Home</Link>
        <Link to="/admin/adminstudents"><MdOutlineSecurity /> Students Accounts</Link>
        <Link to="/admin/teacheraccount"><GiTeacher /> Teacher Accounts</Link>
        <Link to="/admin/accountsetting"><MdAccountCircle /> Account Setting</Link>
        <Link to="/admin/report">Reports</Link>

        <Spacer />

        <HStack mb={2}>
          <Avatar.Root shape="full" size="lg">
            <Avatar.Fallback name={userName} />
            <Avatar.Image src="" />
            <Float placement="bottom-end" offsetX="1" offsetY="1">
              <Circle
                bg="green.500"
                size="8px"
                outline="0.2em solid"
                outlineColor="bg"
              />
            </Float>
          </Avatar.Root>
          <Text>{userName}</Text>
        </HStack>

        <Button 
          bg="purple" 
          maxW={200} 
          _hover={{ bg: "red", opacity: "0.5", transform: "Scale(1.05)" }} 
          onClick={() => setShowLogoutPopup(true)}
        >
          Logout
        </Button>
      </Sidebar>

      <Content>
        {/* CRITICAL FIX: Removed the internal <Routes> block.
          <Outlet /> tells React Router to render the child components 
          defined in App.jsx here.
        */}
        <Outlet /> 
        <Footer />
      </Content>

      {/* Logout Popup */}
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
            <AlertIndicator color="red" />
            <Box flex="1">
              <AlertTitle fontSize="lg" color="red">Are you sure?</AlertTitle>
              <AlertDescription mt={2} color="black">
                You're about to log out of the Admin Portal.
              </AlertDescription>
              <Stack direction="row" justify="flex-end" mt={6}>
                <Button 
                  color="white" 
                  bg="purple.700" 
                  _hover={{ bg: "gray.500" }}  
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button 
                  color="white" 
                  bg="purple.700" 
                  _hover={{ bg: "red", transform: "scale(1.05)" }}  
                  onClick={handleLogout}
                >
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