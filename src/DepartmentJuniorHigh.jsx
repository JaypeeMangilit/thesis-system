import { useState } from "react";
import { 
  Heading, VStack, Text, Table, Input, Button, Box, HStack, NativeSelect, IconButton, 
  Badge
} from "@chakra-ui/react";
import { pathfinderFetch } from './api';
import { useEffect } from "react";
import { toaster } from "./components/ui/toaster"; // Fixed path based on your screenshots
import { LuPlus, LuTrash2 } from "react-icons/lu"; 

export default function DepartmentJuniorHigh() {
  const [teacherName, setTeacherName] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [scheduleData, setScheduleData] = useState({});

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
  
  // --- NEW STATES FOR SEARCH ---
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [timeSlots, setTimeSlots] = useState([
    { start: "6:30", end: "7:00", period: "am", label: "RHGP" },
    { start: "7:00", end: "7:45", period: "am", label: "" },
    { start: "7:45", end: "8:30", period: "am", label: "" },
    { start: "8:30", end: "9:15", period: "am", label: "" },
    { start: "9:15", end: "9:45", period: "am", label: "BREAK" },
    { start: "9:45", end: "10:30", period: "am", label: "" },
    { start: "10:30", end: "11:15", period: "am", label: "" },
    { start: "11:15", end: "12:00", period: "pm", label: "LUNCH" },
    { start: "12:00", end: "12:45", period: "pm", label: "" },
    { start: "12:45", end: "1:30", period: "pm", label: "" },
    { start: "1:30", end: "2:15", period: "pm", label: "" },
    { start: "2:15", end: "3:00", period: "pm", label: "" }
  ]);

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  // --- NEW: HANDLE TEACHER TYPING WITH SUGGESTIONS ---
  const handleTeacherTyping = async (value) => {
    setTeacherName(value);
    
    if (value.length > 1) {
      try {
        const res = await pathfinderFetch(`http://localhost:3000/api/teachers/search?query=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Search error", err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addTimeSlot = () => {
    const lastSlot = timeSlots[timeSlots.length - 1];
    const newStart = lastSlot ? lastSlot.end : "3:00";
    const newPeriod = lastSlot ? lastSlot.period : "pm";

    setTimeSlots([...timeSlots, { start: newStart, end: "", period: newPeriod, label: "" }]);
    toaster.create({ title: "New Slot Added", type: "info" });
  };

  const removeTimeSlot = (index) => {
    if (timeSlots.length <= 1) return;
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const handleTimeUpdate = (index, field, value) => {
    const cleanValue = value.replace(/[^0-9:]/g, "");
    const updatedSlots = [...timeSlots];
    updatedSlots[index][field] = cleanValue;
    setTimeSlots(updatedSlots);
  };

  const handleInputChange = (cellId, field, value) => {
    setScheduleData(prev => ({
      ...prev,
      [cellId]: { ...prev[cellId], [field]: value }
    }));
  };

  const handlePublish = async () => {
    if (!teacherName.trim()) {
      return toaster.create({ title: "Error", description: "Teacher Name is required.", type: "error" });
    }

    setIsPublishing(true);
    try {
      // Safety Verify Check
      const verifyRes = await pathfinderFetch(`http://localhost:3000/api/teachers/verify?name=${encodeURIComponent(teacherName)}`);
      if (!verifyRes.ok) throw new Error("Teacher not found. Please select from the suggestions.");

      const payload = [];
      timeSlots.forEach((slot, rowIndex) => {
        if (slot.label) return;
        const formattedTime = `${slot.start}${slot.period}-${slot.end}${slot.period}`;
        
        days.forEach(day => {
          const entry = scheduleData[`${rowIndex}-${day}`];
          if (entry?.subject && entry?.gradeSection) {
            payload.push({
              time_slot: formattedTime,
              day: day,
              teacher: teacherName,
              subject: entry.subject,
              section: entry.gradeSection,
              room: entry.room || "N/A"
            });
          }
        });
      });

      if (payload.length === 0) throw new Error("No academic data entered.");

      const response = await pathfinderFetch('http://localhost:3000/api/schedule/publish', {
        method: 'POST',
        body: JSON.stringify({ schedule: payload })
      });

      if (response.ok) {
        toaster.create({ title: "Success", type: "success" });
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch (err) {
      toaster.create({ title: "Failed", description: err.message, type: "error" });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <VStack align="flex-start" p="6" gap="6" w="full">
      <HStack justify="space-between" w="full" borderBottom="2px solid" pb="4" borderColor="gray.100">
        <VStack align="flex-start" gap="1">
          <Badge variant="subtle" color="purple.600" size="md">
            S.Y {academicYear.StartYear}- {academicYear.EndYear}
          </Badge>
          <Heading size="xl" fontWeight="bold">Create Academic Schedule</Heading>
          <Text color="gray.500">Elementary Department Head</Text>
        </VStack>
        
        <HStack gap="4">
          <Button onClick={addTimeSlot} colorPalette="blue" variant="surface" size="sm">
            <LuPlus style={{ marginRight: '8px' }} /> Add Row
          </Button>

          {/* TEACHER INPUT WITH AUTOCOMPLETE */}
          <Box w="350px" p="3" bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200" position="relative">
             <Text fontSize="2xs" fontWeight="bold" mb="1" color="blue.700">ASSIGN TEACHER</Text>
             <Input 
                bg="white" 
                size="sm" 
                placeholder="Type name (e.g. Mhelric)..."
                value={teacherName} 
                onChange={(e) => handleTeacherTyping(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
             />
             
             {showSuggestions && suggestions.length > 0 && (
                <Box 
                  position="absolute" top="100%" left="0" w="full" bg="white" 
                  border="1px solid" borderColor="gray.200" borderRadius="md" 
                  boxShadow="lg" zIndex="999" maxH="150px" overflowY="auto"
                >
                  {suggestions.map((t) => (
                    <Box 
                      key={t.Employee_ID} p="2" fontSize="xs" cursor="pointer"
                      _hover={{ bg: "blue.500", color: "white" }}
                      onClick={() => {
                        setTeacherName(t.FullName);
                        setShowSuggestions(false);
                      }}
                    >
                      {t.FullName}
                    </Box>
                  ))}
                </Box>
             )}
          </Box>
        </HStack>
      </HStack>

      <Box overflowX="auto" w="full" borderWidth="1px" borderRadius="md" bg="white">
        <Table.Root variant="outline" size="sm">
          <Table.Header bg="gray.50">
            <Table.Row>
              <Table.ColumnHeader border="1px solid #edf2f7" w="240px">TIME CONFIG</Table.ColumnHeader>
              <Table.ColumnHeader border="1px solid #edf2f7" textAlign="center">MINS</Table.ColumnHeader>
              {days.map(day => (
                <Table.ColumnHeader key={day} border="1px solid #edf2f7" textAlign="center">{day}</Table.ColumnHeader>
              ))}
              <Table.ColumnHeader border="1px solid #edf2f7" w="50px"></Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {timeSlots.map((slot, rowIndex) => {
              const isSpecial = slot.label !== "";
              return (
                <Table.Row key={rowIndex} bg={isSpecial ? (slot.label === "RHGP" ? "blue.50" : "orange.50") : "transparent"}>
                  <Table.Cell border="1px solid #edf2f7">
                    <HStack gap="1">
                      <Input size="xs" w="50px" bg="white" value={slot.start} onChange={(e) => handleTimeUpdate(rowIndex, 'start', e.target.value)} />
                      <Text fontSize="xs">-</Text>
                      <Input size="xs" w="50px" bg="white" value={slot.end} onChange={(e) => handleTimeUpdate(rowIndex, 'end', e.target.value)} />
                      <NativeSelect.Root size="xs" width="65px">
                        <NativeSelect.Field bg="white" value={slot.period} onChange={(e) => handleTimeUpdate(rowIndex, 'period', e.target.value)}>
                          <option value="am">AM</option>
                          <option value="pm">PM</option>
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </HStack>
                  </Table.Cell>

                  <Table.Cell border="1px solid #edf2f7" textAlign="center">{isSpecial ? "--" : "45"}</Table.Cell>

                  {isSpecial ? (
                    <Table.Cell border="1px solid #edf2f7" colSpan={5} textAlign="center" fontWeight="bold" color={slot.label === "RHGP" ? "blue.600" : "orange.600"} letterSpacing="widest">
                      {slot.label === "RHGP" ? "RHGP / HOMEROOM ROUTINE" : `${slot.label} BREAK`}
                    </Table.Cell>
                  ) : (
                    days.map(day => (
                      <Table.Cell key={day} border="1px solid #edf2f7" p="1">
                        <VStack gap="1">
                          <Input placeholder="Subject" size="2xs" variant="outline" onChange={(e) => handleInputChange(`${rowIndex}-${day}`, 'subject', e.target.value)}/>
                          <Input placeholder="G&S" size="2xs" variant="subtle" onChange={(e) => handleInputChange(`${rowIndex}-${day}`, 'gradeSection', e.target.value)}/>
                          <Input placeholder="Rm" size="2xs" variant="subtle" onChange={(e) => handleInputChange(`${rowIndex}-${day}`, 'room', e.target.value)}/>
                        </VStack>
                      </Table.Cell>
                    ))
                  )}

                  <Table.Cell border="1px solid #edf2f7" textAlign="center">
                    <IconButton variant="ghost" colorPalette="red" size="xs" onClick={() => removeTimeSlot(rowIndex)}>
                      <LuTrash2 />
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Box>

      <HStack justify="flex-end" w="full">
        <Button colorPalette="purple" loading={isPublishing} onClick={handlePublish} px="10">
          Publish Schedule
        </Button>
      </HStack>
    </VStack>
  );
};