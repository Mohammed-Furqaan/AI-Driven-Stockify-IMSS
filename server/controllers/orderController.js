import Product from "../models/Product.js";
import Order from "../models/Order.js";

const addOrder = async (req, res) => {
  try {
    const { productId, quantity, total } = req.body;
    const userId = req.user._id;
    const product = await Product.findById({ _id: productId });
    if (!product) {
      return res.status(404).json({ error: "product not found in order" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ error: "Not enough stock" });
    } else {
      product.stock -= parseInt(quantity);
      await product.save();
    }

    const orderObj = new Order({
      customer: userId,
      product: productId,
      quantity,
      totalPrice: total,
    });

    await orderObj.save();

    return res
      .status(200)
      .json({ success: true, message: "Order added successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    let query = {};
    if (req.user.role === "customer") {
      query = { customer: userId };
    }
    const orders = await Order.find(query)
      .populate({
        path: "product",
        populate: {
          path: "categoryId",
          select: "categoryName",
        },
        select: "name price",
      })
      .populate("customer", "name email");
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error in fetching Orders" });
  }
};

// Approve order (Admin only)
const approveOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = "approved";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order approved successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Reject order (Admin only)
const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = "rejected";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order rejected successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Cancel order (Customer only)
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Check if order belongs to the user
    if (order.customer.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own orders",
      });
    }

    // Check if order is still pending
    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled",
      });
    }

    order.status = "cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { addOrder, getOrders, approveOrder, rejectOrder, cancelOrder };

import { incrementDemand } from "./demandController.js";

/**
 * Creates an order from chatbot interaction with fuzzy search
 * @param {string} userId - User ID
 * @param {string} productName - Product name (supports typos and partial names)
 * @param {number} quantity - Order quantity
 * @returns {Promise<Object>} - Order result or error
 */
export const createOrderFromChatbot = async (userId, productName, quantity) => {
  try {
    if (!userId || !productName || !quantity) {
      return {
        success: false,
        message: "User ID, product name, and quantity are required",
      };
    }

    // Import fuzzy search from chatbot service
    const { fuzzyProductSearch } = await import(
      "../services/chatbotService.js"
    );

    // Get all products for fuzzy matching
    const allProducts = await Product.find({ isDeleted: false }).populate(
      "categoryId"
    );

    // Use fuzzy search to find matching products
    const matchedProducts = fuzzyProductSearch(allProducts, productName);

    if (!matchedProducts || matchedProducts.length === 0) {
      return {
        success: false,
        message: `Product "${productName}" not found. Please check the product name and try again.`,
        productNotFound: true,
      };
    }

    // Use the best match (first result)
    const product = matchedProducts[0];

    // Check stock availability
    if (product.stock < quantity) {
      // Get alternative products from same category
      const alternatives = await getAlternativeProducts(
        product.categoryId._id,
        quantity
      );

      return {
        success: false,
        message: `Sorry, "${product.name}" is out of stock. We only have ${product.stock} unit(s) available.`,
        insufficientStock: true,
        product: {
          name: product.name,
          availableStock: product.stock,
          requestedQuantity: quantity,
        },
        alternatives,
      };
    }

    // Calculate total price
    const totalPrice = product.price * quantity;

    // Create order
    const order = new Order({
      customer: userId,
      product: product._id,
      quantity,
      totalPrice,
      status: "pending",
    });

    await order.save();

    // Decrement product stock
    product.stock -= quantity;
    await product.save();

    // Increment demand counter
    await incrementDemand(product._id, quantity);

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate("product")
      .populate("customer", "name email");

    return {
      success: true,
      order: populatedOrder,
      message: `Order placed successfully for ${quantity} x ${product.name}`,
    };
  } catch (error) {
    console.error("Error creating order from chatbot:", error);
    return {
      success: false,
      message: "Server error creating order. Please try again.",
    };
  }
};

/**
 * Gets alternative products from the same category
 * @param {string} categoryId - Category ID
 * @param {number} minStock - Minimum stock required
 * @returns {Promise<Array>} - Array of alternative products
 */
export const getAlternativeProducts = async (categoryId, minStock = 1) => {
  try {
    const alternatives = await Product.find({
      categoryId,
      stock: { $gte: minStock },
      isDeleted: false,
    })
      .limit(5)
      .populate("categoryId")
      .select("name price stock description");

    return alternatives;
  } catch (error) {
    console.error("Error fetching alternative products:", error);
    return [];
  }
};
