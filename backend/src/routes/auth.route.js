import express from "express";
import {loginHandler,logoutHandler,signupHandler,checkHandler} from "../controllers/auth.controller.js";
import protectRoute from "../middleware/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/signup", signupHandler);

authRouter.post("/login", loginHandler);

authRouter.post("/logout", logoutHandler);

authRouter.get("/check", protectRoute, checkHandler);

export default authRouter;
