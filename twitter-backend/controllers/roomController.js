import Room from "../models/roomModel.js";
import User from "../models/userModel.js";

const getRoomAboutUserId = async (req, res) => {
    try {
        const userId = req.user._id;
        const {recipientId} = req.params;

        if (!recipientId || !userId) {
            return res.status(400).json({error: "Один из участников переписки не подключен"});
        }

        const room = await Room.findOne({
            users: {
                $all: [userId.toString(), req.params.recipientId]
            }
        });
        if (!room) {
            return res.status(404).json({message: "Переписки с этим пользователем еще нет", data: null});
        }

        return res.status(200).json(room);
    } catch (e) {
        return res.status(500).send();
    }
}

const getRoom = async (req, res) => {
    try {
        const userId = req.user._id;
        const {roomId} = req.params;

        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({message: "Переписки с этим пользователем еще нет", data: null});
        }

        return res.status(200).json(room);
    } catch (e) {
        return res.status(500).send();
    }
}

const getUsersListForCorrespondence = async (req, res) => {
    console.log("Entering getUsersListForCorrespondence, req.user:", req.user);
    try {
        if (!req.user) {
            console.error("req.user is undefined");
            return res.status(401).json({error: "Пользователь не аутентифицирован"});
        }

        const userId = req.user._id;

        // Находим все комнаты, где участвует текущий пользователь, с сортировкой по updatedAt
        const rooms = await Room.find({
            users: userId.toString(),
        })
            .populate("lastMessage.sender")
            .sort({updatedAt: -1}) // Сортировка по времени обновления
            .lean();

        if (!rooms || rooms.length < 1) {
            return res.status(404).json({error: "У вас нет переписок"});
        }

        // Извлекаем информацию о получателях
        const recipients = await Promise.all(rooms.map(async (room) => {
            const recipientId = room.users.find((id) => id.toString() !== userId.toString());
            if (!recipientId) {
                console.log("No recipientId found for room:", room._id);
                return null;
            }

            const recipient = await User.findById(recipientId)
                .select("username profilePic")
                .lean();
            if (!recipient) {
                console.log("Recipient not found for ID:", recipientId);
                return null;
            }

            return {
                _id: recipient._id,
                username: recipient.username || "Unknown",
                profilePic: recipient.profilePic || "",
                lastMessage: room.lastMessage ? {
                    text: room.lastMessage.text || "",
                    sender: room.lastMessage.sender?._id.toString() === userId.toString() ? "Вы" : recipient.username || "Unknown",
                } : null,
            };
        }));

        const filteredRecipients = recipients.filter((recipient) => recipient !== null);

        return res.status(200).json(filteredRecipients);
    } catch (error) {
        console.error("Error in getUsersListForCorrespondence:", error);
        return res.status(500).json({error: "Ошибка сервера", details: error.message});
    }
};
const getUserChats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Находим все чаты, в которых участвует пользователь
        const rooms = await Room.find({users: userId})
            .populate("users", "name username profilePic")
            .populate("lastMessage.sender", "name username")
            .sort({updatedAt: -1});

        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json({error: "Ошибка сервера", details: err.message});
    }
};

const createRoom = async (req, res) => {
    try {
        const {recipientId} = req.body;
        const userId = req.user._id;

        if (!recipientId || !userId) {
            return res.status(400).json({error: "Не все пользователи участвуют в переписке"});
        }

        const existingRoom = await Room.findOne({
            users: {
                $all: [userId.toString(), recipientId]
            }
        });

        if (existingRoom) {
            return res.status(200).json(existingRoom);
        }

        // if (img) {
        //     const uploadedResponse = await cloudinary.uploader.upload(img);
        //     img = uploadedResponse.secure_url;
        // }

        const newRoom = new Room({users: [recipientId, userId]});
        await newRoom.save();

        return res.status(201).json(newRoom);
    } catch (e) {
        return res.status(500).send({error: e.message});
    }
}

const sendMessage = async (req, res) => {
    try {
        const {senderBy, text, img, roomId} = req.body;
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(400).json({error: "У вас нет переписки с этим пользователем"});
        }

        if (text.trim() === "") {
            return res.status(400).json({error: "Введите текст для сообщения"});
        }

        if (text.length > 50) {
            return res.status(400).json({error: "Сообщение не может превышать 50 символов"});
        }

        const message = {
            senderBy,
            text,
            img,
            createdAt: new Date(),
            seen: false,
        };

        room.lastMessage = {sender: senderBy, text, createdAt: new Date()};
        room.messages.push(message);
        await room.save();

        return res.status(200).json({...message, _id: room.messages[room.messages.length - 1]._id});
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
};

const getRoomMessages = async (req, res) => {
    try {
        const {roomId} = req.params;

        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(400).json({error: "У вас нет переписки с этим пользователем"})
        }

        return res.status(200).json(room.messages);
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}

export {
    getRoomAboutUserId, getRoom, createRoom, sendMessage, getRoomMessages, getUsersListForCorrespondence, getUserChats
}
