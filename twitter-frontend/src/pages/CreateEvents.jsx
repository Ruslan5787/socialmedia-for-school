import {
    Box,
    Button,
    CloseButton,
    createListCollection,
    Dialog,
    HStack,
    Input,
    Portal,
    Select,
    Stack,
    useDialog
} from "@chakra-ui/react";
import {IoMdAddCircleOutline} from "react-icons/io";
import {FormControl, FormLabel} from "@chakra-ui/form-control";
import React, {useState} from "react";
import useShowToast from "../hooks/useShowToast.js";
import {useColorMode} from "../components/ui/color-mode.jsx";

export const CreateEvents = ({groupEvents, setGroupEvents, activeTab, isDisabled}) => {
    const showToast = useShowToast();
    const [isOpen, setIsOpen] = useState(false);
    const dialog = useDialog({open: isOpen, setOpenChange: setIsOpen});

    const [inputs, setInputs] = useState({
        name: "", description: "", date: "", time: "", status: "", price: 0, address: "", img: "",
    });

    const frameworks = createListCollection({
        items: [
            {label: "обязательное", value: "mandatory"},
            {label: "необязательное", value: "optional"},
        ],
    })

    const handleCreate = async () => {
        try {
            if (!activeTab) {
                showToast("Ошибка", "Выберите группу для мероприятия", "error");
                return;
            }

            if (!inputs.status) {
                showToast("Ошибка", "Выберите статус мероприятия", "error");
                return;
            }

            const res = await fetch("/api/events/create", {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify({...inputs, groupId: activeTab}),
            });

            const data = await res.json();

            if (data.error) {
                showToast("Ошибка", data.error, "error");
                return;
            }

            setGroupEvents((prev) => [...prev, data]);
            setIsOpen(false);
            showToast("Успех", "Мероприятие создано", "success");
        } catch (error) {
            showToast("Ошибка", error.message, "error");
        }
    };

    return (<Dialog.RootProvider size="sm" placement="center" motionPreset="slide-in-bottom" value={dialog}>
            <Dialog.Trigger asChild>
                <Button
                    onClick={() => setIsOpen(true)}
                    variant="outline"
                    size="xl"
                    bg={useColorMode("gray.300", "gray.dark")}
                    isDisabled={isDisabled}
                >
                    <IoMdAddCircleOutline/> Создать мероприятие
                </Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop/>
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Создание мероприятия</Dialog.Title>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton onClick={() => setIsOpen(false)} size="xl"/>
                            </Dialog.CloseTrigger>
                        </Dialog.Header>
                        <Dialog.Body>
                            <HStack>
                                <Box>
                                    <FormControl isRequired>
                                        <FormLabel>Название</FormLabel>
                                        <Input
                                            value={inputs.name}
                                            onChange={(e) => setInputs({...inputs, name: e.target.value})}
                                            
                                            type="text"
                                        />
                                    </FormControl>
                                </Box>
                                <Box>
                                    <FormControl isRequired>
                                        <FormLabel>Описание</FormLabel>
                                        <Input
                                            value={inputs.description}
                                            onChange={(e) => setInputs({...inputs, description: e.target.value})}
                                            
                                            type="text"
                                        />
                                    </FormControl>
                                </Box>
                            </HStack>
                            <FormControl isRequired>
                                <FormLabel>Дата</FormLabel>
                                <Input
                                    value={inputs.date}
                                    onChange={(e) => setInputs({...inputs, date: e.target.value})}
                                    
                                    type="date"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Время</FormLabel>
                                <Input
                                    value={inputs.time}
                                    onChange={(e) => setInputs({...inputs, time: e.target.value})}
                                    
                                    type="time"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Статус</FormLabel>
                                <Select.Root collection={frameworks} size="sm" width="320px"
                                             value={inputs.status}
                                             onValueChange={(e) => {
                                                 // console.log(inputs, e.value[0])
                                                 setInputs({...inputs, status: e.value})
                                             }}>
                                    <Select.HiddenSelect/>
                                    <Select.Label>Выберите статус</Select.Label>
                                    <Select.Control>
                                        <Select.Trigger>
                                            <Select.ValueText placeholder="Select framework"/>
                                        </Select.Trigger>
                                        <Select.IndicatorGroup>
                                            <Select.Indicator/>
                                        </Select.IndicatorGroup>
                                    </Select.Control>
                                    <Select.Positioner>
                                        <Select.Content>
                                            {frameworks.items.map((framework) => (
                                                <Select.Item item={framework} key={framework.value}>
                                                    {framework.label}
                                                    <Select.ItemIndicator/>
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Select.Root>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Цена</FormLabel>
                                <Input
                                    value={inputs.price}
                                    onChange={(e) => setInputs({...inputs, price: Number(e.target.value)})}
                                    
                                    type="number"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Адрес</FormLabel>
                                <Input
                                    value={inputs.address}
                                    onChange={(e) => setInputs({...inputs, address: e.target.value})}
                                    
                                    type="text"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Изображение (URL)</FormLabel>
                                <Input
                                    value={inputs.img}
                                    onChange={(e) => setInputs({...inputs, img: e.target.value})}
                                    
                                    type="text"
                                />
                            </FormControl>
                            <Stack spacing={10} pt={2}>
                                <Button
                                    onClick={handleCreate}
                                    size="lg"
                                    bg="blue.400"
                                    color="white"
                                    _hover={{bg: "blue.500"}}
                                >
                                    Создать
                                </Button>
                            </Stack>
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.RootProvider>
    );
};