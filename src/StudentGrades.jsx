import { Box, Heading, Text, Table, Center, Spinner, Badge, VStack, HStack, Button } from "@chakra-ui/react";
import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from "@chakra-ui/react"; 
import { useState, useEffect } from "react";
import { pathfinderFetch } from './api'; 

export default function StudentGrades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuarter, setSelectedQuarter] = useState("All Quarters");
  
  const studentLRN = localStorage.getItem("studentLRN"); 

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await pathfinderFetch(`/api/student-account/grades/${studentLRN}`);
        const data = await response.json();
        if (response.ok) setGrades(data);
      } catch (error) {
        console.error("Grades fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
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

  // --- CALCULATION LOGIC (Untouched) ---
  const isIncomplete = grades.some(g =>
    !g.Q1 || !g.Q2 || !g.Q3 || !g.Q4 || g.Q1 === 0 || g.Q2 === 0 || g.Q3 === 0 || g.Q4 === 0
  );
  const totalPoints = grades.reduce((sum, g) => sum + parseFloat(g.FinalGrade || 0), 0);
  const generalAverage = !isIncomplete && grades.length > 0 ? (totalPoints / grades.length).toFixed(2) : "0.00";

  const isAll = selectedQuarter === "All Quarters";

  if (loading) return <Center h="100vh"><Spinner size="xl" color="purple.500" /></Center>;

  return (
    <Box flex="1" p={8} bg="gray.50" minH="100vh">
      <HStack justify="space-between" mb={6} align="flex-end">
        <VStack align="start">
          <Heading size="lg" color="purple.700">Report Card</Heading>
          <Text fontSize="sm" color="gray.600">LRN: {studentLRN}</Text>
        </VStack>

          <Badge variant="subtle" color="purple.600" size="md">
            S.Y {academicYear.StartYear}- {academicYear.EndYear}
          </Badge>

        {/* --- THE FIX: FORCED LOCAL POSITIONING --- */}
        <Box position="relative"> 
          <MenuRoot positioning={{ placement: "bottom-end", gutter: 4 }}>
            <MenuTrigger asChild>
              <Button variant="outline" size="sm" border="1px solid" borderColor="purple.400" bg="white">
                View: {selectedQuarter}
              </Button>
            </MenuTrigger>
            
            {/* portalled={false} is the MAGIC fix here */}
            <MenuContent 
              portalled={false} 
              position="absolute" 
              zIndex="2000" 
              minW="160px" 
              bg="white" 
              boxShadow="lg" 
              border="1px solid" 
              borderColor="gray.200"
            >
              <MenuItem value="all" onClick={() => setSelectedQuarter("All Quarters")}>All Quarters</MenuItem>
              <MenuItem value="q1" onClick={() => setSelectedQuarter("1st Quarter")}>1st Quarter</MenuItem>
              <MenuItem value="q2" onClick={() => setSelectedQuarter("2nd Quarter")}>2nd Quarter</MenuItem>
              <MenuItem value="q3" onClick={() => setSelectedQuarter("3rd Quarter")}>3rd Quarter</MenuItem>
              <MenuItem value="q4" onClick={() => setSelectedQuarter("4th Quarter")}>4th Quarter</MenuItem>
            </MenuContent>
          </MenuRoot>
        </Box>
      </HStack>
      
      <Box bg="white" borderRadius="sm" boxShadow="lg" overflow="hidden" border="1px solid" borderColor="black">
        <Table.Root variant="line">
          <Table.Header bg="purple.600">
            <Table.Row>
              <Table.ColumnHeader border="1px solid" color="black" py={4} px={6}>SUBJECT</Table.ColumnHeader>
              {(isAll || selectedQuarter === "1st Quarter") && <Table.ColumnHeader border="1px solid" color="black" textAlign="center">1ST</Table.ColumnHeader>}
              {(isAll || selectedQuarter === "2nd Quarter") && <Table.ColumnHeader border="1px solid" color="black" textAlign="center">2ND</Table.ColumnHeader>}
              {(isAll || selectedQuarter === "3rd Quarter") && <Table.ColumnHeader border="1px solid" color="black" textAlign="center">3RD</Table.ColumnHeader>}
              {(isAll || selectedQuarter === "4th Quarter") && <Table.ColumnHeader border="1px solid" color="black" textAlign="center">4TH</Table.ColumnHeader>}
              <Table.ColumnHeader border="1px solid" color="black" textAlign="center">FINAL</Table.ColumnHeader>
              <Table.ColumnHeader border="1px solid" color="black" textAlign="center">REMARKS</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {grades.map((g, index) => (
              <Table.Row key={index} _hover={{ bg: "purple.50" }}>
                <Table.Cell border="1px solid" fontWeight="bold" px={6}>{g.SubjectName}</Table.Cell>
                {(isAll || selectedQuarter === "1st Quarter") && <Table.Cell border="1px solid" textAlign="center">{g.Q1 || '-'}</Table.Cell>}
                {(isAll || selectedQuarter === "2nd Quarter") && <Table.Cell border="1px solid" textAlign="center">{g.Q2 || '-'}</Table.Cell>}
                {(isAll || selectedQuarter === "3rd Quarter") && <Table.Cell border="1px solid" textAlign="center">{g.Q3 || '-'}</Table.Cell>}
                {(isAll || selectedQuarter === "4th Quarter") && <Table.Cell border="1px solid" textAlign="center">{g.Q4 || '-'}</Table.Cell>}
                <Table.Cell border="1px solid" textAlign="center" fontWeight="bold" color="purple.700">{g.FinalGrade}</Table.Cell>
                <Table.Cell border="1px solid" textAlign="center">
                  <Badge bg={parseFloat(g.FinalGrade) >= 75 ? "green" : "red"} variant="solid" borderRadius="full" px={3}>
                    {parseFloat(g.FinalGrade) >= 75 ? "PASSED" : "FAILED"}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
            
            <Table.Row bg="gray.100">
              <Table.Cell px={6} py={4} fontWeight="extrabold" fontSize="md">GENERAL AVERAGE</Table.Cell>
              <Table.Cell colSpan={isAll ? 4 : 1}>
                {isIncomplete && (
                  <Text color="red.600" fontSize="xs" fontWeight="bold italic">
                    *Pending: some grades are not yet encoded.
                  </Text>
                )}
              </Table.Cell>
              <Table.Cell textAlign="center" fontWeight="extrabold" fontSize="lg" color={isIncomplete ? "gray.400" : "purple.800"}>
                {generalAverage}                
              </Table.Cell>
              <Table.Cell textAlign="center">
                <Badge fontSize="sm" px={4} py={1} borderRadius="md" color={isIncomplete ? "red" : (parseFloat(generalAverage) >= 75 ? "green" : "red")}>
                  {isIncomplete ? "INCOMPLETE" : (parseFloat(generalAverage) >= 75 ? "PROMOTED" : "RETAINED")}
                </Badge>
              </Table.Cell>        
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
};