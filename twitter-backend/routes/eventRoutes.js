import express from "express";
import {createEvent, getEvent, getEventGroup, getEvents, markEventAsViewed,} from "../controllers/eventController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/create", protectRoute, createEvent);
router.get("/group/:groupId", protectRoute, getEvents);
router.post('/event/:eventId/view', protectRoute, markEventAsViewed);
router.get("/:eventId", protectRoute, getEvent);
router.get('/:eventId/group', protectRoute, getEventGroup);

export default router;