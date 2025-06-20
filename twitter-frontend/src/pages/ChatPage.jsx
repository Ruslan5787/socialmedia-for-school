import {v4 as uuidv4} from "uuid";
import {useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import useShowToast from "../hooks/useShowToast.js";
import {socket} from "../../socket.js";
import {useRecoilValue} from "recoil";
import userAtom from "../atoms/userAtom.js";
import {Avatar, Box, Button, Flex, Input, Separator, Text} from "@chakra-ui/react";
import {Toaster} from "../components/ui/toaster.jsx";
import {UsersListForCorrespondence} from "../components/UsersListForCorrespondence.jsx";
import {MdOutlineMessage} from "react-icons/md";
import {IoCheckmarkDone, IoSend} from "react-icons/io5";
import {FormControl} from "@chakra-ui/form-control";


const ChatPage = () => {
    const showToaster = useShowToast();
    const mainUser = useRecoilValue(userAtom);
    const {recipientId, } = useParams(); // Поддержка recipientId и room._id
    const [messageValue, setMessageValue] = useState("");
    const [room, setRoom] = useState(null);
    const [recipient, setRecipient] = useState(null);
    const [messages, setMessages] = useState([]);
    const lastMessageRef = useRef(null);

    const fetchRoomAndMessages = async () => {
        try {
            if (room._id) {
                const resRoom = await fetch(`/api/rooms/room/${room._id}`);
                const dataRoom = await resRoom.json();

                if (dataRoom.error || !dataRoom.users.includes(mainUser._id)) {
                    // showToaster("Ошибка", dataRoom.error || "Вы не участник этой комнаты", "error");
                    return;
                }

                setRoom(dataRoom);
                setRecipient({ username: dataRoom.title, profilePic: null });
                setMessages(dataRoom.messages || []);
            } else if (recipientId) {
                if (recipientId === mainUser._id) {
                    // showToaster("Ошибка", "Нельзя начать чат с самим собой", "error");
                    return;
                }

                const resUser = await fetch(`/api/users/profile/${recipientId}`);
                const dataUser = await resUser.json();

                if (dataUser.error) {
                    // showToaster("Ошибка", dataUser.error, "error");
                    return;
                }

                setRecipient(dataUser);

                const resRoom = await fetch(`/api/rooms/${recipientId}`);
                const dataRoom = await resRoom.json();

                if (dataRoom.error) {
                    // showToaster("Ошибка", dataRoom.error, "error");
                    return;
                }
                console.log("dataRoom: ", dataRoom)

                if (dataRoom?.data !== null) {
                    setRoom(dataRoom);
                    setMessages(dataRoom.messages || []);
                } else {
                    const resRoom = await fetch(`/api/rooms/createRoom`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ recipientId }),
                    });

                    const newRoom = await resRoom.json();

                    if (newRoom.error) {
                        // showToaster("Ошибка", newRoom.error, "error");
                        return;
                    }

                    setRoom(newRoom);
                    setMessages([]);
                }
            }
        } catch (error) {
            // showToaster("Ошибка", error.message, "error");
        }
    };

    const handleSendMessage = async () => {
        try {
            if (!messageValue.trim()) {
                // showToaster("Ошибка", "Введите текст для сообщения", "error");
                return;
            }

            if (!room) {
                // showToaster("Ошибка", "Комната не создана", "error");
                return;
            }

            const newMessage = {
                senderBy: mainUser._id,
                text: messageValue,
                img: "",
                roomId: room._id,
                _id: uuidv4(),
                createdAt: new Date(),
            };

            // Отправка через HTTP
            const resMessage = await fetch(`/api/rooms/sendMessage`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(newMessage),
            });

            const dataMessage = await resMessage.json();

            if (dataMessage.error) {
                // showToaster("Ошибка", dataMessage.error, "error");
                return;
            }

            // Обновляем _id с сервера
            const updatedMessage = {...newMessage, _id: dataMessage._id || newMessage._id};

            // Добавляем сообщение локально только если его еще нет
            setMessages((prev) => {
                if (!prev.some((msg) => msg._id === updatedMessage._id)) {
                    return [...prev, updatedMessage];
                }
                return prev;
            });

            socket.emit("send_message", updatedMessage);
            setMessageValue("");
        } catch (error) {
            // showToaster("Ошибка", error.message, "error");
        }
    };

    useEffect(() => {
        if (recipientId || room._id) {
            fetchRoomAndMessages().then(() => {
                console.log(recipientId, room?._id)
                if (room?._id) {
                    socket.emit("join_room", room._id);
                    console.log(`Joined room ${room._id}`); // Для отладки
                }
            });
        }

        console.log(recipientId, room?._id)
        // Очистка при смене комнаты или размонтировании
        return () => {
            if (room?._id) {
                socket.emit("leave_room", room._id); // Предполагается, что сервер поддерживает leave_room
                console.log(`Left room ${room._id}`);
            }
        };
    }, [recipientId, room?._id]);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Socket.IO connected");
        });

        socket.on("connect_error", (err) => {
            console.error("Socket.IO connection error:", err.message);
        });

        return () => {
            socket.off("connect");
            socket.off("connect_error");
        };
    }, []);

    useEffect(() => {
        const handleMessageResponse = (message) => {
            if (message.room._id === room?._id) {
                setMessages((prev) => {
                    // Проверяем, нет ли сообщения с таким _id
                    if (!prev.some((msg) => msg._id === message._id)) {
                        console.log("New message received:", message); // Для отладки
                        return [...prev, message];
                    }
                    return prev;
                });
            }
        };

        socket.on("message_from", handleMessageResponse);

        return () => {
            socket.off("message_from", handleMessageResponse);
        };
    }, [room?._id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (lastMessageRef.current) {
                lastMessageRef.current.scrollIntoView({behavior: "smooth"});
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [messages]);

    return (<Flex justifyContent={"space-between"} flexDirection={{base: "column", md: "row"}} w={"full"}>
        <Toaster/>

        <UsersListForCorrespondence/>

        {!(recipientId || room._id) && (
            <Flex mt={"80px"} flexDirection={"column"} justifyContent={"center"} alignItems="center" gap={2}>
                <Text fontSize="20px">Можете кому-нибудь написать</Text>
                <MdOutlineMessage size={70}/>
            </Flex>)}

        {(recipientId || room._id) && (<Flex
            borderRadius={"10px"}
            p={"20px 10px"}
            flexDirection={"column"}
            flex="1 0 0"
            background={"gray.500"}
            w={"full"}
            h={"full"}
        >
            <Flex textAlign={"left"} alignItems={"center"}>
                <Avatar.Root mr={3}>
                    <Avatar.Fallback/>
                    <Avatar.Image src={recipient?.profilePic}/>
                </Avatar.Root>
                <Text color={"base.dark"} fontWeight={"bold"}>
                    {recipient?.username}
                </Text>
            </Flex>
            <Separator m={"15px 0"}/>
            <Flex h={"450px"} flexDirection={"column"}>
                <Flex h={"full"} flex={"1 1 auto"} flexDirection={"column"} overflow={"auto"}>
                    {messages.length > 0 && messages.map((message, index) => (<Box
                        key={message._id}
                        p={"10px 10px"}
                        css={{scrollBehavior: "smooth"}}
                        ref={index === messages.length - 1 ? lastMessageRef : null}
                        alignSelf={mainUser?._id === message.senderBy ? "flex-end" : "flex-start"}
                        mb={4}
                        margin={mainUser?._id === message.senderBy ? "0 0 15px 50px" : "0 50px 15px 0"}
                        background={mainUser?._id === message.senderBy ? "white" : "#ccc"}
                    >
                        {message.text}
                        <IoCheckmarkDone size={15} color={message.seen ? "blue" : "black"}/>
                    </Box>))}
                </Flex>

                <FormControl mb={2} alignContent={"flex-end"} onSubmit={() => console.log("e")}>
                    <Flex>
                        <Input
                            value={messageValue}
                            onChange={(event) => setMessageValue(event.target.value)}
                            placeholder="Сообщение"
                        />
                        <Button onClick={handleSendMessage}>
                            <IoSend/>
                        </Button>
                    </Flex>
                </FormControl>
            </Flex>
        </Flex>)}
    </Flex>);

}

export default ChatPage;