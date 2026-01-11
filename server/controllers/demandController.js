import Product from "../models/Product.js";

/**
 * Increments the demand counter for a product
 * @param {string} productId - Product ID
 * @param {number} amount - Amount to increment (default: 1)
 * @returns {Promise<Object>} - Updated product or error
 */
export const incrementDemand = async (productId, amount = 1) => {
  try {
    if (!productId) {
      return { success: false, message: "Product ID is required" };
    }

    const product = await Product.findById(productId);
    if (!product) {
      return { success: false, message: "Product not found" };
    }

    // Atomically increment demand counter
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $inc: { demandCount: amount },
        $set: { lastDemandUpdate: new Date() },
        $push: {
          demandHistory: {
            date: new Date(),
            count: amount,
          },
        },
      },
      { new: true }
    );

    return {
      success: true,
      product: updatedProduct,
      message: "Demand counter updated successfully",
    };
  } catch (error) {
    console.error("Error incrementing demand:", error);
    return { success: false, message: "Server error updating demand" };
  }
};

/**
 * Gets demand data for a specific product
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const getDemandByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findById(productId)
      .populate("categoryId")
      .populate("supplierId");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        demandCount: product.demandCount,
        lastDemandUpdate: product.lastDemandUpdate,
        stock: product.stock,
        price: product.price,
        category: product.categoryId?.categoryName,
      },
    });
  } catch (error) {
    console.error("Error fetching product demand:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching demand data",
    });
  }
};

/**
 * Gets top demanded products
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const getTopDemandedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const products = await Product.find({ isDeleted: false })
      .sort({ demandCount: -1 })
      .limit(limit)
      .populate("categoryId")
      .populate("supplierId");

    const formattedProducts = products.map((p) => ({
      _id: p._id,
      name: p.name,
      demandCount: p.demandCount,
      stock: p.stock,
      price: p.price,
      category: p.categoryId?.categoryName,
      lastDemandUpdate: p.lastDemandUpdate,
    }));

    return res.status(200).json({
      success: true,
      products: formattedProducts,
      message: `Top ${formattedProducts.length} demanded products`,
    });
  } catch (error) {
    console.error("Error fetching top demanded products:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching demand analytics",
    });
  }
};
