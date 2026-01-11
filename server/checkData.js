import mongoose from "mongoose";
import dotenv from "dotenv";
import OrderModel from "./models/Order.js";
import ProductModel from "./models/Product.js";

dotenv.config();

const checkData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Check products
    const products = await ProductModel.find({ isDeleted: false }).limit(5);
    console.log(`📦 Found ${products.length} products (showing first 5):`);
    products.forEach((p) => {
      console.log(`  - ${p.name} (ID: ${p._id})`);
    });

    console.log("\n🛒 Checking orders for each product:");
    for (const product of products) {
      const orderCount = await OrderModel.countDocuments({
        product: product._id,
      });
      console.log(`  - ${product.name}: ${orderCount} orders`);

      if (orderCount > 0) {
        const sampleOrders = await OrderModel.find({ product: product._id })
          .limit(3)
          .sort({ orderDate: -1 });
        console.log(`    Sample orders:`);
        sampleOrders.forEach((o) => {
          console.log(
            `      ${o.orderDate.toISOString().split("T")[0]} - Qty: ${
              o.quantity
            }`
          );
        });
      }
    }

    // Total orders
    const totalOrders = await OrderModel.countDocuments();
    console.log(`\n📊 Total orders in database: ${totalOrders}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

checkData();
