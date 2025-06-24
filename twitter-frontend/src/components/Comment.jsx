import {useState} from "react"
import {Actions} from "./Actions";
import {Avatar, Box, Button, Flex, Text} from "@chakra-ui/react";
import {BsThreeDots} from "react-icons/bs";
import {formatDistanceToNow} from "date-fns";

export const Comment = ({likes, userName, userAvatar, comment, numberDaysHavePassed}) => {
    const [liked, setLiked] = useState(false);

    console.log(userAvatar);

    return (
        <Flex p={"15px 0"}>
            <Avatar.Root size="xl" mr={5}>
                <Avatar.Fallback name="Segun Adebayo"/>
                <Avatar.Image src={userAvatar}/>
            </Avatar.Root>
            <Box>
                <Text fontWeight={"bold"} mb={1} mr={2}>
                    {userName}
                </Text>
                <Text fontWeight={"light"} mb={3}>{comment}</Text>

                <Actions liked={liked} setLiked={setLiked}/>

                <Text mt={3} color={"gray.light"} fontSize={"sm"} fontWeight={"light"}>
                    {likes + (liked ? 1 : 0)} лайков
                </Text>
            </Box>
            <Flex alignItems={"right"} ml={"auto"}>
                <Text color={"gray.light"} fontWeight={"light"} mr={2}>
                    {formatDistanceToNow(new Date(numberDaysHavePassed))}
                </Text>
                <Button variant={"plain"} height={"23px"}>
                    <BsThreeDots/>
                </Button>
            </Flex>
        </Flex>
    )
}