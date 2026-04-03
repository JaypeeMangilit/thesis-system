import { 
    Heading, Box, VStack, HStack, Text, Flex, Button, 
    Input, Table, Checkbox, Spinner, Center, Badge, Spacer, Group,
    DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogBody, 
    DialogFooter, DialogActionTrigger, DialogBackdrop, DialogPositioner,
    createListCollection
} from "@chakra-ui/react";
import { 
    SelectRoot, SelectTrigger, SelectValueText, SelectContent, SelectItem 
} from "@chakra-ui/react"; // Ensure this matches your local Select component path
import { 
    LuSearch, LuHistory, LuRefreshCw, LuKey,
    LuChevronLeft, LuChevronRight, LuTrash2, LuCircleAlert 
} from "react-icons/lu";
import { useEffect, useState } from "react";
import { toaster } from "./components/ui/toaster";
import { pathfinderFetch } from './api';

export default function AdminStudentAccounts() {
    const [items, setItems] = useState([]);
    const [selection, setSelection] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [showArchive, setShowArchive] = useState(false);
    
    // Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 20; 

    // Password Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeLrn, setActiveLrn] = useState("");
    const [activeName, setActiveName] = useState("");
    const [newPass, setNewPass] = useState("");

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Archive Reason Modal State
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [archiveReason, setArchiveReason] = useState("");

    const reasons = createListCollection({
        items: [
            { label: "Graduated", value: "Graduated" },
            { label: "Dropped Out", value: "Dropped Out" },
            { label: "Transferred", value: "Transferred" },
            { label: "End of School Year", value: "End of Year" },
            { label: "Other", value: "Other" },
        ],
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = showArchive ? '/api/archive-list' : '/api/admin';
            const response = await pathfinderFetch(`http://localhost:3000${endpoint}`);
            if (!response.ok) throw new Error("Server error");
            const data = await response.json();
            setItems(data);
            setSelection([]);
            setCurrentPage(1); 
        } catch (err) {
            toaster.create({ title: "Error", description: "Failed to load records.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [showArchive]);

    const getRemainingDays = (dateArchived) => {
        if (!dateArchived) return 0;
        const archived = new Date(dateArchived);
        const expiryDate = new Date(archived);
        expiryDate.setDate(archived.getDate() + 300); 
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays > 0 ? diffDays : 0;
    };

    const handleArchive = async () => {
        if (selection.length === 0 || !archiveReason) return;
        try {
            const response = await pathfinderFetch('http://localhost:3000/api/archive-students', {
                method: 'POST',
                body: JSON.stringify({ 
                    lrns: selection,
                    reason: archiveReason 
                })
            });
            if (response.ok) {
                toaster.create({ title: "Success", description: "Students archived.", type: "success" });
                setSelection([]);
                setIsArchiveModalOpen(false);
                setArchiveReason("");
                fetchData();
            }
        } catch (err) {
            toaster.create({ title: "Error", description: "Archive failed.", type: "error" });
        }
    };

    const handleRestore = async () => {
        if (selection.length === 0) return;
        try {
            const response = await pathfinderFetch('http://localhost:3000/api/restore-students', {
                method: 'POST',
                body: JSON.stringify({ lrns: selection })
            });
            if (response.ok) {
                toaster.create({ title: "Success", description: "Students restored.", type: "success" });
                setSelection([]);
                fetchData();
            }
        } catch (err) {
            toaster.create({ title: "Error", description: "Restore failed.", type: "error" });
        }
    };

    const handlePermanentDelete = async () => {
        try {
            const response = await pathfinderFetch(`http://localhost:3000/api/delete-student/${activeLrn}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                toaster.create({ title: "Deleted", description: "Account removed permanently.", type: "success" });
                setIsDeleteModalOpen(false);
                setSelection([]);
                fetchData();
            }
        } catch (err) {
            toaster.create({ title: "Error", description: "Deletion failed.", type: "error" });
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPass.trim()) return;
        try {
            const response = await pathfinderFetch('http://localhost:3000/api/change-password', {
                method: 'POST',
                body: JSON.stringify({ 
                    lrn: activeLrn.toString(), 
                    newPassword: newPass 
                })
            });
            if (response.ok) {
                toaster.create({ title: "Updated", description: `Password changed for ${activeName}`, type: "success" });
                setIsModalOpen(false);
                setNewPass("");
                fetchData();
            } else {
                const msg = await response.text();
                throw new Error(msg);
            }
        } catch (err) {
            toaster.create({ title: "Update Failed", description: err.message, type: "error" });
        }
    };

    const filteredItems = items.filter(item => 
        (item.Name || `${item.FirstName} ${item.LastName}`)?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.LRN?.toString().includes(searchTerm)
    );

    const currentRecords = filteredItems.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
    const totalPages = Math.ceil(filteredItems.length / recordsPerPage);

    return (
        <Flex minH="100vh" bg="#F9FAFB">
            <Box ml="64px" flex="1" p={10} overflow="auto">
                
                {/* Header */}
                <Flex align="center" justify="space-between" mb={8}>
                    <VStack align="flex-start" gap={1}>
                        <Heading size="xl" fontWeight="800" color="gray.800">
                            {showArchive ? "Archive Vault" : "Student Accounts"}
                        </Heading>
                        <Text color="gray.500">Manage student credentials and portal access.</Text>
                    </VStack>

                    <HStack gap={3}>
                        {!showArchive ? (
                            <>
                                <Button variant="outline" onClick={() => setShowArchive(true)} leftIcon={<LuHistory />}>History Archive</Button>
                                <Button colorPalette="purple" disabled={selection.length === 0} onClick={() => setIsArchiveModalOpen(true)}>
                                    Archive Selected ({selection.length})
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button colorPalette="purple" disabled={selection.length === 0} onClick={handleRestore} leftIcon={<LuRefreshCw />}>
                                    Restore Selected ({selection.length})
                                </Button>
                                <Button variant="subtle" bg="purple.600" color="white" onClick={() => setShowArchive(false)}>Return to Active</Button>
                            </>
                        )}
                    </HStack>
                </Flex>

                <Box bg="white" shadow="md" borderRadius="2xl" border="1px solid" borderColor="gray.200" overflow="hidden">
                    <Flex p={5} align="center" borderBottom="1px solid" borderColor="gray.100">
                        <HStack border="1px solid" px={2} borderRadius="md">
                            <LuSearch color="#000000" />
                            <Input placeholder="Search records..." variant="plain" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </HStack>
                        <Spacer />
                        <Text fontSize="xs" color="black.400" fontWeight="bold">TOTAL: {filteredItems.length}</Text>
                    </Flex>

                    <Table.Root size="md" variant="line">
                        <Table.Header bg="gray.50/50">
                            <Table.Row>
                                <Table.ColumnHeader w="50px">
                                    <Checkbox.Root
                                        checked={selection.length > 0 && selection.length === currentRecords.length} 
                                        onCheckedChange={(e) => setSelection(e.checked ? currentRecords.map(i => i.LRN) : [])} colorPalette="purple"
                                    >
                                        <Checkbox.HiddenInput /><Checkbox.Control />
                                    </Checkbox.Root>
                                </Table.ColumnHeader>
                                <Table.ColumnHeader fontWeight="bold">LRN</Table.ColumnHeader>
                                <Table.ColumnHeader fontWeight="bold">{showArchive ? "Days Remaining" : "Password"}</Table.ColumnHeader>
                                <Table.ColumnHeader fontWeight="bold">Full Name</Table.ColumnHeader>
                                <Table.ColumnHeader fontWeight="bold">Status</Table.ColumnHeader>
                                <Table.ColumnHeader fontWeight="bold">Actions</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {loading ? (
                                <Table.Row><Table.Cell colSpan={6} py={10}><Center><Spinner /></Center></Table.Cell></Table.Row>
                            ) : (
                                currentRecords.map((item) => {
                                    const daysLeft = showArchive ? getRemainingDays(item.DateArchived) : null;
                                    return (
                                        <Table.Row key={item.LRN}>
                                            <Table.Cell>
                                                <Checkbox.Root checked={selection.includes(item.LRN)} onCheckedChange={(e) => setSelection(prev => e.checked ? [...prev, item.LRN] : prev.filter(id => id !== item.LRN))} colorPalette="purple">
                                                    <Checkbox.HiddenInput /><Checkbox.Control />
                                                </Checkbox.Root>
                                            </Table.Cell>
                                            <Table.Cell fontWeight="bold" color="purple.700">{item.LRN}</Table.Cell>
                                            <Table.Cell fontFamily="mono">
                                                {showArchive ? (
                                                    <Text fontWeight="bold" color={daysLeft <= 30 ? "red.500" : "gray.600"}>{daysLeft} Days</Text>
                                                ) : (
                                                    <Box cursor="pointer" className="group" position="relative">
                                                        <Text _groupHover={{display: 'none'}} letterSpacing="widest">••••••••</Text>
                                                        <Text _groupHover={{ display: 'block' }} display="none" color="purple.600" fontWeight="bold">
                                                            {item.Password}
                                                        </Text>
                                                    </Box>
                                                )}
                                            </Table.Cell>
                                            <Table.Cell fontWeight="600">{item.Name || `${item.FirstName} ${item.LastName}`}</Table.Cell>
                                            <Table.Cell>
                                                <Badge colorPalette={showArchive ? (daysLeft === 0 ? "red" : "orange") : "green"}>
                                                    {showArchive ? (daysLeft === 0 ? "Purge Ready" : "Archived") : "Enrolled"}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {showArchive && daysLeft === 0 ? (
                                                    <Button size="xs" colorPalette="red" variant="subtle" onClick={() => { setActiveLrn(item.LRN); setActiveName(item.Name || "Student"); setIsDeleteModalOpen(true); }}>
                                                        <LuTrash2 /> Purge
                                                    </Button>
                                                ) : !showArchive && (
                                                    <Button size="xs" variant="subtle" colorPalette="blue" onClick={() => { setActiveLrn(item.LRN); setActiveName(item.Name || "Student"); setIsModalOpen(true); }}>
                                                        <LuKey /> Change PW
                                                    </Button>
                                                )}
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })
                            )}
                        </Table.Body>
                    </Table.Root>

                    <Flex px={8} py={5} align="center" borderTop="1px solid" borderColor="gray.100">
                        <Text fontSize="sm" color="gray.500">Page {currentPage} of {totalPages || 1}</Text>
                        <Spacer />
                        <Group attached variant="outline">
                            <Button size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><LuChevronLeft /> Previous</Button>
                            <Button size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>Next <LuChevronRight /></Button>
                        </Group>
                    </Flex>
                </Box>
            </Box>

            {/* Archive Confirmation Modal */}
            <DialogRoot open={isArchiveModalOpen} onOpenChange={(e) => setIsArchiveModalOpen(e.open)} placement="center">
                <DialogBackdrop />
                <DialogPositioner>
                    <DialogContent maxWidth="400px" borderRadius="xl">
                        <DialogHeader><DialogTitle>Reason for Archiving</DialogTitle></DialogHeader>
                        <DialogBody pb={6}>
                            <VStack align="start" gap={4}>
                                <Text size="sm">Please select a reason for archiving <strong>{selection.length}</strong> record(s):</Text>
                                <SelectRoot collection={reasons} onValueChange={(e) => setArchiveReason(e.value[0])}>
                                    <SelectTrigger><SelectValueText placeholder="Select reason..." /></SelectTrigger>
                                    <SelectContent>
                                        {reasons.items.map((r) => (
                                            <SelectItem item={r} key={r.value}>{r.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </SelectRoot>
                            </VStack>
                        </DialogBody>
                        <DialogFooter borderTop="1px solid" borderColor="gray.100">
                            <Button variant="outline" onClick={() => setIsArchiveModalOpen(false)}>Cancel</Button>
                            <Button colorPalette="purple" disabled={!archiveReason} onClick={handleArchive}>Confirm Archive</Button>
                        </DialogFooter>
                    </DialogContent>
                </DialogPositioner>
            </DialogRoot>

            {/* Permanent Delete Modal */}
            <DialogRoot open={isDeleteModalOpen} onOpenChange={(e) => setIsDeleteModalOpen(e.open)} placement="center">
                <DialogBackdrop />
                <DialogPositioner>
                    <DialogContent maxWidth="400px" borderRadius="xl">
                        <DialogHeader>
                            <HStack color="red.600"><LuCircleAlert /><DialogTitle>Confirm Purge</DialogTitle></HStack>
                        </DialogHeader>
                        <DialogBody pb={6}>
                            <Text>Are you sure you want to permanently delete <strong>{activeName}</strong>? This cannot be undone.</Text>
                        </DialogBody>
                        <DialogFooter borderTop="1px solid" borderColor="gray.100">
                            <DialogActionTrigger asChild><Button variant="outline">Cancel</Button></DialogActionTrigger>
                            <Button colorPalette="red" onClick={handlePermanentDelete}>Delete Permanently</Button>
                        </DialogFooter>
                    </DialogContent>
                </DialogPositioner>
            </DialogRoot>

            {/* Password Modal */}
            <DialogRoot open={isModalOpen} onOpenChange={(e) => setIsModalOpen(e.open)} placement="center">
                <DialogBackdrop />
                <DialogPositioner>
                    <DialogContent maxWidth="400px" borderRadius="xl">
                        <DialogHeader><DialogTitle>Update Password</DialogTitle></DialogHeader>
                        <DialogBody pb={6}>
                            <VStack align="start" gap={4}>
                                <Text size="sm">Enter new password for: <strong>{activeName}</strong></Text>
                                <Input placeholder="Enter new password" value={newPass} onChange={(e) => setNewPass(e.target.value)} autoFocus />
                            </VStack>
                        </DialogBody>
                        <DialogFooter borderTop="1px solid" borderColor="gray.100">
                            <DialogActionTrigger asChild><Button variant="outline">Cancel</Button></DialogActionTrigger>
                            <Button colorPalette="purple" onClick={handleUpdatePassword}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </DialogPositioner>
            </DialogRoot>
        </Flex>
    );
};