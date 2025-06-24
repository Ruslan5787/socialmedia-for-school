import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import {v2 as cloudinary} from "cloudinary";

const createPost = async (req, res) => {
    try {
        const {postedBy, text} = req.body;
        let {img} = req.body;

        if (!postedBy || !text) {
            return res.status(400).json({error: "Заполните поле текст для поста"});
        }

        const user = await User.findById(postedBy);
        if (!user) {
            return res.status(404).json({error: "Пользователь не найден"});
        }

        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({error: "У вас нет прав для создания ученика"});
        }

        const maxLength = 500;
        if (text.length > maxLength) {
            return res.status(400).json({error: `Длинна текста в посте должна быть ${maxLength} символов`});
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({postedBy, text, img});
        await newPost.save();

        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({error: "Пост не найден"});
        }

        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({error: "Ошибка при получении поста"});
        console.log(err.message)
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({error: "Пост не найден"});
        }

        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({error: "У вас нет прав для удаления ученика"});
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({message: "Пост удален успешно"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

const likeUnlikePost = async (req, res) => {
    try {
        const {id: postId} = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({error: "Пост не найден"});
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            // Unlike post
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}});
            res.status(200).json({message: "Вы убрали лайк"});
        } else {
            // Like post
            post.likes.push(userId);
            await post.save();
            res.status(200).json({message: "Вы поставили лайк"});
        }
    } catch (err) {
        res.status(500).json({error: "Ошибка при реализации функции лайк"});
        console.log(err.message)
    }
};

const replyToPost = async (req, res) => {
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        const userProfilePic = req.user.profilePic;
        const username = req.user.username;

        if (!text) {
            return res.status(400).json({error: "Поле комментарий должно быть заполнено"});
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({error: "Пост не найден"});
        }

        const reply = {userId, text, userProfilePic, username};

        post.replies.push(reply);
        await post.save();

        res.status(200).json(reply);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

const getFeedPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({error: "Пост не найден"});
        }

        const following = user.following;

        const feedPosts = await Post.find({postedBy: {$in: following}}).sort({createdAt: -1});

        res.status(200).json(feedPosts);
    } catch (err) {
        res.status(500).json({error: "Ошибка при получении постов ваших подписок"});
    }
};

const getUserPosts = async (req, res) => {
    const {username} = req.params;
    try {
        const user = await User.findOne({username});
        if (!user) {
            return res.status(404).json({error: "Такого пользователя нет"});
        }

        const posts = await Post.find({postedBy: user._id}).sort({createdAt: -1});

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({error: "Ошибка при получении постов пользователя"});
        console.log(error.message)
    }
};

export {createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts};
