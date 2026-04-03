import { Box, Heading, Text, HStack, VStack, Table, Separator, Avatar, Spinner, Badge } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { pathfinderFetch } from './api'; //helper audit trail

export default function TeacherProfile() {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const teacherName = localStorage.getItem("userName");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!teacherName) return;
      try {
        const res = await pathfinderFetch(`http://localhost:3000/api/teachers/profile/${encodeURIComponent(teacherName)}`);
        const data = await res.json();
        setTeacherData(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [teacherName]);

  if (loading) return <Box p={10} textAlign="center"><Spinner /></Box>;
  if (!teacherData) return <Box p={10} textAlign="center"><Text>No data found.</Text></Box>;

  // SPLIT LOGIC: Assumes "House/Street, Barangay, Municipality, Province"
  const addressParts = teacherData.Address ? teacherData.Address.split(',') : [];
  const fullDetails = addressParts[0] ? addressParts[0].trim() : "";
  
  const displayAddress = {
    province: addressParts.length > 1 ? addressParts[1].trim() : "N/A",
    municipality: fullDetails.split(' ').pop() || "N/A",
    barangay: fullDetails.split(' ').slice(-3, -1).join(' ') || "N/A",
    street: fullDetails.split(' ').slice(0, -3).join(' ') || "N/A"
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box flex="1" p={{ base: 4, md: 8 }} bg="gray.50" minH="100vh">
      <Heading size="xl" mb={4} fontWeight="bold">Teacher Profile</Heading>
      <Separator mb={8} borderBottom="1px solid" />

      <HStack align="stretch" gap={6} bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="gray.200">
        
        {/* Profile Sidebar */}
        <VStack w="250px" minH="300px" bgGradient="to-b" gradientFrom="purple.700" gradientTo="purple.500" borderRadius="lg" p={8} color="white" justify="center" align="center" textAlign="center">
          <Avatar.Root size="2xl" border="4px solid white">
            <Avatar.Fallback name="" />
          </Avatar.Root>
          <VStack gap={0} mt={4}>
            <Text fontSize="xs" opacity={0.8}>{teacherData.EmployeeID}</Text>
            <Heading size="sm">{teacherData.FirstName} {teacherData.LastName}</Heading>
          </VStack>
        </VStack>

        {/* Info Table */}
        <VStack flex="1" align="stretch">
          <Box border="1px solid" borderColor="purple.500" borderRadius="lg" overflow="hidden">
            <Box bg="purple.500" p={3}><Heading size="xs" color="white">Personal Information</Heading></Box>
            <Table.Root size="sm" variant="line">
              <Table.Body>
                <ProfileRow label="Province" value={displayAddress.province} />
                <ProfileRow label="Municipality" value={displayAddress.municipality} />
                <ProfileRow label="Barangay" value={displayAddress.barangay} />
                <ProfileRow label="House NO./Street" value={displayAddress.street} />
                <ProfileRow label="Age" value={teacherData.Age} />
                <ProfileRow label="Date of Birth" value={formatDate(teacherData.DOB)} />
                <ProfileRow label="Contact Number" value={teacherData.ContactNum} />
                <ProfileRow label="Position" value={teacherData.Position} />
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
      <Table.Cell fontWeight="bold" w="35%" bg="gray.50">{label}</Table.Cell>
      <Table.Cell>{value}</Table.Cell>
    </Table.Row>
  );
};