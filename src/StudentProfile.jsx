import { Box, Heading, Text, HStack, VStack, Table, Separator, Spinner, Avatar } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { pathfinderFetch } from './api'; 

export default function StudentProfile() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const studentName = localStorage.getItem("studentName");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!studentName) return;
      try {
        const res = await pathfinderFetch(`/api/student/profile/${encodeURIComponent(studentName)}`);
        const data = await res.json();
        if (res.ok) setStudentData(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [studentName]);

  if (loading) return <Box p={10} textAlign="center"><Spinner color="purple.500" /></Box>;
  if (!studentData) return <Box p={10} textAlign="center"><Text>No data found.</Text></Box>;

  return (
    <Box flex="1" p={{ base: 4, md: 8 }} bg="gray.50" minH="100vh">
      <Heading size="xl" fontWeight="bold" color="purple.600" mb={6}>Student Profile</Heading>
      <Box borderBottom="1px solid black" mb={8} />

      <HStack align="stretch" gap={6} bg="white" p={4} borderRadius="lg" border="1px solid #E2E8F0" boxShadow="sm">
        
        {/* Sidebar */}
        <VStack w="300px" bgGradient="to-b" gradientFrom="purple.800" gradientTo="purple.500" borderRadius="md" p={6} color="white" textAlign="center">
          <Avatar.Root size="2xl" border="4px solid white" mb={4}>
            <Avatar.Fallback name={studentData.FirstName} />
          </Avatar.Root>
          <Text fontWeight="bold" fontSize="xl">{studentData.LRN}</Text>
          <Text fontWeight="semibold" fontSize="lg">{studentData.FirstName} {studentData.LastName}</Text>
          <Separator borderColor="whiteAlpha.400" my={4} />
          <Text fontWeight="bold">Grade: {studentData.GradeLevel || "N/A"}</Text>
          <Text fontWeight="bold">Section: {studentData.SectionName || "N/A"}</Text>
        </VStack>

        {/* Tables */}
        <VStack flex="1" gap={6} align="stretch">
          
          {/* Table 1: Personal Info */}
          <Box border="2px solid" borderColor="purple.500" borderRadius="md" overflow="hidden">
            <Box bg="purple.500" p={3}><Heading size="sm" color="white">Personal Information</Heading></Box>
            <Table.Root size="sm" variant="line">
              <Table.Body>
                <ProfileRow label="Home Address" value={studentData.Address} />
                <ProfileRow label="Sex" value={studentData.Gender} />
                <ProfileRow label="Age" value={studentData.Age} />
                <ProfileRow label="Citizenship" value={studentData.Citizenship} />
                <ProfileRow label="Religion" value={studentData.Religion} />
              </Table.Body>
            </Table.Root>
          </Box>

          {/* Table 2: Guardian Info (This was the missing part) */}
          <Box border="2px solid" borderColor="purple.500" borderRadius="md" overflow="hidden">
            <Box bg="purple.500" p={3}><Heading size="sm" color="white">Guardian Information</Heading></Box>
            <Table.Root size="sm" variant="line">
              <Table.Body>
                <ProfileRow label="Guardian Name" value={studentData.GuardianName} />
                <ProfileRow label="Contact Number" value={studentData.GuardianContactNumber} />
                <ProfileRow label="Email Address" value={studentData.GuardianEmail} />
              </Table.Body>
            </Table.Root>
          </Box>

        </VStack>
      </HStack>
    </Box>
  );
}

function ProfileRow({ label, value }) {
  return (
    <Table.Row>
      <Table.Cell fontWeight="bold" color="gray.700" w="35%" bg="gray.50" px={4} py={3}>{label}</Table.Cell>
      <Table.Cell color="gray.600" px={4} py={3}>{value || "N/A"}</Table.Cell>
    </Table.Row>
  );
};