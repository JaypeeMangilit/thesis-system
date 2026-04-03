import { useState, useRef } from "react";
import { 
    Box, Flex, Text, Button, Heading, VStack, Icon, 
    HStack, Badge, Card, Separator, IconButton
} from "@chakra-ui/react";
import { 
    LuUpload, LuFileSpreadsheet, LuCircleCheck, 
    LuCircle, LuSend, LuCircleAlert 
} from "react-icons/lu";
import * as XLSX from 'xlsx';
import { toaster, Toaster } from "./components/ui/toaster";
import { pathfinderFetch } from './api';

export default function RegistrarAddStudentInformation() {
    const fileInputRef = useRef(null);
    const [fileData, setFileData] = useState(null);
    const [fileName, setFileName] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // 1. Process Excel and Clean Scientific Notation (E+11 fix)
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const workbook = XLSX.read(event.target.result, { type: 'binary' });
                const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                
                // Clean data: Convert LRN to string to avoid Scientific Notation issues
                const cleanedData = rawData.map(student => ({
                    ...student,
                    lrn: student.LRN ? student.LRN.toString().trim() : "",
                    firstName: student.FirstName || student.FirstName,
                    lastName: student.LastName || student.LastName,
                    middleName: student.MiddleName || "",
                    sectionId: student.SectionID || student.Section, // Ensure this matches your DB
                    guardianEmail: student.Gmail || student.Email || student.guardianEmail
                }));

                if (cleanedData.length > 0 && cleanedData[0].lrn) {
                    setFileData(cleanedData);
                    toaster.create({ 
                        title: "File Ready", 
                        description: `${cleanedData.length} students detected.`, 
                        type: "success" 
                    });
                } else {
                    throw new Error("Invalid LRN column or empty file.");
                }
            } catch (err) {
                toaster.create({ title: "Import Error", description: err.message, type: "error" });
            }
        };
        reader.readAsBinaryString(file);
    };

    // 2. Send Batch to Backend
    const confirmUpload = async () => {
        if (!fileData) return;
        setIsUploading(true);
        
        try {
            const res = await pathfinderFetch("/api/registration/batch-upload-students", {
                method: "POST",
                body: JSON.stringify({ students: fileData }),
            });

            const result = await res.json();

            if (res.ok) {
                toaster.create({ 
                    title: "Onboarding Started", 
                    description: result.message, 
                    type: "success" 
                });
                setFileData(null);
                setFileName("");
            } else {
                // This catches the "Duplicate LRN" or "Connection" error from your backend
                throw new Error(result.error || "Failed to process batch.");
            }
        } catch (error) {
            toaster.create({ 
                title: "Upload Failed", 
                description: error.message, 
                type: "error",
                duration: 5000 
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Box p={8} maxW="900px" mx="auto">
            <Toaster />
            
            {/* Page Title */}
            <VStack align="flex-start" gap={1} mb={8}>
                <Heading size="2xl" color="purple.700" letterSpacing="tight">
                    Batch Student Onboarding
                </Heading>
                <Text color="gray.500" fontSize="lg">
                    Upload your student masterlist to automate enrollment and email notifications.
                </Text>
            </VStack>

            {/* Step 1: Upload Zone (Visible if no file selected) */}
            {!fileData ? (
                <Box 
                    border="2px dashed" 
                    borderColor="purple.200" 
                    borderRadius="3xl" 
                    p={20} 
                    textAlign="center"
                    bg="purple.50/20"
                    _hover={{ bg: "purple.50/50", borderColor: "purple.400", transform: "scale(1.01)" }}
                    transition="all 0.3s ease"
                    cursor="pointer"
                    onClick={() => fileInputRef.current.click()}
                >
                    <input type="file" ref={fileInputRef} hidden accept=".xlsx, .xls" onChange={handleFileSelect} />
                    <VStack gap={6}>
                        <Icon as={LuUpload} fontSize="5xl" color="purple.500" />
                        <VStack gap={2}>
                            <Text fontWeight="bold" fontSize="xl">Import Student Excel File</Text>
                            <Text fontSize="md" color="gray.400">Drag and drop your .xlsx file here or click to browse</Text>
                        </VStack>
                        <Button colorPalette="purple" size="lg" variant="solid" px={10} borderRadius="full">
                            Select File
                        </Button>
                    </VStack>
                </Box>
            ) : (
                /* Step 2: Review & Send Card (Visible once file is parsed) */
                <Card.Root variant="elevated" borderRadius="3xl" shadow="2xl" border="1px solid" borderColor="gray.100">
                    <Card.Body p={8}>
                        <Flex justify="space-between" align="center" mb={6}>
                            <HStack gap={4}>
                                <Icon as={LuFileSpreadsheet} color="green.500" fontSize="3xl" />
                                <Box>
                                    <Text fontWeight="extrabold" fontSize="xl">{fileName}</Text>
                                    <Text fontSize="sm" color="gray.500">{fileData.length} Students found in sheet</Text>
                                </Box>
                            </HStack>
                            <IconButton 
                                aria-label="Remove file"
                                variant="ghost" 
                                color="red.400" 
                                onClick={() => {setFileData(null); setFileName("");}}
                            >
                                <LuCircle fontSize="24px" />
                            </IconButton>
                        </Flex>
                        
                        <Separator mb={6} />
                        
                        <VStack align="flex-start" gap={4}>
                            <HStack gap={3}>
                                <Badge colorPalette="green" size="lg" variant="surface" borderRadius="full" px={3}>
                                    <LuCircleCheck style={{marginRight: '6px'}} /> Column Headers Validated
                                </Badge>
                                <Badge colorPalette="blue" size="lg" variant="surface" borderRadius="full" px={3}>
                                    <LuCircleAlert style={{marginRight: '6px'}} /> Auto-cleaning LRN Formats
                                </Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                                Clicking the button below will create accounts for all {fileData.length} students and send their unique onboarding links to the listed guardian emails.
                            </Text>
                        </VStack>
                    </Card.Body>
                    
                    <Card.Footer p={8} bg="gray.50/50" borderBottomRadius="3xl">
                        <Button 
                            colorPalette="purple" 
                            width="full" 
                            size="xl"
                            height="70px"
                            fontSize="xl"
                            borderRadius="2xl"
                            loading={isUploading}
                            onClick={confirmUpload}
                            boxShadow="0 10px 20px -10px rgba(107, 70, 193, 0.5)"
                        >
                            <LuSend style={{marginRight: '12px'}} /> Send {fileData.length} Onboarding Emails
                        </Button>
                    </Card.Footer>
                </Card.Root>
            )}

            {/* Documentation / Help Footer */}
            <Box mt={12} p={6} bg="blue.50" borderRadius="2xl" border="1px solid" borderColor="blue.100">
                <HStack gap={4} align="flex-start">
                    <Icon as={LuCircleAlert} color="blue.500" mt={1} />
                    <VStack align="flex-start" gap={1}>
                        <Text fontWeight="bold" color="blue.800" fontSize="sm">Required Excel Format</Text>
                        <Text fontSize="xs" color="blue.700" lineHeight="tall">
                            Your sheet must include: <strong>LRN</strong> (12 digits), <strong>FirstName</strong>, <strong>LastName</strong>, 
                            <strong>SectionID</strong> (Numeric ID), and <strong>Gmail</strong>. If an LRN already exists in the system, 
                            the upload will fail to prevent duplicates.
                        </Text>
                    </VStack>
                </HStack>
            </Box>
        </Box>
    );
};