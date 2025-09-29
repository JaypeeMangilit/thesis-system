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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import bgVideo from "./assets/BgVideoLogin.mp4"; 

export default function Login() {
  const [id, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!id || !password) {
      setError("Username and Password are required.");
      return;
    }
    setError("");
    navigate("/dashboard");
  };

  const handleStudentRedirect = () => {
    navigate("/student-login");
  };

  return (
    <>
      <Flex h="100vh" w="100vw" position="relative" zIndex={1}>
        {/* Left Panel */}
        <Box
          flex="1"
          position="relative"
          overflow="hidden"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* Background Video animation*/}
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            zIndex={0}
          >
            <video
              src={bgVideo}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>

          {/* Overlay Content logo */}
          <Box
            position="relative"
            zIndex={1}
            textAlign="center"
            color="#ffffffff"
            p={8}
          >
            <Image
              src="/PathFinder.png"
              alt="PathFinder Logo"
              boxSize="60px"
              borderRadius="full"
              mb={5}
            />
            <Heading fontSize={50} fontWeight="bold">
              PathFinder
            </Heading>
          </Box>
        </Box>

        {/* Right Panel and Admin Login Form */}
        <Box
          flex="1"
          bg="#5A7FB4"
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          <Box
            as="form"
            onSubmit={handleSubmit}
            bg="white"
            p={8}
            borderRadius="md"
            boxShadow="lg"
            w="100%"
            maxW="400px"
            zIndex={2}
          >
            <Heading size="md" mb={6} textAlign="center" fontWeight="bold">
              Admin Login
            </Heading>

            <Stack spacing={4}>
              {error && <Text color="red.500">{error}</Text>}

              <Box>
                <Text mb={1} fontWeight="bold">Username:</Text>
                <Input
                  placeholder="Enter your Username"
                  value={id}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Box>

              <Box>
                <Text mb={1} fontWeight="bold">Password:</Text>
                <Input
                  type="password"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Box>

              <Button type="submit" colorScheme="blue" w="full">
                Login
              </Button>
            </Stack>
          </Box>

          {/* Icon for Student Login Redirect */}
          <Box position="absolute" bottom="4" right="4" zIndex={2}>
            <Button variant="ghost" p={0} onClick={handleStudentRedirect}>
              <Icon as={FaHome} boxSize={6} color="gray.600" />
            </Button>
          </Box>
        </Box>
      </Flex>
    </>
  );
}
