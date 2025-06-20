import {Box, Button, CloseButton, Dialog, Flex, Portal, Spinner, Tabs, Text, VStack} from "@chakra-ui/react";
import {Avatar} from "@chakra-ui/avatar";
import React, {useEffect, useState} from "react";
import useShowToast from "../hooks/useShowToast.js";

export const StudentsPage = ({groupUsers, setGroupUsers, setActiveTab, activeTab, groups, tabGroupRef}) => {
    const [loading, setLoading] = useState(false);
    const showToast = useShowToast();
    const [activeGroup, setActiveGroup] = useState({});

    const [isOpen, setIsOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const cancelRef = React.useRef();

    const openDeleteDialog = (userId) => {
        setUserToDelete(userId);
        setIsOpen(true);
    };

    // const confirmDelete = async (user._id) => {
    //     await handleDeleteUser(userToDelete);
    //     setIsOpen(false);
    //     setUserToDelete(null);
    // };

    const fetchGroupUsers = async (activeGroup) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/schools/group_students/${activeGroup._id}`, {
                headers: {"Cache-Control": "no-store"},
            });
            const data = await res.json();
            if (data.message) {
                showToast("Инфо", data.message, "info");
                setGroupUsers([]);
                return;
            }
            setGroupUsers(data || []);
        } catch (error) {
            showToast("Ошибка", "Не удалось загрузить пользователей группы", "error");
            console.error("Fetch group users error:", error);
            setGroupUsers([]);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (activeTab && groups && groups.length > 0) {
            const activeGroup = groups.find((group) => group._id === activeTab);
            setActiveGroup(activeGroup)
            if (activeGroup) {
                fetchGroupUsers(activeGroup);
            } else {
                console.log("Active group not found for activeTab:", activeTab);
                setGroupUsers([]);
                setLoading(false);
            }
        } else {
            setGroupUsers([]);
            setLoading(false);
        }
    }, [activeTab, groups, showToast]);

    const handleTabChange = ({value}) => {
        setActiveTab(value);
        console.log(value);
    };

    // Новая функция для удаления пользователя
    const handleDeleteUser = async (userId) => {
        try {
            const res = await fetch(`/api/schools/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();

            if (res.status === 200) {
                // Удаляем пользователя из локального состояния
                setGroupUsers(groupUsers.filter((user) => user._id !== userId));
                showToast("Успех", data.message || "Пользователь успешно удалён", "success");
                fetchGroupUsers(activeGroup);
            } else {
                showToast("Ошибка", data.error || "Не удалось удалить пользователя", "error");
            }
        } catch (error) {
            showToast("Ошибка", "Ошибка сервера при удалении пользователя", "error");
            console.error("Delete user error:", error);
        }
    };

    return (
        <Box p={4}>
            {groups === null ? (
                <Flex justify="center" align="center" minH="200px">
                    <Spinner size="lg"/>
                </Flex>
            ) : groups?.length > 0 ? (
                <VStack spacing={4} align="stretch">
                    {/* Вкладки для групп */}
                    <Tabs.Root value={activeTab} onValueChange={handleTabChange} width="full">
                        <Tabs.List borderBottom="1px solid" borderColor="gray.200">
                            {groups.map((item) => (
                                <Tabs.Trigger
                                    key={item._id}
                                    value={item._id}
                                    px={4}
                                    py={2}
                                    _selected={{borderBottom: "2px solid", borderColor: "blue.500", fontWeight: "bold"}}
                                >
                                    {item.title}
                                </Tabs.Trigger>
                            ))}
                        </Tabs.List>

                        {/* Контент активной группы */}
                        <Box minH="200px" width="full" pt={4}>
                            {groups.map((item) => (
                                <Tabs.Content key={item._id} value={item._id}
                                              ref={item._id === activeTab ? tabGroupRef : null}>
                                    {loading ? (
                                        <Flex justifyContent="center" align="center" minH="200px">
                                            <Spinner size="lg"/>
                                        </Flex>
                                    ) : groupUsers?.length > 0 ? (
                                        <VStack spacing={3} align="stretch">
                                            {groupUsers.map((user) => (
                                                <Box
                                                    key={user._id}
                                                    p={3}
                                                    borderWidth="1px"
                                                    borderRadius="md"
                                                    borderColor="gray.200"
                                                    _hover={{bg: "gray.50"}}
                                                >
                                                    <Flex
                                                        justify="space-between"
                                                        gap={4}
                                                        direction={{base: "column", md: "row"}}
                                                        alignItems="center"
                                                        textAlign="center"
                                                    >
                                                        <Avatar
                                                            size="sm"
                                                            top="5"
                                                            name="Mark Zuckerberg"
                                                            src={"userSourceImg"}
                                                            w="100px"
                                                            h="100px"
                                                            borderRadius="50%"
                                                            borderColor="black"
                                                            borderStyle="solid"
                                                            borderWidth="1px"
                                                        />
                                                        <VStack align={{base: "center", md: "start"}} spacing={1}>
                                                            <Text fontWeight="bold">{user.name}</Text>
                                                            <Text fontSize="sm" color="gray.600">{user.username}</Text>
                                                            <Text fontSize="sm" color="gray.600">{user.email}</Text>
                                                            {user.bio && (
                                                                <Text fontSize="xs" color="gray.500">
                                                                    {user.bio}
                                                                </Text>
                                                            )}
                                                        </VStack>
                                                        <Flex direction="column" gap={2}>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => console.log("Редактировать пользователя:", user._id)}
                                                            >
                                                                Редактировать
                                                            </Button>
                                                            <Dialog.Root key={"sm"} size={"sm"}>
                                                                <Dialog.Trigger asChild>
                                                                    <Button variant="outline" size={"sm"}>
                                                                        Удалить
                                                                    </Button>
                                                                </Dialog.Trigger>
                                                                <Portal>
                                                                    <Dialog.Backdrop/>
                                                                    <Dialog.Positioner>
                                                                        <Dialog.Content>
                                                                            <Dialog.Header>
                                                                                <Dialog.Title>Удаление
                                                                                    пользователя</Dialog.Title>
                                                                            </Dialog.Header>
                                                                            <Dialog.Body>
                                                                                <p>
                                                                                    Вы точно хотите удалить
                                                                                    пользователя?
                                                                                </p>
                                                                            </Dialog.Body>
                                                                            <Dialog.Footer>
                                                                                <Dialog.ActionTrigger asChild>
                                                                                    <Button variant="outline"
                                                                                            ref={cancelRef}
                                                                                            onClick={() => setIsOpen(false)}>Нет</Button>
                                                                                </Dialog.ActionTrigger>
                                                                                <Button variant="outline"
                                                                                        onClick={() => handleDeleteUser(user._id)}>Точно</Button>
                                                                            </Dialog.Footer>
                                                                            <Dialog.CloseTrigger asChild>
                                                                                <CloseButton />
                                                                            </Dialog.CloseTrigger>
                                                                        </Dialog.Content>
                                                                    </Dialog.Positioner>
                                                                </Portal>
                                                            </Dialog.Root>
                                                        </Flex>
                                                    </Flex>
                                                </Box>
                                            ))}
                                        </VStack>
                                    ) : (
                                        <Text textAlign="center" color="gray.500">
                                            В этой группе пока нет учеников
                                        </Text>
                                    )}
                                </Tabs.Content>
                            ))}
                        </Box>
                    </Tabs.Root>
                </VStack>
            ) : (
                <Text textAlign="center" color="gray.500">
                    Нет групп
                </Text>
            )}
        </Box>
    );
};