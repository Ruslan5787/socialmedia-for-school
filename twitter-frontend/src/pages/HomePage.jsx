import React, {useEffect, useState} from "react";
import useShowToast from "../hooks/useShowToast.js";
import {Post} from "../components/Post.jsx";
import {Toaster} from "../components/ui/toaster.jsx";
import {Box, Flex, Text} from "@chakra-ui/react";

const HomePage = () => {
    const [posts, setPosts] = useState([]);
    const showToast = useShowToast();

    useEffect(() => {
        try {
            const getPosts = async () => {
                const res = await fetch("/api/posts/feed");
                const data = await res.json();

                if (data.error) {
                    showToast("Ошибка", data.error, "error");
                }

                setPosts(data);
            };

            getPosts();
        } catch (error) {
            showToast("Ошибка", "Не удалось загрузить посты", "error");
        }
    }, [showToast]);

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
