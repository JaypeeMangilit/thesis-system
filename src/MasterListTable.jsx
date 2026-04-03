import { Table, Box, Heading, Button, Center, Text, Spinner,HStack, Badge } from "@chakra-ui/react";
import { TiArrowBack } from "react-icons/ti";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams
import { useState, useEffect } from "react";
import { pathfinderFetch } from './api'; //helper audit trail

export default function MasterListTable() {
    const navigate = useNavigate();
    const { sectionId } = useParams(); // 'id' must match your route path like '/masterlist-table/:id'
    const [students, setStudents] = useState([]);
    const [sectionName, setSectionName] = useState("");
    const [loading, setLoading] = useState(true);

    const Back = () => { navigate('/teacher/teachermasterlist'); };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'enrolled': return 'green';
            case 'dropped': return 'red';
            case 'graduated': return 'blue';
            case 'transferred': return 'orange';
            default: return 'gray';
        }
    };


    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // Fetch students filtered by the Section ID from the URL
                const response = await pathfinderFetch(`http://localhost:3000/api/sections/${sectionId}/students`);
                if (!response.ok) throw new Error("Failed to load");
                
                const data = await response.json();
                setStudents(data.students);
                setSectionName(data.sectionName);

            } catch (error) {
                console.error("Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        if (sectionId) fetchStudents();
    }, [sectionId]);

    if (loading) return <Center h="200px"><Spinner /></Center>;

    return (
        <Box p={8} bg="white" borderRadius="xl" shadow="sm">
            <HStack justify="space-between" mb={4}>
                <Heading>{sectionName || "Class"} Master List</Heading>
                <Button bg="purple.600" color="white" onClick={Back}><TiArrowBack /> Back</Button>
            </HStack>

            <Table.Root variant="striped">
                <Table.Header bg="gray.100">
                    <Table.Row>
                        <Table.ColumnHeader border="1px solid" bg="gray.100" fontWeight="bold">LRN</Table.ColumnHeader>
                        <Table.ColumnHeader border="1px solid" bg="gray.100" fontWeight="bold">Name</Table.ColumnHeader>
                        <Table.ColumnHeader border="1px solid" bg="gray.100" fontWeight="bold">Gender</Table.ColumnHeader>
                        <Table.ColumnHeader border="1px solid" bg="gray.100" fontWeight="bold">Status</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {students.length > 0 ? (
                        students.map((s) => (
                            <Table.Row key={s.LRN}>
                                <Table.Cell border="1px solid" borderColor="gray.900">{s.LRN}</Table.Cell>
                                <Table.Cell border="1px solid" borderColor="gray.900">{`${s.LastName}, ${s.FirstName}`}</Table.Cell>
                                <Table.Cell border="1px solid" borderColor="gray.900">{s.Gender}</Table.Cell>
                                <Table.Cell border="1px solid" borderColor="gray.900">
                                    <Badge
                                        color={getStatusColor(s.Status)}
                                        borderRadius="full"
                                        px={3}
                                    >
                                        {s.Status}
                                    </Badge>
                                </Table.Cell>
                            </Table.Row>
                        ))
                    ) : (
                        <Table.Row>
                            <Table.Cell colSpan={4} textAlign="center">No students found in this section.</Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table.Root>
        </Box>
    );
};