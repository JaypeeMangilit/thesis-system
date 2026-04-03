import React, { useState, useEffect } from "react";
import { Box, Button, Table, Text, VStack, HStack, Heading, IconButton } from "@chakra-ui/react";
import { FaFileUpload, FaTrash, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { pathfinderFetch } from './api'; //helper audit trail

export default function TeacherStudentAttendance() {
    const [attendanceFiles, setAttendanceFiles] = useState([]);
    const teacherName = localStorage.getItem('userName'); // Using your existing storage

    // 1. Fetch saved files from database on load
    const fetchFiles = async () => {
        const res = await pathfinderFetch(`http://localhost:3000/api/attendance/${teacherName}`);
        const data = await res.json();
        setAttendanceFiles(data);
    };

    useEffect(() => { fetchFiles(); }, []);

    // 2. IMPORT Logic: Read file and send to backend
    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64Data = event.target.result.split(',')[1]; // Get only the data part

            const payload = {
                teacher_name: teacherName,
                file_name: file.name,
                file_data: base64Data,
                import_date: new Date().toISOString()
            };

            await pathfinderFetch("http://localhost:3000/api/attendance/upload", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            fetchFiles(); // Refresh list
        };
        reader.readAsDataURL(file);
    };

    // 3. DOWNLOAD Logic: Convert string back to file
    const downloadFile = (fileObj) => {
        const byteCharacters = atob(fileObj.file_data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileObj.file_name;
        link.click();
    };

    // 4. DELETE Logic
    const deleteFile = async (id) => {
        if (window.confirm("Delete this record?")) {
            await pathfinderFetch(`http://localhost:3000/api/attendance/${id}`, { method: "DELETE" });
            fetchFiles();
        }
    };

    return (
        <Box p={8} bg="white" borderRadius="xl">
            <HStack justify="space-between" mb={6}>
                <Heading size="md">Student Attendance Records</Heading>
                <Button as="label" colorPalette="purple" leftIcon={<FaFileUpload />} cursor="pointer">
                    Import Excel
                    <input type="file" hidden accept=".xlsx, .xls" onChange={handleImport} />
                </Button>
            </HStack>

            <Table.Root variant="outline">
                <Table.Header bg="gray.50">
                    <Table.Row>
                        <Table.ColumnHeader w="50px" textAlign="center">#</Table.ColumnHeader>
                        <Table.ColumnHeader>File Name</Table.ColumnHeader>
                        <Table.ColumnHeader>Date Imported</Table.ColumnHeader>
                        <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {attendanceFiles.map((file, index) => (
                        <Table.Row key={file.id}>
                            <Table.Cell textAlign="center" fontWeight="bold" color="gray.500">
                                {index + 1}
                            </Table.Cell>

                            <Table.Cell>
                                <Button variant="ghost" color="green.600" onClick={() => downloadFile(file)}>
                                  <FaFileExcel /> {file.file_name}
                                </Button>
                            </Table.Cell>
                            <Table.Cell>{new Date(file.import_date).toLocaleDateString()}</Table.Cell>
                            <Table.Cell textAlign="right">
                                <IconButton 
                                    aria-label="Delete" 
                                    colorPalette="red" 
                                    variant="ghost" 
                                    onClick={() => deleteFile(file.id)}
                                >
                                    <FaTrash />
                                </IconButton>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    );
};