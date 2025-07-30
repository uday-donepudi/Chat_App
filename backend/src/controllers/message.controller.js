import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import { socketServer, connectedUsers } from "../config/socket.js";

export const createMessage = async (req, res) => {
  const { chatId, content } = req.body;

  try {
    // Add validation
    if (!chatId || !content) {
      return res
        .status(400)
        .json({ message: "Chat ID and content are required" });
    }

    if (!content.trim()) {
      return res
        .status(400)
        .json({ message: "Message content cannot be empty" });
    }

    const newMessage = new Message({
      chatId,
      sender: req.user._id,
      content,
    });

    await newMessage.save();
    const chat = await Chat.findById(chatId).populate(
      "participants",
      "username"
    );
    if (
      !chat ||
      !chat.participants.some(
        (p) => p._id.toString() === req.user._id.toString()
      )
    ) {
      return res
        .status(403)
        .json({ message: "You are not a participant in this chat" });
    }
    chat.lastMessage = newMessage.content;
    // Update the chat's updatedAt timestamp to reflect the new message
    chat.updatedAt = new Date();
    await chat.save();

    // Emit to all participants in the chat (including sender)
    chat.participants.forEach((participant) => {
      const socketId = connectedUsers.get(participant._id.toString());
      if (socketId) {
        socketServer.to(socketId).emit("newMessage", newMessage);

        // Generate chatName for this participant (other participant's name)
        const otherParticipant = chat.participants.find(
          (p) => p._id.toString() !== participant._id.toString()
        );
        const chatName = otherParticipant
          ? otherParticipant.username
          : "Unknown";

        // Emit lastMessage event with chatId, content, and chatName for chat list updates
        socketServer.to(socketId).emit("lastMessage", {
          chatId: chatId,
          content: newMessage.content,
          chatName: chatName,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId).select("participants");
    if (!chat || !chat.participants.includes(req.user._id.toString())) {
      return res
        .status(403)
        .json({ message: "You are not a participant in this chat" });
    }

    const messages = await Message.find({ chatId }).select({
      sender: 1,
      content: 1,
      createdAt: 1,
    });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the user is the sender of the message or a participant in the chat
    const chat = await Chat.findById(message.chatId).populate(
      "participants",
      "username"
    );
    if (
      !chat ||
      (!chat.participants.some(
        (p) => p._id.toString() === req.user._id.toString()
      ) &&
        message.sender.toString() !== req.user._id.toString())
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this message" });
    }

    // Store message data before deletion for socket emission
    const deletedMessageData = {
      messageId: message._id,
      chatId: message.chatId,
      sender: message.sender,
    };

    await Message.findByIdAndDelete(messageId);

    // Emit to all participants in the chat
    chat.participants.forEach((participant) => {
      const socketId = connectedUsers.get(participant._id.toString());
      if (socketId) {
        socketServer.to(socketId).emit("messageDeleted", deletedMessageData);
      }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
