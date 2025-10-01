import { Heading, Table, Checkbox, ActionBar,Button, Kbd, Portal, Input, InputGroup, Menu} from "@chakra-ui/react";
import {  Content} from "./styled"; 
import { useState } from "react";
import {FaEye} from "react-icons/fa";
import {BsPencil} from "react-icons/bs";
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { AiOutlinePlus } from 'react-icons/ai';
import { BsArrowDown } from 'react-icons/bs';

export default function Teachers () {
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
                Teachers Management
            </Heading>
            <Button p={2} left={860} colorPalette="blue">
                <AiOutlinePlus/> Add Teacher
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
    {id: 1, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 2, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 3, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 4, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 5, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 6, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 7, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 8, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 9, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 10, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 11, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 12, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 13, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 14, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 15, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 16, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 17, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 18, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 19, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
    {id: 20, EmployeeId: "103345782014", name: "Bornik D Magiba", Role: "6", Email: "Aguinaldo", PhoneNumber: "09072992174", Status: "Active"},
]

const item = [
    {label: "Active", value: "active"},
    {label: "InActive", value: "inactive"},
    {label: "Retired", value: "retired"},
]