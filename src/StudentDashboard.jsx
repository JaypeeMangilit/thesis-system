import { useState, useEffect, useCallback } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
    Box, Flex, Text, VStack, Button, Heading, HStack,
    Grid, Separator, Table, Badge
} from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { pathfinderFetch } from "./api";

export default function StudentDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userName, setUserName] = useState("");

    // State for the Calendar 
    const [currentDate, setCurrentDate] = useState(new Date());

    // Dynamic Calendar Logic
    const getCalendarDays = useCallback(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

        const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

        const days = [];
        for (let i = 0; i < startDayIndex; i++) {
            days.push(null);
        }
        for (let i = 1; i <= lastDayOfMonth; i++) {
            days.push(i);
        }

        return days;
    }, [currentDate]);


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

    // Month Navigation Handler
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Username 
    useEffect(() => {
        const savedName = localStorage.getItem("studentName");
        if (savedName) setUserName(savedName);
    }, []);

    // Data Fetch 
    useEffect(() => {
        // API fetch Logics
    }, [navigate]);

    // Real Time Clock
    useEffect(() => {
        const timeId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timeId);
    }, []);

    const formatTime = (date) => {
        // Time Format
        return date.toLocaleTimeString('en-US', {
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Calendar Variables Helper 
    const monthYearText = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
    const calendarDays = getCalendarDays();

    return (
        <Flex minH="100vh" bg="gray.50">
            <Box flex="1" p={{ base: 4, md: 8 }} overflow="auto">

                {/* Header: Personal Greeting & Title (Formatted like StudentSchedule) */}
                <HStack justifyContent="space-between" mb={2}>
                    <VStack align="flex-start" gap={0}>
                        <Heading size="xl" fontWeight="bold" color="purple.800">Home</Heading>
                        <Text fontSize="sm" color="gray.600">This is where you can view relevant information as Student</Text>
                        <Badge variant="subtle" color="purple.600" size="md" mt={2}>
                            S.Y {academicYear.StartYear}- {academicYear.EndYear}
                        </Badge>
                    </VStack>

                    <VStack align="flex-end" gap={0}>
                        <Text fontSize="md" fontWeight="bold" color="gray.800">Good Morning, {userName}</Text>
                        <Text fontSize="sm" color="gray.600">Student | Today {formatTime(currentTime)}</Text>
                    </VStack>
                </HStack>

                {/* Blue line divider matching StudentSchedule style */}
                <Box borderBottom="1px solid" borderColor="black" mb={8} />

                {/* Outlet Content Area (e.g., specific student routes) */}
                <Box mb={6}><Outlet /></Box>

                {/* Dashboard Content (Announcements & Calendar) */}
                <HStack spacing={6} align="flex-start" w="full">

                    {/* Announcement Box */}
                    <Box
                        p={5}
                        shadow="md"
                        borderWidth="1px"
                        flex="1"
                        borderRadius="lg"
                        bg="white"
                        minH="800px"
                    >
                        <VStack align="stretch" spacing={2} h="full">
                            <VStack align="stretch" spacing={1}>
                                <Heading fontWeight="bold" size="md" mb={1} color="purple.600">Mission</Heading>
                                <Text fontStyle="Italic" textAlign="center" mb={1}>Keeping Pathfinders ahead of the game. Helping each student to realize and develop their core gifts, advancing thier potentials, and aligned their path to a purposeful future.</Text>
                            </VStack>

                            <Box flex="1" />

                            <VStack align="stretch" spacing={1}>
                                <Heading fontWeight="bold" size="md" mb={1} color="purple.600">Vision</Heading>
                                <Text fontStyle="Italic" textAlign="center" mb={1}>Patnubay Academy envisions to be an Academy of Innovators. Producing 10,000 quality innovators by 2030. From finding one's gift to enhancing their code and up to advancing thru innovations. This is the path that every Pathfinder are trained to walk on.</Text>
                            </VStack>

                            <VStack align="stretch" spacing={1}>
                                <Heading fontWeight="bold" size="md"  mb={1} color="purple.600">Philosophy</Heading>
                                <Text fontStyle="Italic" textAlign="center"> Seven truths a Pathfinder believes in: Christ-Centered "God above all." Champion: "Excellence is our Air." Collaborative: "Competition is out, Collaboration is in." Community: "WE is better than the I." Caring: "We are each other's keeper." Celebrated: "We cheered and celebrated one's YOUniqueness" Contemporary: "Keep Innovating ourselved"
                                </Text>
                                <br></br>
                                <VStack align="stretch" spacing={1}>
                                    <Text fontStyle="Underlined" fontSize="xs"  >
                                        Payment must be receieved by the Finance Office by the 15th of the month. 
                                        Retain all white copies of official receipts for your records. Payment will be entertained according to the scheduled Date.
                                    </Text>
                                </VStack>

                                <HStack align="stretch" spacing={1}>
                                    <Text fontWeight="Bold" fontSize="sm" >Late Fees:</Text>
                                    <Text mb={6} fontSize="xs" mt={0.5} >Accounts with outstanding balances after the 15th will automatically incur a late penalty of 5%</Text>
                                </HStack>

                            </VStack>

                        </VStack>

                        
                            <VStack>
                                <Table.Root mb={1}>
                                    <Table.Body>
                                        <Table.Row bg="purple.600">
                                            <Table.ColumnHeader fontWeight="bold" color="#ffffff">Tuition Fee:</Table.ColumnHeader>
                                            <Table.ColumnHeader fontWeight="bold" color="#ffffff">5,800 (580 per Month)</Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Body>
                                </Table.Root>
                            </VStack>

                            <VStack>
                                <Table.Root mb={1}>
                                    <Table.Row bg="purple.600">
                                        <Table.ColumnHeader fontWeight="bold" color="#ffffff" >Aircon Fee:</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="bold" color="#ffffff">1,500 (150 per Month)</Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Root>
                            </VStack>
                        
                    </Box>

                    {/* Calendar Box */}
                    <Box
                        p={0}
                        shadow="md"
                        borderWidth="1px"
                        borderRadius="lg"
                        bg="white"
                        overflow="hidden"
                        minW="300px"
                        maxW="300px"
                    >
                        <Box bg="purple.700" color="white" p={4}>
                            <Flex justify="space-between" align="center" mb={3}>
                                <Heading size="md">School Calendar</Heading>
                                <HStack>
                                    <Button size="sm" variant="ghost" colorScheme="whiteAlpha" p={1} onClick={handlePrevMonth}>
                                        <FaChevronLeft />
                                    </Button>
                                    <Text fontWeight="semibold">{monthYearText}</Text>
                                    <Button size="sm" variant="ghost" colorScheme="whiteAlpha" p={1} onClick={handleNextMonth}>
                                        <FaChevronRight />
                                    </Button>
                                </HStack>
                            </Flex>

                            <Grid templateColumns="repeat(7, 1fr)" textAlign="center" fontSize="xs" fontWeight="bold" mb={2}>
                                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                                    <Text key={day}>{day}</Text>
                                ))}
                            </Grid>

                            <Grid templateColumns="repeat(7, 1fr)" textAlign="center" fontSize="sm">
                                {calendarDays.map((day, index) => {
                                    const isCurrentDay = isCurrentMonth && day === today.getDate();
                                    let dayBg = isCurrentDay ? 'orange.500' : 'transparent';

                                    return (
                                        <Flex key={index} justify="center" align="center" height="25px" paddingY="1px" w="full">
                                            {day !== null && (
                                                <Text
                                                    bg={dayBg}
                                                    color="white"
                                                    borderRadius="full"
                                                    fontWeight={isCurrentDay ? "bold" : "normal"}
                                                    h="20px" w="20px" lineHeight="20px"
                                                    display="flex" justifyContent="center" alignItems="center"
                                                    border={isCurrentDay ? '1px solid white' : 'none'}
                                                    fontSize="xs"
                                                >
                                                    {day}
                                                </Text>
                                            )}
                                        </Flex>
                                    );
                                })}
                            </Grid>
                        </Box>
                    </Box>
                </HStack>
            </Box>
        </Flex>
    );
};