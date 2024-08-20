import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import megaBotRouter from "./routes/megaBotRouter.js";

dotenv.config();

//Connect with DB
try {
	await mongoose.connect(process.env.MONGODB_URI);
	console.log("Connected to Gus-Tech data base!");
} catch (error) {
	console.log("Error while connecting with DB", error.message);
}

// Server creation
const app = express();

// Cors config
app.use(
	cors({
		origin: [
			"http://localhost:3000",			
			"https://www.gus-tech.com",
			"https://3-2-6-gus-tech-landing.vercel.app",
			"https://three-2-6-gus-tech-api-landing-v1.onrender.com"
		],
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Origin",
			"X-Requested-With",
			"Content-Type",
			"Accept",
			"Authorization",
		],
	})
);

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Middleware para servir archivos estáticos
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/megabot", megaBotRouter);
app.use("/", (req, res) => {
	res.status(200).send("Estoy prendido!!");
});

// Port
const port = process.env.PORT || 8000;

app.listen(port, () => {
	console.log(`Server running at PORT:${port}`);
});
