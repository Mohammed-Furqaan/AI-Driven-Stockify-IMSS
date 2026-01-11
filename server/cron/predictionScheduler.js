import cron from "node-cron";
import ProductModel from "../models/Product.js";
import * as predictionService from "../services/predictionService.js";

/**
 * Initialize CRON scheduler for daily prediction computation
 * Runs every day at 2:00 AM
 */
export const initPredictionScheduler = () => {
  // Schedule: '0 2 * * *' means 2:00 AM every day
  cron.schedule("0 2 * * *", async () => {
    const startTime = new Date();
    console.log(
      `[CRON] Starting daily prediction computation at ${startTime.toISOString()}`
    );

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

      const endTime = new Date();
      const duration = (endTime - startTime) / 1000; // seconds

      console.log(
        `[CRON] Daily prediction computation completed at ${endTime.toISOString()}`
      );
      console.log(`[CRON] Duration: ${duration} seconds`);
      console.log(`[CRON] Total products: ${products.length}`);
      console.log(`[CRON] Successful: ${successCount}`);
      console.log(`[CRON] Failed: ${failureCount}`);

      if (errors.length > 0) {
        console.log(`[CRON] Errors:`, errors);
      }
    } catch (error) {
      console.error("[CRON] Error during daily prediction computation:", error);
    }
  });

  console.log(
    "[CRON] Prediction scheduler initialized. Will run daily at 2:00 AM."
  );
};
