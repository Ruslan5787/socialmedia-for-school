// schoolRoutes.js
import express from "express";
import {
    createGroup,
    createSchool,
    getGroup,
    deleteUser,
    getGroups,
    getGroupUsers,
    getSchool,
    getSchools,
    createStudent
} from "../controllers/schoolController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, createSchool);
router.post("/group", protectRoute, createGroup);
router.get("/groups/:schoolId?", protectRoute, getGroups);
router.get("/", protectRoute, getSchools);
router.get("/school/:id", protectRoute, getSchool);
router.get("/group_students/:id", protectRoute, getGroupUsers);
router.delete("/users/:id", protectRoute, deleteUser); // Новый маршрут
router.post("/student", protectRoute, createStudent); // Новый маршрут
router.get("/group/:id", protectRoute, getGroup);

export default router;