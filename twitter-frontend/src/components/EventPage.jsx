import {Box, Button, Flex, Image, Spinner, Text} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import useShowToast from "../hooks/useShowToast.js";
import {Cell, Legend, Pie, PieChart, Tooltip} from "recharts";
import {useRecoilValue} from "recoil";
import userAtom from "../atoms/userAtom.js";

export const EventPage = () => {
    const {eventId} = useParams();
    const navigate = useNavigate();
    const showToast = useShowToast();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [scriptElement, setScriptElement] = useState(null);
    const [chartData, setChartData] = useState(null);
    const {role} = useRecoilValue(userAtom);

    // Цвета для круговой диаграммы
    const COLORS = ["#8884d8", "#ff4d4f"];

    useEffect(() => {
        if (event && event.address && !mapLoaded) {
            const loadYandexMap = () => {
                if (window.ymaps) {
                    initMap();
                    return;
                }
                const script = document.createElement("script");
                script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=3250a4d0-877c-45ba-8aba-45b1f9d82852";
                script.async = true;
                script.onload = () => {
                    window.ymaps.ready(initMap);
                };
                script.onerror = () => {
                    showToast("Ошибка", "Не удалось загрузить Яндекс.Карты", "error");
                };
                document.body.appendChild(script);
                setScriptElement(script);

                function initMap() {
                    try {
                        const fullAddress = event.address.includes("Екатеринбург") ? event.address : `Екатеринбург, ${event.address}`;
                        window.ymaps.geocode(fullAddress, {results: 1}).then((res) => {
                            const firstGeoObject = res.geoObjects.get(0);
                            if (!firstGeoObject) {
                                showToast("Ошибка", "Не удалось найти адрес на карте", "error");
                                console.log('e')
                                return;
                            }
                            const coords = firstGeoObject.geometry.getCoordinates();
                            const map = new window.ymaps.Map("map", {
                                center: coords,
                                zoom: 15
                            });
                            const placemark = new window.ymaps.Placemark(coords, {
                                balloonContent: event.name,
                            });
                            map.geoObjects.add(placemark);
                            setMapLoaded(true);
                        }).catch(() => {
                            console.log('error', event);
                            showToast("Ошибка", "Не удалось определить координаты адреса", "error");
                        });
                    } catch (error) {
                        showToast("Ошибка", "Не удалось инициализировать карту", "error");
                    }
                }
            };
            loadYandexMap();
        }
        return () => {
            if (scriptElement) {
                const script = document.querySelector(`script[src="${scriptElement.src}"]`);
                if (script) {
                    script.remove();
                }
            }
        };
    }, [event, mapLoaded, showToast]);

    // Fetch event details and mark as viewed
    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/events/${eventId}`);
                if (!res.ok) {
                    throw new Error("Ошибка при загрузке мероприятия");
                }
                const data = await res.json();

                if (data.error) {
                    showToast("Ошибка", data.error, "error");
                    return;
                }
                setEvent(data);

                const viewRes = await fetch(`/api/events/event/${eventId}/view`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (!viewRes.ok) {
                    throw new Error("Ошибка при отметке мероприятия как просмотренного");
                }
                const viewData = await viewRes.json();
                console.log("viewData", viewData)
                if (viewData.error) {
                    showToast("Ошибка", viewData.error, "error");
                }
            } catch (error) {
                showToast("Ошибка", error.message || "Не удалось загрузить мероприятие", "error");
                console.error("Fetch event error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId, showToast]);

    // Fetch user role and chart data
    useEffect(() => {
        const fetchChartData = async () => {
            try {
                // Если пользователь — учитель, получаем данные для диаграммы
                if (role === "teacher" && event) {
                    // Получаем группу, связанную с мероприятием
                    const groupRes = await fetch(`/api/events/${eventId}/group`);
                    if (!groupRes.ok) {
                        throw new Error("Ошибка при загрузке группы мероприятия");
                    }
                    const groupData = await groupRes.json();
                    console.log("groupData: ", groupData);
                    console.log("event", event)
                    // Подсчитываем пользователей
                    const totalGroupUsers = groupData.users?.length || 0;
                    const viewedUsers = event.viewUsers?.length || 0;
                    const notViewedUsers = totalGroupUsers - viewedUsers;
                    console.log("notViewedUsers", notViewedUsers)
                    // Формируем данные для круговой диаграммы
                    setChartData([
                        {name: "Просмотрели", value: viewedUsers},
                        {name: "Не просмотрели", value: notViewedUsers},
                    ]);
                }
            } catch (error) {
                console.error("Ошибка при загрузке данных для диаграммы:", error);
                showToast("Ошибка", "Не удалось загрузить данные для диаграммы", "error");
            }
        };
        console.log(event)
        if (event) {
            fetchChartData();
        }
    }, [event, showToast, eventId]);

    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    return (
        <Box p={4}>
            {loading ? (
                <Flex justify="center" align="center" minH="100vh">
                    <Spinner/>
                </Flex>
            ) : event ? (
                <Flex direction="column" gap={4} maxW="800px" mx="auto">
                    <Button
                        onClick={handleBack}
                        alignSelf="start"
                        mb={4}
                        colorScheme="blue"
                        variant="outline"
                    >
                        Назад
                    </Button>
                    <Text fontSize="2xl" fontWeight="bold">{event.name}</Text>
                    {event.img && (
                        <Image
                            src={event.img}
                            alt={event.name}
                            maxH="400px"
                            objectFit="cover"
                            borderRadius="md"
                        />
                    )}
                    <Text>{event.description}</Text>
                    <Text>
                        <strong>Дата:</strong> {new Date(event.Date).toLocaleDateString()}
                    </Text>
                    <Text>
                        <strong>Время:</strong> {event.Time}
                    </Text>
                    {event.price > 0 && (
                        <Text>
                            <strong>Стоимость:</strong> {event.price} руб.
                        </Text>
                    )}
                    {event.address && (
                        <Text>
                            <strong>Адрес:</strong> {event.address}
                        </Text>
                    )}
                    <Text>
                        <strong>Статус:</strong> {event.status?.name === "mandatory" ? "обязательно" : "по желанию"}
                    </Text>

                    {event.address && (
                        <Box id="map" width="100%" height="400px" mt={4}/>
                    )}

                    {/* Круговая диаграмма для учителей */}
                    {role === "teacher" && chartData && (
                        <Box mt={6}>
                            <Text fontSize="xl" fontWeight="bold" mb={4}>
                                Статистика просмотров мероприятия в группе
                            </Text>
                            <PieChart width={400} height={400}>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={150}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                    ))}
                                </Pie>
                                <Tooltip/>
                                <Legend/>
                            </PieChart>
                        </Box>
                    )}
                </Flex>
            ) : (
                <Text>Мероприятие не найдено</Text>
            )}
        </Box>
    );
};