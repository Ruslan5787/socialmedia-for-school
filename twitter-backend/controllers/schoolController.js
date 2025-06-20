import School from "../models/schoolModel.js";
import Group from "../models/groupsModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import Room from "../models/roomModel.js";

const createSchool = async (req, res) => {
    try {
        const teacherId = req.user._id;
        const {title, email, inn} = req.body;
        const school = await School.findOne({title});

        if (school) {
            return res.status(400).json({error: "Школа уже существует в системе"});
        }
        const newSchool = new School({
            title,
            email,
            inn,
        });

        newSchool.teachers.push(teacherId);
        await newSchool.save();

        res.status(201).json(newSchool);
    } catch (err) {
        res.status(500).json({error: err.message});
        console.log("Error in createSchool: ", err.message);
    }
};

const getGroups = async (req, res) => {
    try {
        const teacherId = req.user._id;
        const {schoolId} = req.params; // Получаем schoolId из параметров

        // Проверяем, что учитель имеет доступ к школе, если schoolId передан
        if (schoolId) {
            const school = await School.findOne({_id: schoolId, teachers: teacherId});
            if (!school) {
                return res.status(403).json({error: "У вас нет доступа к этой школе"});
            }
        }

        // Формируем запрос для поиска групп
        const query = {teacherId: teacherId.toString()};
        if (schoolId) {
            query.schoolId = schoolId;
        }

        const groups = await Group.find(query);

        return res.status(200).json(groups || []);
    } catch (error) {
        return res.status(500).json({error: "Ошибка сервера", details: error.message});
    }
};

const createGroup = async (req, res) => {
    try {
        const {title, schoolId} = req.body;
        if (!title.trim()) {
            return res.status(400).json({error: "Заполните название группы"});
        }

        const existingGroup = await Group.findOne({title, schoolId});
        if (existingGroup) {
            return res.status(400).json({error: "Такая группа уже существует"});
        }

        // Создаем новый чат для группы
        const newRoom = new Room({
            title: `Чат группы ${title}`, // Название чата = название группы
            users: [req.user._id], // Изначально только учитель в чате
        });
        await newRoom.save();

        // Создаем новую группу
        const newGroup = new Group({
            title,
            teacherId: req.user._id,
            schoolId,
            users: [],
            chatId: newRoom._id, // Связываем чат с группой
        });
        await newGroup.save();

        // Обновляем школу, добавляя новую группу
        await School.updateOne({_id: schoolId}, {$push: {groups: newGroup._id}});

        res.status(201).json(newGroup);
    } catch (err) {
        res.status(500).json({error: "Ошибка сервера", details: err.message});
    }
};

const getGroupUsers = async (req, res) => {
    try {
        const groupId = req.params.id;
        console.log("Fetching users for groupId:", groupId);
        const group = await Group.findById(groupId).populate('users');

        if (!group) {
            return res.status(404).json({message: "Группа не найдена"});
        }

        console.log(group.users)

        return res.status(200).json(group.users || []);
    } catch (error) {
        console.error("Error in getGroupUsers:", error.message);
        return res.status(500).json({error: "Ошибка сервера", details: error.message});
    }
};

const getSchool = async (req, res) => {
    try {
        const schoolId = req.params.id;
        const school = await School.findById(schoolId);

        if (!school) {
            return res.status(404).json({error: "Такой школы не существует в системе"});
        }

        return res.status(200).json(school);
    } catch (error) {
        return res.status(500).json({error: "Ошибка сервера", details: error.message});
    }
};

const getSchools = async (req, res) => {
    try {
        const teacherId = req.user._id;

        const schools = await School.find({teachers: teacherId.toString()});

        return res.status(200).json(schools);
    } catch (error) {
        return res.status(500).json({error: "Ошибка сервера", details: error.message});
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const teacherId = req.user._id;

        // Проверяем, существует ли пользователь
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({error: "Пользователь не найден"});
        }

        // Проверяем, что пользователь является учеником
        if (user.role !== "student") {
            return res.status(403).json({error: "Можно удалять только учеников"});
        }

        // Проверяем, что учитель имеет доступ к группе, в которой состоит пользователь
        const group = await Group.findOne({
            users: userId,
            teacherId: teacherId.toString()
        });

        if (!group) {
            return res.status(403).json({error: "У вас нет прав для удаления этого пользователя"});
        }

        // Удаляем пользователя из группы
        await Group.updateOne(
            {_id: group._id},
            {$pull: {users: userId}}
        );

        // Удаляем пользователя
        await User.findByIdAndDelete(userId);

        return res.status(200).json({message: "Пользователь успешно удален"});
    } catch (error) {
        return res.status(500).json({error: "Ошибка сервера", details: error.message});
    }
};

const createStudent = async (req, res) => {
    try {
        const {name, email, username, password, role, group} = req.body;
        const user = await User.findOne({$or: [{email}, {username}]});
        const groupForUser = await Group.findById(group)
        const chatGroup = await Room.findById(groupForUser.chatId._id)
        if (user) {
            return res.status(400).json({error: "Такой пользователь уже существует"});
        }

        if (!groupForUser) {
            return res.status(400).json({error: "Такой группы не существует"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword,
            role,
            groups: [group]
        });

        await newUser.save();

        // if (updatedGroup.chatId) {
        //     await Room.findByIdAndUpdate(
        //         updatedGroup.chatId,
        //         {$push: {users: newUser._id}},
        //         {new: true}
        //     );
        // }

        groupForUser.users.push(newUser)
        chatGroup.users.push(newUser)
        await groupForUser.save();

        if (newUser) {
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                bio: newUser.bio,
                profilePic: newUser.profilePic,
                role: newUser.role,
            });
        } else {
            res.status(400).json({error: "Неверные пользовательские данные"});
        }
    } catch (err) {
        res.status(500).json({error: err.message});
        console.log("Error in createStudent: ", err.message);
    }
};

const getGroup = async (req, res) => {
    try {
        const {id} = req.params; // Получаем schoolId из параметров

        const group = await Group.findById(id);

        return res.status(200).json(group || []);
    } catch (error) {
        return res.status(500).json({error: "Ошибка сервера", details: error.message});
    }
};

export {
    createSchool,
    createGroup,
    getSchools,
    getGroup,
    getSchool,
    getGroups,
    getGroupUsers,
    createStudent,
    deleteUser
};