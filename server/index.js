import express from "express";
import cors from "cors";
import connectDB from "./db/connection.js";
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/category.js";
import supplierRoutes from "./routes/supplier.js";
import productRoutes from "./routes/product.js";
import userRoutes from "./routes/user.js";
import orderRouter from "./routes/order.js";
import dashboardRouter from "./routes/dashboard.js";
import predictionRouter from "./routes/prediction.js";
import chatbotRouter from "./routes/chatbot.js";
import { initPredictionScheduler } from "./cron/predictionScheduler.js";

const app = express();

// Define the precise CORS options required for a secure credential exchange
const corsOptions = {
  // Allow multiple frontend origins (development ports)
  origin: [
    "http://localhost:5173",
    "http://localhost:3174",
    "http://localhost:5174",
  ],
  // CRITICAL FIX: Set to true because your frontend uses axios withCredentials: true
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

// Apply the configured CORS middleware
app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/predictions", predictionRouter);
app.use("/api/chatbot", chatbotRouter);

app.listen(process.env.PORT, () => {
  connectDB();
  initPredictionScheduler();
  console.log("Server is running on http://localhost:3000");
});
