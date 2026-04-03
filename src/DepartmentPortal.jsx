import { useNavigate, Link,Outlet} from "react-router-dom";
import { AlertRoot,Box, HStack, Float, Heading,Circle, AlertIndicator, AlertDescription, Stack, AlertTitle, Button, Avatar, Text, Spacer, Image} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Layout, Sidebar, Content } from "./styled";
import { IoMdHome } from "react-icons/io";


const Footer = () => (
    <Box
        as="footer"
        width="100%"
        py="0"
        borderTop="1px solid"
        borderColor="gray.200"
        mt="auto"
        textAlign="center"
    >
        <Text fontSize="xs" color="gray.500">
            @ 2026 PathFinder School Portal. All Rights Reserved.
        </Text>
    </Box>
);

export default function DepartmentPortal () {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Employee");

  const handleLogout = () => {
    setShowLogoutPopup(false);
    navigate("/login");
  };

  const handleCancel = () => {
    setShowLogoutPopup(false);
    navigate("departmentdashboard");
  };

  useEffect (() => {
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
                    style={{marginLeft: "80px"}}
                
                />

                <Heading
                    style={{ marginLeft: '55px'}}
                    fontSize="22px"
                    fontWeight="bold"
                    textShadow="-1px -1px 0 #000,
                    -1px 1px 0 #000,
                    1px -1px 0 #000,
                    1px 1px 0 #000
                    "
                >Patnubay</Heading>

                <Text
                    fontSize="xl"
                    fontWeight="bold"
                    style={{marginLeft: "25px"}}
                    textShadow="-1px -1px 0 #000,
                    -1px 1px 0 #000,
                    1px -1px 0 #000,
                    1px 1px 0 #000
                    "
                >Academy Portal</Text>

                <Spacer />
                <Link to="departmentdashboard"><IoMdHome/>Home</Link>
                <Link to="departmentelementary">Deparment Head Elementary</Link>
                <Link to="departmentjuniorhigh">Department Head Junior High</Link>
                <Link to="departmentassign">Assign Advisory Teacher</Link>
                
                <Spacer />

                <HStack mb={2}>
                    <Avatar.Root shape="full" size="lg">
                    <Avatar.Fallback name="" />
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
                    <Button size="sm" bg="purple.700" color="white"  onClick={() => setShowLogoutPopup(true)} _hover={{bg: "red", transform: "scale(1.05)", opacity: "0.5"}}>
                        Logout
                    </Button>
            </Sidebar>

            <Content>
                <Outlet />
                <Footer />
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
                        <AlertIndicator color="red"/>
                        <Box flex="1">
                            <AlertTitle fontSize="lg" color="red">Are you sure?</AlertTitle>
                            <AlertDescription mt={2} color="black">
                                You're about to log out of the Portal.
                            </AlertDescription>
                            <Stack direction="row" justify="flex-end" mt={6}>
                                <Button color="white" bg="purple.700" _hover={{bg: "red", transform: "scale(1.05)", opacity: "0.5"}} onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button color="white" bg="purple.700" _hover={{bg: "red", transform: "scale(1.05)", opacity: "0.5"}} onClick={handleLogout}>
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