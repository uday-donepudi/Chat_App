import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import { createMessage, deleteMessage, getMessages } from "../controllers/message.controller.js";

const messageRouter = express.Router();

messageRouter.post("/newMessage", protectRoute, createMessage);
messageRouter.get("/:chatId", protectRoute, getMessages);
messageRouter.delete("/:messageId", protectRoute, deleteMessage);

export default messageRouter;
