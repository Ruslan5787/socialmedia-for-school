import mongoose from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";

const roomSchema = new mongoose.Schema(
    {
        title: {type: String},
        users: [{
            type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, default: [],
        }],
        lastMessage: {
            text: {type: String},
            sender: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
            seen: {type: Boolean, default: false},
            createdAt: {type: Date, default: Date.now},
        },
        messages: [{
            senderBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                autopopulate: {select: "username"}, // Автопопуляция username
            },
            text: {
                type: String,
                required: true,
            },
            createdAt: {type: Date, default: Date.now},
            seen: {type: Boolean, default: false},
            img: {type: String},
        }],
    },
    {timestamps: true}
);

roomSchema.plugin(mongooseAutoPopulate); // Подключаем плагин автопопуляции

const Room = mongoose.model("Room", roomSchema);

export default Room;