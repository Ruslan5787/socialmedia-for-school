import {
    Button,
    CloseButton,
    createListCollection,
    Dialog,
    Input,
    List,
    Portal,
    Stack,
    useDialog,
} from "@chakra-ui/react";
import {IoMdAddCircleOutline} from "react-icons/io";
import {FormControl, FormErrorMessage, FormLabel} from "@chakra-ui/form-control";
import React, {useState} from "react";
import useShowToast from "../hooks/useShowToast.js";
import {Toaster} from "../components/ui/toaster.jsx";
import {useColorMode} from "../components/ui/color-mode.jsx";

export const CreateEvents = ({groupEvents, setGroupEvents, activeTab, isDisabled}) => {
    const {colorMode} = useColorMode();
    const showToast = useShowToast();
    const [isOpen, setIsOpen] = useState(false);
    const dialog = useDialog({open: isOpen, setOpenChange: setIsOpen});
    const [inputs, setInputs] = useState({
        name: "", description: "", date: "", time: "", status: "", // Статус как строка
        price: 0, address: "", img: "",
    });
    const [errors, setErrors] = useState({
        name: "", description: "", date: "", time: "", status: "", price: "", address: "", img: "",
    });
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    const frameworks = createListCollection({
        items: [{label: "обязательное", value: "mandatory"}, {label: "необязательное", value: "optional"},],
    });

    // Получить минимальную дату (сегодня)
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    // Получить минимальное время для сегодняшней даты
    const getMinTime = () => {
        const now = new Date();
        return inputs.date === getMinDate() ? `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}` : "00:00";
    };

    // Валидация полей
    const validateInputs = (name, value) => {
        switch (name) {
            case "name":
                if (!value.trim()) return "Название не может быть пустым";
                if (value.length < 3) return "Название должно содержать минимум 3 символа";
                if (value.length > 50) return "Название не может превышать 50 символов";
                return "";
            case "description":
                if (!value.trim()) return "Описание не может быть пустым";
                if (value.length < 5) return "Описание должно содержать минимум 5 символов";
                return "";
            case "date":
                if (!value) return "Дата обязательна";
                if (new Date(value) <= new Date(getMinDate())) return "Дата должна быть в будущем";
                return "";
            case "time":
                if (!value) return "Время обязательно";
                if (inputs.date === getMinDate()) {
                    const selectedTime = new Date(`${inputs.date}T${value}`);
                    const now = new Date();
                    if (selectedTime <= now) return "Время должно быть в будущем для сегодняшней даты";
                }
                return "";
            case "status":
                if (!value) return "Статус обязателен";
                return "";
            case "address":
                if (value && value.length < 5) return "Адрес должен содержать минимум 5 символов";
                return "";
            default:
                return "";
        }
    };

    // Проверка конфликта времени
    const hasTimeConflict = () => {
        return groupEvents.some((event) => event.date === inputs.date && event.time === inputs.time);
    };

    // Получение предложений адресов
    const fetchAddressSuggestions = async (query) => {
        if (!query || query.length < 3) {
            setAddressSuggestions([]);
            return;
        }

        setIsLoadingSuggestions(true);
        try {
            const response = await fetch(`https://geocode-maps.yandex.ru/1.x/?format=json&geocode=${encodeURIComponent(`Екатеринбург, ${query}`)}&apikey=3250a4d0-877c-45ba-8aba-45b1f9d82852`);
            const data = await response.json();
            const suggestions = data.response.GeoObjectCollection.featureMember.map((item) => item.GeoObject.metaDataProperty.GeocoderMetaData.text);
            setAddressSuggestions(suggestions);
        } catch (error) {
            console.error("Ошибка при получении предложений адреса:", error);
            setAddressSuggestions([]);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    // Обработка ввода адреса
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setInputs({...inputs, [name]: value});
        setErrors({...errors, [name]: validateInputs(name, value)});

        if (name === "address") {
            fetchAddressSuggestions(value);
        }
    };

    // Выбор адреса из предложений
    const handleSuggestionClick = (suggestion) => {
        setInputs({...inputs, address: suggestion});
        setErrors({...errors, address: validateInputs("address", suggestion)});
        setAddressSuggestions([]);
    };

    // Обработка изменения статуса
    const handleStatusChange = (value) => {
        setInputs((prev) => ({...prev, status: value}));
        setErrors((prev) => ({...prev, status: validateInputs("status", value)}));
    };

    const handleCreate = async () => {
        const newErrors = {
            name: validateInputs("name", inputs.name),
            description: validateInputs("description", inputs.description),
            date: validateInputs("date", inputs.date),
            time: validateInputs("time", inputs.time),
            status: validateInputs("status", inputs.status),
            address: validateInputs("address", inputs.address),
        };
        setErrors(newErrors);

        if (Object.values(newErrors).some((error) => error)) {
            showToast("Ошибка", "Пожалуйста, исправьте ошибки в форме", "error");
            return;
        }

        if (!activeTab) {
            showToast("Ошибка", "Выберите группу для мероприятия", "error");
            return;
        }

        if (hasTimeConflict()) {
            showToast("Ошибка", "На это время уже запланировано мероприятие", "error");
            return;
        }

        try {
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
            setInputs({
                name: "", description: "", date: "", time: "", status: "", price: 0, address: "", img: "",
            });
            setErrors({
                name: "", description: "", date: "", time: "", status: "", price: "", address: "", img: "",
            });
            setAddressSuggestions([]);
        } catch (error) {
            showToast("Ошибка", error.message, "error");
        }
    };

    return (<Dialog.RootProvider
        size="sm"
        placement="center"
        motionPreset="slide-in-bottom"
        value={dialog}
    >
        <Toaster/>
        <Dialog.Trigger asChild>
            <Button
                onClick={() => setIsOpen(true)}
                variant="outline"
                size="xl"
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
                            <CloseButton
                                onClick={() => {
                                    setIsOpen(false);
                                    setInputs({
                                        name: "",
                                        description: "",
                                        date: "",
                                        time: "",
                                        status: "",
                                        price: 0,
                                        address: "",
                                        img: "",
                                    });
                                }}
                                size="xl"
                            />
                        </Dialog.CloseTrigger>
                    </Dialog.Header>
                    <Dialog.Body>
                        <FormControl isRequired isInvalid={!!errors.name}>
                            <FormLabel>Название</FormLabel>
                            <Input
                                name="name"
                                value={inputs.name}
                                onChange={handleInputChange}
                                type="text"
                            />
                            {errors.name && <FormErrorMessage color={"red"}>{errors.name}</FormErrorMessage>}
                        </FormControl>
                        <FormControl isRequired isInvalid={!!errors.description}>
                            <FormLabel>Описание</FormLabel>
                            <Input
                                name="description"
                                value={inputs.description}
                                onChange={handleInputChange}
                                type="text"
                            />
                            {errors.description &&
                                <FormErrorMessage color={"red"}>{errors.description}</FormErrorMessage>}
                        </FormControl>
                        <FormControl isRequired isInvalid={!!errors.date}>
                            <FormLabel>Дата</FormLabel>
                            <Input
                                name="date"
                                value={inputs.date}
                                onChange={handleInputChange}
                                type="date"
                                min={getMinDate()}
                            />
                            {errors.date && <FormErrorMessage color={"red"}>{errors.date}</FormErrorMessage>}
                        </FormControl>
                        <FormControl isRequired isInvalid={!!errors.time}>
                            <FormLabel>Время</FormLabel>
                            <Input
                                name="time"
                                value={inputs.time}
                                onChange={handleInputChange}
                                type="time"
                                min={getMinTime()}
                            />
                            {errors.time && <FormErrorMessage color={"red"}>{errors.time}</FormErrorMessage>}
                        </FormControl>
                        <FormControl isRequired isInvalid={!!errors.status}>
                            <FormLabel>Статус*</FormLabel>
                            <select
                                value={inputs.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                style={{height: "40px", borderRadius: "4px", padding: "8px"}}
                            >
                                <option value="" disabled>
                                    Выберите статус...
                                </option>
                                <option value="mandatory">обязательное</option>
                                <option value="optional">необязательное</option>
                            </select>
                            {errors.status && <FormErrorMessage color={"red"}>{errors.status}</FormErrorMessage>}
                        </FormControl>
                        <FormControl isInvalid={!!errors.address}>
                            <FormLabel>Адрес*</FormLabel>
                            <Input
                                name="address"
                                value={inputs.address}
                                onChange={handleInputChange}
                                type="text"
                            />
                            {errors.address && <FormErrorMessage color={"red"}>{errors.address}</FormErrorMessage>}
                            {addressSuggestions.length > 0 && (<List.Root
                                position="absolute"
                                background={colorMode === "light" ? "white" : "gray.800"}
                                mt={2}
                                border="1px solid"
                                zIndex="docked"
                                borderColor="gray.200"
                                borderRadius="md"
                                maxH="150px"
                                overflowY="auto"
                                left="10px"
                                w="430px"
                            >
                                {addressSuggestions.map((suggestion, index) => (<List.Item
                                    borderBottom={addressSuggestions.length === index + 1 ? "none" : "1px solid"}
                                    key={index}
                                    px={3}
                                    py={2}
                                    cursor="pointer"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    _hover={{bg: "gray.100"}}
                                >
                                    {suggestion}
                                </List.Item>))}
                            </List.Root>)}
                        </FormControl>
                        <FormControl isInvalid={!!errors.img}>
                            <FormLabel>Изображение (URL)</FormLabel>
                            <Input
                                name="img"
                                value={inputs.img}
                                onChange={handleInputChange}
                                type="text"
                            />
                            {errors.img && <FormErrorMessage color={"red"}>{errors.img}</FormErrorMessage>}
                        </FormControl>
                        <Stack spacing={10} pt={2}>
                            <Button
                                onClick={handleCreate}
                                size="lg"
                                bg="blue.400"
                                color="white"
                                _hover={{bg: "blue.500"}}
                                isDisabled={Object.values(errors).some((error) => error) || !inputs.name || !inputs.description || !inputs.date || !inputs.time || !inputs.status}
                            >
                                Создать
                            </Button>
                        </Stack>
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Portal>
    </Dialog.RootProvider>);
};