import {Button, CloseButton, Dialog, Flex, Input, Portal, useDialog} from '@chakra-ui/react';
import React, {useState} from 'react'
import useShowToast from "../hooks/useShowToast.js";

export const Actions = ({liked, setLiked, postId, countLikes, setCountLikes, setCountReplies}) => {
    const showToast = useShowToast();
    const [isOpen, setIsOpen] = useState(false);
    const dialog = useDialog({open: isOpen, setOpenChange: setIsOpen});
    const [comment, setComment] = useState('');

    const handleForLike = async () => {
        const res = await fetch(`/api/posts/like/${postId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });
        const data = await res.json();

        console.log('like')

        showToast("Успех", data.message, "success");
    }

    const handleForComment = async () => {
        try {
            const res = await fetch(`/api/posts/reply/${postId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        text: comment,
                    })
                })
            const data = await res.json();

            if (data.error) {
                showToast("Ошибка", data.error, "error")
                return;
            }


            showToast("Уведомление", "Комментарий создан", "success");
            setIsOpen(false);
            setComment('');
        } catch (e) {
            showToast("Ошибка", e.message, "error");
        }
    }

    return (
        <Flex gap={3}>
            <svg
                cursor="pointer"
                aria-label="Лайкать"
                color={liked ? "rgb(237, 73, 86)" : ""}
                fill={liked ? "rgb(237, 73, 86)" : "transparent"}
                height="19"
                role="img"
                viewBox="0 0 24 22"
                width="20"
                onClick={() => {
                    handleForLike()
                    setLiked(!liked)
                    if (liked) {
                        setCountLikes(countLikes - 1)
                    } else if (!liked) {
                        setCountLikes(countLikes + 1)
                    }
                }}
            >
                <title>Лайкнуть</title>
                <path
                    d="M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z"
                    stroke="currentColor"
                    strokeWidth="2"
                ></path>
            </svg>

            <Dialog.RootProvider value={dialog} closeOnInteractOutside>
                <Portal>
                    <Dialog.Backdrop/>
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>Введите комментарий</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Input onChange={(event) => setComment(event.target.value)} value={comment}
                                       placeholder={"Текст вашего комментария"} w={"full"}/>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button onClick={() => setIsOpen(false)} variant="outline">Отменить</Button>
                                </Dialog.ActionTrigger>
                                <Dialog.ActionTrigger asChild>
                                    <Button onClick={() => {
                                        handleForComment()
                                        setCountReplies((prev) => prev + 1)
                                    }}>Сохранить</Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton onClick={() => setIsOpen(false)} size="sm"/>
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.RootProvider>

            <svg
                cursor="pointer"
                aria-label="Comment"
                color=""
                fill=""
                height="20"
                role="img"
                viewBox="0 0 24 24"
                width="20"
                onClick={() => {
                    setIsOpen(true)
                }}
            >
                <title>Комментировать</title>
                <path
                    d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="2"
                ></path>
            </svg>

            <svg
                cursor="pointer"
                aria-label="Repost"
                color="currentColor"
                fill="currentColor"
                height="20"
                role="img"
                viewBox="0 0 24 24"
                width="20"
            >
                <title>Репост</title>
                <path
                    fill=""
                    d="M19.998 9.497a1 1 0 0 0-1 1v4.228a3.274 3.274 0 0 1-3.27 3.27h-5.313l1.791-1.787a1 1 0 0 0-1.412-1.416L7.29 18.287a1.004 1.004 0 0 0-.294.707v.001c0 .023.012.042.013.065a.923.923 0 0 0 .281.643l3.502 3.504a1 1 0 0 0 1.414-1.414l-1.797-1.798h5.318a5.276 5.276 0 0 0 5.27-5.27v-4.228a1 1 0 0 0-1-1Zm-6.41-3.496-1.795 1.795a1 1 0 1 0 1.414 1.414l3.5-3.5a1.003 1.003 0 0 0 0-1.417l-3.5-3.5a1 1 0 0 0-1.414 1.414l1.794 1.794H8.27A5.277 5.277 0 0 0 3 9.271V13.5a1 1 0 0 0 2 0V9.271a3.275 3.275 0 0 1 3.271-3.27Z"
                ></path>
            </svg>

            <svg
                cursor="pointer"
                aria-label="Share"
                color=""
                fill="rgb(243, 245, 247)"
                height="20"
                role="img"
                viewBox="0 0 24 24"
                width="20"
            >
                <title>Поделиться</title>
                <line
                    fill="none"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    x1="22"
                    x2="9.218"
                    y1="3"
                    y2="10.083"
                ></line>
                <polygon
                    fill="none"
                    points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="2"
                ></polygon>
            </svg>
        </Flex>
    );
}
