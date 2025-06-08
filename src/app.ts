import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { userRouter } from "./routes/user";
import { articleRouter } from "./routes/article";
import { setupSwagger } from "./config/swagger";
import { errorHandler } from "./middleware/errorHandler";

// Load environment variables
dotenv.config();

// Create Express app
const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRouter);
app.use("/api/articles", articleRouter);

// Home route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the CASL Express API" });
});

app.use(errorHandler);

export default app;
