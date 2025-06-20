import React, {useEffect, useRef, useState} from "react";
import UserHeader from "./UserHeader";
import {UserPost} from "../components/UserPost";
import {Toaster} from "../components/ui/toaster.jsx";
import {useColorMode} from "../components/ui/color-mode.jsx";
import {
    Box,
    Button,
    CloseButton,
    Dialog,
    Flex,
    Image,
    Input,
    Portal,
    Text,
    Textarea,
    useDialog
} from "@chakra-ui/react";
import {useParams} from "react-router-dom";
import useShowToast from "../hooks/useShowToast.js";
import {IoMdAddCircleOutline} from "react-icons/io";
import {BsFillImageFill} from "react-icons/bs";
import {useChangeUserAvatar} from "../hooks/useChangeUserAvatar.js";
import {useRecoilValue} from "recoil";
import userAtom from "../atoms/userAtom.js";
import CreatePost from "../components/CreatePost.jsx";

const MAX_CHAR = 500;

export const UserPage = () => {
    const [isPostCreated, setIsPostCreated] = useState(0)

    const userMain = useRecoilValue(userAtom);
    const [user, setUser] = useState(null);
    const {username} = useParams();
    const showToast = useShowToast();
    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState([])
    const [postsCount, setPostsCount] = useState(0)
    const [postText, setPostText] = useState("");
    const fileRef = useRef(null);
    const {handleImageChange, urlAvatar, setUrlImage} = useChangeUserAvatar();
    const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
    const [isOpen, setIsOpen] = useState(false);
    const dialog = useDialog({open: isOpen, setOpenChange: setIsOpen});
    const backgroung = useColorMode("gray.300", "gray.dark")

    const handleTextChange = (e) => {
        const inputText = e.target.value;

        if (inputText.length > MAX_CHAR) {
            const truncatedText = inputText.slice(0, MAX_CHAR);
            setPostText(truncatedText);
            setRemainingChar(0);
        } else {
            setPostText(inputText);
            setRemainingChar(MAX_CHAR - inputText.length);
        }
    };

    const handlePushPost = async () => {
        try {
            setIsLoading(true);

            const res = await fetch("/api/posts/create/", {
                method: "POST", headers: {"Content-type": "application/json"}, body: JSON.stringify({
                    postedBy: user._id, text: postText, img: urlAvatar,
                }),
            });

            const data = await res.json();
            if (data.error) {
                throw Error(data.error);
            }

            setIsOpen(false);
            setPostText("")
            showToast("Уведомления", "Пост создан успешно", "success");
            setIsLoading(false);
            setIsPostCreated((prev) => prev + 1)
        } catch (error) {
            showToast("Ошибка", error.message, "error");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await fetch(`/api/users/profile/${username}`);

                const userData = await userResponse.json();
                if (userData.error) {
                    showToast("Error", userData.error, "error");
                }
                setUser(userData);
                console.log("user data", userData);
                const postsResponse = await fetch(`/api/posts/user/${userData.username}`);
                const postsData = await postsResponse.json();

                if (postsData.error) {
                    showToast("Error", postsData.error, "error");
                }
                setPosts(postsData);
                setPostsCount(postsData.length);
            } catch (error) {
                showToast("Error", error, "error");
            }
            setIsLoading(false)
        }

        fetchData()
    }, [username, isPostCreated, postsCount, isPostCreated, showToast]);

    if (!user && isLoading) {
        return <Flex m={"20px 0 0 0"} justifyContent={"center"}>
            {/*<Spinner></Spinner>*/}
        </Flex>
    }

    if (user.error && !isLoading) {
        return <h1>Пользователь не найден</h1>
    }

    return (
        <Flex flexDirection={"column"}>
            {user && <CreatePost setIsPostCreated={setIsPostCreated} />}
            <Toaster/>
            <UserHeader user={user}/>

            {posts.length === 0 && username !== userMain?.username && (
                <Box textAlign="center">
                    <Text>У пользователя пока что нет постов</Text>
                </Box>
            )}

            <Flex flexDirection={"column"} gap={2}>
                {posts.length === 0 && username === userMain?.username && (
                    <Box mt={4} textAlign={"center"}>
                        <Text mb={7}>У вас пока нет постов. Вы можете их создать.</Text>
                        <Dialog.RootProvider size="sm" placement="center" motionPreset="slide-in-bottom" value={dialog}>
                            <Dialog.Trigger asChild>
                                <Button
                                    textAlight={"center"}
                                    onClick={() => setIsOpen(true)}
                                    variant="outline"
                                    size="xl"
                                    bg={backgroung}
                                    isLoading={isLoading}
                                >
                                    <IoMdAddCircleOutline/> Создать пост
                                </Button>
                            </Dialog.Trigger>
                            <Portal>
                                <Dialog.Backdrop/>
                                <Dialog.Positioner>
                                    <Dialog.Content>
                                        <Dialog.Header>
                                            <Dialog.Title>Создание поста</Dialog.Title>
                                            <Dialog.CloseTrigger asChild>
                                                <CloseButton onClick={() => setIsOpen(false)} size="xl"/>
                                            </Dialog.CloseTrigger>
                                        </Dialog.Header>
                                        <Dialog.Body>
                                            <>
                                                <Textarea
                                                    margin="0 0 10px 0"
                                                    height="200px"
                                                    resize="none"
                                                    placeholder="Напишите текст для поста"
                                                    value={postText}
                                                    onChange={handleTextChange}
                                                />
                                                <Flex justifyContent="space-between" textAlign="right" m="0 0 20px 0">
                                                    <Input
                                                        type="file"
                                                        hidden
                                                        ref={fileRef}
                                                        onChange={handleImageChange}
                                                    />

                                                    <BsFillImageFill
                                                        m={"0 0 30px 0"}
                                                        size={18}
                                                        onClick={() => fileRef.current.click()}
                                                        cursor="pointer"
                                                    />
                                                    <Text>
                                                        {remainingChar}/{MAX_CHAR}
                                                    </Text>
                                                </Flex>
                                                <Button onClick={handlePushPost}
                                                        loading={isLoading}>Опубликовать</Button>
                                                {urlAvatar && (<Flex mt={5} w={"full"} position={"relative"}>
                                                    <Image src={urlAvatar} alt="Ваше изображение"/>
                                                    <CloseButton
                                                        variant="solid"
                                                        position="absolute"
                                                        right={0}
                                                        t={0}
                                                        onClick={() => {
                                                            setUrlImage("");
                                                        }}
                                                    />
                                                </Flex>)}
                                            </>
                                        </Dialog.Body>
                                    </Dialog.Content>
                                </Dialog.Positioner>
                            </Portal>
                        </Dialog.RootProvider>
                    </Box>
                )}

                {posts.length > 0 && posts.map((post) => (
                    <UserPost key={post._id} postAuthor={user} postId={post._id} userAvatar={user?.profilePic}
                              setPostsCount={setPostsCount}/>
                ))}
            </Flex>
        </Flex>
    )
}
