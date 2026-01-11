import mongoose from "mongoose";
import OrderModel from "./models/Order.js";
import ProductModel from "./models/Product.js";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

const seedOrders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all products
    const products = await ProductModel.find({ isDeleted: false }).limit(5);

    if (products.length === 0) {
      console.log("No products found. Please add products first.");
      process.exit(1);
    }

    // Get a customer user
    const customer = await User.findOne({ role: "customer" });

    if (!customer) {
      console.log(
        "No customer user found. Please create a customer user first."
      );
      process.exit(1);
    }

    console.log(`Found ${products.length} products`);
    console.log(`Using customer: ${customer.email}`);

    // Generate orders for the last 30 days
    const ordersToCreate = [];
    const today = new Date();

    for (const product of products) {
      console.log(`\nGenerating orders for: ${product.name}`);

      // Create 30 days of order history
      for (let i = 0; i < 30; i++) {
        const orderDate = new Date(today);
        orderDate.setDate(orderDate.getDate() - i);

        // Random quantity between 1 and 10
        const quantity = Math.floor(Math.random() * 10) + 1;

        // Skip some days randomly (70% chance of having an order)
        if (Math.random() > 0.3) {
          ordersToCreate.push({
            customer: customer._id,
            product: product._id,
            quantity: quantity,
            totalPrice: product.price * quantity,
            orderDate: orderDate,
          });
        }
      }
    }

    // Insert orders
    console.log(`\nInserting ${ordersToCreate.length} orders...`);
    await OrderModel.insertMany(ordersToCreate);

    console.log("✅ Sample orders created successfully!");
    console.log(`Total orders created: ${ordersToCreate.length}`);

    // Show summary per product
    for (const product of products) {
      const count = ordersToCreate.filter(
        (o) => o.product.toString() === product._id.toString()
      ).length;
      console.log(`  - ${product.name}: ${count} orders`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding orders:", error);
    process.exit(1);
  }
};

seedOrders();
