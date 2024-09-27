import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/user.routes.js";
import travelStoryRoutes from "./routes/travelStory.routes.js";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Configure CORS to allow specific origins
const allowedOrigins = [
  "https://travel-story-7rnt6fu1p-fawad526s-projects.vercel.app",//production deployment
  "http://localhost:5173", // Local development
  "https://travel-story-five.vercel.app", // Production frontend URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies and other credentials
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection using environment variable
mongoose
  .connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Use routes
app.use(authRoutes);
app.use(travelStoryRoutes);

// Serve static files for uploads and assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Travel Story API");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
