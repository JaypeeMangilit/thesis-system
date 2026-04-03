import { 
    Box, Heading, Text, HStack, VStack, Table, Input, Button, 
    Badge, Select, Spinner, createListCollection 
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { pathfinderFetch } from './api'; //helper audit trail

export default function TeacherPublishGrades() {
    // 1. Core States
    const [students, setStudents] = useState([]); 
    const [subjects, setSubjects] = useState([]); 
    const [selectedSection, setSelectedSection] = useState([]); 
    const [selectedQuarter, setSelectedQuarter] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. Grade Input State - Stores grades as { "LRN-SubjectID": "Value" }
    const [gradeInputs, setGradeInputs] = useState({});

    const empID = localStorage.getItem("userName"); 
    const currentYear = new Date().getFullYear();

    // Fetch Students on Load
    useEffect(() => {
        const fetchStudents = async () => {
            if (!empID) return;
            try {
                const res = await pathfinderFetch(`http://localhost:3000/api/grades/advisory-students/${empID}`);
                const data = await res.json();
                const list = Array.isArray(data) ? data : [];
                setStudents(list);
                if (list.length > 0 && selectedSection.length === 0) {
                    setSelectedSection([list[0].SectionName]);
                }
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchStudents();
    }, [empID]);

    // Fetch Subjects when Section changes
    useEffect(() => {
        const fetchSubs = async () => {
            if (selectedSection.length === 0) return;
            try {
                const res = await pathfinderFetch(`http://localhost:3000/api/grades/subjects/${selectedSection[0]}`);
                const data = await res.json();
                setSubjects(Array.isArray(data) ? data : []);
            } catch (err) { console.error(err); }
        };
        fetchSubs();
    }, [selectedSection]);

    //Academic Year
    const [academicYear, setAcademicYear] = useState({ StartYear: "...", EndYear: "..." });

    useEffect(() => {
        const fetchSchoolYear = async () => {
            try {
                const response = await pathfinderFetch("/api/academic-year/active");
                const data = await response.json();
                if (response.ok && data) {
                    // Map your DB columns (StartYear, EndYear) to the state
                    setAcademicYear({
                        StartYear: data.StartYear,
                        EndYear: data.EndYear
                    });
                }
            } catch (err) {
                console.error("Failed to fetch Academic Year:", err);
            }
        };
        fetchSchoolYear();
    }, []);

    // Handle typing in the grade inputs
    const onGradeChange = (lrn, subId, val) => {
        setGradeInputs(prev => ({
            ...prev,
            [`${lrn}-${subId}`]: val
        }));
    };

    // Publish Function
    const handlePublish = async () => {
        const payload = Object.entries(gradeInputs).map(([key, grade]) => {
            const [lrn, subjectId] = key.split("-");
            return {
                lrn,
                subjectId,
                grade,
                quarter: selectedQuarter[0],
                section: selectedSection[0],
                schoolYear: `${currentYear}-${currentYear + 1}`
            };
        });

        if (payload.length === 0) {
            alert("Please enter grades before publishing.");
            return;
        }

        try {
            const res = await pathfinderFetch("http://localhost:3000/api/grades/publish", {
                method: "POST",
                body: JSON.stringify({ grades: payload })
            });

            if (res.ok) {
                alert("Grades Published Successfully!");
                setGradeInputs({}); // Clear inputs after success
            } else {
                alert("Error publishing grades.");
            }
        } catch (err) {
            console.error("Publish error:", err);
            alert("Server connection failed.");
        }
    };

    // Collections for Selects
    const sectionsCollection = useMemo(() => {
        const names = [...new Set(students.map(s => s.SectionName))];
        return createListCollection({
            items: names.map(n => ({ label: n, value: n }))
        });
    }, [students]);

    const quarterCollection = createListCollection({
        items: [
            { label: "1st Quarter", value: "1st Quarter" },
            { label: "2nd Quarter", value: "2nd Quarter" },
            { label: "3rd Quarter", value: "3rd Quarter" },
            { label: "4th Quarter", value: "4th Quarter" },
        ]
    });

    const filtered = students.filter(s => s.SectionName === selectedSection[0]);
    const males = filtered.filter(s => s.Gender === "Male");
    const females = filtered.filter(s => s.Gender === "Female");

    if (loading) return <Box p={20} textAlign="center"><Spinner color="purple.500" /></Box>;

    return (
        <Box p={8} bg="gray.50" minH="100vh">
            {/* Header Section */}
            <HStack justify="space-between" mb={6}>
                <Box>
                    <Text fontSize="xs" fontWeight="bold" color="purple.600">S.Y. {academicYear.StartYear}-{academicYear.EndYear}</Text>
                    <Heading size="md">Publish Grades</Heading>
                    <Text fontSize="sm" color="gray.500">Section: {selectedSection[0]}</Text>
                </Box>
                <Button colorPalette="purple" size="sm" onClick={handlePublish}>
                    Publish Grades
                </Button>
            </HStack>

            {/* Filter Box */}
            <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.200" mb={8} position="relative" zIndex="500">
                <HStack gap={10}>
                    <Box flex="1">
                        <Text fontSize="xs" fontWeight="bold" mb={2}>SECTION</Text>
                        <Select.Root 
                            collection={sectionsCollection} 
                            value={selectedSection}
                            onValueChange={(e) => setSelectedSection(e.value)}
                        >
                            <Select.Trigger bg="white"><Select.ValueText /></Select.Trigger>
                            <Select.Content zIndex="1000" position="absolute" bg="white" shadow="md">
                                {sectionsCollection.items.map(i => (
                                    <Select.Item item={i} key={i.value}>{i.label}</Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </Box>

                    <Box flex="1">
                        <Text fontSize="xs" fontWeight="bold" mb={2}>QUARTER</Text>
                        <Select.Root 
                            collection={quarterCollection} 
                            value={selectedQuarter}
                            onValueChange={(e) => setSelectedQuarter(e.value)}
                        >
                            <Select.Trigger bg="white"><Select.ValueText /></Select.Trigger>
                            <Select.Content zIndex="1000" position="absolute" bg="white" shadow="md">
                                {quarterCollection.items.map(i => (
                                    <Select.Item item={i} key={i.value}>{i.label}</Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </Box>
                </HStack>
            </Box>

            {/* Student Tables */}
            <VStack gap={8} align="stretch">
                <GradeTable 
                    title="MALE" 
                    data={males} 
                    subjects={subjects} 
                    color="blue" 
                    quarter={selectedQuarter[0]}
                    gradeInputs={gradeInputs}
                    onGradeChange={onGradeChange}
                />
                <GradeTable 
                    title="FEMALE" 
                    data={females} 
                    subjects={subjects} 
                    color="pink" 
                    quarter={selectedQuarter[0]}
                    gradeInputs={gradeInputs}
                    onGradeChange={onGradeChange}
                />
            </VStack>
        </Box>
    );
}

function GradeTable({ title, data, subjects, color, quarter, gradeInputs, onGradeChange }) {
    if (data.length === 0) return null;
    return (
        <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" overflow="hidden">
            <HStack bg={`${color}.600`} p={3} color="white" justify="space-between">
                <Text fontWeight="bold">{title} - {quarter}</Text>
                <Badge bg="white" color={`${color}.700`}>{data.length} Students</Badge>
            </HStack>
            <Table.Root size="sm">
                <Table.Header bg="gray.50">
                    <Table.Row>
                        <Table.ColumnHeader w="120px">LRN</Table.ColumnHeader>
                        <Table.ColumnHeader>Name</Table.ColumnHeader>
                        {subjects.map(s => (
                            <Table.ColumnHeader key={s.SubjectID} textAlign="center">{s.SubjectName}</Table.ColumnHeader>
                        ))}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map(student => (
                        <Table.Row key={student.LRN}>
                            <Table.Cell fontSize="xs">{student.LRN}</Table.Cell>
                            <Table.Cell fontWeight="medium">{student.LastName}, {student.FirstName}</Table.Cell>
                            {subjects.map(s => (
                                <Table.Cell key={s.SubjectID} textAlign="center">
                                    <Input 
                                        size="xs" 
                                        w="50px" 
                                        textAlign="center" 
                                        variant="outline" 
                                        bg="white"
                                        value={gradeInputs[`${student.LRN}-${s.SubjectID}`] || ""}
                                        onChange={(e) => onGradeChange(student.LRN, s.SubjectID, e.target.value)}
                                    />
                                </Table.Cell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    );
};