import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { InputGroup, InputRightElement } from "@chakra-ui/input";
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { Box, Button, CloseButton, Dialog, HStack, Input, Portal, Stack, useDialog } from "@chakra-ui/react";
import { useColorMode } from "./ui/color-mode.jsx";
import React, { useState } from "react";
import useShowToast from "../hooks/useShowToast.js";
import { IoMdAddCircleOutline } from "react-icons/io";

export default function CreateUser({ setGroupUsers, activeGroupId, isDisabled, activeTab }) {
    const [showPassword, setShowPassword] = useState(false);
    const showToast = useShowToast();
    const [isOpen, setIsOpen] = useState(false);
    const dialog = useDialog({ open: isOpen, setOpenChange: setIsOpen });

    const [inputs, setInputs] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
    });

    const handleCreate = async () => {
        try {
            if (!activeGroupId) {
                showToast("Ошибка", "Выберите группу для ученика", "error");
                return;
            }

            const res = await fetch("/api/schools/student", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...inputs, role: "student", group: activeGroupId }),
            });

            const data = await res.json();

            if (data.error) {
                showToast("Ошибка", data.error, "error");
                return;
            }

            // Обновляем список студентов, делая новый запрос к API
            const fetchGroupUsers = async () => {
                try {
                    const res = await fetch(`/api/schools/group_students/${activeGroupId}`, {
                        headers: { "Cache-Control": "no-store" },
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
            setInputs({ name: "", username: "", email: "", password: "" }); // Сбрасываем форму
            showToast("Успех", "Ученик создан", "success");
        } catch (error) {
            showToast("Ошибка", error.message, "error");
        }
    };

    return (
        <Dialog.RootProvider size="sm" placement="center" motionPreset="slide-in-bottom" value={dialog}>
            <Dialog.Trigger asChild>
                <Button
                    onClick={() => setIsOpen(true)}
                    variant="outline"
                    size="xl"
                    bg={useColorMode("gray.300", "gray.dark")}
                    isDisabled={isDisabled}
                >
                    <IoMdAddCircleOutline /> Создать ученика
                </Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Создание ученика</Dialog.Title>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton onClick={() => setIsOpen(false)} size="xl" />
                            </Dialog.CloseTrigger>
                        </Dialog.Header>
                        <Dialog.Body>
                            <HStack>
                                <Box>
                                    <FormControl>
                                        <FormLabel m={"0 0 10px 0"}>Полное имя</FormLabel>
                                        <Input
                                            value={inputs.username}
                                            onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                                            
                                            borderWidth={"1px"}
                                            borderStyle={"solid"}
                                            borderRadius={"5"}
                                            w={"100%"}
                                            h={"35px"}
                                            type="text"
                                        />
                                    </FormControl>
                                </Box>
                                <Box>
                                    <FormControl id="lastName">
                                        <FormLabel m={"0 0 10px 0"}>Логин</FormLabel>
                                        <Input
                                            value={inputs.name}
                                            onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                                            
                                            borderWidth={"1px"}
                                            borderStyle={"solid"}
                                            borderRadius={"5"}
                                            w={"100%"}
                                            h={"35px"}
                                            type="text"
                                        />
                                    </FormControl>
                                </Box>
                            </HStack>
                            <FormControl id="email" isRequired>
                                <FormLabel m={"0 0 10px 0"}>Почта</FormLabel>
                                <Input
                                    value={inputs.email}
                                    onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                                    
                                    borderWidth={"1px"}
                                    borderStyle={"solid"}
                                    borderRadius={"5"}
                                    w={"100%"}
                                    h={"35px"}
                                    type="email"
                                />
                            </FormControl>
                            <FormControl m={"0 0 10px 0"} id="password" isRequired>
                                <FormLabel m={"0 0 10px 0"}>Пароль</FormLabel>
                                <InputGroup>
                                    <Input
                                        value={inputs.password}
                                        onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                                        
                                        borderWidth={"1px"}
                                        borderStyle={"solid"}
                                        borderRadius={"5"}
                                        w={"100%"}
                                        h={"35px"}
                                        type={showPassword ? "text" : "password"}
                                    />
                                    <InputRightElement h={"full"}>
                                        <Button
                                            variant={"ghost"}
                                            onClick={() => setShowPassword((showPassword) => !showPassword)}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
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
                                >
                                    Зарегистрировать
                                </Button>
                            </Stack>
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.RootProvider>
    );
}