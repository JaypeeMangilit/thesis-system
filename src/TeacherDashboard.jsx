import {
    Box,
    Heading,
    Text,
    SimpleGrid,
    Button,
    VStack,
    HStack,
    Separator,
    Flex,
    Card,
    Spacer,
    Grid
} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function TeacherDashboard() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("Employee");
    const [currentTime, setCurrentTime] = useState(new Date());

    // State for the calendar
    const [currentDate, setCurrentDate] = useState(new Date());

    // Calculate the days for the current month view
    const getCalendarDays = useCallback(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

        // Adjusting start day to Monday (0=Mon, 6=Sun)
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

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    useEffect(() => {
        const savedName = localStorage.getItem('userName');
        if (savedName) {
            setUserName(savedName);
        }
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    const hour = currentTime.getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const monthYearText = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
    const calendarDays = getCalendarDays();

    return (
        <Flex minH="100vh" bg="gray.50">
            {/* Main Content Area */}
            <Box ml="50px" flex="1" p={6} overflow="auto">
                <VStack align="stretch" spacing={8}>
                    
                    {/* 1. Header Section */}
                    <Flex justify="space-between" align="flex-start" w="full" pb={4} borderBottom="2px solid">
                        <VStack align="flex-start" spacing={1}>
                            <Heading size="xl" fontWeight="bold">Welcome Back, Teacher</Heading>
                            <Text color="gray.500" fontSize="md">Teacher Portal</Text>
                        </VStack>

                        <VStack align="flex-end" spacing={0}>
                            <Heading size="xl" fontWeight="semibold" color="gray.800">{greeting}, {userName}</Heading>
                            <Text fontSize="sm" color="gray.500">
                                Teacher | Today {formatTime(currentTime)}
                            </Text>
                        </VStack>
                    </Flex>

                    {/* 2. Main Dashboard Layout Section */}
                    <HStack spacing={6} align="flex-start" w="full">
                        
                        {/* LEFT COLUMN: Stats and Status Box */}
                        <VStack align="stretch" spacing={6} flex="1">

                            {/* Status Box (Originally the "sds" box) */}
                            <Box
                                p={6}
                                shadow="md"
                                borderWidth="1px"
                                borderRadius="xl"
                                bg="white"
                                minH="200px"
                            >
                                <Heading size="sm" mb={4} color="purple.700" fontWeight="bold">Employee Memorandum</Heading>
                                <Separator mb={4} borderBottom="1px solid" />
                                <Text color="gray.600">sds</Text>
                                {/* You can add more list items or status updates here */}
                            </Box>
                        </VStack>


                        {/* RIGHT COLUMN: Calendar */}
                        <Box
                            shadow="md"
                            borderWidth="1px"
                            borderRadius="lg"
                            bg="white"
                            overflow="hidden"
                            minW="300px"
                            maxW="300px"
                        >
                            {/* Calendar Header */}
                            <Box bg="purple.700" color="white" p={4}>
                                <Flex justify="space-between" align="center" mb={2}>
                                    <Heading size="md">Calendar</Heading>
                                    <HStack spacing={1}>
                                        <Button size="xs" variant="ghost" color="white" _hover={{ bg: "purple.500" }} onClick={handlePrevMonth}>
                                            <FaChevronLeft />
                                        </Button>
                                        <Text fontSize="sm" fontWeight="bold" minW="100px" textAlign="center">
                                            {monthYearText}
                                        </Text>
                                        <Button size="xs" variant="ghost" color="white" _hover={{ bg: "purple.500" }} onClick={handleNextMonth}>
                                            <FaChevronRight />
                                        </Button>
                                    </HStack>
                                </Flex>

                                {/* Weekday Labels */}
                                <Grid templateColumns="repeat(7, 1fr)" textAlign="center" fontSize="xs" fontWeight="bold" mb={2} opacity="0.8">
                                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sat', 'Su'].map(day => (
                                        <Text key={day}>{day}</Text>
                                    ))}
                                </Grid>

                                {/* Calendar Days Grid */}
                                <Grid templateColumns="repeat(7, 1fr)" textAlign="center" rowGap={2}>
                                    {calendarDays.map((day, index) => {
                                        const isCurrentDay = isCurrentMonth && day === today.getDate();
                                        return (
                                            <Flex key={index} justify="center" align="center" h="30px">
                                                {day !== null && (
                                                    <Text
                                                        fontSize="sm"
                                                        w="26px"
                                                        h="26px"
                                                        lineHeight="26px"
                                                        borderRadius="full"
                                                        fontWeight={isCurrentDay ? "bold" : "normal"}
                                                        bg={isCurrentDay ? "orange.400" : "transparent"}
                                                        color={isCurrentDay ? "white" : "white"}
                                                        border={isCurrentDay ? "2px solid white" : "none"}
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
                </VStack>
            </Box>
        </Flex>
    );
};