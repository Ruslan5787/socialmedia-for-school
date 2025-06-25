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
import {useColorMode} from "../components/ui/color-mode.jsx";

const ChatPage = () => {
    const {colorMode, toggleColorMode} = useColorMode();
    const showToaster = useShowToast();
    const mainUser = useRecoilValue(userAtom);
    const {recipientId, roomId} = useParams(); // Добавляем roomId
    const [messageValue, setMessageValue] = useState("");
    const [room, setRoom] = useState(null);
    const [recipient, setRecipient] = useState(null);
    const [messages, setMessages] = useState([]);
    const lastMessageRef = useRef(null);

    const fetchRoomAndMessages = async () => {
        try {
            if (roomId) {
                // Для группового чата
                const resRoom = await fetch(`/api/rooms/room/${roomId}`);
                const dataRoom = await resRoom.json();
                if (dataRoom.error) {
                    showToaster("Ошибка", dataRoom.error, "error");
                    return;
                }
                setRoom(dataRoom);
                setMessages(dataRoom.messages || []);
                setRecipient({username: dataRoom.title || "Групповой чат", profilePic: ""});
            } else if (recipientId) {
                // Для личного чата
                if (recipientId === mainUser._id) {
                    showToaster("Ошибка", "Нельзя начать чат с самим собой", "error");
                    return;
                }

                const resUser = await fetch(`/api/users/profile/${recipientId}`);
                const dataUser = await resUser.json();
                if (dataUser.error) {
                    showToaster("Ошибка", dataUser.error, "error");
                    return;
                }
                setRecipient(dataUser);

                const resRoom = await fetch(`/api/rooms/${recipientId}`);
                const dataRoom = await resRoom.json();
                if (dataRoom.error) {
                    showToaster("Ошибка", dataRoom.error, "error");
                    return;
                }

                if (dataRoom.data !== null) {
                    setRoom(dataRoom);
                    setMessages(dataRoom.messages || []);
                } else {
                    const resCreateRoom = await fetch(`/api/rooms/createRoom`, {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({recipientId}),
                    });
                    const newRoom = await resCreateRoom.json();
                    if (newRoom.error) {
                        showToaster("Ошибка", newRoom.error, "error");
                        return;
                    }
                    setRoom(newRoom);
                    setMessages([]);
                }
            } else {
                console.log("Ошибка", "ID получателя или чата не указан", "error");
            }
        } catch (error) {
            console.error("fetchRoomAndMessages error:", error);
            showToaster("Ошибка", "Не удалось загрузить чат", "error");
        }
    };

    const handleSendMessage = async () => {
        try {
            if (!messageValue.trim()) {
                showToaster("Ошибка", "Введите текст для сообщения", "error");
                return;
            }

            if (!room?._id) {
                showToaster("Ошибка", "Комната не создана", "error");
                return;
            }

            if (!mainUser?._id) {
                showToaster("Ошибка", "Пользователь не авторизован", "error");
                return;
            }

            const newMessage = {
                senderBy: {_id: mainUser._id}, // Убедитесь, что senderBy — объект
                text: messageValue,
                img: "",
                roomId: room._id,
                _id: uuidv4(),
                createdAt: new Date(),
            };

            const resMessage = await fetch(`/api/rooms/sendMessage`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(newMessage),
            });

            const dataMessage = await resMessage.json();
            if (dataMessage.error) {
                showToaster("Ошибка", dataMessage.error, "error");
                return;
            }

            const updatedMessage = {...newMessage, _id: dataMessage._id || newMessage._id};
            setMessages((prev) => {
                if (!prev.some((msg) => msg._id === updatedMessage._id)) {
                    return [...prev, updatedMessage];
                }
                return prev;
            });

            socket.emit("send_message", updatedMessage);
            setMessageValue("");
        } catch (error) {
            console.error("handleSendMessage error:", error);
            showToaster("Ошибка", "Не удалось отправить сообщение", "error");
        }
    };

    useEffect(() => {
        fetchRoomAndMessages();
    }, [recipientId, roomId]);

    useEffect(() => {
        if (room?._id) {
            socket.emit("join_room", room._id);
            console.log(`Joined room ${room._id}`);
        }

        return () => {
            if (room?._id) {
                socket.emit("leave_room", room._id);
                console.log(`Left room ${room._id}`);
            }
        };
    }, [room?._id]);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Socket.IO connected, socket ID:", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.error("Socket.IO connection error:", err.message, err);
        });

        return () => {
            socket.off("connect");
            socket.off("connect_error");
        };
    }, []);

    useEffect(() => {
        const handleMessageResponse = (message) => {
            if (message.roomId.toString() === room?._id.toString()) {
                setMessages((prev) => {
                    if (!prev.some((msg) => msg._id === message._id)) {
                        console.log("New message received:", message);
                        return [...prev, message];
                    }
                    return prev;
                });
            }
        };

        socket.on("message_from", (message) => {
            console.log("Received message_from:", message);
            handleMessageResponse(message);
        });

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

    return (<Flex
        justifyContent={"space-between"}
        mb={{base: "15px", md: "0"}}
        flexDirection={{base: "column", md: "row"}}
        w={"full"}
    >
        <Toaster/>

        <Box>
            <UsersListForCorrespondence/>
        </Box>

        {!(recipientId || roomId) && (
            <Flex mt={"80px"} flexDirection={"column"} justifyContent={"center"} alignItems="center" gap={2}>
                <Text fontSize="20px" textAlign={"center"}>Можете кому-нибудь написать</Text>
                <MdOutlineMessage size={70}/>
            </Flex>)}

        {(recipientId || roomId) && room?._id && (<Flex
            borderRadius={"10px"}
            p={"15px 10px"}
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
                <Flex pr={"10px"} h={"full"} flex={"1 1 auto"} flexDirection={"column"} overflow={"auto"}>
                    {messages.length > 0 && messages.map((message, index) => {
                        console.log("mainUser:", mainUser?._id, "message.senderBy:", message.senderBy);
                        console.log("Messages array:", messages);

                        const isOwnMessage = mainUser?._id && message.senderBy?._id
                            ? mainUser._id.toString() === message.senderBy._id.toString()
                            : false;

                        return (
                            <Box
                                borderRadius={"10px"}
                                key={message._id}
                                p={"10px 10px"}
                                ref={index === messages.length - 1 ? lastMessageRef : null}
                                mb={4}
                                alignSelf={isOwnMessage ? "flex-end" : "flex-start"}
                                margin={isOwnMessage ? "0 0 15px 50px" : "0 50px 15px 0"}
                                background={isOwnMessage ? (colorMode === "dark" ? "black" : "white") : (colorMode === "light" ? "white" : "black")}
                            >
                                {message.text || "Сообщение отсутствует"}
                                <IoCheckmarkDone size={15} color={message.seen ? "blue" : "black"}/>
                            </Box>
                        );
                    })}
                </Flex>

                <FormControl mb={2} alignContent={"flex-end"} onSubmit={(e) => e.preventDefault()}>
                    <Flex>
                        <Input
                            value={messageValue}
                            border={"none"}
                            background={colorMode === "dark" ? "black" : "white"}
                            onChange={(event) => setMessageValue(event.target.value)}
                            placeholder="Введите сообщение..."
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        />
                        <Button onClick={handleSendMessage}>
                            <IoSend/>
                        </Button>
                    </Flex>
                </FormControl>
            </Flex>
        </Flex>)}
    </Flex>);
};

export default ChatPage;