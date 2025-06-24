import mongoose from "mongoose";

const eventsSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        Date: {
            type: Date,

            required: true,
        },
        Time: {
            type: String, // Предполагается строка времени, например, "14:30"
            required: true,
        },
        viewUsers: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Users",
            default: [],
        },
        status: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Status",
            required: true,
        },
        price: {
            type: Number,
            default: 0,
        },
        address: {
            type: String,
            default: "",
        },
        img: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Event = mongoose.model("Event", eventsSchema);

export default Event;