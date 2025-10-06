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
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentLogin() {
  const [studentLRN, setStudentLRN] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentLRN || !password) {
      setError("LRN and Password are required.");
      return;
    }
    setError("");
    navigate("/studentportal"); //redirect to student portal dashboard
  };

  const handleAdminRedirect = () => {
    setShowAdminPrompt(false);
    navigate("/login"); //admin redirectory
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
      {/* Left Panel with Slideshow */}
      <Box flex="1.3" position="relative" overflow="hidden">
        <Fade duration={3000} arrows={false}>
          {slides.map((src, i) => (
            <Box key={i} w="100%" h="100%">
              <Image src={src} objectFit="cover" w="100%" h="100%" />
            </Box>
          ))}
        </Fade>

        {/* Overlay Logo + Heading */}
        <Box
          position="absolute"
          top="20px"
          left="20px"
          zIndex={1}
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap={4}
          p={3}
          borderRadius="md"
        >
          <Image
            src="/PATNUBAY.jpeg"
            alt="Patnubay Logo"
            boxSize="60px"
            borderRadius="full"
          />
          <Heading fontSize={25} color="#5A7FB4" fontWeight="bold"  whiteSpace="nowrap">
            PATNUBAY ACADEMY, INC.
          </Heading>
        </Box>
      </Box>

      {/* Right Panel: PathFinder Login */}
      <Box
        flex="1"
        bg="#E0F2FF"
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={6}
      >
        <Card.Root
          as="form"
          onSubmit={handleSubmit}
          maxW="md"
          w="full"
          bg="#E0F2FF"
          p={8}
          borderRadius="xl"
        >
          <Stack spacing={2} align="center" mb={6}>
            <Image src="/PathFinder.png" alt="PathFinder Logo" boxSize="60px" borderRadius="full"/>
            <Heading fontSize={25} color="#5A7FB4" fontWeight="bold">PathFinder</Heading>
          </Stack>

          <Stack spacing={4}>
            {error && <Text color="red.500">{error}</Text>}

            <Field.Root>
              <Field.Label>LRN *</Field.Label>
              <Input
                placeholder="Enter your LRN"
                value={studentLRN}
                onChange={(e) => setStudentLRN(e.target.value)}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Password *</Field.Label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field.Root>

            <Button type="submit" colorScheme="blue" w="full">
              Login
            </Button>
          </Stack>
        </Card.Root>

        {/* Bottom-right Admin Logo */}
        <Image
          src="/PATNUBAY.jpeg"
          alt="Admin Access"
          boxSize="40px"
          borderRadius="full"
          position="absolute"
          bottom="20px"
          right="20px"
          cursor="pointer"
          onClick={() => setShowAdminPrompt(true)}
        />
      </Box>

      {/* Admin Confirmation Popup */}
      {showAdminPrompt && (
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
            status="info"
            variant="subtle"
            bg="white"
            p={6}
            w={{ base: "90%", sm: "400px" }}
            boxShadow="xl"
          >
            <AlertIndicator />
            <Box flex="1">
              <AlertTitle fontSize="lg">Proceed to Admin Portal?</AlertTitle>
              <AlertDescription mt={2}>
                Do you want to proceed to the Admin Portal?
              </AlertDescription>
              <Stack direction="row" justify="flex-end" mt={6}>
                <Button onClick={() => setShowAdminPrompt(false)}>Cancel</Button>
                <Button colorScheme="blue" onClick={handleAdminRedirect}>
                  Yes
                </Button>
              </Stack>
            </Box>
          </AlertRoot>
        </Box>
      )}
    </Box>
  );
};