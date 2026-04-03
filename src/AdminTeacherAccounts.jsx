import { 
    Heading, Box, VStack, HStack, Text, Flex, Button, 
    Input, Table, Checkbox, Spinner, Center, SimpleGrid,
    Dialog, InputGroup,
    Field,
} from "@chakra-ui/react";
import { toaster } from "./components/ui/toaster";
import { LuSearch, LuUserPlus, LuSave, LuTrash2, LuX } from "react-icons/lu";
import { useEffect, useState } from "react";
import { pathfinderFetch } from './api'; //helper audit trail

export default function AdminTeacherAccounts() {
    const [items, setItems] = useState([]); 
    const [selection, setSelection] = useState([]); 
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // Form State for Adding Employee
    const [formData, setFormData] = useState({
        employeeId: "", password: "", lastName: "", firstName: "",
        middleName: "", age: "", address: "", position: "Teacher",
        dob: "", status: "Active", contactNum: ""
    });

    // 1. Fetch Data
    useEffect(() => {
        const getEmployeeData = async () => {
            try {
                const response = await pathfinderFetch('http://localhost:3000/api/subadmin');
                if (!response.ok) throw new Error("Server connection failed");
                const data = await response.json();
                setItems(data);
            } catch (err) {
                console.error("Fetch error:", err.message);
            } finally {
                setLoading(false);
            }
        };
        getEmployeeData();
    }, []);

    // 2. Search & Selection Logic
    const filteredItems = items.filter(item => 
        (item.Name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.Employee_ID?.toString().includes(searchTerm))
    );

    const indeterminate = selection.length > 0 && selection.length < filteredItems.length;

    // 3. Formatting Logic for Employee ID: AAAAAAAA-0000-0000
    const handleIdChange = (val) => {
        let cleaned = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        let formatted = cleaned;
        if (cleaned.length > 8) formatted = cleaned.slice(0, 8) + "-" + cleaned.slice(8);
        if (cleaned.length > 12) formatted = formatted.slice(0, 13) + "-" + cleaned.slice(12, 16);
        setFormData({ ...formData, employeeId: formatted.slice(0, 18) });
    };

    // 4. Save Logic
    const handleSave = async () => {

        const requiredFields = [
            'employeeId', 'password', 'firstName', 'lastName',
            'age', 'dob', 'contactNum', 'address'
        ];

        const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === "");

        if (missingFields.length > 0) {
            alert(`Please Fill in all required fields:`);
            return;
        }
        try {
            const response = await pathfinderFetch('http://localhost:3000/api/add-employee', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                alert("Employee saved successfully!");
                setOpen(false);
                window.location.reload(); 
            }
        } catch (err) {
            console.error("Save error:", err);
        }
    };

    const handleDelete = async () => {
        
        if (!window.confirm(`Are you sure you want to permanently delete ${selection.length} account(s)?`)) {
            return;
        }

        try {
            const response = await pathfinderFetch('http://localhost:3000/api/add-employee/delete', {
                method: 'DELETE',
                body: JSON.stringify({employeeIds: selection})
            });

            if(response.ok) {
                toaster.create({
                    title: "Account Deleted",
                    description: "The Teacher Record was removed successfully",
                    type: "success",
                });
                setSelection([]);
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert("Error:" + errorData.error);
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to Connect to the Server");
        }
    };

    return (
        <Flex minH="100vh" bg="gray.50">
            <Box ml="50px" flex="1" p={6} overflow="auto">
                
                {/* --- HEADER SECTION --- */}
                <Flex justify="space-between" align="center" w="full" pb={4} borderBottom="2px solid" borderColor="gray.200">
                    <VStack align="flex-start" gap={0}>
                        <Heading size="xl" fontWeight="bold">Employee Accounts</Heading>
                        <Text color="gray.500" fontSize="sm">Manage and monitor all Employee login credentials</Text>
                    </VStack>

                    <HStack gap={3}>
                        <Button 
                            variant="subtle"
                            colorPalette="red"
                            disabled={selection.length === 0}
                            onClick={() => console.log("Archiving IDs:", selection)}
                        >
                            <LuTrash2 style={{marginRight: '8px'}}/> Archive ({selection.length})
                        </Button>

                        <Button
                            colorPalette="red"
                            variant="subtle"
                            disabled={selection.length === 0}
                            onClick={handleDelete}
                        >
                            <LuTrash2 style={{marginRight: "8px"}}/> Delete Selected ({selection.length})
                        </Button>

                        {/* CENTERED ADD EMPLOYEE DIALOG */}
                        <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)} placement="center" motionPreset="slide-in-bottom">
                            <Dialog.Trigger asChild>
                                <Button color="white" bg="purple.600" _hover={{ bg: "purple.700" }}>
                                    <LuUserPlus style={{marginRight: '8px'}} /> Add Employee Account
                                </Button>
                            </Dialog.Trigger>
                            
                            <Dialog.Backdrop />
                            <Dialog.Positioner>
                                <Dialog.Content p={6} borderRadius="xl" boxShadow="2xl" bg="white" maxWidth="650px">
                                    <Dialog.Header>
                                        <Flex justify="space-between" align="center">
                                            <Dialog.Title fontSize="2xl" fontWeight="bold">Employee Registration</Dialog.Title>
                                        </Flex>
                                    </Dialog.Header>

                                    <Dialog.Body mt={4}>
                                        <VStack gap={4}>
                                            <SimpleGrid columns={2} gap={4} w="full">
                                                <Box>
                                                    <Text fontSize="xs" fontWeight="bold" mb={1} color="black">EMPLOYEE ID</Text>
                                                    <Input border="1px solid" placeholder="MTCNOV-1234-5678" value={formData.employeeId} onChange={(e) => handleIdChange(e.target.value)} />
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs" fontWeight="bold" mb={1} color="black">PASSWORD</Text>
                                                    <Input border="1px solid" type="password" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                                </Box>
                                                <Input border="1px solid" placeholder="First Name" onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                                                <Input border="1px solid" placeholder="Last Name" onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                                                <Input border="1px solid" placeholder="Middle Name" onChange={(e) => setFormData({...formData, middleName: e.target.value})} />
                                                <Input border="1px solid" placeholder="Age" type="number" onChange={(e) => setFormData({...formData, age: e.target.value})} />
                                                <Box>
                                                    <Text fontSize="xs" fontWeight="bold" mb={1} color="black">DATE OF BIRTH</Text>
                                                    <Input border="1px solid" type="date" onChange={(e) => setFormData({...formData, dob: e.target.value})} />
                                                </Box>
                                                <Box>
                                                    <Text fontSize="xs" fontWeight="bold" mb={1} color="black">CONTACT NUMBER</Text>
                                                    <Input border="1px solid" placeholder="09XXXXXXXXX" onChange={(e) => setFormData({...formData, contactNum: e.target.value})} />
                                                </Box>
                                            </SimpleGrid>
                                            <Input border="1px solid" placeholder="Home Address" w="full" onChange={(e) => setFormData({...formData, address: e.target.value})} />
                                            <Box w="full">
                                                <Text fontSize="xs" fontWeight="bold" mb={1} color="black">POSITION</Text>
                                                <select 
                                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }}
                                                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                                                    value={formData.position}
                                                >
                                                    <option value="Teacher">Teacher</option>
                                                    <option value="Admin">Admin</option>
                                                    <option value="Registrar">Registrar</option>
                                                    <option value="Department Head">Department Head</option>
                                                </select>
                                            </Box>
                                        </VStack>
                                    </Dialog.Body>

                                    <Dialog.Footer mt={8}>
                                        <HStack gap={3} w="full" justify="flex-end">
                                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                            <Button bg="purple.600" color="white" px={10} onClick={handleSave}>
                                                <LuSave style={{marginRight: '8px'}}/> Save Account
                                            </Button>
                                        </HStack>
                                    </Dialog.Footer>
                                </Dialog.Content>
                            </Dialog.Positioner>
                        </Dialog.Root>
                    </HStack>
                </Flex>

                {/* SEARCH & TABLE SECTION */}
                <Box mt={6} p={6} shadow="sm" borderWidth="1px" borderRadius="xl" bg="white">
                    <HStack mb={6} maxW="400px">
                         <Input 
                            placeholder="Search by Name or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="md"
                        />
                    </HStack>

                    <Table.Root size="md" variant="line" interactive>
                        <Table.Header>
                            <Table.Row bg="gray.50">
                                <Table.ColumnHeader w="6">
                                    <Checkbox.Root 
                                        checked={indeterminate ? "indeterminate" : selection.length > 0 && selection.length === filteredItems.length}
                                        onCheckedChange={(changes) => {
                                            setSelection(changes.checked ? filteredItems.map((item) => item.Employee_ID) : []);
                                        }}
                                    >
                                        <Checkbox.HiddenInput /><Checkbox.Control />
                                    </Checkbox.Root>
                                </Table.ColumnHeader>
                                <Table.ColumnHeader fontWeight="bold">Employee_ID</Table.ColumnHeader>
                                <Table.ColumnHeader fontWeight="bold">Password</Table.ColumnHeader>
                                <Table.ColumnHeader fontWeight="bold">Employee Name</Table.ColumnHeader>
                                <Table.ColumnHeader fontWeight="bold">Position</Table.ColumnHeader>
                                <Table.ColumnHeader fontWeight="bold">Status</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {loading ? (
                                <Table.Row><Table.Cell colSpan={4}><Center p={10}><Spinner color="purple.500" /><Text ml={3}>Fetching Data...</Text></Center></Table.Cell></Table.Row>
                            ) : filteredItems.length === 0 ? (
                                <Table.Row><Table.Cell colSpan={4} textAlign="center" py={10}>No employee records found.</Table.Cell></Table.Row>
                            ) : (
                                filteredItems.map((item) => (
                                    <Table.Row key={item.Employee_ID} _selected={{ bg: "purple.50" }}>
                                        <Table.Cell>
                                            <Checkbox.Root 
                                                checked={selection.includes(item.Employee_ID)}
                                                onCheckedChange={(changes) => {
                                                    setSelection(prev => changes.checked ? [...prev, item.Employee_ID] : prev.filter(id => id !== item.Employee_ID));
                                                }}
                                            >
                                                <Checkbox.HiddenInput /><Checkbox.Control />
                                            </Checkbox.Root>
                                        </Table.Cell>
                                        <Table.Cell fontWeight="600" color="purple.800">{item.Employee_ID}</Table.Cell>
                                        <Table.Cell fontFamily="mono">{item.Password}</Table.Cell>
                                        <Table.Cell>{item.Name}</Table.Cell>
                                        <Table.Cell>{item.Position}</Table.Cell>
                                        <Table.Cell>{item.Status}</Table.Cell>
                                    </Table.Row>
                                ))
                            )}
                        </Table.Body>
                    </Table.Root>
                </Box>
            </Box>
        </Flex>
    );
};