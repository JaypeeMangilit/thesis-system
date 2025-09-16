import {Box, Heading, Text, SimpleGrid, Button, VStack, HStack, Separator, Badge, Stack,} from "@chakra-ui/react";
import { Layout, Sidebar, Content } from "./styled";

export const App = () => {
  return (
    <Layout>
      {/* Sidebar */}
      <Sidebar>
        <h1>School Portal</h1>
        <a href="#dashboard">Dashboard</a>
        <a href="#students">Students</a>
        <a href="#teachers">Teachers</a>
        <a href="#classes">Classes</a>
        <a href="#attendance">Attendance</a>
        <a href="#grades">Grades</a>
        <a href="#reports">Reports</a>
        <a href="#logout">Logout</a>
      </Sidebar>

      {/* Main Content Area */}
      <Content>
        <Heading size="lg" mb={6}>
          Dashboard
        </Heading>

        {/* Top Cards */}
        <SimpleGrid columns={[1, 3]} spacing={6} mb={6}>
          <Box p={5} bg="white" shadow="md" borderRadius="lg">
            <Heading size="md">Total Students</Heading>
            <Text fontSize="3xl" fontWeight="bold">1,247</Text>
            <Text color="green.500">⬆ 12% from last month</Text>
          </Box>
          <Box p={5} bg="white" shadow="md" borderRadius="lg">
            <Heading size="md">Total Teachers</Heading>
            <Text fontSize="3xl" fontWeight="bold">89</Text>
            <Text color="green.500">⬆ 5% from last month</Text>
          </Box>
          <Box p={5} bg="white" shadow="md" borderRadius="lg">
            <Heading size="md">Active Classes</Heading>
            <Text fontSize="3xl" fontWeight="bold">68</Text>
            <Text color="gray.500">All sections included</Text>
          </Box>
        </SimpleGrid>

        {/* Quick Actions */}
        <Heading size="md" mb={3}>
          Quick Actions
        </Heading>
        <SimpleGrid columns={[2, 4]} spacing={4} mb={6}>
          <Button colorPalette="blue">Add Student</Button>
          <Button colorPalette="blue">Add Teacher</Button>
          <Button colorPalette="blue">Create Class</Button>
          <Button colorPalette="blue">Generate Report</Button>
        </SimpleGrid>

        <SimpleGrid columns={[1, 2]} spacing={6}>
          {/* Recent Activity */}
          <Box p={5} bg="white" shadow="md" borderRadius="lg">
            <Heading size="md" mb={3}>Recent Activity</Heading>
            <VStack align="stretch" spacing={3}>
              <Box>
                <Text fontWeight="bold">New student enrollment</Text>
                <Text fontSize="sm" color="gray.600">
                  frogstyle adrian enrolled in Grade 10 - Science Stream
                </Text>
                <Badge colorPalette="green">Admissions</Badge>
              </Box>
              <Separator />
              <Box>
                <Text fontWeight="bold">Grade update</Text>
                <Text fontSize="sm" color="gray.600">
                  Mathematics grades updated for Class 10A
                </Text>
                <Badge colorPalette="blue">Academic</Badge>
              </Box>
              <Separator />
              <Box>
                <Text fontWeight="bold">Teacher added</Text>
                <Text fontSize="sm" color="gray.600">
                  Dr. lancebilat added as Physics teacher
                </Text>
                <Badge colorPalette="teal">HR</Badge>
              </Box>
              <Separator />
              <Box>
                <Text fontWeight="bold">Attendance report</Text>
                <Text fontSize="sm" color="gray.600">
                  Monthly attendance summary generated
                </Text>
                <Badge colorPalette="purple">Administration</Badge>
              </Box>
            </VStack>
          </Box>

          {/* System Status */}
          <Box p={5} bg="white" shadow="md" borderRadius="lg">
            <Heading size="md" mb={3}>System Status</Heading>
            <Stack spacing={2}>
              <HStack justify="space-between">
                <Text>Server Uptime</Text>
                <Badge colorPalette="green">99.9%</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text>Database Status</Text>
                <Badge colorPalette="green">Online</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text>Backup Status</Text>
                <Badge colorPalette="orange">Pending</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text>Security Updates</Text>
                <Badge colorPalette="gray">Up to date</Badge>
              </HStack>
              <Separator />
              <Heading size="sm">Notifications</Heading>
              <Text>⚠ Backup scheduled for tonight at 2:00 AM</Text>
              <Text>📢 New feature update available</Text>
            </Stack>
          </Box>
        </SimpleGrid>
      </Content>
    </Layout>
  );
};
