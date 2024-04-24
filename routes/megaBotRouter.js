import express from "express"
import { megaBotController } from "../controllers/megaBotController.js"

const megaBotRouter = express.Router()

// For posting user message
megaBotRouter.post("/", megaBotController)

export default megaBotRouter

