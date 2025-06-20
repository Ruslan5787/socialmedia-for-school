import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        title: {type: String}, //maxLength: 50
        users: [{
            type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, default: [],
        }],
        lastMessage: {
            text: {type: String},
            sender: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
            seen: {
                type: Boolean,
                default: false,
            },
            createdAt: { type: Date, default: Date.now },
        },
        messages: [{
            senderBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            text: {
                type: String,
                maxLength: 50,
                required: true
            },
            createdAt: {type: Date, default: Date.now},
            seen: {
                type: Boolean,
                default: false,
            },
            img: {
                type: String,
            },
        }]
    }, {timestamps: true}
);

const Room = mongoose.model("Room", roomSchema);

export default Room;