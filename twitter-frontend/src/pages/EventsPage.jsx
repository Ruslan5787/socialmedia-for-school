import {Box, Flex, Spinner, Tabs, Text} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import useShowToast from "../hooks/useShowToast.js";
import {useNavigate} from "react-router-dom";

export const EventsPage = ({groupEvents, setGroupEvents, setActiveTab, activeTab, groups, tabGroupRef}) => {
    const [loading, setLoading] = useState(false);
    const showToast = useShowToast();
    const navigate = useNavigate();

    // Загрузка мероприятий для активной группы
    useEffect(() => {
        if (activeTab && groups && groups.length > 0) {
            const activeGroup = groups.find((group) => group._id === activeTab);
            if (activeGroup) {
                const fetchEvents = async () => {
                    setLoading(true);
                    try {
                        const res = await fetch(`/api/events/group/${activeGroup._id}`);
                        const data = await res.json();

                        if (data.error) {
                            showToast("Ошибка", data.error, "error");
                            setGroupEvents([]);
                            return;
                        }
                        setGroupEvents(data || []);
                    } catch (error) {
                        showToast("Ошибка", "Не удалось загрузить мероприятия", "error");
                        console.error("Fetch groupEvents error:", error);
                        setGroupEvents([]);
                    } finally {
                        setLoading(false);
                    }
                };
                fetchEvents();
            } else {
                setGroupEvents([]);
            }
        } else {
            setGroupEvents([]);
        }
    }, [activeTab]);

    const handleTabChange = ({value}) => {
        setActiveTab(value);
    };

    return (
        <Box p={4}>
            {groups === null ? (
                <Spinner/>
            ) : groups?.length > 0 ? (
                <Flex minH="dvh" cursor={"pointer"}>
                    <Tabs.Root value={activeTab} onValueChange={handleTabChange} width="full">
                        <Tabs.List>
                            {groups.map((item) => (
                                <Tabs.Trigger key={item._id} value={item._id}>
                                    {item.title}
                                </Tabs.Trigger>
                            ))}
                        </Tabs.List>
                        <Box minH="200px" width="full">
                            {groups.map((item) => (
                                <Tabs.Content
                                    key={item._id}
                                    value={item._id}
                                    ref={item._id === activeTab ? tabGroupRef : null}
                                >
                                    {loading ? (
                                        <Spinner/>
                                    ) : groupEvents.length > 0 ? (
                                        <Box>
                                            {groupEvents.map((event) => (
                                                <Box
                                                    key={event._id}
                                                    p={2}
                                                    borderBottom="1px solid gray"
                                                    onClick={() => navigate(`/events/${event._id}`)}>
                                                    <Text fontWeight="bold">{event.name}</Text>
                                                    <Text>{event.description}</Text>
                                                    <Text fontSize="sm">
                                                        Дата: {new Date(event.Date).toLocaleDateString()}
                                                    </Text>
                                                    <Text fontSize="sm">Время: {event.Time}</Text>
                                                    {event.price > 0 && (
                                                        <Text fontSize="sm">Стоимость: {event.price} руб.</Text>
                                                    )}
                                                    {event.address && (
                                                        <Text fontSize="sm">Адрес: {event.address}</Text>
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Text textAlign={"center"} mt={"20px"}>В этой группе пока нет мероприятий</Text>
                                    )}
                                </Tabs.Content>
                            ))}
                        </Box>
                    </Tabs.Root>
                </Flex>
            ) : (
                <Text>Нет групп</Text>
            )}
        </Box>
    );
};