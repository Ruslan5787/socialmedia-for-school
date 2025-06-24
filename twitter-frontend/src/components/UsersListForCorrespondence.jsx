import {Avatar, Box, Button, Flex, Input, List, Spinner, Text} from "@chakra-ui/react";
import {FormControl} from "@chakra-ui/form-control";
import {FaSearch} from "react-icons/fa";
import {Link} from "react-router-dom";
import React, {useEffect, useState} from "react";
import useShowToast from "../hooks/useShowToast.js";
import {useRecoilValue} from "recoil";
import userAtom from "../atoms/userAtom.js";
import {IoCheckmarkDone} from "react-icons/io5";
import {useColorMode} from "./ui/color-mode.jsx";

export const UsersListForCorrespondence = () => {
    const showToast = useShowToast();
    const user = useRecoilValue(userAtom);
    const [recipients, setRecipients] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchRecipients = async () => {
            try {
                setIsLoading(true)
                const res = await fetch(`/api/rooms/users/${user._id}`);
                const data = await res.json();
                console.log(data)
                if (data.error) {
                    showToast("Ошибка", data.error, "error");
                    return;
                }
                setRecipients(data);
            } catch (error) {
                showToast("Ошибка", "Не удалось загрузить список контактов", "error");
                console.error(error);
            }
        };

        fetchRecipients();
        setIsLoading(false)
    }, [showToast, user._id]);

    // Фильтрация пользователей и групп по поисковому запросу
    const filteredRecipients = recipients.filter((recipient) =>
        recipient.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return <Flex m={"20px 0 0 0"} justifyContent={"center"}>
            <Spinner></Spinner>
        </Flex>
    }

    return (
        <Box mb={{ base: "20px", md: "0" }} mr={{ base: "0", md: "20px" }} w={{ base: "full", md: "250px" }} borderColor="gray.200">
            <Text fontSize="xl" fontWeight="bold" mb={4}>
                Ваши контакты
            </Text>

            <FormControl mb={"15px"}>
                <Flex>
                    <Input
                        placeholder="Введите имя пользователя или группы"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit">
                        <FaSearch />
                    </Button>
                </Flex>
            </FormControl>

            <List.Root alignItems="start">
                {filteredRecipients.length > 0 ? (
                    filteredRecipients.map((recipient) => (
                        <List.Item key={recipient._id} listStyle="none" mb={2} w={"full"}>
                            <Button
                                justifyContent={"flex-start"}
                                paddingBlock={"20px"}
                                as={Link}
                                to={recipient.isGroup ? `/chat/room/${recipient._id}` : `/chat/${recipient._id}`}
                                variant="plain"
                                w="full"
                                paddingInline={"0"}
                            >
                                <Flex>
                                    <Avatar.Root mr={3}>
                                        <Avatar.Fallback />
                                        <Avatar.Image src={recipient.profilePic} />
                                    </Avatar.Root>
                                    <Box textAlign="left">
                                        <Text color="base.dark" fontWeight="bold">
                                            {recipient.username} {recipient.isGroup ? "(Группа)" : ""}
                                        </Text>
                                        {recipient.lastMessage && (
                                            <Flex alignItems="center">
                                                <IoCheckmarkDone color="blue" />
                                                <Text fontWeight="bold" ml={2} noOfLines={1}>
                                                    {recipient.lastMessage.text.slice(0, 16)}...
                                                </Text>
                                            </Flex>
                                        )}
                                    </Box>
                                </Flex>
                            </Button>
                        </List.Item>
                    ))
                ) : (
                    <Text color="gray.500" textAlign={"center"}>Нет переписок или пользователей по вашему запросу</Text>
                )}
            </List.Root>
        </Box>
    );
};