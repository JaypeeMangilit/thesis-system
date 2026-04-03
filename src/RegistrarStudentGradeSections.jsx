import { 
    Box, Heading, Card, SimpleGrid, Button, Text, Spinner, Center, Flex, IconButton, VStack, HStack, Icon, Separator 
} from "@chakra-ui/react";
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { pathfinderFetch } from './api';
import { LuTrash, LuArrowLeft, LuTriangleAlert  } from "react-icons/lu";

// 1. Ensure these paths are 100% correct for your project structure
import { toaster, Toaster } from "./components/ui/toaster";

export default function RegistrarGradeSections() {
    const { gradeId } = useParams();
    const navigate = useNavigate();
    
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    // MODAL STATES
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [targetSection, setTargetSection] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchSections = () => {
        setLoading(true);
        pathfinderFetch(`http://localhost:3000/api/sections/${gradeId}`)
            .then(res => res.json())
            .then(data => {
                setSections(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchSections();
    }, [gradeId]);

    // 2. REPLACED ALL NATIVE ALERTS WITH THIS STATE TRIGGER
    const startDeleteProcess = (section) => {
        setTargetSection(section);
        setShowDeleteModal(true);
    };

    const finalDeleteAction = async () => {
        if (!targetSection) return;
        setIsDeleting(true);
        
        try {
            const response = await fetch(`http://localhost:3000/api/sections/${targetSection.SectionID}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toaster.create({
                    title: "Section Removed",
                    type: "success",
                });
                setShowDeleteModal(false);
                fetchSections();
            }
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setIsDeleting(false);
            setTargetSection(null);
        }
    };

    return (
        <Box p={8} bg="gray.50" minH="100vh">
            <Toaster />

            <Flex justify="space-between" align="center" mb={8} borderBottom="2px solid" borderColor="purple.500" pb={4}>
                <Heading size="2xl" color="purple.700"> Grade: {gradeId} Sections</Heading>
                <Button bg="purple.600" color="white" onClick={() => navigate('/registrar/studentlist')}>
                    <LuArrowLeft /> Back
                </Button>
            </Flex>

            {loading ? <Center mt={20}><Spinner color="purple.500" /></Center> : (
                <SimpleGrid columns={{ base: 1, md: 4 }} gap={6}>
                    {sections.map((s) => (
                        <Card.Root key={s.SectionID} bg="white" shadow="md">
                            <Card.Body>
                                <Flex justify="space-between" align="center">
                                    <Card.Title color="purple.700">Section: {s.SectionName}</Card.Title>
                                    <IconButton
                                        variant="ghost"
                                        color="red.500"
                                        onClick={() => startDeleteProcess(s)} // NO WINDOW.CONFIRM HERE
                                    >
                                        <LuTrash />
                                    </IconButton>
                                </Flex>
                                <Text fontSize="sm" color="gray.600">Adviser: {s.Adviser || "Not Set"}</Text>
                            </Card.Body>
                            <Card.Footer>
                                <Button width="full" bg="purple.600" color="white" onClick={() => navigate(`/registrar/students/${gradeId}/${s.SectionName}`)}>
                                    View Students
                                </Button>
                            </Card.Footer>
                        </Card.Root>
                    ))}
                </SimpleGrid>
            )}

            {/* 3. THE ONLY DIALOG THAT SHOULD EVER APPEAR */}
            {showDeleteModal && (
                <Box position="fixed" top="0" left="0" w="100vw" h="100vh" bg="blackAlpha.800" zIndex="9999" display="flex" justifyContent="center" alignItems="center" backdropFilter="blur(8px)">
                    <Box bg="white" p={10} borderRadius="30px" w="420px" textAlign="center" shadow="dark-lg">
                        <Icon as={LuTriangleAlert} color="red.500" boxSize={14} mb={4} />
                        <Heading size="md" mb={4}>Confirm Deletion</Heading>
                        <Text mb={8}>Delete <b>{targetSection?.SectionName}</b>? This cannot be undone.</Text>
                        <HStack gap={4}>
                            <Button flex={1} variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                            <Button flex={1} bg="red.600" color="white" loading={isDeleting} onClick={finalDeleteAction}>Delete Now</Button>
                        </HStack>
                    </Box>
                </Box>
            )}
        </Box>
    );
};