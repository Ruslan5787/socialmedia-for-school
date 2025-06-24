import {Box, Button, CloseButton, Dialog, Flex, Input, Portal, Spinner, Tabs, Text, VStack,} from '@chakra-ui/react';
import {Avatar} from '@chakra-ui/avatar';
import React, {useEffect, useRef, useState} from 'react';
import useShowToast from '../hooks/useShowToast.js';
import * as XLSX from 'xlsx';
import {Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType} from 'docx';
import {saveAs} from 'file-saver';
import {useNavigate} from "react-router-dom";

export const StudentsPage = ({
                                 groupUsers, setGroupUsers, setActiveTab, activeTab, groups, tabGroupRef,
                             }) => {
    const [loading, setLoading] = useState(false);
    const showToast = useShowToast();
    const [activeGroup, setActiveGroup] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const cancelRef = React.useRef();
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState(''); // Состояние для поискового запроса

    const openDeleteDialog = (userId) => {
        setUserToDelete(userId);
        setIsOpen(true);
    };

    const fetchGroupUsers = async (activeGroup) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/schools/group_students/${activeGroup._id}`, {
                headers: {'Cache-Control': 'no-cache'},
            });
            const data = await res.json();
            if (data.message) {
                showToast('Информация', data.message, 'info');
                setGroupUsers([]);
                return;
            }
            // Убедитесь, что данные не дублируются
            setGroupUsers([...new Set(data.map(user => JSON.stringify(user)))]
                .map(str => JSON.parse(str))); // Удаление дубликатов по уникальным объектам
        } catch (error) {
            showToast('Ошибка', 'Не удалось загрузить данные пользователей группы', 'error');
            console.error('Ошибка загрузки пользователей:', error);
            setGroupUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Функция для выгрузки в Excel
    const handleExportToExcel = () => {
        const worksheetData = groupUsers.map((user) => ({
            ФИО: user.name || '',
            Логин: user.username || '',
            Почта: user.email || '',
            Пароль: user.password || '******',
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Студенты');
        XLSX.writeFile(workbook, `Студенты_${activeGroup?.title || 'группа'}.xlsx`);
    };

    // Функция для выгрузки в Word
    const handleExportToWord = () => {
        const table = new Table({
            width: {size: 100, type: WidthType.PERCENTAGE}, rows: [new TableRow({
                children: [new TableCell({children: [new Paragraph('ФИО')]}), new TableCell({children: [new Paragraph('Логин')]}), new TableCell({children: [new Paragraph('Почта')]}), new TableCell({children: [new Paragraph('Пароль')]}),],
            }), ...groupUsers.map((user) => new TableRow({
                children: [new TableCell({children: [new Paragraph(user.name || '')]}), new TableCell({children: [new Paragraph(user.username || '')]}), new TableCell({children: [new Paragraph(user.email || '')]}), new TableCell({children: [new Paragraph(user.password || '******')]}),],
            })),],
        });

        const doc = new Document({
            sections: [{
                properties: {}, children: [new Paragraph({
                    text: `Список студентов группы ${activeGroup?.title || 'группа'}`, heading: 'Heading1',
                }), new Paragraph(''), table,],
            }],
        });

        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, `Студенты_${activeGroup?.title || 'группа'}.docx`);
        }).catch((error) => {
            console.error('Ошибка при создании Word-файла:', error);
            showToast('Ошибка', 'Не удалось создать Word-файл', 'error');
        });
    };

    // Функция для загрузки из Excel
    const handleImportFromExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                const requiredColumns = ['ФИО', 'Логин', 'Почта', 'Пароль'];
                const firstRow = jsonData[0];
                if (!firstRow || !requiredColumns.every((col) => Object.keys(firstRow).includes(col))) {
                    showToast('Ошибка', 'Файл должен содержать колонки: ФИО, Логин, Почта, Пароль', 'error');
                    return;
                }

                const newUsers = jsonData.map((row) => ({
                    name: row['ФИО'],
                    username: row['Логин'],
                    email: row['Почта'],
                    password: row['Пароль'] || undefined,
                    groupId: activeTab,
                }));

                try {
                    const res = await fetch('/api/schools/add_users', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(newUsers),
                    });
                    const data = await res.json();
                    if (data.error) {
                        showToast('Ошибка', data.error, 'error');
                        return;
                    }
                    showToast('Успех', 'Студенты успешно загружены', 'success');
                    await fetchGroupUsers(activeGroup); // Только обновляем через fetch
                } catch (error) {
                    showToast('Ошибка', 'Не удалось сохранить студентов на сервере', 'error');
                    console.error('Import API error:', error);
                }

                e.target.value = null;
            } catch (error) {
                showToast('Ошибка', 'Не удалось обработать файл', 'error');
                console.error('Import error error:', error);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    useEffect(() => {
        console.log('Group users:', groupUsers); // Логирование данных
        if (activeTab && groups && groups.length > 0) {
            const activeGroup = groups.find((group) => group._id === activeTab);
            setActiveGroup(activeGroup);
            if (activeGroup) {
                fetchGroupUsers(activeGroup);
            } else {
                console.log('Active group not found for activeTab:', activeTab);
                setGroupUsers([]);
                setLoading(false);
            }
        } else {
            setGroupUsers([]);
            setLoading(false);
        }
    }, [activeTab]);

    const handleTabChange = ({value}) => {
        setActiveTab(value);
        setSearchQuery(''); // Сбрасываем поиск при смене вкладки
    };

    const handleDeleteUser = async (userId) => {
        try {
            const res = await fetch(`/api/schools/users/${userId}`, {
                method: 'DELETE', headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();

            if (res.status === 200) {
                setGroupUsers(groupUsers.filter((user) => user._id !== userId));
                showToast('Успех', data.message || 'Пользователь успешно удалён', 'success');
                fetchGroupUsers(activeGroup);
            } else {
                showToast('Ошибка', data.error || 'Не удалось удалить пользователя', 'error');
            }
        } catch (error) {
            showToast('Ошибка', 'Ошибка сервера при удалении пользователя', 'error');
            console.error('Delete user error:', error);
        }
    };

    // Фильтрация пользователей по поисковому запросу
    const filteredUsers = groupUsers.filter((user) => user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || user.username?.toLowerCase().includes(searchQuery.toLowerCase()) || user.email?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (<Box p={4}>
        {groups === null ? (<Flex justify="center" align="center" minH="200px">
            <Spinner size="lg"/>
        </Flex>) : groups?.length > 0 ? (<VStack spacing={4} align="stretch">
            {/* Кнопки для загрузки/выгрузки */}
            <Flex gap={2} direction={{base: "column", md: "row"}}>
                <Button
                    onClick={() => fileInputRef.current.click()}
                    colorScheme="green"
                    isDisabled={!activeTab}
                >
                    Загрузить из Excel
                </Button>
                <Button onClick={handleExportToExcel} colorScheme="blue" isDisabled={!activeTab}>
                    Выгрузить в Excel
                </Button>
                <Button onClick={handleExportToWord} colorScheme="teal" isDisabled={!activeTab}>
                    Выгрузить в Word
                </Button>
                <Input
                    type="file"
                    accept=".xlsx, .xls"
                    ref={fileInputRef}
                    onChange={handleImportFromExcel}
                    display="none"
                    w={"full"}
                />
            </Flex>

            {/* Поле поиска */}
            <Input
                mt={"10px"}
                placeholder="Поиск по имени, логину или почте..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Вкладки для групп */}
            <Tabs.Root value={activeTab} onValueChange={handleTabChange} width="full">
                <Tabs.List borderBottom="1px solid" borderColor="gray.200">
                    {groups.map((item) => (<Tabs.Trigger
                        key={item._id}
                        value={item._id}
                        px={4}
                        py={2}
                        _selected={{
                            borderBottom: '2px solid', borderColor: 'blue.500', fontWeight: 'bold',
                        }}
                    >
                        {item.title}
                    </Tabs.Trigger>))}
                </Tabs.List>

                <Box minH="200px" width="full" pt={4}>
                    {groups.map((item) => (<Tabs.Content
                        key={item._id}
                        value={item._id}
                        ref={item._id === activeTab ? tabGroupRef : null}
                    >
                        {loading ? (<Flex justifyContent="center" align="center" minH="200px">
                            <Spinner size="lg"/>
                        </Flex>) : filteredUsers.length > 0 ? ( // Используем filteredUsers вместо groupUsers
                            <VStack spacing={3} align="stretch">
                                {filteredUsers.map((user) => (<Box
                                    key={user._id}
                                    p={3}
                                    borderWidth="1px"
                                    borderRadius="md"
                                    borderColor="gray.200"
                                >
                                    <Flex
                                        gap={4}
                                        direction={{base: 'column', md: 'row'}}
                                        alignItems="center"
                                    >
                                        <Avatar
                                            size="sm"
                                            top="5"
                                            name={user.name}
                                            src={user.profilePic}
                                            w="100px"
                                            h="100px"
                                            borderRadius="50%"
                                            borderColor="black"
                                            borderStyle="solid"
                                            borderWidth="1px"
                                        />
                                        <VStack align={{base: 'center', md: 'start'}} spacing={1}>
                                            <Text fontWeight="bold" textAlign={{ base: "center", md: "auto"}}>{user.name}</Text>
                                            <Text fontSize="sm" color="gray.600" textAlign={{ base: "center", md: "auto"}}>{user.username}</Text>
                                            <Text fontSize="sm" color="gray.600" textAlign={{ base: "center", md: "auto"}}>{user.email}</Text>
                                        </VStack>
                                        <Flex direction="column" gap={2}
                                              margin={{base: '0', md: '0 0 0 auto'}}>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => navigate(`/update/${user._id}`)}
                                            >
                                                Редактировать
                                            </Button>
                                            <Dialog.Root key={'sm'} size={'sm'}>
                                                <Dialog.Trigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size={'sm'}
                                                        onClick={() => openDeleteDialog(user._id)}
                                                    >
                                                        Удалить
                                                    </Button>
                                                </Dialog.Trigger>
                                                <Portal>
                                                    <Dialog.Backdrop/>
                                                    <Dialog.Positioner>
                                                        <Dialog.Content>
                                                            <Dialog.Header>
                                                                <Dialog.Title>Удаление
                                                                    пользователя</Dialog.Title>
                                                            </Dialog.Header>
                                                            <Dialog.Body>
                                                                <p>Вы точно хотите удалить
                                                                    пользователя?</p>
                                                            </Dialog.Body>
                                                            <Dialog.Footer>
                                                                <Dialog.ActionTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        ref={cancelRef}
                                                                        onClick={() => setIsOpen(false)}
                                                                    >
                                                                        Нет
                                                                    </Button>
                                                                </Dialog.ActionTrigger>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        handleDeleteUser(userToDelete);
                                                                        setIsOpen(false);
                                                                    }}
                                                                >
                                                                    Точно
                                                                </Button>
                                                            </Dialog.Footer>
                                                            <Dialog.CloseTrigger asChild>
                                                                <CloseButton/>
                                                            </Dialog.CloseTrigger>
                                                        </Dialog.Content>
                                                    </Dialog.Positioner>
                                                </Portal>
                                            </Dialog.Root>
                                        </Flex>
                                    </Flex>
                                </Box>))}
                            </VStack>) : (<Text textAlign="center" color="gray.500">
                            {searchQuery ? 'Нет пользователей, соответствующих поиску' : 'В этой группе пока нет учеников'}
                        </Text>)}
                    </Tabs.Content>))}
                </Box>
            </Tabs.Root>
        </VStack>) : (<Text textAlign="center" color="gray.500">
            Нет групп
        </Text>)}
    </Box>);
};