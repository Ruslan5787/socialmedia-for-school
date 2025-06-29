import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({message: "Unauthorized"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({message: "В системе такого пользователя нет"});
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(500).json({message: 'Internal Server Error', error: err.message});
    }
};

export default protectRoute;
