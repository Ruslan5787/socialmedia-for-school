import { IoSearch } from "react-icons/io5";
import {TbSchool} from "react-icons/tb";
import {Flex} from "@chakra-ui/react";
import {useColorMode} from "./ui/color-mode";
import {FiMessageCircle} from "react-icons/fi";
import React from "react";
import {IoIosHome} from "react-icons/io";
import {FaUserCircle} from "react-icons/fa";
import {Link} from "react-router-dom";
import {useRecoilValue} from "recoil";
import userAtom from "../atoms/userAtom.js";
import {TiUserAdd} from "react-icons/ti";
import {FaUserGroup} from "react-icons/fa6";
import LogoutButton from "./LogoutButton.jsx";

const Header = () => {
    const {colorMode, toggleColorMode} = useColorMode();

    // Определяем градиент в зависимости от colorMode
    const gradientId = `gradient-${colorMode}`;
    const gradientColors =
        colorMode === "dark"
            ? {start: "#FF5733", stop: "#C70039"} // Градиент для тёмной темы
            : {start: "#33B5FF", stop: "#0052CC"};
    const user = useRecoilValue(userAtom);

    return (<Flex
        justifyContent={"space-between"}
        pt={6}
        pb={12}
        alignItems={"center"}
    >
        <Flex gap={4}>

            {user && (<Link to="/">
                <IoIosHome size={24}/>
            </Link>)}
            {user?.role === "student" && <Link to={'/group'}>
                <FaUserGroup size={24}/>
            </Link>}

            {user && (<Link to={`/searchuser`}>
                <IoSearch size={24}/>
            </Link>)}
            {user?.role === "teacher" && <Link to={'/groups'}>
                <FaUserGroup size={24}/>
            </Link>}
        </Flex>

        <svg
            width="40"
            height="40"
            cursor="pointer"
            onClick={toggleColorMode}
            aria-label="logo"
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={gradientColors.start}/>
                    <stop offset="100%" stopColor={gradientColors.stop}/>
                </linearGradient>
            </defs>
            {/* Рендерим иконку TbSchool с применением градиента */}
            <g fill={`url(#${gradientId})`}>
                <TbSchool size={40}/>
            </g>
        </svg>

        <Flex gap={4}>

            {user && (<Link to={`/chat`}>
                <FiMessageCircle size={24}/>
            </Link>)}

            {user && (<Link title={user.role === "teacher" ? "Учитель" : "Студент"} to={`/${user.username}`}>
                <FaUserCircle  size={24}/>
            </Link>)}

            {user && <LogoutButton/>}
        </Flex>
    </Flex>);
};

export default Header;
