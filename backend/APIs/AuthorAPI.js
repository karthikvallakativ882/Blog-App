import exp from "express";
import { register } from "../services/AuthService.js";
import { checkAuthor } from "../middlewares/checkAuthor.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import ArticleModel from "../models/ArticleModel.js";
import upload from "../config/multer.js";
import { uploadToCloudinary } from "../config/coudinaryUpload.js";

export const authorRoute = exp.Router();

const articlePopulateOptions = [
  { path: "author", select: "firstName lastName email profileImageUrl" },
  { path: "comments.user", select: "firstName lastName email profileImageUrl role" },
];

const getArticlePayload = (body = {}) => ({
  title: body.title?.trim(),
  category: body.category?.trim(),
  content: body.content?.trim(),
});

// Register author (public)
authorRoute.post("/users", upload.single("profileImage"), async (req, res, next) => {
  try {
    const userObj = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      userObj.profileImageUrl = uploadResult.secure_url;
    }

    const newUserObj = await register({ ...userObj, role: "AUTHOR" });
    res.status(201).json({ message: "author created", payload: newUserObj });
  } catch (err) {
    next(err);
  }
});

// Create article (protected)
authorRoute.post("/articles", verifyToken, checkAuthor, async (req, res) => {
  try {
    const articlePayload = getArticlePayload(req.body);

    if (!articlePayload.title || !articlePayload.category || !articlePayload.content) {
      return res.status(400).json({ message: "Title, category and content are required" });
    }

    const article = {
      ...articlePayload,
      author: req.user.userId,
    };

    const newArticleDoc = new ArticleModel(article);
    const createdArticleDoc = await newArticleDoc.save();
    const populatedArticle = await ArticleModel.findById(createdArticleDoc._id)
      .populate(articlePopulateOptions);

    res.status(201).json({ message: "article created", payload: populatedArticle });
  } catch (err) {
    res.status(500).json({ message: "error creating article", error: err.message });
  }
});

// Read articles of author (protected)
authorRoute.get("/articles/:authorId", verifyToken, checkAuthor, async (req, res) => {
  try {
    const aid = req.user.userId;

    const articles = await ArticleModel.find({ author: aid })
      .sort({ createdAt: -1 })
      .populate(articlePopulateOptions);

    res.status(200).json({ message: "articles", payload: articles });
  } catch (err) {
    res.status(500).json({ message: "error fetching articles", error: err.message });
  }
});

// Edit article (protected)
authorRoute.put("/articles", verifyToken, checkAuthor, async (req, res) => {
  try {
    const { articleId, title, category, content } = req.body;
    const authorId = req.user.userId;
    const articlePayload = getArticlePayload({ title, category, content });

    if (!articleId) {
      return res.status(400).json({ message: "Article id is required" });
    }

    if (!articlePayload.title || !articlePayload.category || !articlePayload.content) {
      return res.status(400).json({ message: "Title, category and content are required" });
    }

    const updatedArticle = await ArticleModel.findOneAndUpdate(
      {
        _id: articleId,
        author: authorId,
      },
      { $set: articlePayload },
      { new: true, runValidators: true }
    ).populate(articlePopulateOptions);

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({ message: "article updated", payload: updatedArticle });
  } catch (err) {
    res.status(500).json({ message: "error updating article", error: err.message });
  }
});

// Hide or show article (protected soft delete)
authorRoute.patch("/articles/:articleId/visibility", verifyToken, checkAuthor, async (req, res) => {
  try {
    const { articleId } = req.params;
    const { isArticleActive } = req.body;
    const authorId = req.user.userId;

    if (typeof isArticleActive !== "boolean") {
      return res.status(400).json({ message: "isArticleActive must be a boolean value" });
    }

    const updatedArticle = await ArticleModel.findOneAndUpdate(
      {
        _id: articleId,
        author: authorId,
      },
      { $set: { isArticleActive } },
      { new: true, runValidators: true }
    ).populate(articlePopulateOptions);

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({
      message: isArticleActive ? "article is now visible" : "article hidden from readers",
      payload: updatedArticle,
    });
  } catch (err) {
    res.status(500).json({ message: "error updating article visibility", error: err.message });
  }
});
