import { Box, Heading, Text, Table, Center, Spinner, VStack, Badge } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { pathfinderFetch } from './api'; //helper audit trail

export default function StudentSchedule() {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const studentLRN = localStorage.getItem("studentLRN"); 
  const userName = localStorage.getItem("studentName");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await pathfinderFetch(`/api/student-account/schedule/${studentLRN}`);
        const data = await response.json();
        console.log("Data from API:", data); 
        if (response.ok) setScheduleData(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [studentLRN]);


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

  // 11:45am-12:45pm Break / 9:15-9:30am recess break
  const timeSlots = [
    "7:00am-7:45am", "7:45am-8:30am", "8:30am-9:15am", 
    "9:15am-9:30am", "9:30am-10:15am", "10:15am-11:00am",
    "11:00am-11:45am", "11-45am-12:45pm", "12:45pm-01:30pm",
    "01:30pm-02:15pm", "02:15pm-03:00pm"
  ];
  
  const daysOfWeek = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  const getSubjectForSlot = (time, day) => {
    return scheduleData.find((item) => {
      if (!item.TimeSlot) return false;
      // Normalization: remove all spaces for comparison
      const cleanDBTime = item.TimeSlot.replace(/\s+/g, '').toLowerCase();
      const cleanUITime = time.replace(/\s+/g, '').toLowerCase();
      return cleanDBTime === cleanUITime && item.DayOfWeek?.trim().toUpperCase() === day;
    });
  };

  if (loading) return <Center h="100vh"><Spinner size="xl" color="purple.500" /></Center>;

  return (
    <Box flex="1" p={8} bg="gray.50" minH="100vh">
      <Heading size="md">Hello Student, {userName}</Heading>
      <Text fontSize="sm">LRN: {studentLRN}</Text>

      <Badge variant="subtle" color="purple.600" size="md" mb={2} style={{marginLeft: "420px"}}>
        S.Y {academicYear.StartYear}- {academicYear.EndYear}
      </Badge>
      
      <Box bg="white" borderRadius="lg" boxShadow="lg" overflowX="auto">
        <Table.Root variant="line" showColumnBorder>
          <Table.Header bg="gray.100">
            <Table.Row>
              <Table.ColumnHeader textAlign="center" w="150px">TIME</Table.ColumnHeader>
              {daysOfWeek.map((day) => <Table.ColumnHeader key={day} textAlign="center">{day}</Table.ColumnHeader>)}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {timeSlots.map((time) => (
              <Table.Row key={time}>
                <Table.Cell whiteSpace="nowrap" fontWeight="bold" fontSize="xs" textAlign="center" bg="gray.50">{time}</Table.Cell>
                {daysOfWeek.map((day) => {
                  const entry = getSubjectForSlot(time, day);
                  return (
                    <Table.Cell key={`${time}-${day}`} p={1} h="100px" w="200px">
                      {entry ? (
                        <Center bg="purple.600" color="white" borderRadius="md" h="full" p={2} flexDirection="column" textAlign="center">
                          <Text fontSize="xs" fontWeight="bold">{entry.SubjectName}</Text>
                          <Text fontSize="10px">T. {entry.TeacherName}</Text>
                          <Text fontSize="xs">{entry.RoomName}</Text>
                        </Center>
                      ) : <Box h="full" />}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
};