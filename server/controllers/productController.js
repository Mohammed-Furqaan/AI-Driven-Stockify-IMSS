import Supplier from "../models/Supplier.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, supplierId } =
      req.body;

    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      categoryId,
      supplierId,
    });

    await newProduct.save();
    return res
      .status(201)
      .json({ success: true, message: "Product added successfully" });
  } catch (error) {
    console.error("Error adding Product:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false })
      .populate("categoryId")
      .populate("supplierId");
    const suppliers = await Supplier.find({});
    const categories = await Category.find({});
    return res
      .status(200)
      .json({ success: true, products, suppliers, categories });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error in Suppliers" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, categoryId, supplierId } =
      req.body;

    const updateProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, stock, categoryId, supplierId },
      { new: true }
    );

    if (!updateProduct) {
      return res
        .status(404)
        .json({ success: false, message: "product not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updateProduct,
    });
  } catch (error) {
    console.error("Error updating Products: ", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (existingProduct.isDeleted) {
      return res
        .status(400)
        .json({ success: true, message: "Product already deleted" });
    }

    await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    return res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting Product: ", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export { getProducts, addProduct, updateProduct, deleteProduct };

import { incrementDemand } from "./demandController.js";

/**
 * Searches for products by name (fuzzy search)
 * Also increments demand counter for queried products
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const searchProductByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    // Fuzzy search using regex (case-insensitive)
    const searchRegex = new RegExp(name.trim(), "i");
    const products = await Product.find({
      name: searchRegex,
      isDeleted: false,
    })
      .populate("categoryId")
      .populate("supplierId")
      .limit(10);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No products found matching "${name}"`,
        products: [],
      });
    }

    // Increment demand counter for all found products
    for (const product of products) {
      await incrementDemand(product._id, 1);
    }

    return res.status(200).json({
      success: true,
      products,
      message: `Found ${products.length} product(s) matching "${name}"`,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return res.status(500).json({
      success: false,
      message: "Server error searching products",
    });
  }
};

/**
 * Gets products with low stock
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const getLowStockProducts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;

    const products = await Product.find({
      stock: { $lt: threshold },
      isDeleted: false,
    })
      .populate("categoryId")
      .populate("supplierId")
      .sort({ stock: 1 });

    return res.status(200).json({
      success: true,
      products,
      threshold,
      count: products.length,
      message: `Found ${products.length} product(s) with stock below ${threshold}`,
    });
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching low stock products",
    });
  }
};

/**
 * Gets inventory statistics
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const getInventoryStats = async (req, res) => {
  try {
    // Get all non-deleted products
    const products = await Product.find({ isDeleted: false }).populate(
      "categoryId"
    );

    // Calculate total product count
    const totalProducts = products.length;

    // Calculate total stock value
    const totalValue = products.reduce(
      (sum, product) => sum + product.price * product.stock,
      0
    );

    // Count low stock items (threshold: 10)
    const lowStockCount = products.filter((p) => p.stock < 10).length;

    // Calculate category distribution
    const categoryMap = {};
    products.forEach((product) => {
      const categoryName = product.categoryId?.categoryName || "Uncategorized";
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = 0;
      }
      categoryMap[categoryName]++;
    });

    const categories = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count,
    }));

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalValue,
        lowStockCount,
        categories,
      },
      message: "Inventory statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching inventory statistics",
    });
  }
};

/**
 * Fuzzy search for products with partial name matching
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const fuzzySearchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchTerm = query.trim().toLowerCase();

    // Get all non-deleted products
    const allProducts = await Product.find({ isDeleted: false })
      .populate("categoryId")
      .populate("supplierId");

    // Calculate similarity scores
    const productsWithScores = allProducts.map((product) => {
      const nameLower = product.name.toLowerCase();

      // Exact match
      if (nameLower === searchTerm) {
        return { product, score: 100, matchType: "exact" };
      }

      // Starts with
      if (nameLower.startsWith(searchTerm)) {
        return { product, score: 90, matchType: "starts_with" };
      }

      // Contains
      if (nameLower.includes(searchTerm)) {
        return { product, score: 80, matchType: "contains" };
      }

      // Fuzzy match (Levenshtein distance)
      const words = nameLower.split(" ");
      let bestWordScore = 0;

      for (const word of words) {
        if (word.includes(searchTerm) || searchTerm.includes(word)) {
          bestWordScore = Math.max(bestWordScore, 70);
        }

        // Calculate similarity
        const distance = levenshteinDistance(searchTerm, word);
        const maxLength = Math.max(searchTerm.length, word.length);
        const similarity = ((maxLength - distance) / maxLength) * 100;

        bestWordScore = Math.max(bestWordScore, similarity);
      }

      return { product, score: bestWordScore, matchType: "fuzzy" };
    });

    // Filter products with score > 50 and sort by score
    const matches = productsWithScores
      .filter((item) => item.score > 50)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    if (matches.length === 0) {
      // Get suggestions from same category or popular products
      const suggestions = allProducts
        .sort((a, b) => (b.demandCount || 0) - (a.demandCount || 0))
        .slice(0, 5);

      return res.status(200).json({
        success: true,
        products: [],
        suggestions,
        message: `No exact matches found for "${query}". Here are some popular products you might like.`,
      });
    }

    // Increment demand for matched products
    for (const match of matches.slice(0, 3)) {
      await incrementDemand(match.product._id, 1);
    }

    return res.status(200).json({
      success: true,
      products: matches.map((m) => m.product),
      matchScores: matches.map((m) => ({
        id: m.product._id,
        score: m.score,
        type: m.matchType,
      })),
      message: `Found ${matches.length} product(s) matching "${query}"`,
    });
  } catch (error) {
    console.error("Error in fuzzy search:", error);
    return res.status(500).json({
      success: false,
      message: "Server error performing search",
    });
  }
};

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
const levenshteinDistance = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
};

/**
 * Get related product suggestions
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const getRelatedProducts = async (req, res) => {
  try {
    const { productId, categoryId } = req.query;

    let relatedProducts = [];

    if (productId) {
      const product = await Product.findById(productId);
      if (product) {
        relatedProducts = await Product.find({
          categoryId: product.categoryId,
          _id: { $ne: productId },
          isDeleted: false,
        })
          .populate("categoryId")
          .limit(5);
      }
    } else if (categoryId) {
      relatedProducts = await Product.find({
        categoryId,
        isDeleted: false,
      })
        .populate("categoryId")
        .sort({ demandCount: -1 })
        .limit(5);
    } else {
      // Return popular products
      relatedProducts = await Product.find({ isDeleted: false })
        .populate("categoryId")
        .sort({ demandCount: -1 })
        .limit(5);
    }

    return res.status(200).json({
      success: true,
      products: relatedProducts,
      message: "Related products retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching related products",
    });
  }
};
