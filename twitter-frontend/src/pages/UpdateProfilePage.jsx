"use client";

import {Avatar} from "@chakra-ui/avatar";
import {FormControl, FormLabel} from "@chakra-ui/form-control";
import {useColorModeValue} from "../components/ui/color-mode.jsx";
import {Button, Center, Flex, Heading, Input, Stack} from "@chakra-ui/react";
import {useEffect, useRef, useState} from "react";
import {useRecoilState} from "recoil";
import userAtom from "../atoms/userAtom.js";
import {useChangeUserAvatar} from "../hooks/useChangeUserAvatar.js";
import useShowToast from "../hooks/useShowToast.js";
import {Toaster} from "../components/ui/toaster.jsx";
import {useNavigate, useParams} from "react-router-dom";

const UpdateProfilePage = () => {
    const navigate = useNavigate();
    const showToaster = useShowToast();
    const {userId} = useParams();
    const showToast = useShowToast();
    const currentUser = useRecoilState(userAtom);
    const [updatedUser, setUpdatedUser] = useState({});
    const [inputs, setInputs] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        bio: "",
    });
    console.log(userId)
    const [userSourceImg, setUserSourceImg] = useState("../public/index.png");
    const {urlAvatar, handleImageChange} = useChangeUserAvatar();
    const fileRef = useRef(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log(userId)
                const resUser = await fetch(`/api/users/profile/${userId}`);
                const dataUser = await resUser.json();
                if (dataUser.error) {
                    showToaster("Ошибка", dataUser.error, "error");
                    return;
                }

                if (dataUser.profilePic) {
                    setUserSourceImg(dataUser.profilePic);
                }
            } catch (e) {
                showToast("error", e.message, "error");
            }
        }
        fetchData()
    }, [currentUser.profilePic])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/users/update/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({...inputs, profilePic: urlAvatar}),
            });

            setIsUpdating(true);

            const data = await res.json();

            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }

            showToast("Уведомление", "Профиль обновлен успешно", "success");
            setUpdatedUser(data);

            console.log("user.id: ", currentUser._id, "userId: ", userId, "data._id", data._id);

            if (currentUser._id === userId) {
                localStorage.setItem("user-threads", JSON.stringify(data))
            }

            setIsUpdating(false);
        } catch (error) {
            showToast("Error", error.message, "error");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Flex
                align={"center"}
                justify={"center"}
                bg={useColorModeValue("gray.white", "gray.black")}
            >
                <Toaster/>
                <Stack
                    spacing={4}
                    w={"full"}
                    maxW={"md"}
                    bg={useColorModeValue("white", "gray.700")}
                    rounded={"xl"}
                    boxShadow={"lg"}
                    p={6}
                >
                    <Button m={"0 auto 0 0"} onClick={() => navigate(-1)}>
                        Назад
                    </Button>
                    <Heading lineHeight={1.1} fontSize={{base: "xl", sm: "2xl"}}>
                        Редактирование данных пользователя
                    </Heading>
                    <FormControl id="userName">
                        <Stack direction={["column", "row"]} spacing={6}>
                            <Center>
                                <Avatar
                                    size="sm"
                                    top="5"
                                    name=""
                                    src={userSourceImg}
                                    w="100px"
                                    h="100px"
                                    borderRadius="50%"
                                />
                            </Center>
                            <Center flex={"1"}>
                                <Button width={"80%"} onClick={() => fileRef.current.click()}>
                                    Изменить аватарку
                                </Button>
                                <Input
                                    type="file"
                                    hidden
                                    onChange={handleImageChange}
                                    ref={fileRef}
                                />
                            </Center>
                        </Stack>
                    </FormControl>
                    <FormControl m="10px 0 0 0" id="userName" isRequired>
                        <FormLabel>Логин</FormLabel>
                        <Input
                            placeholder="Логин..."
                            value={inputs.name}
                            onChange={(e) => setInputs({...inputs, name: e.target.value})}
                            _placeholder={{color: "gray.500"}}
                            type="text"
                        />
                    </FormControl>
                    <FormControl m="10px 0 0 0" id="userName" isRequired>
                        <FormLabel>ФИО</FormLabel>
                        <Input
                            placeholder={"ФИО..."}
                            value={inputs.username}
                            onChange={(e) =>
                                setInputs({...inputs, username: e.target.value})
                            }
                            _placeholder={{color: "gray.500"}}
                            type="text"
                        />
                    </FormControl>
                    <FormControl id="email" isRequired>
                        <FormLabel>Почта</FormLabel>
                        <Input
                            value={inputs.email}
                            onChange={(e) => setInputs({...inputs, email: e.target.value})}
                            placeholder={"Почта"}
                            _placeholder={{color: "gray.500"}}
                            type="email"
                        />
                    </FormControl>
                    <FormControl id="password" isRequired>
                        <FormLabel>О себе</FormLabel>
                        <Input
                            value={inputs.bio}
                            onChange={(e) => setInputs({...inputs, bio: e.target.value})}
                            placeholder={"О вас"}
                            _placeholder={{color: "gray.500"}}
                        />
                    </FormControl>
                    <FormControl id="password" isRequired m={"0 0 20px 0"}>
                        <FormLabel>Пароль</FormLabel>
                        <Input
                            value={inputs.password}
                            onChange={(e) =>
                                setInputs({...inputs, password: e.target.value})
                            }
                            placeholder="Пароль..."
                            _placeholder={{color: "gray.500"}}
                            type="password"
                        />
                    </FormControl>
                    <Stack spacing={6} direction={["column"]}>
                        <Button
                            p={"10px 0px"}
                            flex="1"
                            bg={"green.400"}
                            color={"white"}
                            _hover={{
                                bg: "green.500",
                            }}
                            type="submit"
                            loading={isUpdating}
                        >
                            Сохранить
                        </Button>

                        <Button
                            p={"10px 0"}
                            onClick={() => navigate(-1)}
                            flex={"1"}
                            w={"full"}
                            bg={"red.400"}
                            color={"white"}
                            _hover={{
                                bg: "red.500",
                            }}>
                            Отменить
                        </Button>
                    </Stack>
                </Stack>
            </Flex>
        </form>
    );
};

export default UpdateProfilePage;
