import {Box, Flex, Heading, List, ListItem, Text} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import {useRecoilValue} from "recoil";
import {useNavigate} from "react-router-dom";
import userAtom from "../atoms/userAtom.js";
import useShowToast from "../hooks/useShowToast.js";
import {Avatar} from "@chakra-ui/avatar";

export const GroupUser = () => {
    const user = useRecoilValue(userAtom); // Текущий пользователь из Recoil
    const showToast = useShowToast();
    const [school, setSchool] = useState(null);
    const [group, setGroup] = useState(null);
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // 1. Получаем группу пользователя
                if (user.groups && user.groups.length > 0) {
                    const groupId = user.groups[0]; // Предполагаем, что пользователь состоит в одной группе
                    const resGroup = await fetch(`/api/schools/group/${groupId}`);
                    const dataGroup = await resGroup.json();

                    if (dataGroup.error) {
                        showToast("Ошибка", dataGroup.error, "error");
                        return;
                    }
                    setGroup(dataGroup);

                    // 2. Получаем школу, связанную с группой
                    const resSchool = await fetch(`/api/schools/school/${dataGroup.schoolId}`);
                    const dataSchool = await resSchool.json();

                    if (dataSchool.error) {
                        showToast("Ошибка", dataSchool.error, "error");
                        return;
                    }
                    setSchool(dataSchool);

                    // 3. Получаем мероприятия группы
                    const resEvents = await fetch(`/api/events/group/${groupId}`);
                    const dataEvents = await resEvents.json();

                    if (dataEvents.error) {
                        showToast("Ошибка", dataEvents.error, "error");
                        return;
                    }

                    setEvents(dataEvents);
                } else {
                    showToast("Информация", "Пользователь не состоит в группах", "info");
                }
            } catch (error) {
                showToast("Ошибка", "Не удалось загрузить данные профиля", "error");
                console.error(error);
            }
        };

        if (user) {
            fetchUserData();
        }
    }, [user, showToast]);

    // Обработчик клика по карточке мероприятия
    const handleEventClick = (eventId) => {
        navigate(`/event/${eventId}`);
    };

    return (<Box p={6} maxW="800px" mx="auto">
        <Box mb={6}>
            <Heading size="md" mb={2}>Школа</Heading>
            {school ? (<Text fontSize="md">{school.title}</Text>) : (
                <Text fontSize="md" color="gray.500">Школа не указана</Text>)}
        </Box>

        <Box mb={6}>
            <Heading size="md" mb={2}>Группа</Heading>
            {group ? (<Text fontSize="md">{group.title}</Text>) : (
                <Text fontSize="md" color="gray.500">Группа не указана</Text>)}
        </Box>

        <Box>
            <Heading size="md" mb={2}>Мероприятия группы</Heading>
            {events.length > 0 ? (<List.Root spacing={3} style={{listStyle: "none"}}>
                {events.map((event) => (<List.Item
                    key={event._id}
                    p={4}
                    mb={"10px"}
                    borderWidth="1px"
                    borderRadius="md"
                    onClick={() => handleEventClick(event._id)} // Переход на страницу мероприятия
                >
                    <Flex justifyContent="space-between">
                        <Box>
                            <Text fontWeight="bold">{event.name}</Text>
                            <Text fontSize="sm">{event.description}</Text>
                            <Text fontSize="sm" color="gray.500">
                                Дата: {new Date(event.Date).toLocaleDateString()} | Время: {event.Time}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                                Адрес: {event.address || "Не указан"}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                                Статус: {event.status.name === "mandatory" ? "обязательное" : "необязательное"}
                            </Text>
                        </Box>
                    </Flex>
                </List.Item>))}
            </List.Root>) : (<Text fontSize="md" color="gray.500">Мероприятия отсутствуют</Text>)}
        </Box>
    </Box>);
};