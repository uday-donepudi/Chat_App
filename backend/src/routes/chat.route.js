import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import { createChat, getchats } from "../controllers/chat.controllers.js";

const chatRouter = express.Router();

chatRouter.get("/", protectRoute, getchats);

chatRouter.post("/join", protectRoute, createChat);

export default chatRouter;
