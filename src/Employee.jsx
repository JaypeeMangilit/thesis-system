import { Heading, Table, Checkbox, ActionBar,Button, Kbd, Portal, Input, InputGroup, Menu} from "@chakra-ui/react";
import {  Content} from "./styled"; 
import { useState } from "react";
import {FaEye} from "react-icons/fa";
import {BsPencil} from "react-icons/bs";
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { AiOutlinePlus } from 'react-icons/ai';
import { BsArrowDown } from 'react-icons/bs';

export default function Employee () {
    const [selection, setSelection] = useState([]); //Condition

    const [searchTerm, setSearchTerm] = useState(""); //Searching

    const [value, setValue] = useState("asc"); //Filter

    const filteredItems = items.filter((item) => [item.EmployeeId, item.name, item.Role, item.Email, item.PhoneNumber, item.Status]
        .some((field) => String(field).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const hasSelection = selection.length > 0
    const indeterminate = hasSelection && selection.length < items.length

    const rows = filteredItems.map((item) => (
        <Table.Row key={item.name} data-selected={selection.includes(item.name) ? "" : undefined}>
            <Table.Cell>
                <Checkbox.Root
                    size="sm"
                    mt="0.5"
                    aria-label="Select row"
                    checked={selection.includes(item.name)}
                    onCheckedChange={(changes) => {
                    setSelection((prev) =>
                    changes.checked
                    ? [...prev, item.name]
                    : selection.filter((name) => name !== item.name),
                        )
                    }}
                >
                    <Checkbox.HiddenInput/>
                    <Checkbox.Control/>
                </Checkbox.Root>
            </Table.Cell>
            <Table.Cell>{item.EmployeeId}</Table.Cell>
            <Table.Cell>{item.name}</Table.Cell>
            <Table.Cell>{item.Role}</Table.Cell>
            <Table.Cell>{item.Email}</Table.Cell>
            <Table.Cell>{item.PhoneNumber}</Table.Cell>
            <Table.Cell>{item.Status}</Table.Cell>
        </Table.Row>
    ))

    return (
        <>
            <Heading fontSize="30px" mb={6} fontWeight="bold">
                Employee Management
            </Heading>
            <Button p={2} left={860} colorPalette="#ae00ffffs" variant="outline">
                <AiOutlinePlus/> Add Employee
            </Button>
            <Content>
                <InputGroup padding={2} maxW="350px" startElement={<FaMagnifyingGlass/>}>
                    <Input placeholder="Search for Teachers"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
               <Menu.Root>
                    <Menu.Trigger asChild left={450}>
                        <Button variant="outline" size="sm" colorPalette="blue">
                            <BsArrowDown/> Filter by Status
                        </Button>
                    </Menu.Trigger>
                    <Portal>
                        <Menu.Positioner>
                            <Menu.Content minW="10rem">
                                <Menu.RadioItemGroup value={value} onValueChange={(e) => setValue(e.value)}>
                                    {item.map((item) => (
                                        <Menu.RadioItem key={item.value} value={item.value}>{item.label}
                                            <Menu.ItemIndicator/>
                                        </Menu.RadioItem>
                                    ))}
                                </Menu.RadioItemGroup>
                            </Menu.Content>
                        </Menu.Positioner>
                    </Portal>
                </Menu.Root>
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader w="6">
                                <Checkbox.Root
                                    size="sm"
                                    mt="0.5"
                                    aria-label="Select all rows"
                                    checked={indeterminate ? "indeterminate" : selection.length > 0}
                                    onCheckedChange={(changes) => {
                                    setSelection(
                                    changes.checked ? items.map((item) => item.name) : [],
                                        )
                                    }}
                                >
                                    <Checkbox.HiddenInput/>
                                    <Checkbox.Control/>
                                </Checkbox.Root>
                            </Table.ColumnHeader>
                            <Table.ColumnHeader>Employee_ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Name</Table.ColumnHeader>
                            <Table.ColumnHeader>Role</Table.ColumnHeader>
                            <Table.ColumnHeader>Email</Table.ColumnHeader>
                            <Table.ColumnHeader>Phone Number</Table.ColumnHeader>
                            <Table.ColumnHeader>Status</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>{rows}</Table.Body>
                </Table.Root>

                <ActionBar.Root open={hasSelection}>
                    <Portal>
                        <ActionBar.Positioner>
                            <ActionBar.Content>
                                <ActionBar.SelectionTrigger>
                                    {selection.length} selected
                                </ActionBar.SelectionTrigger>
                                <ActionBar.Separator/>
                                <Button variant="outline" size="sm">
                                    View <FaEye/>
                                </Button>
                                <Button variant="outline" size="sm">
                                    Edit <BsPencil/>
                                </Button>
                                <Button variant="outline" size="sm">
                                    Delete <Kbd>⌫</Kbd>
                                </Button>
                            </ActionBar.Content>
                        </ActionBar.Positioner>
                    </Portal>
                </ActionBar.Root>
            </Content>
        </>
    );
};

const items =[
    {id: 1, EmployeeId: "MTCNOV-1201-4550", name: "Bornik D Magiba", Role: "Teacher", Email: "lbudonia2013@mtcgs.edu.ph", PhoneNumber: "09072992174", Status: "Active"},
    {id: 2, EmployeeId: "MTCNOV-1345-0254", name: "Romeo A Delta", Role: "Teacher", Email: "mangilit2014@mtcgs.edu.ph", PhoneNumber: "09456775471", Status: "Active"},
    {id: 3, EmployeeId: "MTCNOV-5644-0014", name: "Luisa P Pustigo", Role: "Registar", Email: "luisa2001@mtcgs.edu.ph", PhoneNumber: "09997884101", Status: "Active"},
    {id: 4, EmployeeId: "MTCNOV-0070-0587", name: "Rhea M Hernandez", Role: "Teacher In Charge", Email: "lance2002@mtcgs.edu.ph", PhoneNumber: "09997845111", Status: "Active"},
    {id: 5, EmployeeId: "MTCNOV-5404-4577", name: "Jane Panganiban", Role: "Teacher", Email: "Carljoseph2012@mtcgs.edu.ph", PhoneNumber: "09084654112", Status: "Active"},
    {id: 6, EmployeeId: "MTCNOV-4657-0145", name: "Adrian Magiba", Role: "Teacher", Email: "lbudonia2013@mtcgs.edu.ph", PhoneNumber: "09774655132", Status: "Active"},
    {id: 7, EmployeeId: "MTCNOV-4697-0145", name: "Lance De Guzman", Role: "Registar", Email: "lbudonia2013@mtcgs.edu.ph", PhoneNumber: "09799801102", Status: "Active"},
    {id: 8, EmployeeId: "MTCNOV-0457-0354", name: "Marcelito Guzman", Role: "Teacher", Email: "lbudonia2013@mtcgs.edu.ph", PhoneNumber: "09780112014", Status: "InActive"},
    {id: 9, EmployeeId: "MTCNOV-1245-6478", name: "Anghel Malimban", Role: "Teacher", Email: "lbudonia2013@mtcgs.edu.ph", PhoneNumber: "09082773175", Status: "Active"},
    {id: 10, EmployeeId: "MTCNOV-4554-0677", name: "John Bayani", Role: "Teacher", Email: "lbudonia2013@mtcgs.edu.ph", PhoneNumber: "09099881247", Status: "Active"},
    {id: 11, EmployeeId: "MTCNOV-1447-0030", name: "Russel Del Rosario", Role: "Teacher", Email: "lbudonia2013@mtcgs.edu.ph", PhoneNumber: "09784654451", Status: "InActive"},
    {id: 12, EmployeeId: "MTCNOV-0457-1245", name: "Joana Magimban", Role: "Registar", Email: "lbudonia2013@mtcgs.edu.ph", PhoneNumber: "09879975141", Status: "Active"},
    {id: 13, EmployeeId: "MTCNOV-1325-4454", name: "Jhoan Mijares", Role: "Teacher", Email: "lbudonia2013@mtcgs.edu.ph", PhoneNumber: "09579801324", Status: "Active"},
    {id: 14, EmployeeId: "MTCNOV-4567-2015", name: "Rhenalyn Guzman", Role: "Teacher", Email: "lbudonia2013@mtcgs.edu.ph", PhoneNumber: "09095122101", Status: "InActive"},
    {id: 15, EmployeeId: "MTCNOV-4474-7987", name: "Kerby De Aquino", Role: "Registar", Email: "lbudonia2013@mtcgs.edu.ph", PhoneNumber: "09082553147", Status: "Active"},
    {id: 16, EmployeeId: "MTCNOV-6547-7998", name: "Johannah Avancenia", Role: "Teacher", Email: "lbudonia2013@mtcgs.edu.ph", PhoneNumber: "09314655798", Status: "Active"},
    {id: 17, EmployeeId: "MTCNOV-0878-0234", name: "Nenet Tolentino", Role: "Teacher", Email: "lbudonia2013@mtcgs.edu.ph", PhoneNumber: "09798551012", Status: "InActive"},
    {id: 18, EmployeeId: "MTCNOV-0354-0457", name: "Trinie Nazareno", Role: "Registar", Email: "Nazareno2030@mtcgs.edu.ph", PhoneNumber: "09092663454", Status: "Active"},
    {id: 19, EmployeeId: "MTCNOV-0798-0450", name: "Nathalie Purihin", Role: "Teacher", Email: "Purihin2020@mtcgs.edu.ph", PhoneNumber: "09016559748", Status: "Active"},
    {id: 20, EmployeeId: "MTCNOV-0658-0012", name: "Giron Gumamela", Role: "Teacher", Email: "Giron2015@mtcgs.edu.ph", PhoneNumber: "09084665790", Status: "InActive"},
]

const item = [
    {label: "Active", value: "active"},
    {label: "InActive", value: "inactive"},
    {label: "Retired", value: "retired"},
]