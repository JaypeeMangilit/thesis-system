import {
    Box, Heading, Text, SimpleGrid, Button, VStack, HStack, 
    Separator, Flex, Card, Spacer, Grid, Spinner, Input
} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { LuSend, LuHistory } from "react-icons/lu"; 
import { pathfinderFetch } from './api'; 
import { toaster } from "./components/ui/toaster";

export default function Dashboard() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("Employee");
    const [currentTime, setCurrentTime] = useState(new Date());

    const [startMonth, setStartMonth] = useState("");
    const [startYear, setStartYear] = useState("");
    const [endMonth, setEndMonth] = useState("");
    const [endYear, setEndYear] = useState("");

    // --- LOGIC FIX: Track the "Current" active year separately ---
    const [currentAY, setCurrentAY] = useState(null); 
    const [publishHistory, setPublishHistory] = useState([]);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [activities, setActivities] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);

    const fetchLogs = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            const savedName = localStorage.getItem('userName') || 'Employee';
            const savedRole = localStorage.getItem('userRole') || 'Staff';

            const response = await pathfinderFetch('http://localhost:3000/api/system-logs', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'x-user-name': savedName,
                    'x-user-role': savedRole
                }
            });

            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            }

            const ayRes = await pathfinderFetch('http://localhost:3000/api/academic-year', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (ayRes.ok) {
                const ayData = await ayRes.json();
                // Store the 'current' object to check if a year is active
                const active = ayData.current && ayData.current.StartYear && ayData.current.StartYear !== "" ? ayData.current : null;

                setCurrentAY(active);
                setPublishHistory(ayData.history || []);
            }
        } catch (error) {
            console.error("Log fetch error:", error);
        } finally {
            setLoadingLogs(false);
        }
    }, []);

    const handlePublish = async () => {
        if (!startMonth || !startYear || !endMonth || !endYear) {
            toaster.create({ title: "Missing Information", type: "error" });
            return;
        }

        const payload = {
            startMonth,
            startYear: parseInt(startYear),
            endMonth,
            endYear: parseInt(endYear),
            adminName: userName
        };

        try {
            const response = await pathfinderFetch('http://localhost:3000/api/academic-year/publish', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toaster.create({ title: "Publish Successful", type: "success" });
                setStartMonth(""); setStartYear(""); setEndMonth(""); setEndYear("");
                
                fetchLogs(); 
            } else {
                throw new Error("Failed to Publish");
            }
        } catch (error) {
            toaster.create({ title: "Save Failed", type: "error" });
        }
    };

    const getCalendarDays = useCallback(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
        const days = [];
        for (let i = 0; i < startDayIndex; i++) days.push(null);
        for (let i = 1; i <= lastDayOfMonth; i++) days.push(i);
        return days;
    }, [currentDate]);

    useEffect(() => {
        const savedName = localStorage.getItem('userName');
        if (savedName) setUserName(savedName);
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchLogs();
        const logId = setInterval(fetchLogs, 10000);
        return () => { clearInterval(timerId); clearInterval(logId); };
    }, [fetchLogs]);

    const hour = currentTime.getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
    const formatTime = (date) => date.toLocaleTimeString('en-US', { weekday: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const calendarDays = getCalendarDays();

    return (
        <Flex minH="100vh" bg="gray.50">
            <Box ml="50px" flex="1" p={6} overflow="auto">
                <VStack align="stretch" gap={8}>
                    
                    <Flex justify="space-between" align="flex-start" w="full" pb={4} borderBottom="2px solid">
                        <VStack align="flex-start" gap={1}>
                            <Heading size="2xl" fontWeight="bold">Welcome Back, Admin</Heading>
                            <Text color="gray.500" fontSize="md">Overview of Patnubay Academy</Text>
                        </VStack>
                        <VStack align="flex-end" gap={0}>
                            <Heading size="xl" fontWeight="semibold" color="gray.800">{greeting}, {userName}</Heading>
                            <Text fontSize="sm" color="gray.500">Admin | Today {formatTime(currentTime)}</Text>
                        </VStack>
                    </Flex>

                    <HStack gap={6} align="flex-start" w="full">
                        <VStack align="stretch" gap={6} flex="1">
                            <Box p={6} shadow="md" borderWidth="1px" borderRadius="xl" bg="white" minH="200px">
                                <Heading size="sm" mb={4} color="purple.700" fontWeight="bold">Employee Memorandum</Heading>
                                <Separator mb={4} borderBottom="1px solid" />
                                <Text color="gray.600">sds</Text>
                            </Box>

                            <Box p={6} shadow="md" borderWidth="1px" borderRadius="xl" bg="white" maxH="220px" overflowY="auto">
                                <Heading size="sm" mb={4} color="purple.700" fontWeight="bold">Recent Activity & Changes</Heading>
                                <VStack align="flex-start" gap={3}>
                                    {loadingLogs ? <Spinner size="sm" color="purple.500" /> : activities.map((log, index) => (
                                        <Text key={index} fontSize="sm" color="gray.600">• {log.Activity}</Text>
                                    ))}
                                </VStack>
                            </Box>
                        </VStack>

                        <VStack gap={6} minW="300px" maxW="300px">
                            <Box shadow="md" borderWidth="1px" borderRadius="lg" bg="white" overflow="hidden" w="full">
                                <Box bg="purple.700" color="white" p={4}>
                                    <Flex justify="space-between" align="center" mb={2}>
                                        <Heading size="md">Calendar</Heading>
                                        <HStack gap={1}>
                                            <Button size="xs" variant="ghost" color="white" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}><FaChevronLeft /></Button>
                                            <Text fontSize="sm" fontWeight="bold">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                                            <Button size="xs" variant="ghost" color="white" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}><FaChevronRight /></Button>
                                        </HStack>
                                    </Flex>
                                    <Grid templateColumns="repeat(7, 1fr)" textAlign="center" rowGap={2}>
                                        {calendarDays.map((day, index) => (
                                            <Flex key={index} justify="center" align="center" h="30px">
                                                {day !== null && (
                                                    <Text fontSize="sm" w="26px" h="26px" lineHeight="26px" borderRadius="full" bg={day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? "orange.400" : "transparent"} color="white">
                                                        {day}
                                                    </Text>
                                                )}
                                            </Flex>
                                        ))}
                                    </Grid>
                                </Box>
                            </Box>

                            <Box p={5} shadow="md" borderWidth="1px" borderRadius="xl" bg="white" w="full">
                                <VStack align="stretch" gap={4}>
                                    <Box>
                                        <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.700">Start of Academic Year</Text>
                                        <HStack>
                                            <Input size="xs" placeholder="Month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} />
                                            <Input size="xs" placeholder="Year" value={startYear} onChange={(e) => setStartYear(e.target.value)} />
                                        </HStack>
                                    </Box>
                                    <Box>
                                        <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.700">End of Academic Year</Text>
                                        <HStack>
                                            <Input size="xs" placeholder="Month" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} />
                                            <Input size="xs" placeholder="Year" value={endYear} onChange={(e) => setEndYear(e.target.value)} />
                                        </HStack>
                                    </Box>

                                    {/* FIX: Check !!currentAY instead of publishHistory.length */}
                                    <Button 
                                        size="sm"
                                        bg={currentAY ? "gray.300" : "purple.700"}
                                        color={currentAY ? "gray.500" : "white"}
                                        cursor={currentAY ? "not-allowed" : "pointer"}
                                        pointerEvents={currentAY ? "none" : "auto"}
                                        w="full"
                                        _hover={currentAY ? {} : {bg: "purple.800"}}
                                        onClick={currentAY ? null : handlePublish}
                                    >
                                        <LuSend style={{ marginRight: '8px' }} />
                                        {currentAY ? "Year Already Published" : "Publish Academic Year"}
                                    </Button>

                                    <Box mt={2}>
                                        <HStack mb={2} color="gray.500">
                                            <LuHistory size="14px" />
                                            <Text fontSize="xs" fontWeight="bold">Recent Updates</Text>
                                        </HStack>
                                        <VStack align="stretch" gap={2} maxH="100px" overflowY="auto">
                                            {publishHistory.map((item, idx) => (
                                                <Box key={idx} p={2} bg="gray.50" borderRadius="md" borderLeft="3px solid" borderColor="purple.400">
                                                    <Text fontSize="10px" fontWeight="bold" color="gray.700">{item.AY_Range}</Text>
                                                    <Text fontSize="9px" color="gray.500">{new Date(item.PublishedDate).toLocaleDateString()} by {item.AdminName}</Text>
                                                </Box>
                                            ))}
                                        </VStack>
                                    </Box>
                                </VStack>
                            </Box>
                        </VStack>
                    </HStack>
                </VStack>
            </Box>
        </Flex>
    );
};