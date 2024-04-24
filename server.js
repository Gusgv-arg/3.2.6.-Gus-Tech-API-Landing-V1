import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors";
import morgan from "morgan";
import megaBotRouter from "./routes/megaBotRouter.js";

dotenv.config();

//Connect with DB
try {
  mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("Connected to MegaBot data base!")
    }).catch(err=>{
      console.log(err.message)
    })  
} catch (error) {
  console.log("Error while connecting with DB", error.message)
}

// Server creation
const app = express();

// Cors config
app.use(
  cors({
    origin: ["http://localhost:3000", "https://api-landingpage.onrender.com"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
  })
);

// Middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/megabot", megaBotRouter);  
 
// Port
const port = process.env.PORT || 4000;

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});

