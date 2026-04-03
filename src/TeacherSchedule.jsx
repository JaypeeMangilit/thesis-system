import { Box, VStack, Heading, Text, Separator, HStack, Table, Spinner, Badge, Button } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { pathfinderFetch } from './api'; 

export default function TeacherSchedule() {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const scheduleRef = useRef(); 

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    useEffect(() => {
        const fetchSchedule = async () => {
            const storedName = localStorage.getItem('userName'); 
            if (!storedName) { setLoading(false); return; }
            try {
                const res = await pathfinderFetch(`http://localhost:3000/api/schedule/${encodeURIComponent(storedName)}`);
                const data = await res.json();
                setSchedule(data); // Data from AcademicSchedules table
            } catch (error) { 
                console.error("Fetch error:", error); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchSchedule();
    }, []);

    // Dynamic Logic: Extract unique time slots from the database results
    const dynamicTimeSlots = [...new Set(schedule.map(item => item.TimeSlot))].sort((a, b) => {
        // Simple sort to keep AM before PM
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    const handleDownload = async () => {
        const element = scheduleRef.current;
        if (!element) return;
        window.scrollTo(0, 0);
        const pdfWidth = 297; 

        try {
            const canvas = await html2canvas(element, {
                scale: 2, 
                useCORS: true,
                backgroundColor: "#ffffff",
                height: element.scrollHeight,
                windowHeight: element.scrollHeight,
            });

            const imgData = canvas.toDataURL("image/png");
            const imgProps = new jsPDF('l', 'mm', 'a4').getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: [pdfWidth, pdfHeight]
            });

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Schedule_${localStorage.getItem('userName')}.pdf`);
        } catch (error) {
            console.error("PDF Failed:", error);
        }
    };

    return (
        <Box p={8} bg="white">
            <HStack justify="space-between" mb={3}>
                <VStack align="flex-start" gap={0}>
                    <Heading size="lg" fontWeight="bold">Weekly Academic Schedule</Heading>
                    <Text color="gray.500">Teacher: {localStorage.getItem('userName')}</Text>
                </VStack>
                <Button colorPalette="purple" onClick={handleDownload} variant="surface">
                    <FaDownload style={{ marginRight: '8px' }} /> Download PDF
                </Button>
            </HStack>
            
            <Separator mb={5} border="1px solid"/>

            <Box ref={scheduleRef} id="pdf-capture-area" p={6} bg="white">
                <VStack mb={6} textAlign="center">
                    <Heading size="md" fontWeight="bold">PATNUBAY ACADEMY, INC.</Heading>
                    <Text fontSize="sm">Academic Schedule | AY 2025-2026</Text>
                </VStack>

                {loading ? <Spinner /> : (
                    <Table.Root variant="outline" size="sm" border="1px solid #E2E8F0">
                        <Table.Header>
                            <Table.Row bg="gray.50">
                                <Table.ColumnHeader textAlign="center" w="150px">Time Slot</Table.ColumnHeader>
                                {days.map(day => <Table.ColumnHeader key={day} textAlign="center">{day}</Table.ColumnHeader>)}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {dynamicTimeSlots.length === 0 ? (
                                <Table.Row>
                                    <Table.Cell colSpan={6} textAlign="center" py={10} color="gray.400">
                                        No published schedule found for this teacher.
                                    </Table.Cell>
                                </Table.Row>
                            ) : (
                                dynamicTimeSlots.map((slot) => (
                                    <Table.Row key={slot}>
                                        <Table.Cell fontWeight="bold" textAlign="center" bg="gray.50">
                                            {slot}
                                        </Table.Cell>
                                        {days.map(day => {
                                            // Matching logic that handles potential spacing/casing issues
                                            const entry = schedule.find(s => 
                                                s.TimeSlot === slot && 
                                                s.DayOfWeek?.trim().toUpperCase() === day.toUpperCase()
                                            );

                                            return (
                                                <Table.Cell key={`${day}-${slot}`} h="95px" textAlign="center" border="1px solid #E2E8F0">
                                                    {entry ? (
                                                        <VStack gap={1}>
                                                            <Text fontSize="xs" fontWeight="bold" color="purple.700">
                                                                {entry.SubjectName}
                                                            </Text>
                                                            <Badge size="xs" colorPalette="purple">
                                                                {entry.SectionName}
                                                            </Badge>
                                                            <Text fontSize="xs" fontWeight="bold" color="purple.700">
                                                               Room No.{entry.RoomName}
                                                            </Text>
                                                        </VStack>
                                                    ) : <Text color="gray.200">--</Text>}
                                                </Table.Cell>
                                            );
                                        })}
                                    </Table.Row>
                                ))
                            )}
                        </Table.Body>
                    </Table.Root>
                )}
            </Box>
        </Box>
    );
};