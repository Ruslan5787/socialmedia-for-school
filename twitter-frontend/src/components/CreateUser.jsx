import {FormControl, FormErrorMessage, FormLabel} from "@chakra-ui/form-control";
import {Box, Button, CloseButton, Dialog, HStack, Input, Portal, Stack, useDialog} from "@chakra-ui/react";
import {useColorMode} from "./ui/color-mode.jsx";
import React, {useState} from "react";
import useShowToast from "../hooks/useShowToast.js";
import {IoMdAddCircleOutline} from "react-icons/io";
import {PasswordInput} from "./ui/password-input.jsx";

export default function CreateUser({setGroupUsers, activeGroupId, isDisabled, activeTab}) {
    const [showPassword, setShowPassword] = useState(false);
    const showToast = useShowToast();
    const [isOpen, setIsOpen] = useState(false);
    const dialog = useDialog({open: isOpen, setOpenChange: setIsOpen});
    const [inputs, setInputs] = useState({
        name: "", username: "", email: "", password: "",
    });
    const [errors, setErrors] = useState({
        name: "", username: "", email: "", password: "",
    });

    // Валидация полей
    const validateInputs = (name, value) => {
        switch (name) {
            case "username":
                if (!value.trim()) return "Логин не может быть пустым";
                if (value.length < 3) return "Логин должен содержать минимум 3 символа";
                if (value.length > 20) return "Логин не может превышать 20 символов";
                if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Логин может содержать только буквы, цифры и подчеркивания";
                return "";
            case "name":
                if (!value.trim()) return "ФИО не может быть пустым";
                if (value.length < 2) return "ФИО должно содержать минимум 2 символа";
                if (value.length > 50) return "ФИО не может превышать 50 символов";
                return "";
            case "email":
                if (!value.trim()) return "Почта не может быть пустой";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Введите корректный email";
                return "";
            case "password":
                if (!value) return "Пароль не может быть пустым";
                if (value.length < 8) return "Пароль должен содержать минимум 8 символов";
                if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value) || !/[^a-zA-Z0-9]/.test(value)) return "Пароль должен содержать буквы, цифры и специальный символ";
                return "";
            default:
                return "";
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setInputs({...inputs, [name]: value});
        setErrors({...errors, [name]: validateInputs(name, value)});
    };

    const handleCreate = async () => {
        // Проверяем все поля перед отправкой
        const newErrors = {
            name: validateInputs("name", inputs.name),
            username: validateInputs("username", inputs.username),
            email: validateInputs("email", inputs.email),
            password: validateInputs("password", inputs.password),
        };
        setErrors(newErrors);

        // Если есть ошибки, показываем тост и прерываем выполнение
        const hasErrors = Object.values(newErrors).some((error) => error);
        if (hasErrors) {
            showToast("Ошибка", "Пожалуйста, исправьте ошибки в форме", "error");
            return;
        }

        if (!activeGroupId) {
            showToast("Ошибка", "Выберите группу для ученика", "error");
            return;
        }

        try {
            const res = await fetch("/api/schools/student", {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify({...inputs, role: "student", group: activeGroupId}),
            });

            const data = await res.json();

            if (data.error) {
                showToast("Ошибка", data.error, "error");
                return;
            }

            // Обновляем список студентов
            const fetchGroupUsers = async () => {
                try {
                    const res = await fetch(`/api/schools/group_students/${activeGroupId}`, {
                        headers: {"Cache-Control": "no-store"},
                    });
                    const usersData = await res.json();
                    if (usersData.message) {
                        showToast("Инфо", usersData.message, "info");
                        setGroupUsers([]);
                    } else {
                        setGroupUsers(usersData || []);
                    }
                } catch (error) {
                    showToast("Ошибка", "Не удалось загрузить пользователей группы", "error");
                    setGroupUsers([]);
                }
            };
            await fetchGroupUsers();

            setIsOpen(false);
            setInputs({name: "", username: "", email: "", password: ""});
            setErrors({name: "", username: "", email: "", password: ""});
            showToast("Успех", "Ученик создан", "success");
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
                    <IoMdAddCircleOutline/> Создать ученика
                </Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop/>
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Создание ученика</Dialog.Title>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton onClick={() => setIsOpen(false)} size="xl"/>
                            </Dialog.CloseTrigger>
                        </Dialog.Header>
                        <Dialog.Body>
                            <HStack>
                                <Box mr={"5px"}>
                                    <FormControl isInvalid={!!errors.username} isRequired>
                                        <FormLabel m={"0 0 10px 0"}>Логин</FormLabel>
                                        <Input
                                            name="username"
                                            value={inputs.username}
                                            onChange={handleInputChange}
                                            borderWidth={"1px"}
                                            borderStyle={"solid"}
                                            borderRadius={"5"}
                                            w={"100%"}
                                            h={"35px"}
                                            type="text"
                                        />
                                        {errors.username && <FormErrorMessage  color={"red"}>{errors.username}</FormErrorMessage>}
                                    </FormControl>
                                </Box>
                                <Box>
                                    <FormControl isInvalid={!!errors.name} isRequired>
                                        <FormLabel m={"0 0 10px 0"}>ФИО</FormLabel>
                                        <Input
                                            name="name"
                                            value={inputs.name}
                                            onChange={handleInputChange}
                                            borderWidth={"1px"}
                                            borderStyle={"solid"}
                                            borderRadius={"5"}
                                            w={"100%"}
                                            h={"35px"}
                                            type="text"
                                        />
                                        {errors.name && <FormErrorMessage color={"red"}>{errors.name}</FormErrorMessage>}
                                    </FormControl>
                                </Box>
                            </HStack>
                            <FormControl isInvalid={!!errors.email} isRequired>
                                <FormLabel m={"0 0 10px 0"}>Почта</FormLabel>
                                <Input
                                    name="email"
                                    value={inputs.email}
                                    onChange={handleInputChange}
                                    borderWidth={"1px"}
                                    borderStyle={"solid"}
                                    borderRadius={"5"}
                                    w={"100%"}
                                    h={"35px"}
                                    type="email"
                                />
                                {errors.email && <FormErrorMessage color={"red"}>{errors.email}</FormErrorMessage>}
                            </FormControl>
                            <FormControl m={"0 0 10px 0"} isInvalid={!!errors.password} isRequired>
                                <FormLabel m={"0 0 10px 0"}>Пароль</FormLabel>
                                <PasswordInput
                                    name="password"
                                    value={inputs.password}
                                    onChange={handleInputChange}
                                />
                                {errors.password && <FormErrorMessage color={"red"}>{errors.password}</FormErrorMessage>}
                            </FormControl>
                            <Stack spacing={10} pt={2}>
                                <Button
                                    onClick={handleCreate}
                                    loadingText="Submitting"
                                    size="lg"
                                    bg={"blue.400"}
                                    color={"white"}
                                    _hover={{
                                        bg: "blue.500",
                                    }}
                                    isDisabled={Object.values(errors).some((error) => error) || !inputs.username || !inputs.name || !inputs.email || !inputs.password}
                                >
                                    Зарегистрировать
                                </Button>
                            </Stack>
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.RootProvider>);
}