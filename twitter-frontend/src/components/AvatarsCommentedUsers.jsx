import {Avatar, AvatarGroup, Box} from "@chakra-ui/react";
import React from "react";

export const AvatarsCommentedUsers = ({replies, countCommentedUsers}) => {
    if (countCommentedUsers > 2) {
        return (<AvatarGroup gap="0" spaceX="-3px" size="xs" position={"relative"}>
            <Avatar.Root key={replies[0]?._id} position={"absolute"} left={"-15px"} top={"3"}>
                <Avatar.Fallback name={replies[0]?.username}/>
                <Avatar.Image src={`${replies[0]?.userProfilePic}`}/>
            </Avatar.Root>
            <Avatar.Root key={replies[1]?._id} position={"absolute"} left={"-25px"} top={"-9px"}>
                <Avatar.Fallback name={replies[1]?.username}/>
                <Avatar.Image src={`${replies[1]?.userProfilePic}`}/>
            </Avatar.Root>
            <Avatar.Root key={replies[2]?._id} position={"absolute"} left={"0"} top={"-9px"}>
                <Avatar.Fallback name={replies[2]?.username}/>
                <Avatar.Image src={`${replies[2]?.userProfilePic}`}/>
            </Avatar.Root>
        </AvatarGroup>)
    } else if (countCommentedUsers > 1) {
        return (<AvatarGroup gap="0" spaceX="-3px" size="xs" position={"relative"}>
            <Avatar.Root key={replies[0]?._id} position={"absolute"} left={"-25px"} top={"-9px"}>
                <Avatar.Fallback name={replies[0]?.username}/>
                <Avatar.Image src={`${replies[0]?.userProfilePic}`}/>
            </Avatar.Root>
            <Avatar.Root key={replies[1]?._id} position={"absolute"} left={"0px"} top={"-9px"}>
                <Avatar.Fallback name={replies[1]?.username}/>
                <Avatar.Image src={`${replies[1]?.userProfilePic}`}/>
            </Avatar.Root>
        </AvatarGroup>)
    } else if (countCommentedUsers > 0) {
        return (<AvatarGroup gap="0" spaceX="-3px" size="xs" position={"relative"}>
            <Avatar.Root key={replies[0]?._id} position={"absolute"} left={"-16px"} top={"-9px"}>
                <Avatar.Fallback name={replies[0]?.username}/>
                <Avatar.Image src={replies[0]?.userProfilePic}/>
            </Avatar.Root>
        </AvatarGroup>)
    }

    return <Box w={"5px"} h={"5px"} background={"gray"} borderRadius={"100%"} position={"absolute"} bottom={"0px"}
                left={"50%"} translate="-50%"></Box>;
}