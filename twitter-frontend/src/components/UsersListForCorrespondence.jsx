import {Avatar, Box, Button, Flex, Input, List, Text} from "@chakra-ui/react";
import {FormControl} from "@chakra-ui/form-control";
import {FaSearch} from "react-icons/fa";
import {Link} from "react-router-dom";
import React, {useEffect, useState} from "react";
import useShowToast from "../hooks/useShowToast.js";
import {useRecoilValue} from "recoil";
import userAtom from "../atoms/userAtom.js";
import {IoCheckmarkDone} from "react-icons/io5";

export const UsersListForCorrespondence = () => {
    const showToast = useShowToast();
    const user = useRecoilValue(userAtom);
    const [recipients, setRecipients] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchRecipients = async () => {
            try {
                const res = await fetch("/api/rooms/users/1");
                const data = await res.json();
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
    }, [showToast]);

    // Фильтрация пользователей по поисковому запросу
    const filteredRecipients = recipients.filter((recipient) => recipient.username.toLowerCase().includes(searchQuery.toLowerCase()));

    return (<Box p={4} w={{base: "full", md: "300px"}} borderColor="gray.200">
        <Text fontSize="xl" fontWeight="bold" mb={4}>
            Ваши контакты
        </Text>

        <FormControl mb={4}>
            <Flex>
                <Input
                    placeholder="Введите имя пользователя"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" ml={2}>
                    <FaSearch/>
                </Button>
            </Flex>
        </FormControl>

        <List.Root alignItems="start">
            {filteredRecipients.length > 0 ? (filteredRecipients.map((recipient) => (
                <List.Item key={recipient._id} listStyle="none" mb={2}>
                    <Button
                        as={Link}
                        to={`/chat/${recipient._id}`}
                        variant="plain"
                        background="none"
                        p={0}
                        w="full"
                        _hover={{bg: "gray.100"}}
                    >
                        <Flex alignItems="center">
                            <Avatar.Root mr={3}>
                                <Avatar.Fallback/>
                                <Avatar.Image src={recipient.profilePic}/>
                            </Avatar.Root>
                            <Box textAlign="left">
                                <Text color="base.dark" fontWeight="bold">
                                    {recipient.username}
                                </Text>
                                {recipient.lastMessage && (<Flex alignItems="center">
                                    <IoCheckmarkDone color="blue"/>
                                    <Text fontWeight="bold" ml={2} noOfLines={1}>
                                        {recipient.lastMessage.text.slice(0, 23)}...
                                    </Text>
                                </Flex>)}
                            </Box>
                        </Flex>
                    </Button>
                </List.Item>))) : (
                <Text color="gray.500">Нет переписок или пользователей по вашему запросу</Text>)}        </List.Root>
    </Box>);
};