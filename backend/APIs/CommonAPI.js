import exp from "express";
import bcrypt from "bcryptjs";
import { authenticate } from "../services/AuthService.js";
import UserTypeModel from "../models/UserModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const commonRouter = exp.Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
};

// login
commonRouter.post("/login", async (req, res, next) => {
  try {
    const userCred = req.body;
    const { token, user } = await authenticate(userCred);

    res.cookie("token", token, cookieOptions);

    res.status(200).json({ message: "login success", payload: user });
  } catch (err) {
    next(err);
  }
});

commonRouter.get("/check-auth", verifyToken, async (req, res, next) => {
  try {
    const user = await UserTypeModel.findById(req.user.userId).select("-password");

    if (!user || user.isActive === false) {
      return res.status(401).json({ message: "Unauthorized request. Please login" });
    }

    res.status(200).json({ message: "authenticated", payload: user });
  } catch (err) {
    next(err);
  }
});

// logout for User, Author and Admin
commonRouter.get("/logout", (req, res) => {
  res.clearCookie("token", cookieOptions);

  res.status(200).json({ message: "Logged out successfully" });
});

// Change Password Route
commonRouter.put("/change-password", async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const userObj = await UserTypeModel.findOne({ email });

    if (!userObj) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatched = await bcrypt.compare(currentPassword, userObj.password);

    if (!isMatched) {
      return res.status(401).json({ message: "Old Password is Invalid" });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await UserTypeModel.findByIdAndUpdate(userObj._id, {
      $set: { password: newHashedPassword },
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
