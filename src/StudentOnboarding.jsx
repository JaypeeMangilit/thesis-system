import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    Box, Flex, VStack, Input, Text, Button, Heading, 
    Spinner, SimpleGrid, Center, Stack, Field
} from "@chakra-ui/react";
import { pathfinderFetch } from './api'; 
import { toaster, Toaster } from "./components/ui/toaster";

export default function StudentOnboarding() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [studentName, setStudentName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Location Data State
    const [provinces, setProvinces] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    // Custom Input Toggle State
    const [showOtherCitizenship, setShowOtherCitizenship] = useState(false);
    const [showOtherReligion, setShowOtherReligion] = useState(false);

    const [passwords, setPasswords] = useState({ new: "", confirm: "" });
    const [personalInfo, setPersonalInfo] = useState({
        houseNo: "", barangay: "", municipality: "", province: "",
        gender: "", age: "", dob: "", citizenship: "", religion: "",
        guardianname: "", occupation: "", guardiancontactnum: ""
    });

    const selectStyle = { 
        width: '100%', 
        height: '40px', 
        padding: '0 10px', 
        borderRadius: '6px', 
        border: '1px solid #E2E8F0', 
        background: 'white' 
    };

    // Initial Data Fetch
    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await pathfinderFetch(`/api/registration/validate-token/${token}`);
                const data = await response.json();
                if (response.ok) {
                    setStudentName(data.student.FirstName);
                } else {
                    setError(data.error || "Invalid or expired link.");
                }
            } catch (err) {
                setError("Connection to server failed.");
            } finally {
                setLoading(false);
            }
        };

        const fetchProvinces = async () => {
            try {
                const res = await fetch("https://psgc.gitlab.io/api/provinces/");
                const data = await res.json();
                setProvinces(data.sort((a, b) => a.name.localeCompare(b.name)));
            } catch (err) {
                console.error("Failed to fetch provinces");
            }
        };

        validateToken();
        fetchProvinces();
    }, [token]);

    // Handle Province Selection
    const handleProvinceChange = async (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const provinceCode = selectedOption.getAttribute("data-code");
        const provinceName = e.target.value;

        setPersonalInfo({ ...personalInfo, province: provinceName, municipality: "", barangay: "" });
        setMunicipalities([]);
        setBarangays([]);

        if (provinceCode) {
            const res = await fetch(`https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`);
            const data = await res.json();
            setMunicipalities(data.sort((a, b) => a.name.localeCompare(b.name)));
        }
    };

    // Handle Municipality Selection
    const handleMunicipalityChange = async (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const muniCode = selectedOption.getAttribute("data-code");
        const muniName = e.target.value;

        setPersonalInfo({ ...personalInfo, municipality: muniName, barangay: "" });
        setBarangays([]);

        if (muniCode) {
            const res = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${muniCode}/barangays/`);
            const data = await res.json();
            setBarangays(data.sort((a, b) => a.name.localeCompare(b.name)));
        }
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return "";
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) { age--; }
        return age;
    };

    const handleDateChange = (e) => {
        const birthDate = e.target.value;
        const predictedAge = calculateAge(birthDate);
        setPersonalInfo({ ...personalInfo, dob: birthDate, age: predictedAge.toString() });
    };

    const handleUpdatePassword = async () => {
        if (passwords.new.length < 8) {
            toaster.create({ title: "Weak Password", description: "At least 8 characters.", type: "error" });
            return;
        }
        if (passwords.new !== passwords.confirm) {
            toaster.create({ title: "Mismatch", description: "Passwords do not match.", type: "error" });
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await pathfinderFetch("/api/registration/update-password", {
                method: "POST",
                body: JSON.stringify({ token, password: passwords.new })
            });
            if (res.ok) setStep(2);
        } catch (err) {
            toaster.create({ title: "Error", description: "Failed to update password.", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinalizeOnboarding = async () => {
        const emptyFields = Object.keys(personalInfo).filter(key => !personalInfo[key]);
        if (emptyFields.length > 0) {
            toaster.create({ title: "Missing Info", description: "Please complete the form.", type: "error" });
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await pathfinderFetch("/api/registration/finalize-onboarding", {
                method: "POST",
                body: JSON.stringify({ token, personalInfo }),
            });
            if (response.ok) {
                toaster.create({ title: "Success!", type: "success" });
                setTimeout(() => navigate("/student-login"), 2000);
            }
        } catch (err) {
            toaster.create({ title: "Update failed", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <Center h="100vh"><Spinner color="purple.500" size="xl" /></Center>;

    return (
        <Flex minH="100vh" bg="gray.50" justify="center" align="center" p={6}>
            <Toaster />
            <Box w="full" maxW="650px" bg="white" p={10} borderRadius="20px" shadow="2xl" borderTop="8px solid #6B46C1">
                {step === 1 ? (
                    <VStack gap={6} align="stretch">
                        <Heading size="md" color="purple.700">Account Activation</Heading>
                        <Text>Welcome, <b>{studentName}</b>! Set your portal password.</Text>
                        <Stack gap={4}>
                            <Field.Root required>
                                <Field.Label>New Password</Field.Label>
                                <Input type="password" onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
                            </Field.Root>
                            <Field.Root required>
                                <Field.Label>Confirm Password</Field.Label>
                                <Input type="password" onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
                            </Field.Root>
                        </Stack>
                        <Button bg="#6B46C1" color="white" onClick={handleUpdatePassword} loading={isSubmitting}>Continue</Button>
                    </VStack>
                ) : (
                    <VStack gap={6} align="stretch">
                        <Heading size="md" color="purple.700">Student Profile Information</Heading>
                        <SimpleGrid columns={2} gap={4}>
                            <Field.Root required><Input placeholder="House No. / Street" onChange={(e) => setPersonalInfo({...personalInfo, houseNo: e.target.value})} /></Field.Root>
                            
                            <Field.Root required>
                                <select style={selectStyle} value={personalInfo.province} onChange={handleProvinceChange}>
                                    <option value="">Select Province</option>
                                    {provinces.map(p => <option key={p.code} value={p.name} data-code={p.code}>{p.name}</option>)}
                                </select>
                            </Field.Root>

                            <Field.Root required>
                                <select style={selectStyle} value={personalInfo.municipality} onChange={handleMunicipalityChange} disabled={!personalInfo.province}>
                                    <option value="">Select Municipality</option>
                                    {municipalities.map(m => <option key={m.code} value={m.name} data-code={m.code}>{m.name}</option>)}
                                </select>
                            </Field.Root>

                            <Field.Root required>
                                <select style={selectStyle} value={personalInfo.barangay} onChange={(e) => setPersonalInfo({...personalInfo, barangay: e.target.value})} disabled={!personalInfo.municipality}>
                                    <option value="">Select Barangay</option>
                                    {barangays.map(b => <option key={b.code} value={b.name}>{b.name}</option>)}
                                </select>
                            </Field.Root>

                            <Field.Root required>
                                <select style={selectStyle} onChange={(e) => setPersonalInfo({...personalInfo, gender: e.target.value})}>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </Field.Root>

                            <Field.Root required><Input type="date" value={personalInfo.dob} onChange={handleDateChange} /></Field.Root>
                            <Field.Root><Input placeholder="Age" value={personalInfo.age} readOnly bg="gray.100" /></Field.Root>

                            <Field.Root required>
                                {!showOtherCitizenship ? (
                                    <select style={selectStyle} onChange={(e) => e.target.value === "Others" ? setShowOtherCitizenship(true) : setPersonalInfo({...personalInfo, citizenship: e.target.value})}>
                                        <option value="">Citizenship</option>
                                        <option value="Filipino">Filipino</option>
                                        <option value="Others">Others</option>
                                    </select>
                                ) : (
                                    <Input placeholder="Specify Citizenship" autoFocus onChange={(e) => setPersonalInfo({...personalInfo, citizenship: e.target.value})} />
                                )}
                            </Field.Root>

                            <Field.Root required>
                                {!showOtherReligion ? (
                                    <select style={selectStyle} onChange={(e) => e.target.value === "Others" ? setShowOtherReligion(true) : setPersonalInfo({...personalInfo, religion: e.target.value})}>
                                        <option value="">Religion</option>
                                        <option value="Catholic">Catholic</option>
                                        <option value="INC">INC</option>
                                        <option value="Muslim">Muslim</option>
                                        <option value="Others">Others</option>
                                    </select>
                                ) : (
                                    <Input placeholder="Specify Religion" autoFocus onChange={(e) => setPersonalInfo({...personalInfo, religion: e.target.value})} />
                                )}
                            </Field.Root>

                            <Field.Root required><Input placeholder="Guardian Full Name" onChange={(e) => setPersonalInfo({...personalInfo, guardianname: e.target.value})} /></Field.Root>
                            <Field.Root required><Input placeholder="Guardian Occupation" onChange={(e) => setPersonalInfo({...personalInfo, occupation: e.target.value})} /></Field.Root>
                            <Field.Root required><Input maxLength={11} placeholder="Guardian Contact #" onChange={(e) => setPersonalInfo({...personalInfo, guardiancontactnum: e.target.value})} /></Field.Root>
                        </SimpleGrid>
                        <Button bg="#6B46C1" color="white" size="lg" onClick={handleFinalizeOnboarding} loading={isSubmitting}>Finish & Go to Login</Button>
                    </VStack>
                )}
            </Box>
        </Flex>
    );
};