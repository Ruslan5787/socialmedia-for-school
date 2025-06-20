import React, {useEffect, useState} from "react";
import {Avatar, Box, Button, Flex, Image, Separator, Text} from "@chakra-ui/react";
import {BsFillPatchCheckFill, BsThreeDots} from "react-icons/bs";
import {Actions} from "../components/Actions.jsx";
import {Comment} from "../components/Comment.jsx";
import {data, useParams} from "react-router-dom";
import useShowToast from "../hooks/useShowToast.js";
import {Toaster} from "../components/ui/toaster.jsx";
import {formatDistanceToNow,} from "date-fns";
import parse from 'html-react-parser';
import {useRecoilState} from "recoil";
import userAtom from "../atoms/userAtom.js";
import {getShortedLink} from "../helpers.js";

const PostPage = () => {
    const {pid} = useParams();
    const [user, setUser] = useRecoilState(userAtom);
    const [post, setPost] = useState(null);
    const [postPostedUser, setPostPostedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const showToast = useShowToast();
    const [liked, setLiked] = useState(null);
    const [countLikes, setCountLikes] = useState(0);
    const [countReplies, setCountReplies] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)

            try {
                const postResponse = await fetch(`/api/posts/${pid}`)
                const postData = await postResponse.json();

                if (data.error) {
                    showToast("Ошибка", postData.error, "error");
                    return;
                }

                if (!postData?.postedBy) {
                    showToast("Ошибка", "Индификатор поста отсутствует", "error");
                    return;
                }

                setPost(postData);
                getShortedLink(postData.text)

                const userResponse = await fetch(`/api/users/profile/${postData.postedBy}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })

                const userData = await userResponse.json();

                if (userData.error) {
                    showToast("Ошибка", userData.error || "Произошла ошибка при получении данных об авторе поста", "error");
                }

                setPostPostedUser(userData);

                setCountLikes(postData.likes.length)
                setCountReplies(postData.replies.length)
                setLiked(postData.likes.includes(user?._id))
            } catch (error) {
                showToast("Ошибка", error.message, "error");
            } finally {
                setIsLoading(false);
            }
        }

        fetchData()
    }, [showToast]);

    return <Box>
        <Box flex={1} mb={3}>
            <Toaster/>
            <Flex justifyContent={"space-between"} w={"full"}>
                <Box mb={2}>
                    <Flex mb={2} alignItems={"center"} textAlign={"center"}>
                        <Avatar.Root size="xl" mr={5}>
                            <Avatar.Fallback name="Segun Adebayo"/>
                            <Avatar.Image src={postPostedUser?.profilePic}/>
                        </Avatar.Root>
                        <Text fontWeight={"bold"} mr={2}>
                            {postPostedUser?.username}
                        </Text>
                        <BsFillPatchCheckFill color="#3D90D7"/>
                    </Flex>
                    <Text fontWeight={"light"} whiteSpace={"pre-wrap"}
                          wordBreak="break-all">{post && parse(post?.text)}</Text>
                </Box>

                <Flex>
                    <Text color={"gray.light"} fontWeight={"light"} mr={2}>
                        {post && formatDistanceToNow(new Date(post.createdAt))} назад
                    </Text>
                    <Button variant={"plain"} height={"23px"}>
                        <BsThreeDots/>
                    </Button>
                </Flex>
            </Flex>

            {post?.img &&
                <Box
                    maxW={570}
                    maxH={320}
                    w="full"
                    h="full"
                    mb={5}
                    borderRadius={6}
                    overflow={"hidden"}
                    border={"1px solid"}
                    borderColor={"gray.dark"}
                >
                    <Image
                        w="full"
                        h="full"
                        objectFit="cover"
                        src={post?.img}
                    />
                </Box>}

            <Actions liked={liked} setLiked={setLiked} postId={post?._id} countLikes={countLikes}
                     setCountLikes={setCountLikes}/>

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

        <Separator size="xs" variant="solid"/>

        <Separator size="xs" variant="solid"/>

        {countReplies > 0 && post.replies.map(reply => {
            console.log(reply)
            return (
                <Comment key={reply._id} userName={reply.username} comment={reply.text} likes={1}
                         numberDaysHavePassed={reply.createdAt} userAvatar={reply.profilePic}/>
            )
        })}
    </Box>;
};

PostPage.propTypes = {}
export default PostPage;