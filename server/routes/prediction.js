import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import checkAdmin from "../middleware/checkAdmin.js";
import {
  computePrediction,
  getPrediction,
  computeAllPredictions,
} from "../controllers/predictionController.js";

const router = express.Router();

// All routes require authentication and admin role
router.post("/compute-all", authMiddleware, checkAdmin, computeAllPredictions);
router.post("/:productId", authMiddleware, checkAdmin, computePrediction);
router.get("/:productId", authMiddleware, checkAdmin, getPrediction);

export default router;
