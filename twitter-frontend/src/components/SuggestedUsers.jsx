import {Box, Button, Flex, Skeleton, SkeletonCircle, Text} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import useShowToast from "../hooks/useShowToast";
import {Link} from "react-router-dom";

import useFollowUnfollow from "../hooks/useFollowUnfollow";
import {Avatar} from "@chakra-ui/avatar";

export const SuggestedUsers = () => {
    const [loading, setLoading] = useState(true);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const showToast = useShowToast();

    useEffect(() => {
        const getSuggestedUsers = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/users/suggested");
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setSuggestedUsers(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoading(false);
            }
        };

        getSuggestedUsers();
    }, [showToast]);

    return (<>
        <Text mb={4} fontWeight={"bold"}>
            Suggested Users
        </Text>
        <Flex direction={"column"} gap={4}>
            {!loading && suggestedUsers.map((user) => <SuggestedUser key={user._id} user={user}/>)}
            {loading && [0, 1, 2, 3, 4].map((_, idx) => (
                <Flex key={idx} gap={2} alignItems={"center"} p={"1"} borderRadius={"md"}>
                    <Box>
                        <SkeletonCircle size={"10"}/>
                    </Box>
                    <Flex w={"full"} flexDirection={"column"} gap={2}>
                        <Skeleton h={"8px"} w={"80px"}/>
                        <Skeleton h={"8px"} w={"90px"}/>
                    </Flex>
                    <Flex>
                        <Skeleton h={"20px"} w={"60px"}/>
                    </Flex>
                </Flex>))}
        </Flex>
    </>);
};


const SuggestedUser = ({user}) => {
    const {handleFollowUnfollow, following, updating} = useFollowUnfollow(user);

    return (
        <Flex gap={2} justifyContent={"space-between"} alignItems={"center"}>
            {/* left side */}
            <Flex gap={2} as={Link} to={`${user.username}`}>
                <Avatar src={user.profilePic}/>
                <Box>
                    <Text fontSize={"sm"} fontWeight={"bold"}>
                        {user.username}
                    </Text>
                    <Text color={"gray.light"} fontSize={"sm"}>
                        {user.name}
                    </Text>
                </Box>
            </Flex>
            {/* right side */}
            <Button
                size={"sm"}
                color={following ? "black" : "white"}
                bg={following ? "white" : "blue.400"}
                onClick={handleFollowUnfollow}
                isLoading={updating}
                _hover={{
                    color: following ? "black" : "white",
                    opacity: ".8",
                }}
            >
                {following ? "Unfollow" : "Follow"}
            </Button>
        </Flex>
    );
};
