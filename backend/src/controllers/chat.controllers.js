import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const getchats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ participants: { $in: [userId] } })
      .populate("participants", "username")
      .sort({ updatedAt: -1 }); // Sort by most recent activity first

    // Return _id, lastMessage, chatName, and updatedAt for sorting
    const chatsWithNames = chats.map((chat) => {
      const otherParticipant = chat.participants.find(
        (participant) => participant._id.toString() !== userId.toString()
      );
      return {
        _id: chat._id,
        lastMessage: chat.lastMessage,
        chatName: otherParticipant ? otherParticipant.username : "Unknown",
        updatedAt: chat.updatedAt,
      };
    });

    return res.status(200).json({ chatsWithNames });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createChat = async (req, res) => {
  const { participants } = req.body;
  if (!participants || participants.length < 2) {
    return res
      .status(400)
      .json({ message: "At least two participants are required" });
  }
  try {
    const users = await User.find({ _id: { $in: participants } });
    if (users.length !== participants.length) {
      return res.status(404).json({ message: "One or more users not found" });
    }
    const newChat = new Chat({
      participants: users.map((user) => user._id),
      lastMessage: null,
    });
    await newChat.save();
    return res.status(201).json({ chat: newChat });
  } catch (error) {
    console.error("Error creating chat:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
