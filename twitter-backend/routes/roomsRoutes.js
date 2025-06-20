import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {
    createRoom,
    getRoom,
    getRoomAboutUserId,
    getRoomMessages,
    getUserChats,
    getUsersListForCorrespondence,
    sendMessage
} from "../controllers/roomController.js";

const router = express.Router();

router.post("/createRoom", protectRoute, createRoom)
router.get("/:recipientId", protectRoute, getRoomAboutUserId)
router.get("/room/:roomId", protectRoute, getRoom)
router.post("/sendMessage", protectRoute, sendMessage)
router.get("/messages/:roomId", protectRoute, getRoomMessages)
router.get("/", protectRoute, getUserChats)
router.get("/users/:id", protectRoute, getUsersListForCorrespondence);

export default router;
