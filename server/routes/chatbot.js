import express from "express";
import { handleChatbotMessage } from "../controllers/chatbotController.js";
import {
  getDemandByProduct,
  getTopDemandedProducts,
} from "../controllers/demandController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All chatbot routes require authentication
router.use(authMiddleware);

// Main chatbot message endpoint
router.post("/message", handleChatbotMessage);

// Demand analytics endpoints
router.get("/demand/top", getTopDemandedProducts);
router.get("/demand/:productId", getDemandByProduct);

export default router;
