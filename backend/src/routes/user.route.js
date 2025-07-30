import express from "express";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import protectRoute from "../middleware/auth.middleware.js";

const userRouter = express.Router();

userRouter.get("/getuser", protectRoute, async (req, res) => {
  const userId = req.user._id;
  try {
    
    const existingChats = await Chat.find({
      participants: userId,
    }).select("participants");

    
    const chatUserIds = existingChats.flatMap((chat) =>
      chat.participants.filter((participantId) => !participantId.equals(userId))
    );

    
    const users = await User.find({
      _id: {
        $ne: userId,
        $nin: chatUserIds,
      },
    }).select("-password");

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
});

export default userRouter;
