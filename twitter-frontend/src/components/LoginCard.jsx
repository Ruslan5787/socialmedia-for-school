import { FormControl, FormLabel, FormErrorMessage } from "@chakra-ui/form-control";
import { Box, Button, Flex, Heading, Input, Link, Stack, Text } from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode.jsx";
import { useState } from "react";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom.js";
import userAtom from "../atoms/userAtom.js";
import useShowToast from "../hooks/useShowToast.js";
import { Toaster } from "./ui/toaster.jsx";
import { PasswordInput } from "./ui/password-input.jsx";

export default function LoginCard() {
    const showToast = useShowToast();
    const setUser = useSetRecoilState(userAtom);
    const setAuthScreenState = useSetRecoilState(authScreenAtom);
    const [showPassword, setShowPassword] = useState(false);
    const [inputs, setInputs] = useState({
        username: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({
        username: "",
        password: "",
    });

    // Функция валидации
    const validateInputs = () => {
        let isValid = true;
        const newErrors = { username: "", password: "" };

        // Валидация логина
        if (!inputs.username) {
            newErrors.username = "Логин обязателен";
            isValid = false;
        } else if (inputs.username.length < 3) {
            newErrors.username = "Логин должен содержать минимум 3 символа";
            isValid = false;
        }

        // Валидация пароля
        if (!inputs.password) {
            newErrors.password = "Пароль обязателен";
            isValid = false;
        } else if (inputs.password.length < 8) {
            newErrors.password = "Пароль должен содержать минимум 8 символов";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = async () => {
        if (!validateInputs()) {
            showToast("Ошибка", "Пожалуйста, исправьте ошибки в форме", "error");
            return;
        }

        try {
            setIsLoading(true);
            const res = await fetch("/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputs),
            });

            const data = await res.json();

            if (data.error) {
                showToast("Ошибка", data.error, "error");
                throw Error(data.error);
            }
            localStorage.setItem("user-threads", JSON.stringify(data));
            setUser(data);
            setIsLoading(false);
        } catch (error) {
            showToast("Ошибка", error.message, "error");
            setIsLoading(false);
        }
    };

    return (
        <Flex
            align={"center"}
            justify={"center"}
            bg={useColorModeValue("gray.white", "gray.black")}
        >
            <Toaster />
            <Stack spacing={8} mx={"auto"} maxW={"lg"} py={{ base: 6, md: 12 }} px={{ base: "xl", md: "2xl" }}>
                <Stack align={"center"}>
                    <Heading fontSize={{ base: "2xl", md: "4xl" }} textAlign={"center"} m={"0 0 25px 0"}>
                        Вход в аккаунт
                    </Heading>
                </Stack>
                <Box
                    w={{ base: "full", sm: "400px" }}
                    rounded={"lg"}
                    bg={useColorModeValue("gray.white", "gray.dark")}
                    boxShadow={"lg"}
                    p={{ base: 4, md: 8 }}
                >
                    <Stack spacing={4}>
                        <FormControl isRequired isInvalid={!!errors.username}>
                            <FormLabel m={"0 0 10px 0"}>Имя пользователя</FormLabel>
                            <Input
                                value={inputs.username}
                                onChange={(e) =>
                                    setInputs((inputs) => ({
                                        ...inputs,
                                        username: e.target.value,
                                    }))
                                }
                                borderWidth={"1px"}
                                borderStyle={"solid"}
                                borderRadius={"5"}
                                w={"100%"}
                                h={"35px"}
                                type="text"
                            />
                            <FormErrorMessage color={"red"}>{errors.username}</FormErrorMessage>
                        </FormControl>
                        <FormControl m={"0 0 10px 0"} isRequired isInvalid={!!errors.password}>
                            <FormLabel m={"0 0 10px 0"}>Пароль</FormLabel>
                            <PasswordInput
                                value={inputs.password}
                                onChange={(e) =>
                                    setInputs((inputs) => ({
                                        ...inputs,
                                        password: e.target.value,
                                    }))
                                }
                            />
                            <FormErrorMessage color={"red"}>{errors.password}</FormErrorMessage>
                        </FormControl>
                        <Stack spacing={10} pt={2}>
                            <Button
                                size="lg"
                                bg={useColorModeValue("gray.600", "gray.700")}
                                color={"white"}
                                _hover={{
                                    bg: useColorModeValue("gray.700", "gray.800"),
                                }}
                                onClick={handleLogin}
                                isLoading={isLoading}
                                loadingText={"Авторизация"}
                            >
                                Войти
                            </Button>
                        </Stack>
                        <Stack pt={6}>
                            <Text
                                textAlign="center"
                                color={useColorModeValue("base.dark", "base.white")}
                            >
                                У вас нет аккаунта?{" "}
                                <Link
                                    color={"blue.400"}
                                    onClick={() => setAuthScreenState("signup")}
                                >
                                    Зарегистрироваться
                                </Link>
                            </Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
}