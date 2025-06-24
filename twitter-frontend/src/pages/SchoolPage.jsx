import React, {useEffect, useRef, useState} from "react";
import useShowToast from "../hooks/useShowToast.js";
import {useNavigate, useParams} from "react-router-dom";
import {Box, Button, Flex, Spinner, Tabs, Text} from "@chakra-ui/react";
import CreateGroup from "../components/CreateGroup.jsx";
import {CreateEvents} from "./CreateEvents.jsx";
import CreateUser from "../components/CreateUser.jsx";
import {StudentsPage} from "./StudentsPage.jsx";
import {EventsPage} from "./EventsPage.jsx";

export function SchoolPage() {
    const [school, setSchool] = useState(null);
    const [groups, setGroups] = useState(null);
    const showToast = useShowToast();
    const {id} = useParams();
    const navigate = useNavigate();
    const tabGroupRef = useRef(null);
    const [groupUsers, setGroupUsers] = useState([]);
    const [groupEvents, setGroupEvents] = useState([]);
    const [selectedTab, setSelectedTab] = useState("students"); // Вкладка для переключения между учениками и мероприятиями
    const [activeTab, setActiveTab] = useState(null);
    const [isLoading, setIsLoading] = useState(true)

    // Загрузка данных школы
    useEffect(() => {
        const fetchSchool = async () => {
            setIsLoading(true)
            try {
                const res = await fetch(`/api/schools/school/${id}`, {
                    headers: {"Cache-Control": "no-cache"},
                });
                const data = await res.json();
                if (data.error) {
                    showToast("Ошибка", data.error, "error");
                    navigate("/groups");
                    return;
                }
                setSchool(data);
                setIsLoading(false)
            } catch (error) {
                showToast("Ошибка", "Не удалось загрузить данные школы", "error");
                navigate("/groups");
            }
        };
        fetchSchool();
    }, [id, showToast, navigate]);

    // Загрузка групп для текущей школы
    useEffect(() => {
        if (school) {
            const fetchGroups = async () => {
                try {
                    const res = await fetch(`/api/schools/groups?schoolId=${school._id}`, {
                        headers: {"Cache-Control": "no-cache"},
                    });
                    const data = await res.json();
                    if (data.error) {
                        showToast("Ошибка", data.error, "error");
                        setGroups([]);
                        return;
                    }
                    setGroups(data);
                    // Синхронизация activeTab
                    if (data.length > 0) {
                        if (!activeTab || !data.find((g) => g._id === activeTab)) {
                            setActiveTab(data[0]._id); // Устанавливаем первую группу
                        }
                    } else {
                        setActiveTab(null);
                    }
                } catch (error) {
                    showToast("Ошибка", "Не удалось загрузить группы", "error");
                    console.error("Error", error);
                    setGroups([]);
                    setActiveTab(null);
                }
            };
            fetchGroups();
        }
    }, [school, showToast, activeTab]);

    if (isLoading) {
        return <Flex m={"20px 0 0 0"} justifyContent={"center"}>
            <Spinner></Spinner>
        </Flex>
    }

    return (
        <Box p={4}>
            <Flex gap={3} mb={4} align="center">
                <Button onClick={() => navigate(`/groups`)}>Назад</Button>
                <Text textStyle={"4xl"}>{school?.title || "Загрузка..."}</Text>
            </Flex>

            <Flex gap={2} direction={"column"}>
                <CreateGroup schoolId={school?._id} setGroups={setGroups} setActiveTab={setActiveTab}/>
                <CreateUser
                    groupUsers={groupUsers}
                    setGroupUsers={setGroupUsers}
                    activeGroupId={groups?.find((group) => group._id === activeTab)?._id}
                    isDisabled={groups?.length === 0}
                    activeTab={activeTab}
                />
                <CreateEvents
                    setGroupUsers={setGroupUsers}
                    tabGroupRef={tabGroupRef}
                    isDisabled={groups?.length === 0}
                    activeTab={activeTab}
                    groupEvents={groupEvents}
                    setGroupEvents={setGroupEvents}
                />
            </Flex>

            <Tabs.Root
                value={selectedTab}
                onValueChange={({value}) => {
                    setSelectedTab(value);
                }}
                mb={4}
            >
                <Tabs.List>
                    <Tabs.Trigger value="students">Ученики</Tabs.Trigger>
                    <Tabs.Trigger value="events">Мероприятия</Tabs.Trigger>
                </Tabs.List>

                <Box>
                    <Tabs.Content value="students">
                        <StudentsPage
                            setActiveTab={setActiveTab}
                            tabGroupRef={tabGroupRef}
                            activeTab={activeTab}
                            groups={groups}
                            groupUsers={groupUsers}
                            setGroupUsers={setGroupUsers}
                        />
                    </Tabs.Content>
                    <Tabs.Content value="events">
                        <EventsPage
                            groupEvents={groupEvents}
                            setGroupEvents={setGroupEvents}
                            setActiveTab={setActiveTab}
                            tabGroupRef={tabGroupRef}
                            activeTab={activeTab}
                            groups={groups}
                        />
                    </Tabs.Content>
                </Box>
            </Tabs.Root>
        </Box>
    );
}