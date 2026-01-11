import OrderModel from "../models/Order.js"; // Assume correct path
import Product from "../models/Product.js"; // Assume correct path
import Category from "../models/Category.js"; // <--- ADDED IMPORT
import Supplier from "../models/Supplier.js"; // <--- ADDED IMPORT
import Prediction from "../models/Prediction.js";

// NOTE: You must ensure 'bcrypt' and 'jwt' are imported elsewhere in your project
// for user-related functions, although they are not needed in these specific functions.

/**
 * @desc    Get comprehensive dashboard data (Admin view)
 * @route   GET /api/dashboard
 * @access  Private
 */
const getData = async (req, res) => {
  try {
    // NOTE: This function currently retrieves TOTAL system-wide data, not user-specific data.
    // If this is for an Admin dashboard, this is acceptable.

    const totalProducts = await Product.countDocuments();

    const stockResult = await Product.aggregate([
      { $group: { _id: null, totalStock: { $sum: "$stock" } } },
    ]);
    const totalStock = stockResult[0]?.totalStock || 0;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const ordersToday = await OrderModel.countDocuments({
      orderDate: { $gte: startOfDay, $lte: endOfDay },
    });

    const revenueResult = await OrderModel.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);
    const revenue = revenueResult[0]?.totalRevenue || 0;

    const outOfStock = await Product.find({ stock: 0 })
      .select("name categoryId stock")
      .populate("categoryId", "categoryName");

    // highest sale Product
    const highestSaleResult = await OrderModel.aggregate([
      { $group: { _id: "$product", totalQuantity: { $sum: "$quantity" } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.categoryId",
          foreignField: "_id",
          as: "product.categoryId",
        },
      },
      { $unwind: "$product.categoryId" },
      {
        $project: {
          name: "$product.name",
          category: "$product.categoryId.categoryName",
          totalQuantity: 1,
        },
      },
    ]);

    const highestSaleProduct = highestSaleResult[0] || {
      message: "No sale data available",
    };

    // low stock Product
    const lowStock = await Product.find({ stock: { $gt: 0, $lt: 5 } })
      .select("name stock")
      .populate("categoryId", "categoryName");

    const dashboardData = {
      totalProducts,
      totalStock,
      ordersToday,
      revenue,
      outOfStock,
      highestSaleProduct,
      lowStock,
    };
    return res.status(200).json({ success: true, dashboardData });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Error in Fetching dashboard Summary" });
  }
};

/**
 * @desc    Get user-specific inventory summary (Chatbot/Customer view)
 * @route   GET /api/dashboard/summary
 * @access  Private
 */
const getInventorySummary = async (req, res) => {
  try {
    // The userId is provided by the 'protect' middleware attached to the route.
    // This correctly scope the data to the authenticated user.
    const userId = req.user._id;

    // 1. Get Product Count
    const productCount = await Product.countDocuments({ user: userId });

    // 2. Get Categories List
    const categories = await Category.find({ user: userId })
      .select("categoryName")
      .lean();

    // 3. Get Suppliers List
    const suppliers = await Supplier.find({ user: userId })
      .select("name")
      .lean();

    // 4. Return the consolidated summary object
    return res.status(200).json({
      success: true,
      productCount: productCount,
      categories: categories,
      suppliers: suppliers,
    });
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    // Respond with a 500 error if anything goes wrong during the database operation
    return res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch dashboard summary.",
    });
  }
};

/**
 * @desc    Get high demand alerts for products
 * @route   GET /api/dashboard/alerts
 * @access  Private (Admin only)
 */
const getHighDemandAlerts = async (req, res) => {
  try {
    // Fetch all predictions and populate product data
    const predictions = await Prediction.find().populate(
      "productId",
      "name stock"
    );

    // Filter predictions where predicted demand exceeds current stock
    const alerts = predictions
      .filter(
        (pred) =>
          pred.productId && pred.predictedTotalNext30 > pred.productId.stock
      )
      .map((pred) => ({
        productId: pred.productId._id,
        productName: pred.productId.name,
        predictedDemand: pred.predictedTotalNext30,
        currentStock: pred.productId.stock,
        recommendedReorder: pred.recommendedReorder,
        urgency: pred.predictedTotalNext30 - pred.productId.stock,
      }))
      .sort((a, b) => b.urgency - a.urgency); // Sort by urgency descending

    return res.status(200).json({
      success: true,
      alerts,
    });
  } catch (error) {
    console.error("Error fetching high demand alerts:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching high demand alerts",
    });
  }
};

export { getData, getInventorySummary, getHighDemandAlerts };
