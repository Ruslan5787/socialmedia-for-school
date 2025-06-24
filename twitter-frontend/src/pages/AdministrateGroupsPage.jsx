import React, {useEffect, useState} from "react";
import {Box, Button, Card, Flex, Spinner, Text} from "@chakra-ui/react";
import {CreateSchool} from "../components/CreateSchool.jsx";
import useShowToast from "../hooks/useShowToast.js";
import {Toaster} from "../components/ui/toaster.jsx";
import {Link} from "react-router-dom";

const AdministrateGroupsPage = () => {
    const [schools, setSchools] = useState([]);
    const showToast = useShowToast();
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const resSchools = await fetch(`/api/schools/`);
                const dataSchools = await resSchools.json();

                if (dataSchools.error) {
                    showToast("Ошибка", dataSchools.error, "error");
                    setSchools([]);
                    return;
                }
                setSchools(dataSchools);
                setIsLoading(false)
            } catch (err) {
                showToast("Ошибка", "Не удалось загрузить школы", "error");
                setSchools([]);
                setIsLoading(false)
            }
        };

        fetchData();
    }, [showToast]);

    if (isLoading) {
        return <Flex m={"20px 0 0 0"} justifyContent={"center"}>
            <Spinner></Spinner>
        </Flex>
    }

    return (<Box>
        <Toaster/>
        <CreateSchool setSchools={setSchools}/>
        {schools.length === 0 ? (<Text textAlign={"center"} mt={"50px"}>Нет учебных заведений</Text>) : (
            <Flex gap={6} mt={5} w={'full'}>
                {schools.length > 0 && schools.map((school) => (<Box
                    key={school._id}
                    background="#8c92e5"
                    borderRadius={10}
                    p={15}
                    flex={"1"}
                    pb={0}
                >
                    <Card.Root mb={15}>
                        <Card.Body p={4}>
                            <Card.Title>{school.title}</Card.Title>
                            <Card.Description>
                                <Text>{school.inn}</Text>
                                <Text>{school.email}</Text>
                            </Card.Description>
                        </Card.Body>
                        <Card.Footer p={4} pt={0}>
                            <Link to={`/school/${school._id}`}>
                                <Button variant="outline">Перейти</Button>
                            </Link>
                        </Card.Footer>
                    </Card.Root>
                </Box>))}
            </Flex>)}
    </Box>);
};

export default AdministrateGroupsPage;