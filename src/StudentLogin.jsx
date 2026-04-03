import {
  Box,
  Button,
  Card,
  Field,
  Input,
  Stack,
  Text,
  Image,
  Heading,
  AlertRoot,
  AlertTitle,
  AlertDescription,
  AlertIndicator,
} from "@chakra-ui/react";
import { Fade } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pathfinderFetch } from './api'; 

// 1. Import Toaster and the creation utility
import { toaster, Toaster } from "./components/ui/toaster";

export default function StudentLogin() {
  const [studentLRN, setStudentLRN] = useState("");
  const [password, setPassword] = useState("");
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track loading state
  const navigate = useNavigate();

  useEffect(() => {
    setStudentLRN("");
    setPassword("");
  }, []);

  const handleLRNChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 12) {
      setStudentLRN(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentLRN || !password) {
      // 2. Use Toaster for validation errors
      toaster.create({
        title: "Required Fields",
        description: "Please enter both LRN and Password.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await pathfinderFetch("/api/student-account/login", {
        method: "POST",
        body: JSON.stringify({ LRN: studentLRN, password }),
      });

      if (!response) throw new Error("No response from server.");

      const data = await response.json();

      if (response.ok) {
        // 3. Success Toaster
        toaster.create({
          title: "Login Successful",
          description: `Welcome back, ${data.user.fullName}!`,
          type: "success",
        });

        localStorage.setItem("studentLRN", data.user.LRN);
        localStorage.setItem("studentName", data.user.fullName);
        navigate("/studentportal");
      } else {
        // 4. Invalid credentials Toaster
        toaster.create({
          title: "Login Failed",
          description: data.error || "Invalid LRN or Password.",
          type: "error",
        });
        setStudentLRN("");
        setPassword("");
      }
    } catch (err) {
      // 5. Connection Error Toaster
      toaster.create({
        title: "Network Error",
        description: "Unable to connect to the server. Please check your internet.",
        type: "error",
      });
      console.error("Critical Fetch Error:", err);
      setStudentLRN("");
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminRedirect = () => {
    setShowAdminPrompt(false);
    navigate("/login");
  };

  const slides = [
    "/Kinder.jpg",
    "/KinderToga.jpg",
    "/Grade6.jpg",
    "/Grade7.jpg",
    "/Grade10.jpg",
    "/Grade10girls.jpg",
    "/Grade10A.jpg",
  ];

  return (
    <Box h="100vh" w="100vw" display="flex" flexDirection={{ base: "column", md: "row" }}>
      {/* 6. Add the Toaster component to the root of your return */}
      <Toaster />

      {/* Left Panel with Slideshow */}
      <Box flex="1.3" position="relative" overflow="hidden">
        <Fade duration={3000} arrows={false}>
          {slides.map((src, i) => (
            <Box key={i} w="100%" h="100%">
              <Image src={src} objectFit="cover" w="100%" h="100%" />
            </Box>
          ))}
        </Fade>

        <Box position="absolute" top="20px" left="20px" zIndex={1} display="flex" flexDirection="row" alignItems="center" gap={4} p={3} borderRadius="md">
          <Heading fontSize={25} color="#ffffff" textShadow="-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" fontWeight="bold" whiteSpace="nowrap">
            PATNUBAY ACADEMY, INC.
          </Heading>
        </Box>
      </Box>

      {/* Right Panel: Login Form */}
      <Box flex="1" bg="#9333EA" display="flex" alignItems="center" justifyContent="center" p={6}>
        <Card.Root as="form" onSubmit={handleSubmit} maxW="md" w="full" bg="#ffffff" p={8} borderRadius="xl" border="1px solid">
          <Stack spacing={2} align="center" mb={6}>
            <Image src="/PATNUBAY.jpeg" alt="Patnubay Logo" boxSize="60px" borderRadius="full"/>
            <Heading fontSize={18} color="#5d7adb" fontWeight="bold">Patnubay Academy Student Portal</Heading>
          </Stack>

          <Stack spacing={4}>
            <Field.Root>
              <Field.Label>Learner Reference Number *</Field.Label>
              <Input
                placeholder="Enter your LRN"
                inputMode="numeric"
                value={studentLRN}
                onChange={handleLRNChange}
                border="1px solid"
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Password *</Field.Label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                border="1px solid"
              />
            </Field.Root>

            <Button 
              type="submit" 
              color="white" 
              w="full" 
              bg="purple.600" 
              loading={isSubmitting} // Use built-in loading prop
              _hover={{bg:"purple.700", transform: "scale(1.02)"}}
            >
              Login
            </Button>
          </Stack>
        </Card.Root>

        {/* Admin Access Toggle */}
        <Box
          position="absolute"
          bottom="20px"
          right="20px"
          p="5px"
          borderRadius="full"
          cursor="pointer"
          _hover={{ bg: "whiteAlpha.300", transform: "scale(1.1)" }}
          onClick={() => setShowAdminPrompt(true)}
        >
          <Image src="/Admin Logo.jpg" boxSize="40px" borderRadius="full" />
        </Box>
      </Box>

      {/* Admin Confirmation Popup */}
      {showAdminPrompt && (
        <Box position="fixed" inset="0" bg="blackAlpha.700" display="flex" alignItems="center" justifyContent="center" zIndex="overlay" backdropFilter="blur(4px)">
          <AlertRoot status="info" bg="white" p={6} w={{ base: "90%", sm: "400px" }} borderRadius="xl" boxShadow="2xl">
            <AlertIndicator boxSize="20px" color="red"/>
            <Box flex="1">
              <AlertTitle fontSize="lg">Switch to Employee Portal?</AlertTitle>
              <AlertDescription mt={2}>
                Are you an Employee? Click yes to proceed to the employee login.
              </AlertDescription>
              <Stack direction="row" justify="flex-end" mt={6}>
                <Button variant="outline" size="sm" onClick={() => setShowAdminPrompt(false)}>Cancel</Button>
                <Button bg="purple.600" color="white" size="sm" onClick={handleAdminRedirect}>Yes, Proceed</Button>
              </Stack>
            </Box>
          </AlertRoot>
        </Box>
      )}
    </Box>
  );
};