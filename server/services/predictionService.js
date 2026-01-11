import mongoose from "mongoose";
import OrderModel from "../models/Order.js";
import ProductModel from "../models/Product.js";
import Prediction from "../models/Prediction.js";

/**
 * Collect historical order data for a product and aggregate by date
 * @param {ObjectId} productId - The product ID
 * @returns {Array} Array of {date, quantity} objects sorted chronologically
 */
export const collectHistoricalData = async (productId) => {
  console.log(`[CollectData] Collecting data for product ID: ${productId}`);
  console.log(`[CollectData] Product ID type: ${typeof productId}`);

  // Convert to ObjectId if it's a string
  const productObjectId =
    typeof productId === "string"
      ? new mongoose.Types.ObjectId(productId)
      : productId;

  console.log(`[CollectData] Converted to ObjectId: ${productObjectId}`);

  // First, let's check if there are ANY orders for this product
  const orderCount = await OrderModel.countDocuments({
    product: productObjectId,
  });
  console.log(
    `[CollectData] Total orders found for this product: ${orderCount}`
  );

  // Aggregate orders by date for the product
  const aggregatedData = await OrderModel.aggregate([
    {
      $match: {
        product: productObjectId,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$orderDate" },
        },
        quantity: { $sum: "$quantity" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  if (aggregatedData.length === 0) {
    return [];
  }

  // Convert aggregated data to date objects
  const dataMap = new Map();
  aggregatedData.forEach((item) => {
    dataMap.set(item._id, item.quantity);
  });

  // Get date range
  const dates = Array.from(dataMap.keys()).sort();
  const startDate = new Date(dates[0]);
  const endDate = new Date(dates[dates.length - 1]);

  // Fill missing dates with zero quantity
  const history = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split("T")[0];
    history.push({
      date: new Date(currentDate),
      quantity: dataMap.get(dateString) || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return history;
};

/**
 * Calculate moving average from data
 * @param {Array} data - Array of quantity values
 * @param {Number} windowSize - Window size for moving average (default 30)
 * @returns {Number} Moving average value
 */
export const calculateMovingAverage = (data, windowSize = 30) => {
  if (data.length === 0) return 0;

  const window = data.slice(-Math.min(windowSize, data.length));
  const sum = window.reduce((acc, val) => acc + val, 0);
  return sum / window.length;
};

/**
 * Calculate linear trend using least-squares regression
 * @param {Array} data - Array of quantity values
 * @returns {Function} Function that predicts value for given day index
 */
export const calculateLinearTrend = (data) => {
  const n = data.length;
  if (n === 0) return () => 0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Return function that predicts value for any day index
  return (dayIndex) => slope * dayIndex + intercept;
};

/**
 * Generate forecast for next N days
 * @param {Array} history - Array of {date, quantity} objects
 * @param {Number} days - Number of days to forecast (default 30)
 * @returns {Array} Array of {date, predicted} objects
 */
export const generateForecast = (history, days = 30) => {
  if (history.length === 0) return [];

  const quantities = history.map((h) => h.quantity);
  const movingAvg = calculateMovingAverage(quantities, 30);
  const trendFunc = calculateLinearTrend(quantities);

  const forecast = [];
  const lastDate = new Date(history[history.length - 1].date);

  for (let i = 1; i <= days; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);

    const trendValue = trendFunc(history.length + i - 1);
    const predicted = Math.max(0, 0.6 * trendValue + 0.4 * movingAvg);

    forecast.push({
      date: futureDate,
      predicted: Math.round(predicted * 100) / 100, // Round to 2 decimals
    });
  }

  return forecast;
};

/**
 * Calculate confidence score based on data variability
 * @param {Array} history - Array of {date, quantity} objects
 * @returns {Number} Confidence score between 0 and 1
 */
export const calculateConfidence = (history) => {
  if (history.length === 0) return 0;

  const quantities = history.map((h) => h.quantity);
  const mean =
    quantities.reduce((acc, val) => acc + val, 0) / quantities.length;

  if (mean === 0) return 0.5; // Neutral confidence for zero mean

  // Calculate standard deviation
  const variance =
    quantities.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
    quantities.length;
  const stdDev = Math.sqrt(variance);

  // Calculate coefficient of variation
  const cv = stdDev / mean;

  // Convert CV to confidence score (lower CV = higher confidence)
  // CV of 0 = confidence 1.0, CV of 1 or more = confidence 0.3
  const confidence = Math.max(0.3, Math.min(1.0, 1.0 - cv * 0.7));

  return Math.round(confidence * 100) / 100; // Round to 2 decimals
};

/**
 * Calculate recommended reorder quantity
 * @param {Number} predictedTotal - Total predicted demand
 * @param {Number} currentStock - Current stock level
 * @returns {Number} Recommended reorder quantity (minimum 0)
 */
export const calculateReorderQuantity = (predictedTotal, currentStock) => {
  const safetyStock = predictedTotal * 0.2; // 20% safety stock
  const reorder = predictedTotal - currentStock + safetyStock;
  return Math.max(0, Math.round(reorder));
};

/**
 * Main function to compute prediction for a product
 * @param {ObjectId} productId - The product ID
 * @returns {Object} Complete prediction object
 */
export const computePrediction = async (productId) => {
  console.log(
    `[Service] Starting prediction computation for product: ${productId}`
  );

  // Fetch product details
  const product = await ProductModel.findById(productId);
  if (!product) {
    console.log(`[Service] Product not found: ${productId}`);
    throw new Error("Product not found");
  }

  console.log(`[Service] Found product: ${product.name}`);

  // Collect historical data
  const history = await collectHistoricalData(productId);
  console.log(`[Service] Collected ${history.length} days of historical data`);

  // Validate sufficient data (minimum 7 days)
  if (history.length < 7) {
    console.log(
      `[Service] Insufficient data: only ${history.length} days, need 7`
    );
    throw new Error(
      "Insufficient historical data for prediction. Minimum 7 days required."
    );
  }

  // Generate forecast
  const forecast = generateForecast(history, 30);

  // Calculate predicted total
  const predictedTotalNext30 = forecast.reduce(
    (sum, f) => sum + f.predicted,
    0
  );

  // Calculate confidence
  const confidence = calculateConfidence(history);

  // Calculate reorder quantity
  const recommendedReorder = calculateReorderQuantity(
    predictedTotalNext30,
    product.stock
  );

  // Build prediction object
  const predictionData = {
    productId: product._id,
    productName: product.name,
    history,
    forecast,
    predictedTotalNext30: Math.round(predictedTotalNext30 * 100) / 100,
    confidence,
    recommendedReorder,
    method: "moving-average-trend",
    generatedAt: new Date(),
  };

  // Upsert prediction to database (replace existing)
  const prediction = await Prediction.findOneAndUpdate(
    { productId: product._id },
    predictionData,
    { upsert: true, new: true }
  ).populate("productId", "name stock");

  return prediction;
};
