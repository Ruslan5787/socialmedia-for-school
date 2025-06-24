import React, {useEffect, useState} from "react";
import useShowToast from "../hooks/useShowToast.js";
import {Post} from "../components/Post.jsx";
import {Toaster} from "../components/ui/toaster.jsx";
import {Box, Flex, Spinner, Text} from "@chakra-ui/react";

const HomePage = () => {
    const [posts, setPosts] = useState([]);
    const showToast = useShowToast();
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        try {
            setIsLoading(true)

            const getPosts = async () => {
                const res = await fetch("/api/posts/feed");
                const data = await res.json();

                if (data.error) {
                    showToast("Ошибка", data.error, "error");
                }

                setPosts(data);
            };

            getPosts();
            setIsLoading(false)
        } catch (error) {
            showToast("Ошибка", "Не удалось загрузить посты", "error");
            setIsLoading(false);
        }
    }, [showToast]);

    if (isLoading) {
        return <Flex m={"20px 0 0 0"} justifyContent={"center"}>
            <Spinner></Spinner>
        </Flex>
    }

    return (<Flex gap='10' alignItems={"flex-start"}>
        <Toaster/>

        <Box flex={70}>
            {posts.length === 0 && (
                <>
                    <Text textAlign={"center"}>Пока что здесь нет постов.</Text>
                    <Text textAlign={"center"}>Вы можете подписатьсы на кого-нибудь чтобы увидеть посты.</Text>
                </>
            )}

            {posts.length > 0 && posts?.map((post) => (
                <Post key={post._id} postInfo={post} postedBy={post.postedBy}/>))}

            <Box
                flex={30}
                display={{
                    base: "none",
                    md: "block",
                }}
            >
                {/*<SuggestedUsers/>*/}
            </Box>
        </Box>
    </Flex>)
        ;
};

HomePage.propTypes = {};

export default HomePage;
