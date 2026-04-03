import { useState, useEffect } from 'react';
import { 
    Box, Flex, VStack, HStack, Text, Input, 
    Avatar, Heading, SimpleGrid, Card, Badge, Icon,
    Separator, Stack, Center
} from "@chakra-ui/react";
import { LuSearch, LuUserX } from "react-icons/lu"; // Added LuUserX for the error icon
import { pathfinderFetch } from './api'; //helper audit trail

export default function AdminAccountSetting() {
    const [searchTerm, setSearchTerm] = useState("");
    const [studentData, setStudentData] = useState(null);
    const [error, setError] = useState(false); // New state for "No Record Found"

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.length >= 3) {
                fetchStudent(searchTerm);
            } else {
                setStudentData(null);
                setError(false); // Reset error if search is too short
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchStudent = async (val) => {
        try {
            const response = await pathfinderFetch(`http://localhost:3000/api/search-student/${val}`);
            if (response.ok) {
                const data = await response.json();
                setStudentData(data);
                setError(false); // Found someone!
            } else {
                setStudentData(null);
                setError(true); // Nothing found in the DB
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setStudentData(null);
            setError(true);
        }
    };

    return (
        <Box p={8} bg="gray.50" minH="100vh" ml="50px">
            <VStack align="stretch" gap={8}>
                <Heading size="lg">Student Account Search</Heading>
                
                {/* Search Input */}
                <Box maxW="500px" bg="white" p={2} borderRadius="md" border="1px solid" borderColor="gray.200" shadow="sm">
                    <HStack gap={3} px={2}>
                        <Icon as={LuSearch} color="gray.400" />
                        <Input 
                            placeholder="Search by Name or LRN..." 
                            value={searchTerm} 
                            variant="plain" 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </HStack>
                </Box>

                {/* ERROR MESSAGE: Pop up when no record is found */}
                {error && searchTerm.length >= 3 && (
                    <Center p={10} bg="white" border="1px dashed" borderColor="red.200" borderRadius="md">
                        <VStack gap={2}>
                            <Icon as={LuUserX} boxSize={8} color="red.400" />
                            <Text fontWeight="bold" color="red.500">No Record Found</Text>
                            <Text fontSize="sm" color="gray.500">We couldn't find any student matching "{searchTerm}"</Text>
                        </VStack>
                    </Center>
                )}

                {/* STUDENT DATA DISPLAY */}
                {studentData && (
                    <Flex gap={8} align="start">
                        {/* Profile Summary Card ... (rest of your existing card code) */}
                        <Card.Root width="320px" bg="white" p={6} borderRadius="none" shadow="sm" border="1px solid" borderColor="gray.200">
                             <VStack gap={6}>
                                <Avatar.Root size="2xl">
                                    <Avatar.Fallback name={studentData.name} />
                                </Avatar.Root>
                                <VStack gap={1} textAlign="center">
                                    <Text fontWeight="bold" color="gray.600">{studentData.id}</Text>
                                    <Text fontWeight="extrabold" fontSize="md">{studentData.name.toUpperCase()}</Text>
                                    <Badge variant="solid" colorPalette={studentData.status === 'Enrolled' ? 'green' : 'orange'}>
                                        {studentData.status}
                                    </Badge>
                                </VStack>
                                <Separator />
                                <Stack gap={4} w="full">
                                    <HStack justify="space-between">
                                        <Text fontWeight="bold" fontSize="sm" color="gray.500">SECTION</Text>
                                        <Text fontWeight="bold" color="blue.500">{studentData.section}</Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text fontWeight="bold" fontSize="sm" color="gray.500">GRADE LEVEL</Text>
                                        <Text fontWeight="bold" color="blue.500">{studentData.gradeLevel}</Text>
                                    </HStack>
                                </Stack>
                            </VStack>
                        </Card.Root>

                        {/* Info Panels */}
                        <VStack flex="1" gap={6} align="stretch">
                            <Box bg="white" p={6} shadow="sm" border="1px solid" borderColor="gray.200">
                                <Heading size="xs" mb={6} textTransform="uppercase" color="gray.700" borderBottom="2px solid" borderColor="gray.100" pb={2}>
                                    Personal Information
                                </Heading>
                                <SimpleGrid columns={3} gap={8}>
                                    <InfoField label="Address" value={studentData.address} />
                                    <InfoField label="Date of Birth" value={studentData.dob} />
                                    <InfoField label="Sex" value={studentData.sex} />
                                    <InfoField label="Citizenship" value={studentData.citizenship} />
                                    <InfoField label="Religion" value={studentData.religion} />
                                </SimpleGrid>
                            </Box>
                            <Box bg="white" p={6} shadow="sm" border="1px solid" borderColor="gray.200">
                                <Heading size="xs" mb={6} textTransform="uppercase" color="gray.700" borderBottom="2px solid" borderColor="gray.100" pb={2}>
                                    Contact Information
                                </Heading>
                                <SimpleGrid columns={3} gap={8}>
                                    <InfoField label="Guardian Name" value={studentData.guardian} />
                                    <InfoField label="Guardian Contact" value={studentData.guardianContact} />
                                </SimpleGrid>
                            </Box>
                        </VStack>
                    </Flex>
                )}
            </VStack>
        </Box>
    );
};

const InfoField = ({ label, value }) => (
    <VStack align="start" gap="1">
        <Text fontWeight="bold" fontSize="xs" color="gray.800" textTransform="uppercase">{label}</Text>
        <Text fontSize="md" color="gray.600">{value || "---"}</Text>
    </VStack>
);