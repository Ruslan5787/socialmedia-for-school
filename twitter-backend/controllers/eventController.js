import Event from "../models/eventModel.js";
import Group from "../models/groupsModel.js";
import {sendNotificationAboutNewEventEmail} from "../utils/mailer.js";
import Status from "../models/statusModel.js";

const createEvent = async (req, res) => {
    try {
        console.log("req.user._id", req.user._id)
        const teacherId = req.user._id;

        const {
            name, description, date, time, status, price, address, img, groupId,
        } = req.body;

        // Проверка, что учитель связан с группой
        const group = await Group.findById(groupId).populate('users');
        if (!group) {
            return res.status(404).json({error: "Группа не найдена"});
        }
        if (!group.teacherId.equals(teacherId)) {
            return res.status(403).json({error: "У вас нет прав для создания мероприятия в этой группе"});
        }

        const statusDoc = await Status.findOne({name: status})
        console.log(status)
        console.log("status", status[0], "statusDoc", statusDoc)
        // Поиск ObjectId статуса
        console.log("statusDoc._id", statusDoc._id)
        // Создание мероприятия
        const newEvent = new Event({
            name,
            description,
            Date: new Date(date),
            Time: time,
            status: statusDoc._id,
            price: price || 0,
            address: address || "",
            img: img || "",
            viewUsers: [],
        });

        // Сохранение мероприятия
        await newEvent.save();

        group.users.forEach((user) => {
            sendNotificationAboutNewEventEmail(user.email, req.body);
            group.users.push(user);
        });

        // Добавление ID мероприятия в массив events группы
        console.log("newEvent._id", newEvent._id)
        group.events.push(newEvent._id);
        await group.save();

        res.status(201).json(newEvent);
    } catch (err) {
        res.status(500).json({error: "Ошибка при создании события"});
        console.log("Error in createEvent: ", err.message);
    }
};

const getEvents = async (req, res) => {
    try {
        const {groupId} = req.params;

        // Проверка, что учитель связан с группой
        const group = await Group.findById(groupId).populate({
            path: 'events', // Сначала заполняем поле events
            populate: {
                path: 'status', // Затем заполняем поле status внутри каждого мероприятия
            },
        });
        if (!group) {
            return res.status(404).json({error: "Группа не найдена"});
        }

        return res.status(200).json(group.events);
    } catch (error) {
        return res.status(500).json({error: "Ошибка сервера", details: error.message});
    }
}

const getEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const event = await Event.findById(eventId).populate("status"); // Популяция статуса, если нужно
        if (!event) {
            return res.status(404).json({error: "Мероприятие не найдено"});
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({error: "Ошибка сервера при получении мероприятия"});
        console.error("Error in getEvent:", error.message);
    }
}

const markEventAsViewed = async (req, res) => {
    try {
        const userId = req.user._id;
        const eventId = req.params.eventId;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({error: 'Мероприятие не найдено'});
        }

        // Добавляем пользователя в viewUsers, если его там нет
        if (!event.viewUsers.includes(userId)) {
            event.viewUsers.push(userId);
            await event.save();
        }

        res.status(200).json({message: 'Мероприятие отмечено как просмотренное'});
    } catch (error) {
        res.status(500).json({error: "Ошибка при просмотре мероприятия"});
        console.log('Ошибка в markEventAsViewed:', error.message);
    }
};

const getEventGroup = async (req, res) => {
    try {
        const {eventId} = req.params;
        const group = await Group.findOne({events: eventId}).populate('users');
        if (!group) {
            return res.status(404).json({error: "Группа для этого мероприятия не найдена"});
        }
        return res.status(200).json(group);
    } catch (error) {
        res.status(500).json({error: "Ошибка при подргрузке мероприятий группы"});
        console.error("Error in getEventGroup:", error.message);
    }
};

export {createEvent, getEvents, markEventAsViewed, getEvent, getEventGroup};