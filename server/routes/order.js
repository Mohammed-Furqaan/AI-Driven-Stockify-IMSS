import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import checkAdmin from "../middleware/checkAdmin.js";
import {
  addOrder,
  getOrders,
  approveOrder,
  rejectOrder,
  cancelOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/add", authMiddleware, addOrder);
router.get("/", authMiddleware, getOrders);

// Admin routes
router.put("/:id/approve", authMiddleware, checkAdmin, approveOrder);
router.put("/:id/reject", authMiddleware, checkAdmin, rejectOrder);

// Customer routes
router.put("/:id/cancel", authMiddleware, cancelOrder);

export default router;
