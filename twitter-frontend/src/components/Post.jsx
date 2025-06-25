import React, {useEffect, useState} from "react";
import {Avatar, Box, Flex, Image, Text} from "@chakra-ui/react";
import {BsFillPatchCheckFill} from "react-icons/bs";
import {Actions} from "./Actions.jsx";
import {Link} from "react-router-dom";
import useShowToast from "../hooks/useShowToast.js";
import {Toaster} from "./ui/toaster.jsx";
import {useRecoilState} from "recoil";
import userAtom from "../atoms/userAtom.js";
import {formatDistanceToNow} from "date-fns";
import {AvatarsCommentedUsers} from "./AvatarsCommentedUsers.jsx";
import {getShortedLink} from "../helpers.js";
import parse from "html-react-parser"

export const Post = ({postInfo, postedBy}) => {
    const [postedPostUser, setPostedPostUser] = useState(null);
    const showToast = useShowToast();
    const [user] = useRecoilState(userAtom);
    const [liked, setLiked] = useState(postInfo.likes.includes(user._id));
    const [countLikes, setCountLikes] = useState(postInfo.likes.length);
    const [countReplies, setCountReplies] = useState(postInfo.replies.length);

    useEffect(() => {
        const getPostedPostUser = async () => {
            try {
                const response = await fetch(`/api/users/profile/${postedBy}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.error) {
                    showToast("Ошибка", "Не удалось получить данные о авторе поста", "error");
                }

                const data = await response.json();

                setPostedPostUser(data);

                if (postInfo.text !== null) postInfo.text = getShortedLink(postInfo.text);
            } catch (error) {
                showToast("Ошибка", error.message, "error");
                showToast("Ошибка", "Не удалось получить данные о авторе поста", "error");
                setPostedPostUser(null);
            }
        };

        getPostedPostUser();
    }, []);

    if (!postedPostUser) return null;

    return (
        <Box>
            <Flex gap={3} my={5} mb={20} width={"full"}>
                <Flex
                    position="relative"
                    mr={{base:"5px", md: "10px"}}
                    flexDirection={"column"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                >
                    <Toaster/>
                    <Link to={`/${postedPostUser.username}`}>
                        <Avatar.Root>
                            <Avatar.Fallback name={postedPostUser.name}/>
                            <Avatar.Image src={postedPostUser.profilePic}/>
                        </Avatar.Root>
                    </Link>
                    <Box h={"full"} w={"1px"} bg={"gray"}></Box>

                    {<AvatarsCommentedUsers replies={postInfo.replies} countCommentedUsers={countReplies}/>}
                </Flex>

                <Box flex={1}>
                    <Flex justifyContent={"space-between"} w={"full"} flexDirection={{base:"column", md: "row"}}>
                        <Box mb={2}>
                            <Flex mb={2} alignItems={"center"}>
                                <Link to={`/${postedPostUser.username}/post/${postInfo._id}`}>
                                    <Text fontWeight={"bold"} mr={2}>
                                        {postedPostUser.name}
                                    </Text>
                                </Link>
                                <BsFillPatchCheckFill color="#3D90D7"/>
                            </Flex>
                            <Text fontWeight={"light"} whiteSpace={"pre-wrap"}
                                  wordBreak="break-all">{postInfo && parse(postInfo?.text)}</Text>
                        </Box>

                        <Flex>
                            <Text mb={{base: "5px", md: "0px"}} color={"gray.light"} fontWeight={"light"} mr={2} fontSize={13}>
                                {formatDistanceToNow(new Date(postInfo.createdAt))} назад
                            </Text>
                        </Flex>
                    </Flex>

                    {postInfo.img && (
                        <Box
                            maxW={570}
                            maxH={320}
                            mb={5}
                            borderRadius={6}
                            overflow={"hidden"}
                            border={"1px solid"}
                            borderColor={"gray.dark"}
                        >
                            <Image w="full" h="full" objectFit="cover" src={postInfo.img}/>
                        </Box>
                    )}

                    <Actions liked={liked} setLiked={setLiked} postId={postInfo._id} countLikes={countLikes}
                             setCountLikes={setCountLikes}
                             setCountReplies={setCountReplies}/>

                    <Flex gap={3} mt={3} alignItems={"center"}>
                        <Text color={"gray.light"} fontSize={"sm"} fontWeight={"light"}>
                            {countReplies} комментариев
                        </Text>
                        <Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
                        <Text color={"gray.light"} fontSize={"sm"} fontWeight={"light"}>
                            {countLikes} лайков
                        </Text>
                    </Flex>
                </Box>
            </Flex>
        </Box>
    );
};
