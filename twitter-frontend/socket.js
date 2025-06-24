import {io} from "socket.io-client";

export const socket = io("http://localhost:27017", {
    transports: ['websocket'], withCredentials: true, cors: {
        origin: "*", methods: ["GET", "POST"], allowedHeaders: ['Access-Control-Allow-Origin'],
    },
});

socket.on("connect", () => {
    console.log("Connected to Socket.IO server");
});

socket.on("connect_error", (error) => {
    console.error("Socket.IO connection error:", error);
});