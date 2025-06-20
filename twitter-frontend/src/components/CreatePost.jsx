import React, {useRef, useState} from "react";
import {useColorMode} from "./ui/color-mode.jsx";
import {Button, CloseButton, Dialog, Flex, Image, Input, Portal, Text, Textarea, useDialog} from "@chakra-ui/react";
import {IoMdAddCircleOutline} from "react-icons/io";
import {useChangeUserAvatar} from "../hooks/useChangeUserAvatar.js";
import {BsFillImageFill} from "react-icons/bs";
import {useRecoilValue} from "recoil";
import userAtom from "../atoms/userAtom.js";
import useShowToast from "../hooks/useShowToast.js";
import {Toaster} from "./ui/toaster.jsx";

const MAX_CHAR = 500;

const CreatePost = ({setIsPostCreated}) => {
    const showToast = useShowToast();
    const [postText, setPostText] = useState("");
    const fileRef = useRef(null);
    const {handleImageChange, urlAvatar, setUrlImage} = useChangeUserAvatar();
    const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
    const user = useRecoilValue(userAtom);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dialog = useDialog({open: isOpen, setOpenChange: setIsOpen});

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

    return (<>
        <Toaster/>
        <Dialog.RootProvider size="sm" placement="center" motionPreset="slide-in-bottom" value={dialog}>
            <Dialog.Trigger asChild>
                <Button
                    onClick={() => setIsOpen(true)}
                    variant="outline"
                    size="xl"
                    position={"fixed"}
                    bottom={10}
                    right={10}
                    bg={useColorMode("gray.300", "gray.dark")}
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
                                <Button onClick={handlePushPost} loading={isLoading}>Опубликовать</Button>
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
    </>);
};

export default CreatePost;
