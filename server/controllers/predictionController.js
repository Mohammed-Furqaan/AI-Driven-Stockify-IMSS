import * as predictionService from "../services/predictionService.js";
import Prediction from "../models/Prediction.js";
import ProductModel from "../models/Product.js";
import mongoose from "mongoose";

/**
 * @desc    Compute prediction for a specific product
 * @route   POST /api/predictions/:productId
 * @access  Private (Admin only)
 */
export const computePrediction = async (req, res) => {
  try {
    const { productId } = req.params;

    console.log(`[Prediction] Computing prediction for product: ${productId}`);

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log(`[Prediction] Invalid product ID format: ${productId}`);
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Compute prediction
    const prediction = await predictionService.computePrediction(productId);

    console.log(
      `[Prediction] Successfully computed prediction for product: ${productId}`
    );
    return res.status(200).json({
      success: true,
      prediction,
    });
  } catch (error) {
    console.error("[Prediction] Error computing prediction:", error);
    console.error("[Prediction] Error message:", error.message);

    if (error.message === "Product not found") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (
      error.message.includes("Insufficient historical data") ||
      error.message.includes("Minimum 7 days required")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Insufficient historical data for prediction. Minimum 7 days required.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error computing prediction",
    });
  }
};

/**
 * @desc    Get stored prediction for a specific product
 * @route   GET /api/predictions/:productId
 * @access  Private (Admin only)
 */
export const getPrediction = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Find prediction and populate product reference
    const prediction = await Prediction.findOne({ productId }).populate(
      "productId",
      "name stock"
    );

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: "No prediction found for this product",
      });
    }

    return res.status(200).json({
      success: true,
      prediction,
    });
  } catch (error) {
    console.error("Error retrieving prediction:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving prediction",
    });
  }
};

/**
 * @desc    Compute predictions for all products
 * @route   POST /api/predictions/compute-all
 * @access  Private (Admin only)
 */
export const computeAllPredictions = async (req, res) => {
  try {
    // Fetch all non-deleted products
    const products = await ProductModel.find({ isDeleted: false });

    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    // Process each product
    for (const product of products) {
      try {
        await predictionService.computePrediction(product._id);
        successCount++;
      } catch (error) {
        failureCount++;
        errors.push({
          productId: product._id,
          productName: product.name,
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      summary: {
        totalProducts: products.length,
        successful: successCount,
        failed: failureCount,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error("Error computing all predictions:", error);
    return res.status(500).json({
      success: false,
      message: "Error computing predictions for all products",
    });
  }
};
