import { Box, SimpleGrid, VStack, Heading, Text, Flex, Spinner, Icon, Badge, Button } from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { pathfinderFetch } from './api';
import { LuUsers, LuUserCheck, LuActivity, LuChartLine, LuRefreshCcw } from "react-icons/lu"; 
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AdminReport() {
    const [data, setData] = useState({ totalStudents: 0, totalTeachers: 0, loginHistory: [] });
    const [loading, setLoading] = useState(true);

    const fetchReportData = useCallback(async () => {
        try {
            const response = await pathfinderFetch('http://localhost:3000/api/admin-stats');
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReportData();
        const interval = setInterval(fetchReportData, 60000); // Auto-refresh every minute
        return () => clearInterval(interval);
    }, [fetchReportData]);

    const chartData = {
        labels: data.loginHistory.length > 0 
            ? data.loginHistory.map(item => item.monthName) 
            : ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"], 
        datasets: [
            {
                label: 'System Engagement',
                // SUMMING ALL ROLES TO ENSURE THE LINE REFLECTS ACTUAL DATA
                data: (data.loginHistory || []).map(item => 
                    (item.students || 0) + 
                    (item.teachers || 0) + 
                    (item.registrars || 0) + 
                    (item.departmentHeads || 0) +
                    (item.admins || 0) +
                    (item.staff || 0)
                ),
                borderColor: '#10B981', // Emerald Green
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 4,
                fill: true, // Area chart feel
                tension: 0.4, // Smooth professional curves
                pointRadius: 4,
                pointHoverRadius: 8,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: '#10B981',
                pointBorderWidth: 2,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }, // Cleaner look without legend
            tooltip: {
                backgroundColor: '#1A202C',
                padding: 12,
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                displayColors: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#EDF2F7', drawBorder: false },
                ticks: { stepSize: 1, color: '#A0AEC0' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#A0AEC0', font: { weight: '600' } }
            }
        }
    };

    if (loading) return (
        <Flex justify="center" align="center" h="100vh" bg="#F7FAFC">
            <Spinner size="xl" color="green.400" thickness="4px" />
        </Flex>
    );

    return (
        <Box ml="150px" p={2} bg="#F7FAFC" minH="100vh">
            <VStack align="start" gap={10} w="full" maxW="1400px" mx="auto">
                
                {/* Header Section */}
                <Flex justify="space-between" align="end" w="full">
                    <Box>
                        <Badge color="green" variant="subtle" mb={2} px={3} py={1} borderRadius="full">
                            <Flex align="center" gap={2}><LuActivity size={10}/> LIVE ANALYTICS</Flex>
                        </Badge>
                        <Heading size="xl" color="gray.800" fontWeight="900">System Intelligence</Heading>
                        <Text color="gray.500" fontSize="md" mt={1}>School Year 2026 – 2027 Utility Overview</Text>
                    </Box>
                    <Button
                        style={{marginLeft: "320px"}} 
                        leftIcon={<LuActivity />} 
                        color="white"
                        bg="purple.600"
                        variant="ghost" 
                        onClick={fetchReportData}
                        size="sm"
                    >
                        Refresh Data
                    </Button>
                    <Button 
                        leftIcon={<LuRefreshCcw />} 
                        onClick={fetchReportData}
                        variant="ghost" 
                        color="white"
                        bg="purple.600" 
                        size="sm"
                    >
                        Sync Data
                    </Button>
                </Flex>

                {/* Key Metrics Grid */}
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} w="full">
                    <StatCard
                        title="Student Enrollment" 
                        value={data.totalStudents} 
                        icon={LuUsers} 
                        color="green.400" 
                        percentage="Verified Accounts" // Example static label
                    />
                    <StatCard 
                        title="Faculty Accounts" 
                        value={data.totalTeachers} 
                        icon={LuUserCheck} 
                        color="blue.400" 
                        percentage="Verified Accounts"
                    />
                </SimpleGrid>

                {/* Main Graph Card */}
                <Box w="full" bg="white" p={8} shadow="sm" borderRadius="32px" border="1px solid" borderColor="gray.100">
                    <Flex justify="space-between" align="center" mb={10}>
                        <VStack align="start" gap={0}>
                            <Heading size="md" color="black" fontWeight="700">Annual System Utility</Heading>
                            <Text fontSize="sm" color="gray.400">Monthly user engagement trends</Text>
                        </VStack>
                        <Icon as={LuChartLine} boxSize={6} color="gray.200" />
                    </Flex>
                    <Box h="450px" px={4}>
                        <Line data={chartData} options={chartOptions} />
                    </Box>
                </Box>
            </VStack>
        </Box>
    );
}

function StatCard({ title, value, icon, color, percentage }) {
    return (
        <Box p={8} bg="white" shadow="sm" borderRadius="32px" border="1px solid" borderColor="gray.100" position="relative" overflow="hidden">
            <Flex justify="space-between" align="center">
                <VStack align="start" gap={1}>
                    <Text fontSize="xs" fontWeight="bold" color="black" textTransform="uppercase" letterSpacing="widest">{title}</Text>
                    <Heading size="3xl" color="gray.800" fontWeight="800">{value}</Heading>
                    <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2}>{percentage}</Badge>
                </VStack>
                <Flex bg={`${color.split('.')[0]}.50`} p={5} borderRadius="24px">
                    <Icon as={icon} boxSize={8} color={color} />
                </Flex>
            </Flex>
        </Box>
    );
};