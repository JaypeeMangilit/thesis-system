import { useEffect, useState } from "react";
import { 
    Table, 
    Badge, 
    Input, 
    Stack, 
    Text, 
    HStack, 
    Box,
    IconButton,
    Center,
    Spinner
} from "@chakra-ui/react";
import { LuArrowLeft } from "react-icons/lu"; 
import { useNavigate, useParams } from "react-router-dom";
import { pathfinderFetch } from "./api"; 

export default function RegistrarStudentTable() {
    const [students, setStudents] = useState([]);
    const [academicYear, setAcademicYear] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Pulls both params from the URL (e.g., /registrar/students/7/Einstein)
    const { gradeLevel, sectionName } = useParams();

    const fetchAcademicYear = async () => {
        try {
            const response = await pathfinderFetch("http://localhost:3000/api/academic-year");
            if (response.ok) {
                const data = await response.json();
                if (data?.current) {
                    setAcademicYear(data.current);
                }
            }
        } catch (err) {
            console.error("Academic Year Fetch Error:", err);
        }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            // UPDATED: Matches the backend route that requires Grade Level + Section Name
            const response = await pathfinderFetch(
                `http://localhost:3000/api/sections/students-by-section/${gradeLevel}/${sectionName}`
            );
            
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            } else {
                setStudents([]);
            }
        } catch (err) {
            console.error("Student Fetch Error:", err);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAcademicYear();
        if (sectionName && gradeLevel) {
            fetchStudents();
        }
    }, [sectionName, gradeLevel]);

    const filteredStudents = students.filter(s => 
        s.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.LRN?.toString().includes(searchTerm)
    );

    return (
        <Stack spacing={6} p={4}>
            <HStack justifyContent="space-between" alignItems="flex-start">
                <HStack spacing={4}>
                    <IconButton 
                        aria-label="Back" 
                        variant="ghost" 
                        onClick={() => navigate(-1)}
                    >
                        <LuArrowLeft />
                    </IconButton>
                    <Box>
                        <Text fontSize="2xl" fontWeight="bold">
                          Grade {gradeLevel} -{sectionName}
                        </Text>
                        <Badge colorPalette="purple" variant="subtle" size="lg" mt={1}>
                            S.Y. {academicYear?.StartYear || "----"} - {academicYear?.EndYear || "----"}
                        </Badge>
                    </Box>
                </HStack>
                
                <Box bg="green.500" color="white" px={3} py={1} borderRadius="md" fontSize="sm">
                    ● Background Automation Active
                </Box>
            </HStack>

            <Input 
                placeholder="Filter by Student Name or LRN..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                maxW="400px"
            />

            {loading ? (
                <Center py={10}><Spinner /></Center>
            ) : (
                <Table.Root variant="line" interactive>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>LRN</Table.ColumnHeader>
                            <Table.ColumnHeader>Full Name</Table.ColumnHeader>
                            <Table.ColumnHeader>Gen. Average</Table.ColumnHeader>
                            <Table.ColumnHeader>Status</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <Table.Row key={student.LRN}>
                                    <Table.Cell fontWeight="medium">{student.LRN}</Table.Cell>
                                    <Table.Cell>{student.FullName}</Table.Cell>
                                    <Table.Cell>{student.GeneralAverage || "0.00"}</Table.Cell>
                                    <Table.Cell>
                                        <Badge colorPalette={student.GeneralAverage >= 75 ? "green" : "orange"}>
                                            {student.GeneralAverage >= 75 ? "Promoted" : "Active"}
                                        </Badge>
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        ) : (
                            <Table.Row>
                                <Table.Cell colSpan={4} textAlign="center" py={10}>
                                    <Text color="gray.500">No students found for Grade {gradeLevel} {sectionName}.</Text>
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Root>
            )}
        </Stack>
    );
};