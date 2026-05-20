import exp from "express";
import { register } from "../services/AuthService.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import ArticleModel from "../models/ArticleModel.js";
import upload from "../config/multer.js";
import { uploadToCloudinary } from "../config/coudinaryUpload.js";

export const userRoute = exp.Router();

// Register user 
userRoute.post("/users", upload.single("profileImage"), async (req, res, next) => {
  try {
    const userObj = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      userObj.profileImageUrl = uploadResult.secure_url;
    }

    const newUserObj = await register({ ...userObj, role: "USER" });
    res.status(201).json({ message: "user created", payload: newUserObj });
  } catch (err) {
    next(err);
  }
});

// Read all articles (protected route)
userRoute.get("/articles", verifyToken, async (req, res) => {
  try {
    const articles = await ArticleModel.find({
      isArticleActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("author", "firstName lastName email profileImageUrl")
      .populate("comments.user", "firstName lastName email profileImageUrl role");

    res.status(200).json({ message: "articles", payload: articles });
  } catch (err) {
    res.status(500).json({ message: "error fetching articles", error: err.message });
  }
});

// Add comment to an article (protected route)
userRoute.post("/articles/:articleId/comments", verifyToken, async (req, res) => {
  try {
    if (req.user?.role !== "USER") {
      return res.status(403).json({ message: "Only users can add comments" });
    }

    const articleId = req.params.articleId;
    const commentText = req.body?.comment?.trim();

    if (!commentText) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const article = await ArticleModel.findOne({
      _id: articleId,
      isArticleActive: true,
    });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    article.comments.push({
      user: req.user.userId,
      comment: commentText,
    });

    await article.save();

    const updatedArticle = await ArticleModel.findById(articleId)
      .populate("author", "firstName lastName email profileImageUrl")
      .populate("comments.user", "firstName lastName email profileImageUrl role");

    res.status(201).json({ message: "comment added", payload: updatedArticle });
  } catch (err) {
    res.status(500).json({ message: "error adding comment", error: err.message });
  }
});
