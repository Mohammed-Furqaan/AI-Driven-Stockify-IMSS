import {
  isInventoryIntent,
  recognizeIntent,
  extractEntities,
  callGeminiApi,
  generateResponse,
} from "../services/chatbotService.js";
import { createOrderFromChatbot } from "./orderController.js";
import {
  searchProductByName,
  getLowStockProducts,
  getInventoryStats,
} from "./productController.js";
import { getTopDemandedProducts } from "./demandController.js";

/**
 * Main chatbot message handler - CONVERSATION FIRST APPROACH
 * Routes to Gemini API by default, inventory mode only when needed
 */
export const handleChatbotMessage = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // STEP 1: Check if this is inventory-related
    // If NOT, route to Gemini API immediately (DEFAULT MODE)
    if (!isInventoryIntent(message)) {
      const geminiResult = await callGeminiApi(
        message,
        conversationHistory || []
      );
      return res.status(200).json({
        success: true,
        response: geminiResult.text,
        intent: "casual_conversation",
        isCasual: true,
      });
    }

    // STEP 2: This is inventory-related, recognize specific intent
    const intentResult = recognizeIntent(message);
    const { intent } = intentResult;

    // STEP 3: Extract entities for inventory operations
    const entities = extractEntities(message, intent);

    // STEP 4: Route to appropriate inventory handler
    let result;
    let response;

    switch (intent) {
      case "place_order":
        result = await handleOrderPlacement(userId, entities);
        response = result.success
          ? generateResponse("place_order", result)
          : result.message;
        break;

      case "product_info":
        result = await handleProductInfo(entities);
        response = result.success
          ? generateResponse("product_info", result)
          : result.message;
        break;

      case "inventory_overview":
        if (userRole !== "admin") {
          return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required.",
          });
        }
        result = await handleInventoryOverview();
        response = result.success
          ? generateResponse("inventory_overview", result)
          : result.message;
        break;

      case "low_stock":
        if (userRole !== "admin") {
          return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required.",
          });
        }
        result = await handleLowStock(entities);
        response = result.success
          ? generateResponse("low_stock", result)
          : result.message;
        break;

      case "demand_analytics":
        if (userRole !== "admin") {
          return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required.",
          });
        }
        result = await handleDemandAnalytics();
        response = result.success
          ? generateResponse("demand_analytics", result)
          : result.message;
        break;

      default:
        // Fallback to Gemini for unclear inventory queries
        const geminiResult = await callGeminiApi(
          message,
          conversationHistory || []
        );
        return res.status(200).json({
          success: true,
          response: geminiResult.text,
          intent: "casual_conversation",
          isCasual: true,
        });
    }

    // STEP 5: Return inventory response (NO confidence score)
    // Next message will be evaluated independently (stateless)
    return res.status(200).json({
      success: true,
      response,
      intent,
      data: result?.data || result,
      isCasual: false,
    });
  } catch (error) {
    console.error("Error handling chatbot message:", error);
    return res.status(500).json({
      success: false,
      message:
        "Sorry, I encountered an error processing your request. Please try again.",
      error: error.message,
    });
  }
};

/**
 * Handles order placement from chatbot
 */
const handleOrderPlacement = async (userId, entities) => {
  try {
    const { productName, quantity } = entities;

    if (!productName) {
      return {
        success: false,
        message: "Please specify which product you'd like to order.",
      };
    }

    const result = await createOrderFromChatbot(userId, productName, quantity);

    if (result.success) {
      return {
        success: true,
        order: result.order,
        data: { order: result.order },
      };
    } else if (result.insufficientStock && result.alternatives?.length > 0) {
      const altText = result.alternatives
        .map(
          (alt) =>
            `- ${alt.name} ($${alt.price.toFixed(2)}, ${alt.stock} in stock)`
        )
        .join("\n");
      return {
        success: false,
        message: `${result.message}\n\n📦 **Alternative Products:**\n${altText}`,
      };
    } else {
      return result;
    }
  } catch (error) {
    console.error("Error in handleOrderPlacement:", error);
    return {
      success: false,
      message: "Error processing order. Please try again.",
    };
  }
};

/**
 * Handles product information queries with fuzzy search support
 */
const handleProductInfo = async (entities) => {
  try {
    const { productName, isPartialSearch } = entities;

    if (!productName) {
      return {
        success: false,
        message: "Please specify which product you'd like to know about.",
      };
    }

    // Use fuzzy search for partial/short names
    const mockReq = { query: { query: productName } };
    let result = null;

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          result = data;
        },
      }),
    };

    // Import fuzzy search dynamically
    const { fuzzySearchProducts } = await import("./productController.js");
    await fuzzySearchProducts(mockReq, mockRes);

    if (result && result.success && result.products.length > 0) {
      return {
        success: true,
        products: result.products,
        suggestions: result.suggestions,
        data: { products: result.products, suggestions: result.suggestions },
      };
    } else {
      return {
        success: false,
        message:
          result?.message || `No products found matching "${productName}".`,
        suggestions: result?.suggestions || [],
      };
    }
  } catch (error) {
    console.error("Error in handleProductInfo:", error);
    return {
      success: false,
      message: "Error fetching product information. Please try again.",
    };
  }
};

/**
 * Handles inventory overview queries (admin only)
 */
const handleInventoryOverview = async () => {
  try {
    const mockReq = { query: {} };
    let result = null;

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          result = data;
        },
      }),
    };

    await getInventoryStats(mockReq, mockRes);

    if (result && result.success) {
      return {
        success: true,
        stats: result.stats,
        data: { stats: result.stats },
      };
    } else {
      return {
        success: false,
        message: "Error fetching inventory statistics.",
      };
    }
  } catch (error) {
    console.error("Error in handleInventoryOverview:", error);
    return {
      success: false,
      message: "Error fetching inventory overview. Please try again.",
    };
  }
};

/**
 * Handles demand analytics queries (admin only)
 */
const handleDemandAnalytics = async () => {
  try {
    const mockReq = { query: { limit: 5 } };
    let result = null;

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          result = data;
        },
      }),
    };

    await getTopDemandedProducts(mockReq, mockRes);

    if (result && result.success) {
      return {
        success: true,
        products: result.products,
        data: { products: result.products },
      };
    } else {
      return {
        success: false,
        message: "Error fetching demand analytics.",
      };
    }
  } catch (error) {
    console.error("Error in handleDemandAnalytics:", error);
    return {
      success: false,
      message: "Error fetching demand analytics. Please try again.",
    };
  }
};

/**
 * Handles low stock queries (admin only)
 */
const handleLowStock = async (entities) => {
  try {
    const { threshold } = entities;
    const mockReq = { query: { threshold } };
    let result = null;

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          result = data;
        },
      }),
    };

    await getLowStockProducts(mockReq, mockRes);

    if (result && result.success) {
      return {
        success: true,
        products: result.products,
        data: { products: result.products },
      };
    } else {
      return {
        success: false,
        message: "Error fetching low stock products.",
      };
    }
  } catch (error) {
    console.error("Error in handleLowStock:", error);
    return {
      success: false,
      message: "Error fetching low stock information. Please try again.",
    };
  }
};
