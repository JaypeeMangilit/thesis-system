import { 
    Box, 
    Heading, 
    HStack, 
    Flex, 
    VStack, 
    Text, 
    Button, 
    Table, 
    Icon, 
    Input,
    Badge
} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LuUsers, LuChevronRight, LuPlus } from "react-icons/lu";

// 1. Import the toaster and provider from your local UI components
import { toaster, Toaster } from "./components/ui/toaster";
import { pathfinderFetch } from "./api";


export default function RegistrarStudentList() {
    const navigate = useNavigate();
    const gradeLevels = Array.from({ length: 10 }, (_, i) => i + 1);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newSection, setNewSection] = useState({
        sectionName: "",
        gradeLevel: "1",
    });

    const handleAddSection = async () => {
        // Validation with Toaster
        if (!newSection.sectionName.trim()) {
            toaster.create({
                title: "Required Field",
                description: "Please enter a section name before saving.",
                type: "warning",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("http://localhost:3000/api/sections/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSection)
            });

            if (response.ok) {
                // 2. Success Feedback
                toaster.create({
                    title: "Section Created",
                    description: `${newSection.sectionName} added to Grade ${newSection.gradeLevel} successfully.`,
                    type: "success",
                });

                // Reset and Close
                setIsModalOpen(false);
                setNewSection({ sectionName: "", gradeLevel: "1" });

                // Optional: Slight delay so they see the success toast before navigating
                setTimeout(() => {
                    navigate(`/registrar/sections/Grade${newSection.gradeLevel}`);
                }, 1200);
            } else {
                const errorData = await response.json();
                toaster.create({
                    title: "Error",
                    description: errorData.message || "Failed to create section.",
                    type: "error",
                });
            }
        } catch (error) {
            console.error("Error:", error);
            toaster.create({
                title: "Server Error",
                description: "Connection failed. Please check if the backend is running.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    //Academic Year
    const [academicYear, setAcademicYear] = useState({ StartYear: "...", EndYear: "..." });

    // Updated Academic Year Fetch logic
    useEffect(() => {
        const fetchSchoolYear = async () => {
            try {
                // FIXED: Removed "/active" to match your backend route
                const response = await pathfinderFetch("http://localhost:3000/api/academic-year");
            
                if (response.ok) {
                    const data = await response.json();
                
                    // Use the 'current' object sent by your academicyear.js
                    if (data?.current) {
                        setAcademicYear({
                            StartYear: data.current.StartYear,
                            EndYear: data.current.EndYear
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch Academic Year:", err);
            }
        };
        fetchSchoolYear();
    }, []);

    return (
        <Box p={8} bg="white" minH="100vh">
            {/* 3. Toaster Component must be present to show notifications */}
            <Toaster />

            {/* Header Section */}
            <Flex justify="space-between" align="center" mb={8} borderBottom="2px solid" borderColor="purple.500" pb={4}>
                <VStack align="flex-start" gap={1}>
                    <Heading size="2xl" color="purple.700">Student List</Heading>
                    <Text color="gray.600">Select a Grade Level to manage sections and student enrollment.</Text>
                    <Badge variant="subtle" color="purple.600" size="md">
                        S.Y {academicYear.StartYear}- {academicYear.EndYear}
                    </Badge>
                </VStack>
                <Button 
                    color="white"
                    bg="purple.600" 
                    size="lg" 
                    onClick={() => setIsModalOpen(true)}
                    boxShadow="md"
                    _hover={{ bg: "purple.700" }}
                >
                    <Icon as={LuPlus} mr={2} /> Add Section
                </Button>
            </Flex>

            {/* Table for Grade Levels */}
            <Box overflowX="auto" boxShadow="sm" borderRadius="lg" border="1px solid" borderColor="gray.200">
                <Table.Root variant="line" interactive>
                    <Table.Header bg="gray.50">
                        <Table.Row>
                            <Table.ColumnHeader py={4} color="purple.600">Grade Level</Table.ColumnHeader>
                            <Table.ColumnHeader py={4} color="purple.600">Description</Table.ColumnHeader>
                            <Table.ColumnHeader py={4} textAlign="end" color="purple.600">Action</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {gradeLevels.map((grade) => (
                            <Table.Row key={grade} _hover={{ bg: "purple.50" }} transition="background 0.2s">
                                <Table.Cell py={4}>
                                    <HStack gap={3}>
                                        <Icon as={LuUsers} color="purple.500" />
                                        <Text fontWeight="bold" fontSize="lg">Grade {grade}</Text>
                                    </HStack>
                                </Table.Cell>
                                
                                <Table.Cell py={4}>
                                    <Text color="gray.500" fontSize="sm">
                                        Manage all sections and students for Grade {grade}
                                    </Text>
                                </Table.Cell>

                                <Table.Cell py={4} textAlign="end">
                                    <Button 
                                        size="sm" 
                                        bg="purple.600" 
                                        color="white"
                                        _hover={{ bg: "purple.700" }}
                                        onClick={() => navigate(`/registrar/sections/${grade}`)}
                                    >
                                        View Sections <Icon as={LuChevronRight} ml={1} />
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Box>

            {/* Modal Overlay */}
            {isModalOpen && (
                <Box 
                    position="fixed" top="0" left="0" w="100vw" h="100vh" 
                    bg="blackAlpha.700" zIndex="1000" 
                    display="flex" justifyContent="center" alignItems="center"
                    backdropFilter="blur(4px)"
                >
                    <Box bg="white" p={8} borderRadius="20px" w="450px" shadow="2xl">
                        <Heading size="md" mb={6} color="purple.700">Create New Section</Heading>
                        <VStack gap={5}>
                            <Box w="full">
                                <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.600">SECTION NAME</Text>
                                <Input 
                                    placeholder="e.g. Einstein" 
                                    focusBorderColor="purple.400"
                                    value={newSection.sectionName} 
                                    onChange={(e) => setNewSection({...newSection, sectionName: e.target.value})} 
                                />
                            </Box>

                            <Box w="full">
                                <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.600">GRADE LEVEL</Text>
                                <select 
                                    style={{ 
                                        width: "100%", 
                                        padding: "10px", 
                                        borderRadius: "6px", 
                                        border: "1px solid #E2E8F0",
                                        outlineColor: "#9F7AEA"
                                    }}
                                    value={newSection.gradeLevel}
                                    onChange={(e) => setNewSection({...newSection, gradeLevel: e.target.value})}
                                >
                                    {gradeLevels.map(g => (
                                        <option key={g} value={g}>Grade {g}</option>
                                    ))}
                                </select>
                            </Box>

                            <HStack w="full" pt={4} gap={4}>
                                <Button 
                                    flex={1} 
                                    variant="outline" 
                                    borderColor="gray.300" 
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    flex={1} 
                                    color="white" 
                                    bg="purple.600" 
                                    _hover={{ bg: "purple.700" }}
                                    loading={isSubmitting} 
                                    onClick={handleAddSection}
                                >
                                    {isSubmitting ? "Creating..." : "Create Section"}
                                </Button>
                            </HStack>
                        </VStack>
                    </Box>
                </Box>
            )}
        </Box>
    );
};