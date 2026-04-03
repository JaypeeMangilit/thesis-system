import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  Image,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import bgImage from "/BackgroundAdmin.jpg";

// 1. Import the toaster (using the relative path we discussed)
import { toaster } from "./components/ui/toaster";
import { pathfinderFetch } from './api'; //helper audit trail

export default function Login() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setEmployeeId("");
    setPassword("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!employeeId || !password) {
      // 2. Replaced setError with a Warning Toast
      toaster.create({
        title: "Required Fields",
        description: "Employee ID and Password are required.",
        type: "warning",
        duration: 1000,
      });
      return;
    }

    try {
      const response = await pathfinderFetch("http://localhost:3000/api/employee-accounts/Login", {
        method: "POST",
        body: JSON.stringify({ Employee_ID: employeeId, password }),
      });

      const result = await response.json();

      if (response.ok) {
        const finalName = result.fullName || "User";
        const role = result.role;
        localStorage.setItem('userName', finalName);
        localStorage.setItem('authToken', result.token);

        localStorage.setItem('userRole', role);

        // 3. Replaced Welcome Alert with Success Toast
        toaster.create({
          title: "Login Successful",
          description: `Welcome back, ${finalName}!`,
          type: "success",
        });

        let redirectPath = '/login';
        switch (role) {
          case 'admin': redirectPath = '/admin/dashboard'; break;
          case 'department': redirectPath = '/department'; break;
          case 'teacher': redirectPath = '/teacher'; break;
          case 'registrar': redirectPath = '/registrar/registrardashboard'; break;
          case 'guidance': redirectPath = '/guidance'; break;
          default: redirectPath = '/dashboard';
        }

        // Slight delay so user can see the success toast before redirecting
        setTimeout(() => {
          navigate(redirectPath);
        }, 1000);

      } else {
        // 4. Replaced Error Alert with Error Toast
        toaster.create({
          title: "Login Failed",
          description: result.message || "Invalid credentials.",
          type: "error",
        });
        setEmployeeId("");
        setPassword("");
      }
    } catch (err) {
      // 5. Connection Error Toast
      toaster.create({
        title: "Server Error",
        description: "Unable to connect to the server. Please check your connection.",
        type: "error",
      });
      setEmployeeId("");
      setPassword("");
    }
  };

  const handleStudentRedirect = () => {
    navigate("/student-login");
  };

  return (
    <Flex
      h="100vh"
      w="100vw"
      backgroundImage={`url(${bgImage})`}
      backgroundSize="cover"
      backgroundPosition="center"
      align="center"
      justify="center"
      position="relative"
    >
      <Box
        position="absolute"
        top="8"
        left="8"
        zIndex={1}
        color="white"
        textShadow="0 0 5px rgba(0, 0, 0, 0.47)"
      >
        <Image
          src="/PATNUBAY.jpeg"
          alt="Patnubay Logo"
          boxSize="60px"
          borderRadius="full"
          mb={2}
          style={{ marginLeft: '45px' }}
        />
        <Heading fontSize="3xl" fontWeight="bold" textAlign="center" textShadow="-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000">
          Patnubay
        </Heading>
        <Text fontSize="lg" textAlign="center" textShadow="-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000">
          Academy, Inc
        </Text>
      </Box>

      <Box
        as="form"
        onSubmit={handleSubmit}
        bg="rgba(255, 255, 255, 0.2)"
        backdropFilter="blur(8px)"
        p={8}
        borderRadius="md"
        boxShadow="xl"
        w="100%"
        maxW="400px"
        zIndex={2}
      >
        <Heading size="md" mb={6} textAlign="center" color="black">
          Employee Login Portal
        </Heading>

        <Stack spacing={4}>
          <Box>
            <Text mb={1} fontWeight="bold" color="black">
              Employee ID:
            </Text>
            <Input
              placeholder="Enter your Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              bg="whiteAlpha.800"
              color="black"
            />
          </Box>

          <Box>
            <Text mb={1} fontWeight="bold" color="black">
              Password:
            </Text>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg="whiteAlpha.800"
              color="black"
            />
          </Box>

          <Button 
            type="submit" 
            bg="purple" 
            _hover={{ bg: "purple.600", transform: "scale(1.02)" }} 
            w="full" 
            fontWeight="bolder" 
            color="white"
          >
            Login
          </Button>
        </Stack>
      </Box>

      <Box position="absolute" bottom="4" right="4" zIndex={2}>
        <Button variant="ghost" p={0} onClick={handleStudentRedirect}>
          <Icon as={FaHome} boxSize={6} color="white" />
        </Button>
      </Box>
    </Flex>
  );
};