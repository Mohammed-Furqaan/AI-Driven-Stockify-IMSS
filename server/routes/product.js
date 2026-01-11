import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  fuzzySearchProducts,
  getRelatedProducts,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", authMiddleware, getProducts);
router.get("/search", authMiddleware, fuzzySearchProducts);
router.get("/related", authMiddleware, getRelatedProducts);
router.post("/add", authMiddleware, addProduct);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
