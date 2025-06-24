import {FormControl, FormErrorMessage, FormLabel} from "@chakra-ui/form-control";
import {Toaster} from "./ui/toaster.jsx";
import {Box, Button, Flex, Heading, HStack, Input, Link, Stack, Text} from "@chakra-ui/react";
import {useColorModeValue} from "./ui/color-mode.jsx";
import {useState} from "react";
import {useSetRecoilState} from "recoil";
import authScreenAtom from "../atoms/authAtom.js";
import useShowToast from "../hooks/useShowToast.js";
import userAtom from "../atoms/userAtom.js";
import {useNavigate} from "react-router-dom";
import {PasswordInput} from "./ui/password-input.jsx";

export default function SignupCard() {
    const setAuthScreenState = useSetRecoilState(authScreenAtom);
    const showToast = useShowToast();
    const setUser = useSetRecoilState(userAtom);
    const navigate = useNavigate();

    const [inputs, setInputs] = useState({
        name: "", username: "", email: "", password: "",
    });

    const [errors, setErrors] = useState({
        name: "", username: "", email: "", password: "",
    });

    // Функция валидации
    const validateInputs = () => {
        let isValid = true;
        const newErrors = {name: "", username: "", email: "", password: ""};

        // Валидация имени
        if (!inputs.name) {
            newErrors.name = "Имя обязательно";
            isValid = false;
        } else if (inputs.name.length < 2) {
            newErrors.name = "Имя должно содержать минимум 2 символа";
            isValid = false;
        } else if (!/^[a-zA-Zа-яА-Я\s]+$/.test(inputs.name)) {
            newErrors.name = "Имя может содержать только буквы и пробелы";
            isValid = false;
        }

        // Валидация логина
        if (!inputs.username) {
            newErrors.username = "Логин обязателен";
            isValid = false;
        } else if (inputs.username.length < 3) {
            newErrors.username = "Логин должен содержать минимум 3 символа";
            isValid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(inputs.username)) {
            newErrors.username = "Логин может содержать только буквы, цифры и подчеркивания";
            isValid = false;
        }

        // Валидация почты
        if (!inputs.email) {
            newErrors.email = "Почта обязательна";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
            newErrors.email = "Неверный формат почты";
            isValid = false;
        }

        // Валидация пароля
        if (!inputs.password) {
            newErrors.password = "Пароль обязателен";
            isValid = false;
        } else if (inputs.password.length < 8) {
            newErrors.password = "Пароль должен содержать минимум 8 символов";
            isValid = false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(inputs.password)) {
            newErrors.password = "Пароль должен содержать заглавную букву, строчную букву, цифру и специальный символ";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSignup = async () => {
        if (!validateInputs()) {
            showToast("Ошибка", "Пожалуйста, исправьте ошибки в форме", "error");
            return;
        }

        try {
            const res = await fetch("/api/users/signup", {
                method: "POST", headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify({...inputs, role: "teacher"}),
            });

            const data = await res.json();

            if (data.error) {
                showToast("Ошибка", data.error, "error");
                return;
            }

            localStorage.setItem("user-threads", JSON.stringify(data));
            navigate("/");
            setUser(data);
        } catch (error) {
            showToast("Ошибка", error.message, "error");
        }
    };

    return (<Flex
        align={"center"}
        justify={"center"}
        bg={useColorModeValue("gray.white", "gray.black")}
    >
        <Toaster/>
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
            <Stack align={"center"}>
                <Heading fontSize={"4xl"} textAlign={"center"} m={"0 0 25px 0"}>
                    Зарегистрироваться как преподаватель
                </Heading>
            </Stack>
            <Box
                rounded={"lg"}
                bg={useColorModeValue("gray.white", "gray.dark")}
                boxShadow={"lg"}
                p={8}
            >
                <Stack spacing={4}>
                    <HStack>
                        <Box flex="1">
                            <FormControl isInvalid={!!errors.username}>
                                <FormLabel m={"0 0 10px 0"}>Логин</FormLabel>
                                <Input
                                    value={inputs.username}
                                    onChange={(e) => setInputs({...inputs, username: e.target.value})}
                                    borderWidth={"1px"}
                                    borderStyle={"solid"}
                                    borderRadius={"5"}
                                    w={"100%"}
                                    h={"35px"}
                                    type="text"
                                />
                                <FormErrorMessage>{errors.username}</FormErrorMessage>
                            </FormControl>
                        </Box>
                        <Box flex="1">
                            <FormControl isInvalid={!!errors.name}>
                                <FormLabel m={"0 0 10px 0"}>ФИО</FormLabel>
                                <Input
                                    value={inputs.name}
                                    onChange={(e) => setInputs({...inputs, name: e.target.value})}
                                    borderWidth={"1px"}
                                    borderStyle={"solid"}
                                    borderRadius={"5"}
                                    w={"100%"}
                                    h={"35px"}
                                    type="text"
                                />
                                <FormErrorMessage>{errors.name}</FormErrorMessage>
                            </FormControl>
                        </Box>
                    </HStack>
                    <FormControl isInvalid={!!errors.email} isRequired>
                        <FormLabel m={"0 0 10px 0"}>Почта</FormLabel>
                        <Input
                            value={inputs.email}
                            onChange={(e) => setInputs({...inputs, email: e.target.value})}
                            borderWidth={"1px"}
                            borderStyle={"solid"}
                            borderRadius={"5"}
                            w={"100%"}
                            h={"35px"}
                            type="email"
                        />
                        <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={!!errors.password} isRequired>
                        <FormLabel m={"0 0 10px 0"}>Пароль</FormLabel>
                        <PasswordInput
                            value={inputs.password}
                            onChange={(e) => setInputs({...inputs, password: e.target.value})}
                        />
                        <FormErrorMessage>{errors.password}</FormErrorMessage>
                    </FormControl>
                    <Stack spacing={10} pt={2}>
                        <Button
                            onClick={handleSignup}
                            loadingText="Submitting"
                            size="lg"
                            bg={"blue.400"}
                            color={"white"}
                            _hover={{
                                bg: "blue.500",
                            }}
                        >
                            Зарегистрироваться
                        </Button>
                    </Stack>
                    <Stack pt={6}>
                        <Text
                            textAlign="center"
                            color={useColorModeValue("base.dark", "base.white")}
                        >
                            У вас есть аккаунт?{" "}
                            <Link
                                color={"blue.400"}
                                onClick={() => setAuthScreenState("login")}
                            >
                                Войти в аккаунт
                            </Link>
                        </Text>
                    </Stack>
                </Stack>
            </Box>
        </Stack>
    </Flex>);
}