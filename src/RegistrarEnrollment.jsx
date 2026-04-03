import { 
  Input, Box, IconButton, Text, VStack, SimpleGrid, 
  Heading, HStack, Button, InputGroup, Checkbox, 
  Icon
} from "@chakra-ui/react";
import { useState } from "react";
import { LuX } from "react-icons/lu";
import { pathfinderFetch } from './api'; //helper audit trail


const EnrollmentField = ({label, placeholder, value,
onChange,inputRef}) => (
    <VStack align="flex-start" gap={1} w="full">
      <Text fontWeight="bold" fontSize="sm" color="gray.700">
        {label}
      </Text>
      <InputGroup
        border="1px solid"
        w="full"
        endElement={
          value ? (
            <IconButton
              variant="ghost"
              size="xs"
              onClick={()=> onChange("")}
            >
              <LuX/>
            </IconButton>
          ) : null
        }
      >
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      </InputGroup>
    </VStack>
);

export default function RegistrarEnrollment() {
  // Main Student States
  const [schoolyear, setSchoolYear] = useState("2024-2025");
  const [lrn, setLrn] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [age, setAge] = useState("");
  const [gradelevel, setGradeLevel] = useState("");
  const [sex, setSex] = useState("");
  const [email, setEmail] = useState("");
  const [contactnum, setContactNum] = useState("");
  const [address, setAddress] = useState("");
  const [mothername, setMotherName] = useState("");
  const [motheroccupation, setMotherOccupation] = useState("");
  const [fathername, setFatherName] = useState("");
  const [fatheroccupation, setFatherOccupation] = useState("");
  const [guardian, setGuardian] = useState("");
  const [guardianoccupation, setGuardianOccupation] = useState("");
  const [guardianemail, setGuardianEmail] = useState("");
  const [guardiancontact, setGuardianContact] = useState("");
  const [guardianfb, setGuardianFb] = useState("");
  const [birthplace, setBirthpPlace] = useState("");

  // INDIVIDUAL STATE FOR CHECKBOXES (Fixes the "undefined" array issue)
  const [reqs, setReqs] = useState({
    FORM137: false,
    CARD138: false,
    GoodMoral: false,
    "Nso/Psa": false,
    "1x1/2x2 Id Pic": false,
    Diploma: false,
    Indigency: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckboxChange = (id) => {
    setReqs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEnrollment = async () => {
    setIsSubmitting(true);
    
    const studentData = {
      SchoolYear: schoolyear,
      LRN: lrn,
      LastName: lastName,
      FirstName: firstName,
      MiddleName: middleName,
      Age: parseInt(age) || 0,
      GradeLevel: gradelevel,
      Sex: sex,
      Email: email,
      BirthPlace: birthplace,
      ContactNumber: contactnum,
      StudentAddress: address,
      MotherName: mothername,
      MotherOccupation: motheroccupation,
      FatherName: fathername,
      FatherOccupation: fatheroccupation,
      GuardianName: guardian,
      GuardianOccupation: guardianoccupation,
      GuardianEmail: guardianemail,
      GuardianContact: guardiancontact,
      GuardianFacebook: guardianfb,
      

      HasForm137: reqs.FORM137 ? 1 : 0,
      HasCard138: reqs.CARD138 ? 1 : 0,
      HasGoodMoral: reqs.GoodMoral ? 1 : 0,
      HasNsoPsa: reqs["Nso/Psa"] ? 1 : 0,
      HasIdPic: reqs["1x1/2x2 Id Pic"] ? 1 : 0,
      HasDiploma: reqs.Diploma ? 1 : 0,
      HasIndigency: reqs.Indigency ? 1 : 0,
    };

    console.log("FINAL PAYLOAD:", studentData);

    try {
      const response = await pathfinderFetch("http://localhost:3000/api/enroll", {
        method: "POST",
        body: JSON.stringify(studentData),
      });

      if (response.ok) {
        alert("Enrollment Successfully!!!");
        window.location.reload();
      } else {
        const errData = await response.json();
        alert("Server Error: " + errData.details);
      }
    } catch (error) {
      alert("Network Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box p={8} bg="white">
      {/*Header Sectin */}
      <HStack justify="space-between" mb={3}>
        <VStack align="flex-start" gap={0}>
          <Heading size="2xl" fontWeight="bold">
            Enroll a Student
          </Heading>
          <Text color="gray.500">
            This is where you enroll the student.
          </Text>
        </VStack>
      </HStack>
      
      {/* Simple Grid for Inputs (Repeat for all fields) */}
      <SimpleGrid columns={4} gap={4} mb={10}>
          <EnrollmentField
            label="LRN"
            placeholder="Enter your 12-digit"
            value={lrn}
            onChange={setLrn}
          />

          <EnrollmentField
            label="Incoming Year Level"
            placeholder="Enter your Grade"
            value={gradelevel}
            onChange={setGradeLevel}
          />

        <VStack align="flex-start" gap={1} w="full">
          <Text fontWeight="bold" fontSize="sn" color="gray.700">
            School Year
          </Text>
          <select
            value={schoolyear}
            onChange={(e) => setSchoolYear(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0'
              }}
          >
            <option value="">Select School Year</option>
            <option value="2026-2027">2026-2027</option>
            <option value="2027-2028">2027-2028</option>
            <option value="2028-2029">2028-2029</option>
            <option value="2029-2030">2029-2030</option>
          </select>
        </VStack>

          <EnrollmentField
            label="Last Name"
            placeholder="Enter your Last Name"
            value={lastName}
            onChange={setLastName}
          />

          <EnrollmentField
            label="First Name"
            placeholder="Enter your First Name"
            value={firstName}
            onChange={setFirstName}
          />

          <EnrollmentField
            label="Age"
            placeholder="Enter your Age"
            value={age}
            onChange={setAge}
          />

          <EnrollmentField
            label="Sex"
            placeholder="Enter your Age"
            value={sex}
            onChange={setSex}
          />

          <EnrollmentField
            label="Address"
            placeholder="Enter your Address"
            value={address}
            onChange={setAddress}
          />

          <EnrollmentField
            label="Birthplace"
            placeholder="Enter BirthPlace"
            value={birthplace}
            onChange={setBirthpPlace}
          />
          <EnrollmentField
            label="Birthday"
            placeholder="Enter Birthday"
            

          />

          <VStack align="flex-start" gap={1} w="full">

            <EnrollmentField
              label="Last School Attended"
              placeholder="Enter the School"
            />

            
          </VStack>

      </SimpleGrid>

      <Box p={6} bg="gray.50" borderRadius="md" border="1px solid #ddd">
        <Text fontWeight="bold" mb={4}>Requirements Checklist</Text>
        <SimpleGrid columns={3} gap={4}>
          {Object.keys(reqs).map((key) => (
            <HStack key={key}>
              <Checkbox.Root 
                checked={reqs[key]} 
                onCheckedChange={() => handleCheckboxChange(key)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>{key}</Checkbox.Label>
              </Checkbox.Root>
            </HStack>
          ))}
        </SimpleGrid>
      </Box>

      <Button 
        mt={8} 
        colorPalette="purple" 
        loading={isSubmitting} 
        onClick={handleEnrollment}
      >
        Enroll Student
      </Button>
    </Box>
  );
};