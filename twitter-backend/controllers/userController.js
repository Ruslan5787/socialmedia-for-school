import User from "../models/userModel.js";

import bcrypt from "bcryptjs";

import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import {v2 as cloudinary} from "cloudinary";
import mongoose from "mongoose";
import {sendFollowUserEmail, sendWelcomeEmail} from "../utils/mailer.js";

const getUserProfile = async (req, res) => {
    const {query} = req.params;
    try {
        let user;
        // query is userId
        if (mongoose.Types.ObjectId.isValid(query)) {
            user = await User.findOne({_id: query}).select("-password").select("-updatedAt");
        } else {
            // query is username
            console.log("username", query)
            user = await User.findOne({username: query}).select("-password").select("-updatedAt");
        }
        console.log(user)
        if (!user) return;
        console.log(user)
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({error: err.message});
        console.log("Error in getUserProfile: ", err.message);
    }
};

const signupUser = async (req, res) => {
    try {
        const {name, email, username, password, role} = req.body;
        const user = await User.findOne({$or: [{email}, {username}]});

        if (user) {
            return res.status(400).json({error: "Такой пользователь уже существует"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword,
            role,
        });

        await newUser.save();

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);

            await sendWelcomeEmail(newUser.email, newUser.username);

            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                bio: newUser.bio,
                profilePic: newUser.profilePic,
                role: newUser.role,
            });
        } else {
            res.status(400).json({error: "Введены неверные данные"});
        }
    } catch (err) {
        res.status(500).json({error: err.message});
        console.log("Error in signupUser: ", err.message);
    }
};

const loginUser = async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) return res.status(400).json({error: "Неправильный логин или пароль"});

        if (user.isFrozen) {
            user.isFrozen = false;
            await user.save();
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePic: user.profilePic,
            role: user.role,
            groups: user.groups,
        });
    } catch (error) {
        res.status(500).json({error: error.message});
        console.log("Error in loginUser: ", error.message);
    }
};

const logoutUser = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 1});
        res.status(200).json({message: "Вы успешно вышли из аккаунта"});
    } catch (err) {
        res.status(500).json({error: err.message});
        console.log("Error in signupUser: ", err.message);
    }
};

const followUnFollowUser = async (req, res) => {
    try {
        const {id} = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString())
            return res.status(400).json({error: "Вы не можете подписаться/отписаться на себя"});

        if (!userToModify || !currentUser) return res.status(400).json({error: "Пользователь не найден"});

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // Unfollow user
            await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}});
            res.status(200).json({message: "Вы успешно отписались"});
        } else {
            // Follow user
            await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}});
            sendFollowUserEmail(req.user.email, req.user.username);

            res.status(200).json({message: "Вы успешно подписались"});
        }
    } catch (err) {
        res.status(500).json({error: err.message});
        console.log("Error in followUnFollowUser: ", err.message);
    }
};

const updateUser = async (req, res) => {
    const {name, email, username, password, bio} = req.body;
    let {profilePic} = req.body;
    const {id} = req.params;
    try {
        let user = await User.findById(id);
        if (!user) return res.status(400).json({error: "Пользователь не найден"});
        if (req.params.id !== id.toString())
            return res.status(400).json({error: "У вас нет прав обновлять данные пользователей"});

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        if (profilePic) {
            if (user.profilePic) {
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadedResponse.secure_url;
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();

        user.password = null;

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({error: err.message});
        console.log("Error in updateUser: ", err);
    }
};

const getSuggestedUsers = async (req, res) => {
    try {
        // exclude the current user from suggested users array and exclude users that current user is already following
        const userId = req.user._id;

        const usersFollowedByYou = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne: userId},
                },
            },
            {
                $sample: {size: 10},
            },
        ]);
        const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach((user) => (user.password = null));

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.log("Error in getSuggestedUsers:", error.message);
        res.status(500).json({error: error.message});
    }
};

const freezeAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(400).json({error: "Пользователь не найден"});
        }

        user.isFrozen = true;
        await user.save();

        res.status(200).json({success: true});
    } catch (error) {
        console.log("Error in freezeAccount:", error.message);
        res.status(500).json({error: error.message});
    }
};

const searchUsers = async (req, res) => {
    try {
        const {username} = req.params;

        const findUsers = await User.find({
            username: {
                $regex: username
            }
        })

        if (!findUsers) {
            return res.status(400).json({error: "Пользователя с таким именем нет"});
        }

        res.status(200).json(findUsers);
    } catch (error) {
        console.log("Error in searchUsers:", error.message);
        res.status(500).json({error: error.message});
    }
};

export {
    signupUser,
    loginUser,
    logoutUser,
    followUnFollowUser,
    updateUser,
    getUserProfile,
    getSuggestedUsers,
    freezeAccount,
    searchUsers
};
