import UserTypeModel from "../models/UserModel.js";

export const checkAuthor = async (req, res, next) => {
  const authenticatedAuthorId = req.user?.userId;
  const requestedAuthorId =
    req.body?.author || req.params?.authorId || authenticatedAuthorId;

  if (!authenticatedAuthorId) {
    return res.status(401).json({ message: "Unauthorized request. Please login" });
  }

  if (
    requestedAuthorId &&
    requestedAuthorId.toString() !== authenticatedAuthorId.toString()
  ) {
    return res
      .status(403)
      .json({ message: "You can only manage your own author resources" });
  }

  const author = await UserTypeModel.findById(authenticatedAuthorId);

  if (!author) {
    return res.status(401).json({ message: "Invalid Author" });
  }

  if (author.role !== "AUTHOR") {
    return res.status(403).json({ message: "User is not an Author" });
  }

  if (!author.isActive) {
    return res.status(403).json({ message: "Author account is not active" });
  }

  req.author = author;
  next();
};
