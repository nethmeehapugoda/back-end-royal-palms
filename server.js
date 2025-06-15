import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import catogaryRoutes from "./routes/cateogoryRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";

import mongoose from "mongoose";

dotenv.config();
connectDB();

const app = express();

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Your other middleware and routes...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(express.json());

//API routes
app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/user", userRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/category", catogaryRoutes);
app.use("/api/room", roomRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
