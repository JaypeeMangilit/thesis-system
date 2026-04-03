import React, { useEffect, useState } from "react";
import { Box, SimpleGrid, Text, Heading, Button, Card, Stack, Badge, Table, Separator, HStack } from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { pathfinderFetch } from './api'; //helper audit trail

export default function TeacherMasterList() {
    const [sections, setSections] = useState([]); 
    const [students, setStudents] = useState([]); // Default as empty array
    const [selectedSection, setSelectedSection] = useState("");
    const [viewMode, setViewMode] = useState("card"); 
    const [loading, setLoading] = useState(true);
    const teacherName = localStorage.getItem('userName');

    useEffect(() => {
        const fetchSections = async () => {
            if (!teacherName) {
                setLoading(false);
                return;
            }
            try {
                // Ensure this URL matches the backend route exactly
                const res = await pathfinderFetch(`http://localhost:3000/api/advisory/my-sections/${encodeURIComponent(teacherName)}`);
                if (!res.ok) throw new Error("Not Found");
                const data = await res.json();
                setSections(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSections();
    }, [teacherName]);

    const handleViewStudents = async (sectionName) => {
        try {
            const res = await pathfinderFetch(`http://localhost:3000/api/advisory/class-list/${encodeURIComponent(teacherName)}/${encodeURIComponent(sectionName)}`);
            const data = await res.json();
            setStudents(Array.isArray(data) ? data : []); // Prevent filter crash
            setSelectedSection(sectionName);
            setViewMode("list");
        } catch (error) {
            setStudents([]); 
        }
    };

    if (loading) return <Box p={10}><Text>Loading...</Text></Box>;
    if (sections.length === 0) return <Box p={10}><Text>No Advisory Class assigned.</Text></Box>;

    // Safe filtering
    const maleStudents = students.filter(s => s.Gender === "Male");
    const femaleStudents = students.filter(s => s.Gender === "Female");

    return (
        <Box p={8}>
            {viewMode === "card" ? (
                <Stack gap={6}>
                    <Heading size="lg" fontWeight="bold">My Advisory Classes</Heading>
                    <Separator border="1px solid"/>
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                        {sections.map((sec) => (
                            <Card.Root key={sec.SectionID} width="100%">
                                <Card.Body gap="2">
                                    <Badge colorPalette="purple" w="fit-content" fontSize="sm">Grade {sec.GradeLevel}</Badge>
                                    <Card.Title mt="2" fontWeight="bold" fontSize="xl">{sec.SectionName}</Card.Title>
                                </Card.Body>
                                <Card.Footer justifyContent="flex-end">
                                    <Button colorPalette="purple" onClick={() => handleViewStudents(sec.SectionName)}>
                                        View Students
                                    </Button>
                                </Card.Footer>
                            </Card.Root>
                        ))}
                    </SimpleGrid>
                </Stack>
            ) : (
                <Stack gap={6}>
                    <HStack justify="space-between">
                        <Button variant="ghost" onClick={() => setViewMode("card")} leftIcon={<FaArrowLeft />}>Back</Button>
                        <Heading size="md">Class List: {selectedSection}</Heading>
                    </HStack>
                    <Separator />
                    <Box>
                        <Heading size="sm" color="blue.600" mb={3}>MALE ({maleStudents.length})</Heading>
                        <StudentTable data={maleStudents} />
                    </Box>
                    <Separator my={4} />
                    <Box>
                        <Heading size="sm" color="pink.600" mb={3}>FEMALE ({femaleStudents.length})</Heading>
                        <StudentTable data={femaleStudents} />
                    </Box>
                </Stack>
            )}
        </Box>
    );
}

const StudentTable = ({ data }) => (
    <Table.Root size="sm" variant="outline">
        <Table.Header bg="gray.50">
            <Table.Row>
                <Table.ColumnHeader w="60px" textAlign="center">#</Table.ColumnHeader>
                <Table.ColumnHeader>Full Name</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {data.length > 0 ? data.map((s, i) => (
                <Table.Row key={s.LRN}>
                    <Table.Cell textAlign="center">{i + 1}</Table.Cell>
                    <Table.Cell>{s.FullName}</Table.Cell>
                    <Table.Cell><Badge>{s.Status}</Badge></Table.Cell>
                </Table.Row>
            )) : <Table.Row><Table.Cell colSpan={3} textAlign="center">No students found.</Table.Cell></Table.Row>}
        </Table.Body>
    </Table.Root>
);