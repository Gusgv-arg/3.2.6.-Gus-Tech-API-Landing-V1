import express from "express";
import { megaBotController } from "../controllers/megaBotController.js";
import { userMiddleware } from "../middlewares/userMiddleware.js";

const megaBotRouter = express.Router();

// For posting user message
megaBotRouter.post("/", userMiddleware, megaBotController);

export default megaBotRouter;
