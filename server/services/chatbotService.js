// OpenAI API Configuration
const OPENAI_API_KEY =
  "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"; // Add your OpenAI API key here
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

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

CONVERSATION EXAMPLES:
- User: "hi bro" → Respond naturally and friendly
- User: "tell me a joke" → Tell a good joke
- User: "explain blockchain" → Give a clear, intelligent explanation
- User: "how are you?" → Respond warmly and naturally
- User: "ಹೇಗಿದ್ದೀಯಾ?" → Respond in Kannada naturally
- User: "كيف حالك؟" → Respond in Arabic naturally

You also help with inventory when asked:
- Product searches and information
- Order placement
- Inventory management (for admins)

But remember: CASUAL CONVERSATION IS YOUR PRIMARY MODE. Only switch to inventory mode when the user clearly asks about products, orders, or stock.`;

// Product name synonyms and common abbreviations
const productSynonyms = {
  iphone: ["iphone", "apple phone", "ios phone", "iphn", "iphon"],
  samsung: ["samsung", "sam", "galaxy", "samsng", "samung"],
  laptop: ["laptop", "lap", "labtop", "laptp", "notebook", "computer"],
  nike: ["nike", "nik", "nikee"],
  earphone: ["earphone", "ear", "earbud", "headphone", "headset", "earfone"],
  watch: ["watch", "smartwatch", "wristwatch", "wtch"],
  shoe: ["shoe", "shoes", "sneaker", "footwear", "sho"],
  phone: ["phone", "mobile", "smartphone", "cell", "fone", "phn"],
  camera: ["camera", "cam", "canon", "nikon", "camra"],
  tablet: ["tablet", "tab", "ipad", "tblet"],
};

/**
 * Detect if message requires inventory mode (product/order related)
 * Returns true ONLY for clear inventory intent, false for casual conversation
 */
export const isInventoryIntent = (message) => {
  if (!message || typeof message !== "string") {
    return false;
  }

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
    // Multilingual inventory keywords
    "ಆರ್ಡರ್",
    "ಖರೀದಿ",
    "ಬೆಲೆ",
    "ಸ್ಟಾಕ್", // Kannada
    "ऑर्डर",
    "खरीद",
    "कीमत",
    "स्टॉक", // Hindi
    "ஆர்டர்",
    "வாங்க",
    "விலை",
    "ஸ்டாக்", // Tamil
    "آرڈر",
    "خریدیں",
    "قیمت",
    "اسٹاک", // Urdu
    "طلب",
    "شراء",
    "سعر",
    "مخزون", // Arabic
  ];

  const messageLower = message.toLowerCase();

  // Check for inventory keywords
  for (const keyword of inventoryKeywords) {
    if (messageLower.includes(keyword.toLowerCase())) {
      return true;
    }
  }

  // Check for product names/synonyms
  for (const synonyms of Object.values(productSynonyms)) {
    for (const synonym of synonyms) {
      if (messageLower.includes(synonym)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Legacy function for backward compatibility
 */
const isProductRelated = isInventoryIntent;

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
 * Calculate similarity score (0-100)
 */
const calculateSimilarity = (str1, str2) => {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  return Math.round(((maxLength - distance) / maxLength) * 100);
};

/**
 * Normalize partial product names using synonyms
 */
export const normalizePartialName = (query) => {
  const queryLower = query.toLowerCase().trim();

  // Check synonyms
  for (const [key, synonyms] of Object.entries(productSynonyms)) {
    for (const synonym of synonyms) {
      if (queryLower.includes(synonym) || synonym.includes(queryLower)) {
        return key;
      }
    }
  }

  return queryLower;
};

/**
 * Fuzzy product search with multiple strategies
 * Handles typos, partial names, and casual references
 */
export const fuzzyProductSearch = (products, query) => {
  if (!query || !products || products.length === 0) {
    return [];
  }

  const queryLower = query.toLowerCase().trim();
  const normalizedQuery = normalizePartialName(query);
  const matches = [];

  for (const product of products) {
    const productNameLower = product.name.toLowerCase();
    let score = 0;
    let matchType = null;

    // 1. Exact match (highest priority)
    if (productNameLower === queryLower) {
      score = 100;
      matchType = "exact";
    }
    // 2. Substring match (high priority)
    else if (
      productNameLower.includes(queryLower) ||
      queryLower.includes(productNameLower)
    ) {
      score = 90;
      matchType = "substring";
    }
    // 3. Normalized/synonym match
    else if (
      productNameLower.includes(normalizedQuery) ||
      normalizedQuery.includes(productNameLower)
    ) {
      score = 85;
      matchType = "synonym";
    }
    // 4. Multi-word matching
    else {
      const queryWords = queryLower.split(/\s+/);
      const matchedWords = queryWords.filter(
        (word) => word.length > 2 && productNameLower.includes(word)
      );
      if (matchedWords.length > 0) {
        score = 70 + (matchedWords.length / queryWords.length) * 20;
        matchType = "multiword";
      }
    }

    // 5. Levenshtein distance for typo tolerance
    if (score === 0) {
      const similarity = calculateSimilarity(queryLower, productNameLower);
      if (similarity >= 60) {
        score = similarity;
        matchType = "fuzzy";
      }
    }

    // Add to matches if score is good enough
    if (score >= 60) {
      matches.push({
        product,
        score,
        matchType,
      });
    }
  }

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  return matches.map((m) => m.product);
};

/**
 * Recognizes user intent from natural language message
 * Returns casual_conversation for non-inventory messages
 */
export const recognizeIntent = (message) => {
  if (!message || typeof message !== "string") {
    return {
      intent: "casual_conversation",
      matchedPattern: null,
    };
  }

  const messageLower = message.toLowerCase().trim();

  // FIRST: Check if this is inventory-related
  // If not, it's casual conversation (DEFAULT MODE)
  if (!isInventoryIntent(message)) {
    return {
      intent: "casual_conversation",
      matchedPattern: "not_inventory_related",
    };
  }

  // SECOND: Determine specific inventory intent
  const intentPatterns = {
    place_order: [
      /\b(order|buy|purchase|get|want)\b/i,
      /\bplace.*order\b/i,
      /\bI want\b/i,
    ],
    product_info: [
      /\b(show|tell|what|details|info|price|cost)\b/i,
      /\bhow much\b/i,
      /\bhow many\b.*\bavailable\b/i,
      /\bdetails\b/i,
    ],
    inventory_overview: [
      /\b(show|list|display)\b.*\b(all|products|inventory)\b/i,
      /\bhow many\b.*\b(products|items)\b/i,
      /\btotal.*\b(products|inventory)\b/i,
    ],
    low_stock: [
      /\b(low|running low|out of)\b.*\bstock\b/i,
      /\bstock\b.*\b(low|alert)\b/i,
    ],
    demand_analytics: [
      /\b(demand|trending|popular|most wanted|selling most)\b/i,
      /\btop.*\bproducts\b/i,
    ],
  };

  // Match specific inventory intent
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(messageLower)) {
        return { intent, matchedPattern: pattern.source };
      }
    }
  }

  // Default to product_info for inventory-related messages
  return {
    intent: "product_info",
    matchedPattern: null,
  };
};

/**
 * Extracts entities from user message
 */
export const extractEntities = (message, intent) => {
  const entities = {
    productName: null,
    quantity: 1,
    category: null,
    threshold: 10,
    isPartialSearch: true, // Always use fuzzy search
  };

  if (!message || typeof message !== "string") {
    return entities;
  }

  const messageLower = message.toLowerCase().trim();

  // Extract quantity - look for quantity-specific patterns first
  let quantity = 1; // default

  // Look for explicit quantity patterns first (more specific)
  const explicitQuantityPatterns = [
    /\bquantity\s+(\d+)\b/i,
    /\bqty\s+(\d+)\b/i,
    /\b(\d+)\s+quantity\b/i,
    /\b(\d+)\s+qty\b/i,
    /\border\s+(\d+)\b/i,
    /\bbuy\s+(\d+)\b/i,
    /\bpurchase\s+(\d+)\b/i,
    /\bget\s+(\d+)\b/i,
    /\bwant\s+(\d+)\b/i,
    /\bneed\s+(\d+)\b/i,
  ];

  // Try explicit patterns first
  for (const pattern of explicitQuantityPatterns) {
    const match = message.match(pattern);
    if (match) {
      const qty = parseInt(match[1], 10);
      if (qty > 0 && qty < 10000) {
        quantity = qty;
        break; // Use the first explicit quantity found
      }
    }
  }

  // If no explicit quantity found, look for standalone numbers (but be more careful)
  if (quantity === 1) {
    // Only look for numbers that are likely quantities (not part of product names)
    const standaloneNumberMatch = message.match(
      /\b(\d+)\b(?!\s*(pro|max|plus|mini|air|gb|tb|inch|"|'))/i
    );
    if (standaloneNumberMatch) {
      const qty = parseInt(standaloneNumberMatch[1], 10);
      // Only use if it's a reasonable quantity (not a model number like 15, 13, etc.)
      if (qty > 0 && qty <= 100) {
        quantity = qty;
      }
    }
  }

  entities.quantity = quantity;

  // Extract product name
  if (intent === "place_order" || intent === "product_info") {
    // Remove common words and quantity-related terms, but preserve product model numbers
    let cleanMessage = message
      .replace(
        /\b(order|buy|purchase|show|tell|details|info|price|cost|how|much|many|the|a|an|please|thanks|give|me|want|need)\b/gi,
        ""
      )
      .replace(/\bquantity\s+\d+\b/gi, "") // Remove "quantity 2"
      .replace(/\bqty\s+\d+\b/gi, "") // Remove "qty 2"
      .replace(/\b\d+\s+quantity\b/gi, "") // Remove "2 quantity"
      .replace(/\b\d+\s+qty\b/gi, "") // Remove "2 qty"
      .trim();

    // Only remove standalone numbers that are likely quantities, not model numbers
    // Keep numbers that are part of product names (like iPhone 15, Galaxy S21)
    cleanMessage = cleanMessage
      .replace(
        /\b(\d+)\b(?!\s*(pro|max|plus|mini|air|gb|tb|inch|"|'|\w))/gi,
        ""
      )
      .trim();

    if (cleanMessage.length > 0) {
      entities.productName = normalizePartialName(cleanMessage);
    }
  }

  return entities;
};

/**
 * Calls OpenAI API for natural multilingual conversation
 * Handles conversation history for context
 */
export const callOpenAI = async (query, conversationHistory = []) => {
  try {
    // Build messages array with system instruction and history
    const messages = [
      {
        role: "system",
        content: systemInstruction,
      },
    ];

    // Add conversation history (last 5 messages for context)
    const recentHistory = conversationHistory.slice(-5);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text,
      });
    }

    // Add current query
    messages.push({
      role: "user",
      content: query,
    });

    const payload = {
      model: "gpt-3.5-turbo", // or "gpt-4" for better quality
      messages: messages,
      temperature: 0.9,
      max_tokens: 1024,
      top_p: 0.95,
    };

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`OpenAI API error ${response.status}:`, errorData);

      // Handle rate limit error
      if (response.status === 429) {
        return {
          text: getFallbackResponse(query),
          error: true,
        };
      }

      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const text =
      result.choices?.[0]?.message?.content || getFallbackResponse(query);

    return { text, error: false };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      text: getFallbackResponse(query),
      error: true,
    };
  }
};

// Alias for backward compatibility
export const callGeminiApi = callOpenAI;

/**
 * Provides fallback responses when Gemini API is unavailable
 * These are natural, friendly responses for common queries
 */
const getFallbackResponse = (query) => {
  const queryLower = query.toLowerCase();

  // Greetings
  if (/\b(hi|hello|hey|hola|namaste|ಹಲೋ|नमस्ते|مرحبا|வணக்கம்)\b/i.test(query)) {
    const greetings = [
      "Hey there! 👋 How's it going?",
      "Hello! 😊 Great to see you! What's up?",
      "Hi! 🌟 How can I help you today?",
      "Hey! 👋 Nice to chat with you!",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // How are you
  if (/how are you|how're you|ಹೇಗಿದ್ದೀಯಾ|कैसे हो|كيف حالك/i.test(query)) {
    return "I'm doing great, thanks for asking! 😊 How about you? Anything I can help with?";
  }

  // Thanks
  if (/\b(thanks|thank you|thx|धन्यवाद|ಧನ್ಯವಾದ|شكرا)\b/i.test(query)) {
    return "You're very welcome! 😊 Happy to help anytime!";
  }

  // Jokes
  if (/joke|funny|laugh|humor/i.test(query)) {
    const jokes = [
      "Why don't programmers like nature? It has too many bugs! 🐛😄",
      "Why did the developer go broke? Because he used up all his cache! 💰😂",
      "What's a computer's favorite snack? Microchips! 🍟😄",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Help
  if (/\b(help|assist|support)\b/i.test(query)) {
    return "I'm here to help! 🤖 I can chat about anything, help you find products, place orders, or just have a friendly conversation. What's on your mind?";
  }

  // What can you do
  if (/what can you do|capabilities|features/i.test(query)) {
    return "I'm like ChatGPT! 🤖 I can:\n\n💬 Chat naturally about any topic\n🌍 Speak any language you prefer\n🔍 Help you find products\n🛒 Assist with orders\n📊 Provide inventory info (for admins)\n\nJust talk to me naturally!";
  }

  // Bye
  if (/\b(bye|goodbye|see you|later)\b/i.test(query)) {
    return "Goodbye! 👋 Take care and come back anytime!";
  }

  // Default fallback
  return "I'm here to chat! 😊 Ask me anything - about products, general topics, or just to have a conversation. What would you like to talk about?";
};

/**
 * Generates a natural language response based on intent and data
 */
export const generateResponse = (intent, data) => {
  switch (intent) {
    case "place_order":
      if (data.success) {
        return `✅ Order placed successfully!\n\n📦 Order Details:\nID: ${
          data.order._id
        }\nProduct: ${data.order.product.name}\nQuantity: ${
          data.order.quantity
        }\nTotal: $${data.order.totalPrice.toFixed(2)}\nStatus: ${
          data.order.status
        }`;
      } else {
        return data.message || "Sorry, I couldn't process your order.";
      }

    case "product_info":
      if (data.products && data.products.length > 0) {
        if (data.products.length === 1) {
          const p = data.products[0];
          return `📦 ${p.name}\n\n💰 Price: $${p.price.toFixed(2)}\n📊 Stock: ${
            p.stock
          } units\n🏷️ Category: ${p.categoryId?.categoryName || "N/A"}\n📝 ${
            p.description
          }`;
        } else {
          return `Found ${data.products.length} products. Here are the matches:`;
        }
      } else {
        return (
          data.message || "No products found. Try a different search term."
        );
      }

    case "inventory_overview":
      if (data.stats) {
        return `📊 Inventory Overview\n\n📦 Total Products: ${
          data.stats.totalProducts
        }\n💰 Total Value: $${data.stats.totalValue.toFixed(
          2
        )}\n⚠️ Low Stock: ${
          data.stats.lowStockCount
        }\n\n🏷️ Categories:\n${data.stats.categories
          .map((c) => `  • ${c.name}: ${c.count}`)
          .join("\n")}`;
      }
      return "Unable to retrieve inventory statistics.";

    case "low_stock":
      if (data.products && data.products.length > 0) {
        return `⚠️ Low Stock Alert\n\n${data.products
          .map((p) => `• ${p.name}: ${p.stock} units ($${p.price.toFixed(2)})`)
          .join("\n")}`;
      }
      return "No low stock items found.";

    case "demand_analytics":
      if (data.products && data.products.length > 0) {
        return `📈 Top Demanded Products\n\n${data.products
          .map(
            (p, i) =>
              `${i + 1}. ${p.name}\n   📊 Demand: ${
                p.demandCount
              }\n   📦 Stock: ${p.stock}`
          )
          .join("\n\n")}`;
      }
      return "No demand data available.";

    default:
      return data.text || "How can I help you?";
  }
};
