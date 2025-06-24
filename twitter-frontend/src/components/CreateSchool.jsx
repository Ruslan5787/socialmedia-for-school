import { FormControl, FormLabel, FormErrorMessage } from "@chakra-ui/form-control";
import { Button, CloseButton, Dialog, Input, Portal, Stack, useDialog } from "@chakra-ui/react";
import React, { useState } from "react";
import { useColorMode } from "./ui/color-mode.jsx";
import { IoMdAddCircleOutline } from "react-icons/io";
import useShowToast from "../hooks/useShowToast.js";

const MAX_CHAR = 500;

export const CreateSchool = ({ setSchools }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dialog = useDialog({ open: isOpen, setOpenChange: setIsOpen });
    const showToast = useShowToast();

    const [inputs, setInputs] = useState({
        title: "",
        email: "",
        inn: "",
    });

    // Состояние для ошибок валидации
    const [errors, setErrors] = useState({
        title: "",
        email: "",
        inn: "",
    });

    // Функция валидации
    const validateInputs = () => {
        let isValid = true;
        const newErrors = { title: "", email: "", inn: "" };

        // Валидация названия
        if (!inputs.title.trim()) {
            newErrors.title = "Название обязательно для заполнения";
            isValid = false;
        } else if (inputs.title.length > MAX_CHAR) {
            newErrors.title = `Название не должно превышать ${MAX_CHAR} символов`;
            isValid = false;
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!inputs.email.trim()) {
            newErrors.email = "Email обязателен для заполнения";
            isValid = false;
        } else if (!emailRegex.test(inputs.email)) {
            newErrors.email = "Введите корректный email";
            isValid = false;
        }

        // Валидация ИНН (для России: 10 или 12 цифр)
        const innRegex = /^\d{10}(\d{2})?$/;
        if (!inputs.inn.trim()) {
            newErrors.inn = "ИНН обязателен для заполнения";
            isValid = false;
        } else if (!innRegex.test(inputs.inn)) {
            newErrors.inn = "ИНН должен состоять из 10 или 12 цифр";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleCreateSchool = async () => {
        if (!validateInputs()) {
            showToast("Ошибка", "Проверьте правильность заполнения полей", "error");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/schools/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputs),
            });

            const data = await res.json();
            if (data.error) {
                showToast("Ошибка", data.error, "error");
                return;
            }

            console.log("Created school:", data);
            setSchools((prevSchools) => [...prevSchools, data]);
            showToast("Успех", "Школа добавлена в систему", "success");
            setIsOpen(false);
            setInputs({
                title: "",
                email: "",
                inn: "",
            });
            setErrors({ title: "", email: "", inn: "" });
        } catch (error) {
            showToast("Ошибка", error.message, "error");
            console.error("Create school error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog.RootProvider size="sm" placement="center" motionPreset="slide-in-bottom" value={dialog}>
            <Dialog.Trigger asChild>
                <Button
                    onClick={() => setIsOpen(true)}
                    variant="outline"
                    w={"full"}
                    bg={useColorMode("gray.300", "gray.dark")}
                    isLoading={isLoading}
                >
                    <IoMdAddCircleOutline /> Создать учебную организацию
                </Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Создание учебной организации</Dialog.Title>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton onClick={() => setIsOpen(false)} size="xl" />
                            </Dialog.CloseTrigger>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Stack spacing={4}>
                                <FormControl isRequired isInvalid={!!errors.title}>
                                    <FormLabel m={"0 0 10px 0"}>Название</FormLabel>
                                    <Input
                                        value={inputs.title}
                                        onChange={(e) => setInputs({ ...inputs, title: e.target.value })}
                                        borderWidth={"1px"}
                                        borderStyle={"solid"}
                                        borderRadius={"5"}
                                        w={"100%"}
                                        h={"35px"}
                                        type="text"
                                        maxLength={MAX_CHAR}
                                        onBlur={validateInputs} // Валидация при потере фокуса
                                    />
                                    <FormErrorMessage>{errors.title}</FormErrorMessage>
                                </FormControl>
                                <FormControl isRequired isInvalid={!!errors.inn}>
                                    <FormLabel m={"0 0 10px 0"}>ИНН</FormLabel>
                                    <Input
                                        value={inputs.inn}
                                        onChange={(e) => setInputs({ ...inputs, inn: e.target.value })}
                                        borderWidth={"1px"}
                                        borderStyle={"solid"}
                                        borderRadius={"5"}
                                        w={"100%"}
                                        h={"35px"}
                                        type="text"
                                        maxLength={12} // Ограничение длины ИНН
                                        onBlur={validateInputs}
                                    />
                                    <FormErrorMessage>{errors.inn}</FormErrorMessage>
                                </FormControl>
                                <FormControl isRequired isInvalid={!!errors.email}>
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
                                        maxLength={MAX_CHAR}
                                        onBlur={validateInputs}
                                    />
                                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                                </FormControl>
                                <Stack spacing={10} pt={2}>
                                    <Button
                                        onClick={handleCreateSchool}
                                        loadingText="Submitting"
                                        size="lg"
                                        bg={"blue.400"}
                                        color={"white"}
                                        _hover={{
                                            bg: "blue.500",
                                        }}
                                        isLoading={isLoading}
                                        isDisabled={!!errors.title || !!errors.email || !!errors.inn}
                                    >
                                        Зарегистрировать
                                    </Button>
                                </Stack>
                            </Stack>
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.RootProvider>
    );
};