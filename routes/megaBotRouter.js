import express from "express";
import { megaBotController } from "../controllers/megaBotController.js";
import { userMiddleware } from "../middlewares/userMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";


const megaBotRouter = express.Router();

// For posting user message
megaBotRouter.post("/", upload.any(), userMiddleware, megaBotController);

export default megaBotRouter;
