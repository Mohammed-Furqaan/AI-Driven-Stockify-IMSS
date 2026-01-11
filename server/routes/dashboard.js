import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import checkAdmin from "../middleware/checkAdmin.js";
import {
  getData,
  getInventorySummary,
  getHighDemandAlerts,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/", authMiddleware, getData);
router.get("/summary", authMiddleware, getInventorySummary);
router.get("/alerts", authMiddleware, checkAdmin, getHighDemandAlerts);

export default router;
