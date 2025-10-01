import { Heading, Table, Checkbox, ActionBar,Button, Kbd, Portal, Input, InputGroup, Menu} from "@chakra-ui/react";
import {  Content} from "./styled"; 
import { useState } from "react";
import {FaEye} from "react-icons/fa";
import {BsPencil} from "react-icons/bs";
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { AiOutlinePlus } from 'react-icons/ai';
import { BsArrowDown } from 'react-icons/bs';

export default function Students () {
    const [selection, setSelection] = useState([]); //condition

    const [value, setValue] = useState("asc"); //Filter
    const [searchTerm, setSearchTerm] = useState(""); //Seacrhing

    const filteredItems = items.filter((item) => [item.id, item.LRN, item.name, item.Grade, item.Section, item.Status]
        .some((field) => String(field).toLowerCase().includes(searchTerm.toLowerCase())) //Search Condition
    );

    const hasSelection = selection.length > 0
    const indeterminate = hasSelection && selection.length < items.length //Check Selection

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
            <Table.Cell>{item.LRN}</Table.Cell>
            <Table.Cell>{item.name}</Table.Cell>
            <Table.Cell>{item.Grade}</Table.Cell>
            <Table.Cell>{item.Section}</Table.Cell>
            <Table.Cell>{item.Status}</Table.Cell>
        </Table.Row>
    ))

    return (
        <>
            <Heading fontSize="30px" mb={6} fontWeight="bold">
                Student Management
            </Heading>
            <Button p={2} left={860} colorPalette="blue">
                <AiOutlinePlus/> Add Student
            </Button>
            <Content>
                <InputGroup padding={2} maxW="350px" startElement={<FaMagnifyingGlass/>}>
                    <Input placeholder="Search for Students"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
                <Menu.Root>
                    <Menu.Trigger asChild left={300}>
                        <Button variant="outline" size="sm" colorPalette="blue">
                            <BsArrowDown/> Filter of Graders
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
                <Menu.Root>
                    <Menu.Trigger asChild left={310}>
                        <Button variant="outline" size="sm" colorPalette="blue">
                            <BsArrowDown/> Filter of Status
                        </Button>
                    </Menu.Trigger>
                    <Portal>
                        <Menu.Positioner>
                            <Menu.Content minW="10rem">
                                <Menu.RadioItemGroup value={value} onValueChange={(e) => setValue(e.value)}>
                                    {itemed.map((item) => (
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
                            <Table.ColumnHeader>LRN</Table.ColumnHeader>
                            <Table.ColumnHeader>Name</Table.ColumnHeader>
                            <Table.ColumnHeader>Grade</Table.ColumnHeader>
                            <Table.ColumnHeader>Section</Table.ColumnHeader>
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
    {id: 1, LRN: "103345782014", name: "Bornik D Magiba", Grade: "6", Section: "Aguinaldo", Status: "Enrolled"},
    {id: 2, LRN: "123768497251", name: "Lance  B Bakla", Grade: "5", Section: "Tanzania", Status: "Dropped"},
    {id: 3, LRN: "134268700145", name: "Luisa  P Pustigo", Grade: "4", Section: "Rosarian", Status: "Graduate"},
    {id: 4, LRN: "179800145788", name: "Jaypee G Mangilit", Grade: "6", Section: "Rose", Status: "Transferred"},
    {id: 5, LRN: "103345798503", name: "Adrian A Avacenia", Grade: "9", Section: "Rizal", Status: "Enrolled"},
    {id: 6, LRN: "179855874164", name: "Ganda D Rosario", Grade: "10", Section: "Tunnel", Status: "Dropped"},
]

const item =[
    {label: "All", value: "all"},
    {label: "Kinder", value: "kinder"},
    {label: "Grade 1", value: "grade1"},
    {label: "Grade 2", value: "grade2"},
    {label: "Grade 3", value: "grade3"},
    {label: "Grade 4", value: "grade4"},
    {label: "Grade 5", value: "grade5"},
    {label: "Grade 6", value: "grade6"},
    {label: "Grade 7", value: "grade7"},
    {label: "Grade 8", value: "grade8"},
    {label: "Grade 9", value: "grade9"},
    {label: "Grade 10", value: "grade10"},
]

const itemed = [
    {label: "Enrolled", value: "enrolled"},
    {label: "Transffered", value: "transffered"},
    {label: "Dropped", value: "dropped"},
    {label: "Graduated", value: "graduated"},
]