import {useEffect, useState} from "react";
import {Box, Flex, Text} from "@chakra-ui/react";
import {CreateSchool} from "../components/CreateSchool.jsx";
import useShowToast from "../hooks/useShowToast.js";
import {Toaster} from "../components/ui/toaster.jsx";
import {Link} from "react-router-dom";

const AdministrateGroupsPage = () => {
    const [schools, setSchools] = useState([]);
    const showToast = useShowToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resSchools = await fetch(`/api/schools/`);
                const dataSchools = await resSchools.json();

                if (dataSchools.error) {
                    showToast("Ошибка", dataSchools.error, "error");
                    setSchools([]);
                    return;
                }
                setSchools(dataSchools);
            } catch (err) {
                showToast("Ошибка", "Не удалось загрузить школы", "error");
                console.error("Fetch error:", err);
                setSchools([]);
            }
        };

        fetchData();
    }, [showToast]);

    return (
        <Box>
            <Toaster/>
            <CreateSchool setSchools={setSchools}/>
            {schools.length === 0 ? (
                <Text>Нет учебных заведений</Text>
            ) : (
                <Flex gap={5} mt={5} wrap="wrap" justifyContent="space-between">
                    {schools.length > 0 && schools.map((school) => (
                        <Box
                            key={school._id}
                            background="gray.400"
                            borderRadius={10}
                            p={15}
                            flexGrow="1"
                            width="33.333%"
                        >
                            <Link to={`/school/${school._id}`}>
                                <Text>{school.title}</Text>
                                <Text>{school.inn}</Text>
                                <Text>{school.email}</Text>
                            </Link>
                        </Box>
                    ))}
                </Flex>
            )}
        </Box>
    );
};

export default AdministrateGroupsPage;