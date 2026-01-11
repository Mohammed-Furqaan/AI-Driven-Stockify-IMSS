import { useState, useRef, useEffect } from "react";
import axios from "axios";

const GEMINI_API_KEY = "AIzaSyDxS13PPWnUSPJ4jXXhx344QnK9nFSoo-I";

const API_KEY_QUERY = GEMINI_API_KEY ? `?key=${GEMINI_API_KEY}` : "";
const GEMINI_API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";
const GEMINI_API_URL = `${GEMINI_API_BASE_URL}${API_KEY_QUERY}`;

const systemInstruction = `You are StockBot, a friendly and intelligent multilingual AI assistant - just like ChatGPT.

CORE BEHAVIOR (MOST IMPORTANT):
1. You are primarily a CONVERSATIONAL AI - chat naturally about ANY topic
2. ALWAYS respond in the SAME LANGUAGE the user uses (English, Hindi, Kannada, Tamil, Telugu, Urdu, Arabic, etc.)
3. Be warm, friendly, humorous, and engaging - like talking to a friend
4. Understand jokes, emotions, greetings, and casual banter
5. Explain any topic clearly - technology, science, history, culture, anything
6. NEVER give repetitive or robotic template responses
7. NEVER mention inventory/products unless the user specifically asks about them
8. Use emojis naturally when appropriate

You also help with inventory when asked:
- Product searches and information
- Order placement
- Inventory management (for admins)

But remember: CASUAL CONVERSATION IS YOUR PRIMARY MODE. Only switch to inventory mode when the user clearly asks about products, orders, or stock.`;

const StockBot = () => {
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hello! 👋 I'm StockBot, your intelligent assistant. I can help you with:\n\n📦 Product searches and orders\n📊 Inventory management\n💬 General conversation in any language\n\nHow can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper: Check if message is an explanation query
  const isExplanationQuery = (message) => {
    const explanationPatterns = [
      /\bexplain\b/i,
      /\bwhat is\b/i,
      /\bwhat are\b/i,
      /\bwhat's\b/i,
      /\bhow does\b/i,
      /\bhow do\b/i,
      /\bhow to\b/i,
      /\bdescribe\b/i,
      /\bteach me\b/i,
      /\bdefine\b/i,
      /\bgive me notes\b/i,
      /\btell me about\b/i,
      /\bsolve\b/i,
      /\bwhy\b/i,
      /\bwhen\b/i,
      /\bwhere\b/i,
      /\bwho\b/i,
      /\bwhich\b/i,
    ];

    return explanationPatterns.some((pattern) => pattern.test(message));
  };

  // Helper: Check if message is inventory-related
  const isInventoryIntent = (message) => {
    const inventoryKeywords = [
      "order",
      "buy",
      "purchase",
      "stock",
      "price",
      "cost",
      "inventory",
      "product",
      "available",
      "demand",
      "analytics",
      "supplier",
      "category",
      "low stock",
    ];
    const lowerMsg = message.toLowerCase();
    return inventoryKeywords.some((keyword) => lowerMsg.includes(keyword));
  };

  // Helper: Detect specific intent
  const detectIntent = (message) => {
    const lowerMsg = message.toLowerCase();

    if (/\b(order|buy|purchase)\b/i.test(message)) return "place_order";
    if (/\b(show|tell|what|details|info|price)\b/i.test(message))
      return "product_info";
    if (/\b(low|running low)\b.*\bstock\b/i.test(message)) return "low_stock";
    if (/\b(demand|trending|popular)\b/i.test(message))
      return "demand_analytics";
    if (/\b(all|list).*\b(products|inventory)\b/i.test(message))
      return "inventory_overview";
    if (lowerMsg.includes("supplier")) return "supplier_info";
    if (lowerMsg.includes("category")) return "category_info";

    return "product_info"; // default for inventory queries
  };

  // Helper: Extract entities from message
  const extractEntities = (message) => {
    const entities = { productName: null, quantity: 1 };

    // Extract quantity
    const qtyMatch = message.match(/\b(\d+)\b/);
    if (qtyMatch) {
      entities.quantity = parseInt(qtyMatch[1], 10);
    }

    // Extract product name (remove common words)
    let cleanMsg = message
      .replace(
        /\b(order|buy|purchase|show|tell|details|info|price|cost|how|much|many|the|a|an|please|thanks|give|me|want|need)\b/gi,
        ""
      )
      .replace(/\d+/g, "")
      .trim();

    if (cleanMsg.length > 0) {
      entities.productName = cleanMsg;
    }

    return entities;
  };

  // Fetch inventory summary
  const fetchInventorySummary = async (queryType) => {
    const token = localStorage.getItem("pos-token");
    if (!token) return { error: "⚠️ Please log in to access inventory data." };

    try {
      const response = await axios.get(
        "http://localhost:3000/api/dashboard/summary",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const { productCount, categories, suppliers } = response.data;

        if (queryType.includes("product")) {
          return `📦 You currently have **${productCount}** different products in stock.`;
        }
        if (queryType.includes("supplier")) {
          const list = suppliers.map((s) => s.name).join(", ");
          return `🏭 You have **${suppliers.length}** active suppliers: ${list}.`;
        }
        if (queryType === "category") {
          const list = categories.map((c) => c.categoryName).join(", ");
          return `🏷️ You have **${categories.length}** categories: ${list}.`;
        }
      }

      return { error: "Could not retrieve inventory data." };
    } catch (error) {
      return { error: "Failed to connect to inventory system." };
    }
  };

  // Search products with fuzzy matching
  const searchProducts = async (productName) => {
    const token = localStorage.getItem("pos-token");
    if (!token) return { error: "⚠️ Please log in to search products." };

    try {
      const response = await axios.get(
        `http://localhost:3000/api/products/search?query=${encodeURIComponent(
          productName
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.products.length > 0) {
        return { products: response.data.products };
      }
      return { error: `No products found matching "${productName}".` };
    } catch (error) {
      return { error: "Error searching products." };
    }
  };

  // Place order
  const placeOrder = async (productName, quantity) => {
    const token = localStorage.getItem("pos-token");
    if (!token) return { error: "⚠️ Please log in to place orders." };

    try {
      const response = await axios.post(
        "http://localhost:3000/api/chatbot/message",
        { message: `order ${quantity} ${productName}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        return {
          order: response.data.data?.order,
          response: response.data.response,
        };
      }
      return { error: response.data.message || "Failed to place order." };
    } catch (error) {
      return { error: error.response?.data?.message || "Error placing order." };
    }
  };

  // Get low stock products
  const getLowStock = async () => {
    const token = localStorage.getItem("pos-token");
    if (!token) return { error: "⚠️ Please log in to view low stock." };

    try {
      const response = await axios.get(
        "http://localhost:3000/api/products/low-stock?threshold=10",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        return { products: response.data.products };
      }
      return { error: "No low stock items found." };
    } catch (error) {
      return { error: "Error fetching low stock products." };
    }
  };

  // Get demand analytics
  const getDemandAnalytics = async () => {
    const token = localStorage.getItem("pos-token");
    if (!token) return { error: "⚠️ Please log in to view analytics." };

    try {
      // Use chatbot endpoint for demand analytics
      const response = await axios.post(
        "http://localhost:3000/api/chatbot/message",
        { message: "show me trending products" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.data?.products) {
        return { products: response.data.data.products };
      }
      return { error: "No demand data available." };
    } catch (error) {
      return { error: "Error fetching demand analytics." };
    }
  };

  // Format structured responses
  const formatOrderResponse = (order) => {
    return `✅ **Order Placed Successfully!**\n\n📦 **Order Details:**\n• Order ID: ${
      order._id
    }\n• Product: ${order.product.name}\n• Quantity: ${
      order.quantity
    }\n• Total: $${order.totalPrice.toFixed(2)}\n• Status: ${order.status}`;
  };

  const formatProductResponse = (products) => {
    if (products.length === 1) {
      const p = products[0];
      return `📦 **${p.name}**\n\n💰 Price: $${p.price.toFixed(2)}\n📊 Stock: ${
        p.stock
      } units\n🏷️ Category: ${p.categoryId?.categoryName || "N/A"}\n📝 ${
        p.description
      }`;
    } else {
      let response = `Found ${products.length} products:\n\n`;
      products.slice(0, 5).forEach((p, idx) => {
        response += `${idx + 1}. **${p.name}** - $${p.price.toFixed(2)} (${
          p.stock
        } in stock)\n`;
      });
      return response;
    }
  };

  const formatLowStockResponse = (products) => {
    let response = `⚠️ **Low Stock Alert**\n\n`;
    products.forEach((p) => {
      response += `• ${p.name}: ${p.stock} units ($${p.price.toFixed(2)})\n`;
    });
    return response;
  };

  const formatDemandResponse = (products) => {
    let response = `📈 **Top Demanded Products**\n\n`;
    products.forEach((p, idx) => {
      response += `${idx + 1}. **${p.name}**\n   📊 Demand: ${
        p.demandCount
      } | 📦 Stock: ${p.stock}\n\n`;
    });
    return response;
  };

  // Call Gemini API with conversation history
  const callGeminiApi = async (query, conversationHistory = []) => {
    const contents = [];

    // Add recent history (last 5 messages)
    const recentHistory = conversationHistory.slice(-5);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }

    // Add current query
    contents.push({
      role: "user",
      parts: [{ text: query }],
    });

    const payload = {
      contents,
      tools: [{ google_search: {} }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return {
        text:
          result.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Sorry, I couldn't process that.",
      };
    } catch (err) {
      console.error("Gemini API error:", err);
      // Fallback responses
      const queryLower = query.toLowerCase();
      if (/\b(hi|hello|hey)\b/i.test(query)) {
        return { text: "Hey there! 👋 How's it going?" };
      }
      if (/how are you/i.test(query)) {
        return {
          text: "I'm doing great, thanks for asking! 😊 How can I help you?",
        };
      }
      if (/joke/i.test(query)) {
        return {
          text: "Why don't programmers like nature? It has too many bugs! 🐛😄",
        };
      }
      return {
        text: "I'm here to help! 😊 Ask me about products, orders, or just chat!",
      };
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userQuery = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userQuery }]);
    setIsTyping(true);

    let responseText = null;
    let structuredData = null;

    // PRIORITY 1: Check if this is an explanation query
    // ALL explanation queries go directly to Gemini
    if (isExplanationQuery(userQuery)) {
      const conversationHistory = messages.slice(-5);
      const geminiResult = await callGeminiApi(userQuery, conversationHistory);
      responseText = geminiResult.text;

      setMessages((prev) => [
        ...prev,
        { role: "model", text: responseText, data: structuredData },
      ]);
      setIsTyping(false);
      return; // Exit early - explanation handled by Gemini
    }

    // STEP 2: Check if inventory-related
    if (isInventoryIntent(userQuery)) {
      const intent = detectIntent(userQuery);
      const entities = extractEntities(userQuery);

      // STEP 2: Handle specific inventory intents
      switch (intent) {
        case "place_order":
          if (entities.productName) {
            const result = await placeOrder(
              entities.productName,
              entities.quantity
            );
            if (result.order) {
              responseText = formatOrderResponse(result.order);
            } else if (result.response) {
              responseText = result.response;
            } else {
              responseText = result.error || "Failed to place order.";
            }
          } else {
            responseText = "Please specify which product you'd like to order.";
          }
          break;

        case "product_info":
          if (entities.productName) {
            const result = await searchProducts(entities.productName);
            if (result.products) {
              responseText = formatProductResponse(result.products);
              structuredData = result.products;
            } else {
              responseText = result.error || "No products found.";
            }
          } else {
            responseText =
              "Please specify which product you'd like to know about.";
          }
          break;

        case "low_stock":
          const lowStockResult = await getLowStock();
          if (lowStockResult.products && lowStockResult.products.length > 0) {
            responseText = formatLowStockResponse(lowStockResult.products);
          } else {
            responseText = lowStockResult.error || "No low stock items found.";
          }
          break;

        case "demand_analytics":
          const demandResult = await getDemandAnalytics();
          if (demandResult.products && demandResult.products.length > 0) {
            responseText = formatDemandResponse(demandResult.products);
          } else {
            responseText = demandResult.error || "No demand data available.";
          }
          break;

        case "inventory_overview":
          const summaryResult = await fetchInventorySummary("product");
          responseText = summaryResult.error || summaryResult;
          break;

        case "supplier_info":
          const supplierResult = await fetchInventorySummary("supplier");
          responseText = supplierResult.error || supplierResult;
          break;

        case "category_info":
          const categoryResult = await fetchInventorySummary("category");
          responseText = categoryResult.error || categoryResult;
          break;

        default:
          responseText =
            "I can help you with products, orders, and inventory. What would you like to know?";
      }
    } else {
      // STEP 3: Casual conversation - use Gemini API
      const conversationHistory = messages.slice(-5);
      const geminiResult = await callGeminiApi(userQuery, conversationHistory);
      responseText = geminiResult.text;
    }

    setMessages((prev) => [
      ...prev,
      { role: "model", text: responseText, data: structuredData },
    ]);
    setIsTyping(false);
  };

  const ChatMessage = ({ message }) => {
    const isUser = message.role === "user";

    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-xl px-5 py-3 rounded-2xl shadow-md border text-[15px] leading-relaxed whitespace-pre-wrap
          ${
            isUser
              ? "bg-blue-600 text-white border-blue-500"
              : "bg-white text-gray-900 border-gray-200"
          }`}
        >
          {message.text}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          📦 StockBot — Inventory Assistant
        </h2>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 h-[78vh] flex flex-col">
          {/* Chat Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-5">
            {messages.map((m, i) => (
              <ChatMessage key={i} message={m} />
            ))}

            {isTyping && (
              <div className="text-gray-500 italic animate-pulse">
                StockBot is typing…
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t bg-gray-50 flex gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, suppliers, or inventory…"
              className="flex-grow px-4 py-3 rounded-xl bg-white border border-gray-300 focus:ring-2
              focus:ring-blue-500 outline-none shadow-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 
              text-white rounded-xl shadow-md font-medium disabled:bg-gray-400 transition"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockBot;
