import { useState } from 'react';
import { 
    Box, Heading, VStack, HStack, Button, Text, 
    Container, Input, Flex, Image, NativeSelect
} from "@chakra-ui/react";
import { LuPrinter, LuFileText } from "react-icons/lu";
import { toaster } from "./components/ui/toaster";

/**
 * FIXED EDITABLE FIELD
 * Uses 'as="span"' to prevent the "div cannot be a descendant of p" error.
 */
const EditableField = ({ name, value, onChange, width = "220px" }) => (
    <Box 
        as="span" 
        borderBottom="1px solid black" 
        mx={1} 
        verticalAlign="bottom"
        bg="white"
    >
        <Input
            variant="unstyled"
            name={name}
            value={value}
            onChange={onChange}
            width={width}
            textAlign="center"
            fontWeight="bold"
            color="black"
            fontSize="inherit"
            height="1.0em"
            display="inline"
        />
    </Box>
);

export default function RegistrarCertificate() {
    const [certType, setCertType] = useState("good_moral");
    
    const [formData, setFormData] = useState({
        studentName: "DELA CRUZ, JUAN",
        lrn: "107981100069",
        gradeSection: "GRADE 10 - MT. CARMEL",
        schoolYear: "2025-2026",
        dateIssued: "6TH day of March 2026",
        requestor: "Ms. Lucasia",
        registrar: "MS. RHAYLANIE GAY M. DE VERA",
        principal: "KERVIN JAY A. VALIAO, LPT"
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePrint = () => {
        toaster.create({
            title: "Preparing Document",
            description: "Optimizing for single-page A4...",
            type: "info",
        });
        setTimeout(() => {
            window.print();
        }, 500);
    };

    return (
        <Box p={8} bg="gray.100" minH="100vh">
            {/* UI Control Panel */}
            <Flex className="no-print" justify="space-between" align="center" mb={10} bg="white" p={4} borderRadius="lg" shadow="sm">
                <HStack gap={4}>
                    <LuFileText size={24} color="#6B46C1" />
                    <NativeSelect.Root width="300px">
                        <NativeSelect.Field value={certType} onChange={(e) => setCertType(e.target.value)}>
                            <option value="non_issuance">Non-Issuance of Form 137</option>
                            <option value="good_moral">Good Moral Character</option>
                            <option value="enrollment">Certification of Enrollment</option>
                        </NativeSelect.Field>
                    </NativeSelect.Root>
                </HStack>
                <Button bg="#6B46C1" color="white" onClick={handlePrint} _hover={{ bg: "purple.700" }}>
                    <LuPrinter style={{ marginRight: '8px' }} /> Print A4 Certificate
                </Button>
            </Flex>

            {/* Print Styling */}
            <style>
                {`
                @media print {
                    @page { size: A4; margin: 0; }
                    body * { visibility: hidden; }
                    .print-container, .print-container * { visibility: visible; }
                    .print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 210mm;
                        height: 297mm;
                        padding: 20mm !important;
                        box-shadow: none !important;
                    }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
                .justified-text {
                    text-align: justify;
                    text-justify: inter-word;
                    text-indent: 50px;
                }
                `}
            </style>

            <Box display="flex" justifyContent="center">
                <Container 
                    className="print-container"
                    width="210mm" 
                    minHeight="297mm" 
                    bg="white" 
                    p="25mm" 
                    color="black"
                >
                    {/* Header Section */}
                    <VStack gap={0} mb={8}>
                        <HStack justify="space-between" w="full" align="center">
                            <Image src="/PATNUBAY.jpeg" h="80px" />
                            <VStack gap={0} textAlign="center">
                                <Text fontSize="xs" fontWeight="extrabold">Republic of the Philippines</Text>
                                <Text fontSize="xs" fontWeight="extrabold">Department of Education</Text>
                                <Text fontWeight="extrabold" fontSize="lg" color="purple.600">PATNUBAY ACADEMY, INC.</Text>
                                <Text fontSize="6.5px" maxW="700px" color="purple.600" fontWeight="extrabold">
                                    School ID: 402260 | Government Recognition: 036, s. 2004 | Government Permit No.: E-033, s. 1995(Elem)
                                    0036, s. 2014(Secondary)
                                </Text>
                                <Text fontSize="6.5px" maxW="420px" color="purple.600" fontWeight="extrabold">037 Daang Bakal St., San Juan 1, Noveleta, Cavite, Philippines | 0953 887 5485 - 0923 743 3671</Text>
                            </VStack>
                            <Image src="/DEPED.png" h="80px" />
                        </HStack>
                        <Box h="2px" bg="#6B46C1" w="full" mt={2} />
                    </VStack>

                    <VStack gap={8} align="center">
                        <Heading size="md" fontWeight="bold" letterSpacing="4px" pb={1}>
                            {certType === "enrollment" ? "CERTIFICATION OF ENROLLMENT" : "CERTIFICATION"}
                        </Heading>

                        {certType === "good_moral" && (
                            <Text alignSelf="flex-start" fontWeight="bold">To whom it may concern:</Text>
                        )}

                        {/* FIX: Using Box instead of Text for the container 
                            to permit nested 'span' elements without hydration errors.
                        */}
                        <Box className="justified-text" lineHeight="2.2" fontSize="16px" w="full">
                            {certType === "good_moral" && (
                                <>
                                    <Text textAlign="justify" textIndent="2em" fontSize="md">
                                        This is to certify that<strong><EditableField name="studentName" value={formData.studentName} onChange={handleInputChange} width="220px"/></strong>
                                        a bonafide student of Mother Theresa Colegio de Noveleta, Inc., with a Learner Reference Number of
                                        <strong><EditableField name="lrn" value={formData.lrn} onChange={handleInputChange} width="150px"/></strong>, S/Y
                                        <EditableField name="schoolYear" value={formData.schoolYear} onChange={handleInputChange} width="120px"/>
                                        is of good moral character and has no derogatory records. Issued this
                                        <EditableField name="dateIssued" value={formData.dateIssued} onChange={handleInputChange} width="210px"/>,
                                        at Mother Theresa Colegio de Noveleta, Inc., upon the request of
                                        <EditableField name="requestor" value={formData.requestor} onChange={handleInputChange} width="120px"/> for school purposes.
                                    </Text>
                                </>
                            )}
                            
                            {certType === "non_issuance" && (
                                <>
                                    <Text textAlign="justify" textIndent="2em" fontSize="14px">
                                        &nbsp;&nbsp;This is to certify the <strong>NON-ISSUANCE of FORM 137</strong> of
                                        <EditableField name="studentName" value={formData.studentName} onChange={handleInputChange} width="200px"/>
                                        with a Learner Reference Number of <EditableField name="lrn" value={formData.lrn} onChange={handleInputChange} width="140px"/>,
                                        He/She is a bonafide enrolled as <EditableField name="gradeSection" value={formData.gradeSection} onChange={handleInputChange} width="215px"/>
                                        student in this institution School Year <EditableField name="schoolYear" value={formData.schoolYear} onChange={handleInputChange} width="110px"/>
                                    </Text>
                                </>
                            )}

                            {certType === "enrollment" && (
                                <>
                                    <Text textAlign="justify" textIndent="2em" fontSize="14px">
                                        This is to certify that <strong><EditableField name="studentName" value={formData.studentName} onChange={handleInputChange} width="230px"/></strong>
                                        with a Learner Reference Number of <strong><EditableField name="lrn" value={formData.lrn} onChange={handleInputChange} width="160px"/></strong>
                                        a bonafide enrolled as <strong><EditableField name="gradeSection" value={formData.gradeSection} onChange={handleInputChange} width="210px"/></strong>
                                        in this institution School Year <EditableField name="schoolYear" value={formData.schoolYear} onChange={handleInputChange} width="110px"/>.
                                    </Text>
                                </>
                            )}
                        </Box>

                        <Text w="full" fontSize="14px" className="justified-text">
                            This is issued upon request by the student for whatever legal purposes this certification may serve.
                        </Text>

                        {/* Signature Block */}
                        <Flex direction="column" align="flex-start" w="full" pt={10}>
                            <Text mb={12} fontSize="14px">Given this <EditableField name="dateIssued" value={formData.dateIssued} onChange={handleInputChange} width="220px" />.</Text>
                            
                            <VStack gap={0} alignSelf="flex-end" pr={4} mt={20}>
                                <EditableField name="registrar" value={formData.registrar} onChange={handleInputChange} width="300px" />
                                <Text fontWeight="bold" fontSize="16px">School Registrar</Text>
                            </VStack>
                        </Flex>

                        <Box alignSelf="flex-start" mt="auto" pt={4} fontSize="xs">
                            <Text as="i">Not valid without School Seal.</Text>
                        </Box>
                    </VStack>
                </Container>
            </Box>
        </Box>
    );
};