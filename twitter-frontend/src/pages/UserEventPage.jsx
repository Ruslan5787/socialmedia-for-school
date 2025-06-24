import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useShowToast from "../hooks/useShowToast.js";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import { Avatar } from "@chakra-ui/avatar";

export const UserEventPage = () => {
    const { eventId } = useParams();
    const showToast = useShowToast();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [coordinates, setCoordinates] = useState([55.751244, 37.618423]); // Центр Москвы по умолчанию

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                // Получаем данные мероприятия
                const res = await fetch(`/api/events/${eventId}`);
                const data = await res.json();

                if (data.error) {
                    showToast("Ошибка", data.error, "error");
                    return;
                }

                setEvent(data);

                // Геокодирование адреса
                if (data.address) {
                    const geocodeRes = await fetch(
                        `https://geocode-maps.yandex.ru/1.x/?apikey=YOUR_YANDEX_API_KEY&format=json&geocode=${encodeURIComponent(data.address)}`
                    );
                    const geocodeData = await geocodeRes.json();
                    const coords = geocodeData.response.GeoObjectCollection.featureMember[0]?.GeoObject.Point.pos.split(" ");
                    if (coords) {
                        setCoordinates([parseFloat(coords[1]), parseFloat(coords[0])]); // [lat, lon]
                    }
                }

                // Отмечаем мероприятие как просмотренное
                const viewRes = await fetch(`/api/events/event/${eventId}/view`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });
                const viewData = await viewRes.json();

                if (viewData.error) {
                    showToast("Ошибка", viewData.error, "error");
                }
            } catch (error) {
                showToast("Ошибка", "Не удалось загрузить данные мероприятия", "error");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId, showToast]);

    if (loading) {
        return (
            <Box p={6} maxW="800px" mx="auto">
                <Text>Загрузка...</Text>
            </Box>
        );
    }

    if (!event) {
        return (
            <Box p={6} maxW="800px" mx="auto">
                <Text>Мероприятие не найдено</Text>
            </Box>
        );
    }

    return (
        <Box p={6} maxW="800px" mx="auto">
            <Button mb={4} onClick={() => navigate(-1)}>
                Назад
            </Button>
            <Heading size="lg" mb={4}>{event.name}</Heading>
            <Flex direction="column" gap={4}>
                <Box>
                    <Text fontWeight="bold">Описание:</Text>
                    <Text>{event.description}</Text>
                </Box>
                <Box>
                    <Text fontWeight="bold">Дата:</Text>
                    <Text>{new Date(event.Date).toLocaleDateString()}</Text>
                </Box>
                <Box>
                    <Text fontWeight="bold">Время:</Text>
                    <Text>{event.Time}</Text>
                </Box>
                <Box>
                    <Text fontWeight="bold">Адрес:</Text>
                    <Text>{event.address || "Не указан"}</Text>
                </Box>
                <Box>
                    <Text fontWeight="bold">Статус:</Text>
                    <Text>{event.status.name === "mandatory" ? "Обязательное" : "Необязательное"}</Text>
                </Box>
                <Box>
                    <Text fontWeight="bold">Цена:</Text>
                    <Text>{event.price ? `${event.price} руб.` : "Бесплатно"}</Text>
                </Box>
                {event.img && (
                    <Box>
                        <Text fontWeight="bold">Изображение:</Text>
                        <Avatar src={event.img} size="2xl" />
                    </Box>
                )}
                {event.address && (
                    <Box>
                        <Text fontWeight="bold" mb={2}>Место проведения:</Text>
                        <YMaps>
                            <Map
                                defaultState={{
                                    center: coordinates,
                                    zoom: 15,
                                }}
                                width="100%"
                                height="400px"
                            >
                                <Placemark
                                    geometry={coordinates}
                                    properties={{ hintContent: event.address }}
                                />
                            </Map>
                        </YMaps>
                    </Box>
                )}
            </Flex>
        </Box>
    );
};