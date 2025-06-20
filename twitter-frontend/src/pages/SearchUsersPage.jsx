import {FormControl} from "@chakra-ui/form-control";
import {Avatar, Box, Button, Flex, Input, List, Text} from "@chakra-ui/react";
import {FaSearch} from "react-icons/fa";
import React, {useState} from "react";
import useShowToast from "../hooks/useShowToast.js";
import {Toaster} from "../components/ui/toaster.jsx";
import {Link} from "react-router-dom";


const SearchUsersPage = () => {
    const [searchValue, setSearchValue] = useState('');
    const [users, setUsers] = useState([]);
    const showToast = useShowToast();

    const handleSearch = async (event) => {
        event.preventDefault();

        setSearchValue(event.target.value)

        if (event.target.value === "") {
            setUsers([])
            return;
        }

        const res = await fetch(`/api/users/search/${event.target.value}`);
        const data = await res.json();

        if (data.message) {
            showToast("Ошибка", data.message, "error")
        }

        setUsers(data);
    }

    return (<Box>
        <Toaster/>

        <FormControl mb={"15px"}>
            <Flex>
                <Input placeholder={"Введите имя пользователя"} onChange={handleSearch}
                       value={searchValue}/>
                <Button>
                    <FaSearch size={24}/>
                </Button>
            </Flex>
        </FormControl>

        {users.length === 0 && (<Text mt={5} textAlign={"center"}>Пользователя с таким именем нет</Text>)}

        {users.length > 0 && (

            <List.Root>
                {users.map((user) => (<List.Item mb={"10px"} key={user._id} listStyle={"none"}>
                    <Link to={`/${user.username}`}>
                        <Flex alignItems={"center"}>
                            <Avatar.Root mr={5}>
                                <Avatar.Fallback name={user.name}/>
                                <Avatar.Image src={user.profilePic}/>
                            </Avatar.Root>
                            <Text>{user.username}</Text>
                        </Flex>
                    </Link>

                </List.Item>))}
            </List.Root>)}
    </Box>)
}

export default SearchUsersPage;
