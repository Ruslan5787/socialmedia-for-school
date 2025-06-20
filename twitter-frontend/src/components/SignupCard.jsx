import {FormControl, FormLabel} from "@chakra-ui/form-control";
import {InputGroup, InputRightElement,} from "@chakra-ui/input";
import {Toaster} from "./ui/toaster.jsx";
import {FaEyeSlash} from "react-icons/fa";
import {IoEyeSharp} from "react-icons/io5";

import {Box, Button, Flex, Heading, HStack, Input, Link, Stack, Text,} from "@chakra-ui/react";
import {useColorModeValue} from "./ui/color-mode.jsx";
import {useState} from "react";
import {useSetRecoilState} from "recoil";
import authScreenAtom from "../atoms/authAtom.js";
import useShowToast from "../hooks/useShowToast.js";
import userAtom from "../atoms/userAtom.js";
import {useNavigate} from "react-router-dom";

export default function SignupCard() {
    const [showPassword, setShowPassword] = useState(false);
    const setAuthScreenState = useSetRecoilState(authScreenAtom);
    const showToast = useShowToast();
    const setUser = useSetRecoilState(userAtom);
    const navigate = useNavigate();

    const [inputs, setInputs] = useState({
        name: "Марина Сергеевна",
        username: "MarinaSergeevna",
        email: "marinaSergects@gmail.com",
        password: "7ItRVN32rJ",
    });


    const handleSignup = async () => {
        try {
            const res = await fetch("/api/users/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({...inputs, role: "teacher"}),
            });

            const data = await res.json();

            if (data.error) {
                showToast("Error", data.error, "error");

                return;
            }

            localStorage.setItem("user-threads", JSON.stringify(data));
            navigate("/")
            setUser(data);
        } catch (error) {
            showToast("Error", error, "error");
        }
    };

    return (
        <Flex
            minH={"100vh"}
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
                            <Box>
                                <FormControl>
                                    <FormLabel m={"0 0 10px 0"}>Полное имя</FormLabel>
                                    <Input
                                        value={inputs.username}
                                        onChange={(e) =>
                                            setInputs({...inputs, username: e.target.value})
                                        }
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
                                        onChange={(e) =>
                                            setInputs({...inputs, name: e.target.value})
                                        }
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
                                onChange={(e) =>
                                    setInputs({...inputs, email: e.target.value})
                                }
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
                                    onChange={(e) =>
                                        setInputs({...inputs, password: e.target.value})
                                    }
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
                                        onClick={() =>
                                            setShowPassword((showPassword) => !showPassword)
                                        }
                                    >
                                        {showPassword ? <FaEyeSlash/> : <IoEyeSharp/>}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        <Stack spacing={10} pt={2}>
                            <Button
                                onClick={() => handleSignup()}
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
        </Flex>
    );
}
