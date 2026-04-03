import { useState, useEffect } from "react";
import { 
  Heading, VStack, Input, Button, Box, Text, 
  HStack, Stack, Table, IconButton, Group, InputElement,
  Menu, Portal 
} from "@chakra-ui/react";
import { 
  LuChevronDown, LuTrash, 
  LuUser, LuBookOpen, LuChevronLeft, LuChevronRight 
} from "react-icons/lu";
import { pathfinderFetch } from './api';
import { Toaster, toaster } from "./components/ui/toaster";
import { TiUserDelete } from "react-icons/ti";

export default function DepartmentAssign() {
  const [formData, setFormData] = useState({ 
    teacherName: "", 
    gradeLevel: "", 
    sectionID: "", 
    displaySectionName: "" 
  });
  
  const [allTeachers, setAllTeachers] = useState([]);
  const [advisoryList, setAdvisoryList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // You can change this number to show more/less rows

  const fetchData = async () => {
    try {
      const [advRes, teachRes] = await Promise.all([
        pathfinderFetch('http://localhost:3000/api/advisory/list'),
        pathfinderFetch('http://localhost:3000/api/teachers/list')
      ]);
      const advData = await advRes.json();
      const teachData = await teachRes.json();
      
      setAdvisoryList(Array.isArray(advData) ? advData.sort((a, b) => a.GradeLevel - b.GradeLevel) : []);
      setAllTeachers(Array.isArray(teachData) ? teachData : []);
    } catch (err) { 
      console.error("Fetch error:", err); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(advisoryList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = advisoryList.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAssign = async () => {
    if (!formData.teacherName || !formData.sectionID || !formData.gradeLevel) {
      toaster.create({ title: "Please fill all fields", type: "warning" });
      return;
    }

    const teacherSectionCount = advisoryList.filter(item => item.Adviser === formData.teacherName).length;
    
    if (teacherSectionCount >= 2) {
      toaster.create({ 
        title: "Assignment Limit Reached", 
        description: `${formData.teacherName} already has 2 advisory sections.`,
        type: "error" 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await pathfinderFetch('http://localhost:3000/api/advisory/assign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherName: formData.teacherName,
          sectionID: formData.sectionID,
          gradeLevel: formData.gradeLevel
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toaster.create({ title: "Success!", type: "success" });
        setFormData({ teacherName: "", gradeLevel: "", sectionID: "", displaySectionName: "" });
        fetchData();
      } else {
        toaster.create({ title: result.error || "Failed", type: "error" });
      }
    } catch (err) {
      toaster.create({ title: "Network Error", type: "error" });
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleDelete = async (sectionID) => {
    if (!confirm("Remove this adviser?")) return;
    try {
      const response = await pathfinderFetch(`http://localhost:3000/api/advisory/remove/${sectionID}`, {
        method: 'PUT'
      });
      if (response.ok) {
        toaster.create({ title: "Adviser removed", type: "success" });
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <VStack align="flex-start" p="8" gap="8" w="full" bg="gray.50" minH="100vh">
      <Toaster />
      <Heading size="xl" color="purple.800">Department Management</Heading>

      {/* Input Form Section */}
      <Box w="full" maxW="600px" p="6" borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
        <Stack gap="4">
          <Box>
            <Text mb="1" fontSize="xs" fontWeight="bold" color="gray.500">SELECT ADVISER</Text>
            <Menu.Root positioning={{ placement: "bottom", gutter: 4 }}>
              <Menu.Trigger asChild>
                <Group w="full" attached shadow="sm">
                  <InputElement pointerEvents="none" ml="2" color="purple.500"><LuUser /></InputElement>
                  <Input 
                    placeholder="Click to select teacher..." 
                    value={formData.teacherName} 
                    readOnly 
                    cursor="pointer"
                  />
                  <IconButton variant="outline"><LuChevronDown /></IconButton>
                </Group>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner zIndex="9999">
                  <Menu.Content minW="400px" maxH="250px" overflowY="auto" bg="white" boxShadow="lg">
                    {allTeachers.map((teacher) => (
                      <Menu.Item 
                        key={teacher.Employee_ID} 
                        value={teacher.FullName} 
                        onSelect={() => setFormData(prev => ({ ...prev, teacherName: teacher.FullName }))}
                      >
                        <HStack w="full">
                          <LuUser color="purple" />
                          <Text fontSize="sm">{teacher.FullName}</Text>
                        </HStack>
                      </Menu.Item>
                    ))}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </Box>

          <HStack gap="4">
            <Box flex="1">
              <Text mb="1" fontSize="xs" fontWeight="bold" color="gray.500">GRADE</Text>
              <Input 
                type="number" 
                placeholder="Level"
                value={formData.gradeLevel} 
                disabled
                bg={formData.sectionID ? "gray.100" : "white"}
              />
            </Box>

            <Box flex="2">
              <Text mb="1" fontSize="xs" fontWeight="bold" color="gray.500">SECTION</Text>
              <Menu.Root positioning={{ placement: "bottom", gutter: 4 }}>
                <Menu.Trigger asChild>
                  <Group w="full" attached shadow="sm">
                    <Input 
                      placeholder="Select Section..." 
                      value={formData.displaySectionName} 
                      readOnly 
                      cursor="pointer"
                    />
                    <IconButton variant="outline"><LuChevronDown /></IconButton>
                  </Group>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner zIndex="9999">
                    <Menu.Content minW="300px" maxH="250px" overflowY="auto" bg="white" boxShadow="lg">
                      {advisoryList.map((sec) => (
                        <Menu.Item 
                          key={sec.SectionID} 
                          value={sec.SectionName} 
                          onSelect={() => setFormData(prev => ({ 
                            ...prev, 
                            sectionID: sec.SectionID, 
                            displaySectionName: sec.SectionName,
                            gradeLevel: sec.GradeLevel 
                          }))}
                        >
                          <Text fontSize="sm">Grade {sec.GradeLevel} - {sec.SectionName}</Text>
                        </Menu.Item>
                      ))}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </Box>
          </HStack>

          <Button 
            colorPalette="purple" 
            w="full" 
            loading={isSubmitting} 
            onClick={handleAssign}
            mt="2"
          >
            Confirm Assignment
          </Button>
        </Stack>
      </Box>

      {/* Table Section */}
      <Box w="full" borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
        <Table.Root size="sm" variant="line">
          <Table.Header bg="purple.50">
            <Table.Row>
              <Table.ColumnHeader p="4">Grade & Section</Table.ColumnHeader>
              <Table.ColumnHeader p="4">Adviser</Table.ColumnHeader>
              <Table.ColumnHeader p="4" textAlign="right">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedItems.map((item) => (
              <Table.Row key={item.SectionID}>
                <Table.Cell p="4">Grade {item.GradeLevel} - {item.SectionName}</Table.Cell>
                <Table.Cell p="4">
                  <Text color={item.Adviser ? "black" : "gray.400"}>
                    {item.Adviser || "Unassigned"}
                  </Text>
                </Table.Cell>
                <Table.Cell p="4" textAlign="right">
                  <Menu.Root size="sm">
                    <Menu.Trigger asChild>
                      <IconButton variant="ghost" size="sm"><TiUserDelete /></IconButton>
                    </Menu.Trigger>
                    <Menu.Positioner>
                      <Menu.Content>
                        <Menu.Item 
                          value="delete" 
                          color="red.600" 
                          onClick={() => handleDelete(item.SectionID)}
                        >
                          <LuTrash /> Remove Adviser
                        </Menu.Item>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Menu.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {/* --- PAGINATION CONTROLS --- */}
        <HStack p="4" justify="space-between" borderTopWidth="1px" bg="gray.50">
          <Text fontSize="sm" color="gray.600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, advisoryList.length)} of {advisoryList.length} sections
          </Text>
          <Group attached variant="outline">
            <IconButton 
              size="sm"
              bg="purple.600"
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              <LuChevronLeft />
            </IconButton>
            
            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                size="sm"
                variant={currentPage === i + 1 ? "solid" : "ghost"}
                colorPalette="purple"
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <IconButton 
              size="sm"
              bg="purple.600"
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <LuChevronRight />
            </IconButton>
          </Group>
        </HStack>
      </Box>
    </VStack>
  );
};