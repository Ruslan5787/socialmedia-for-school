import React, { useState } from "react";
import { useColorMode } from "./ui/color-mode.jsx";
import {
    Box,
    Button,
    CloseButton,
    Dialog,
    HStack,
    Input,
    Portal,
    Stack,
    useDialog,
} from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast.js";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { IoMdAddCircleOutline } from "react-icons/io";

export default function CreateGroup({ schoolId, setGroups, setActiveTab }) {
    const showToast = useShowToast();
    const [groupTitle, setGroupTitle] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dialog = useDialog({ open: isOpen, setOpenChange: setIsOpen });

    const handleCreateGroup = async () => {
        if (!groupTitle.trim()) {
            showToast("Ошибка", "Название группы не может быть пустым", "error");
            return;
        }

        try {
            const res = await fetch("/api/schools/group", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache",
                },
                body: JSON.stringify({ title: groupTitle, schoolId }),
            });
            const data = await res.json();
            if (data.error) {
                showToast("Ошибка", data.error, "error");
                return;
            }
            console.log("Created group:", data); // Логирование для отладки
            setGroups((prev) => [...prev, data]); // Добавляем новую группу
            setActiveTab(data._id); // Используем _id вместо title
            showToast("Успех", "Группа создана", "success");
            setGroupTitle("");
            setIsOpen(false);
        } catch (error) {
            showToast("Ошибка", "Не удалось создать группу", "error");
            console.error("Create group error:", error);
        }
    };

    return (
        <Dialog.RootProvider size="sm" placement="center" motionPreset="slide-in-bottom" value={dialog}>
            <Dialog.Trigger asChild>
                <Button
                    onClick={() => setIsOpen(true)}
                    variant="outline"
                    size="xl"
                    bg={useColorMode("gray.300", "gray.dark")}
                >
                    <IoMdAddCircleOutline /> Создать группу
                </Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Создание группы</Dialog.Title>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton onClick={() => setIsOpen(false)} size="xl" />
                            </Dialog.CloseTrigger>
                        </Dialog.Header>
                        <Dialog.Body>
                            <HStack>
                                <Box>
                                    <FormControl>
                                        <FormLabel m={"0 0 10px 0"}>Название</FormLabel>
                                        <Input
                                            value={groupTitle}
                                            onChange={(e) => setGroupTitle(e.target.value)}
                                            borderWidth={"1px"}
                                            borderStyle={"solid"}
                                            borderRadius={"5"}
                                            w={"100%"}
                                            h={"35px"}
                                            type="text"
                                        />
                                    </FormControl>
                                </Box>
                            </HStack>
                            <Stack spacing={10} pt={2}>
                                <Button
                                    onClick={handleCreateGroup}
                                    loadingText="Submitting"
                                    size="lg"
                                    bg={"blue.400"}
                                    color={"white"}
                                    _hover={{
                                        bg: "blue.500",
                                    }}
                                    isDisabled={!groupTitle.trim()}
                                >
                                    Создать
                                </Button>
                            </Stack>
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.RootProvider>
    );
}