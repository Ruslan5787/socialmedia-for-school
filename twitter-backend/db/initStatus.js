import mongoose from "mongoose";
import Status from "../models/statusModel.js";

export const initStatuses = async () => {
    await mongoose.connect("mongodb+srv://RuslanAbdulazimov:vuJWgeFU7BMuPj4w@twittersocialmedia.agxykk4.mongodb.net/?retryWrites=true&w=majority&appName=TwitterSocialMedia");
    const statuses = [
        {name: "mandatory"},
        {name: "optional"},
    ];
    await Status.insertMany(statuses);
    mongoose.disconnect();
};

