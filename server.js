import express from "express";
import dotenv from "dotenv";
import path from "path";

import cookieParser from "cookie-parser";
import userRoutes from "./twitter-backend/routes/userRoutes.js";
import postRoutes from "./twitter-backend/routes/postRoutes.js";
import sсhoolRoutes from "./twitter-backend/routes/schoolRoutes.js";
import eventRoutes from "./twitter-backend/routes/eventRoutes.js";
import {Server} from 'socket.io';
import {createServer} from 'node:http';
import {v2 as cloudinary} from "cloudinary";
import {app} from "./twitter-backend/socket/socket.js";
import roomsRoutes from "./twitter-backend/routes/roomsRoutes.js";
import cors from "cors";
import {startCronJobs} from "./twitter-backend/cron/cron.js";
import connectDB from "./twitter-backend/db/connectDB.js";
import {initStatuses} from "./twitter-backend/db/initStatus.js";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middlewares
app.use(cors({
    origin: "https://socialmedia-for-school-frontend.vercel.app/auth", // Замените на ваш Vercel URL
    credentials: true
}));
app.use(express.json({limit: "50mb"})); // To parse JSON data in the req.body
app.use(express.urlencoded({extended: true})); // To parse form data in the req.body
app.use(cookieParser());

const server = createServer(app);
const io = new Server(server);

// twitter-backend/index.js
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("leave_room", (roomId) => {
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);
    });

    socket.on("send_message", (msg) => {
        io.to(msg.roomId).emit("message_from", msg);
    });

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
    });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/schools", sсhoolRoutes);
app.use("/api/events", eventRoutes);

startCronJobs();

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "twitter-frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "twitter-frontend", "dist", "index.html"));
    });
}

server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
