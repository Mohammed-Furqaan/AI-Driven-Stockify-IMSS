# Developer Guide: Conversation-First Chatbot

## Quick Start

### 1. Environment Setup

```bash
# Add to server/.env
GEMINI_API_KEY="AIzaSyDOlm0FAnvPd3Uq4sIypnPDw-CnuqLtnJg"
```

### 2. Test the Implementation

```bash
cd server
node test-conversation.js
```

### 3. Start the Server

```bash
cd server
npm start
```

### 4. Start the Frontend

```bash
cd frontend
npm run dev
```

## Core Functions

### `isInventoryIntent(message)`

**Location:** `server/services/chatbotService.js`

Determines if a message requires inventory mode.

```javascript
const isInventory = isInventoryIntent("order 2 iphone");
// Returns: true

const isCasual = isInventoryIntent("hi bro");
// Returns: false
```

**Inventory Keywords:**

- order, buy, purchase, stock, price, cost
- inventory, product, available, demand, analytics
- Product names: iphone, samsung, laptop, etc.

### `recognizeIntent(message)`

**Location:** `server/services/chatbotService.js`

Recognizes specific intent for inventory messages.

```javascript
const intent = recognizeIntent("order 2 iphone");
// Returns: { intent: "place_order", matchedPattern: "..." }

const intent = recognizeIntent("show me laptops");
// Returns: { intent: "product_info", matchedPattern: "..." }
```

**Intent Types:**

- `casual_conversation` - Default for non-inventory messages
- `place_order` - User wants to create an order
- `product_info` - User wants product details
- `inventory_overview` - Admin wants inventory stats
- `low_stock` - Admin wants low stock alerts
- `demand_analytics` - Admin wants demand insights

### `fuzzyProductSearch(products, query)`

**Location:** `server/services/chatbotService.js`

Performs fuzzy matching on product names.

```javascript
const matches = fuzzyProductSearch(allProducts, "samsng");
// Returns: [Samsung Galaxy S21, Samsung Galaxy Note, ...]

const matches = fuzzyProductSearch(allProducts, "lap");
// Returns: [Dell Laptop XPS 15, HP Laptop Pavilion, ...]
```

**Matching Strategies:**

1. Exact match (100% score)
2. Substring match (90% score)
3. Synonym match (85% score)
4. Multi-word match (70-90% score)
5. Levenshtein distance (60-100% score)

### `callGeminiApi(message, conversationHistory)`

**Location:** `server/services/chatbotService.js`

Calls Gemini API for natural conversation.

```javascript
const result = await callGeminiApi("hi bro", []);
// Returns: { text: "Hey! 👋 How's it going?", error: false }

const result = await callGeminiApi("tell me a joke", conversationHistory);
// Returns: { text: "Why don't programmers...", error: false }
```

**With Conversation History:**

```javascript
const history = [
  { role: "user", text: "hi" },
  { role: "model", text: "Hello!" },
  { role: "user", text: "how are you?" },
];

const result = await callGeminiApi("what's your name?", history);
// Gemini uses context from history
```

## API Endpoints

### POST `/api/chatbot/message`

Main chatbot endpoint with conversation-first routing.

**Request:**

```javascript
{
  "message": "hi bro",
  "conversationHistory": [
    { "role": "user", "text": "previous message" },
    { "role": "model", "text": "previous response" }
  ]
}
```

**Response (Casual):**

```javascript
{
  "success": true,
  "response": "Hey! 👋 How's it going?",
  "intent": "casual_conversation",
  "isCasual": true
}
```

**Response (Inventory):**

```javascript
{
  "success": true,
  "response": "✅ Order placed successfully!...",
  "intent": "place_order",
  "data": {
    "order": { /* order details */ }
  },
  "isCasual": false
}
```

## Adding New Features

### 1. Add New Inventory Keywords

Edit `server/services/chatbotService.js`:

```javascript
const inventoryKeywords = [
  "order",
  "buy",
  "purchase",
  // Add your new keywords here
  "reserve",
  "book",
  "checkout",
];
```

### 2. Add New Product Synonyms

Edit `server/services/chatbotService.js`:

```javascript
const productSynonyms = {
  iphone: ["iphone", "apple phone", "ios phone"],
  // Add your new synonyms here
  macbook: ["macbook", "mac", "apple laptop"],
};
```

### 3. Add New Intent Type

Edit `server/services/chatbotService.js`:

```javascript
const intentPatterns = {
  place_order: [
    /* patterns */
  ],
  // Add your new intent here
  check_warranty: [/\b(warranty|guarantee)\b/i, /\bhow long.*\bcovered\b/i],
};
```

Then handle it in `server/controllers/chatbotController.js`:

```javascript
switch (intent) {
  case "place_order":
  // ...
  case "check_warranty":
    result = await handleWarrantyCheck(entities);
    response = generateResponse("check_warranty", result);
    break;
}
```

### 4. Customize Gemini Instructions

Edit `server/services/chatbotService.js`:

```javascript
const systemInstruction = `You are StockBot...

CORE BEHAVIOR:
1. You are primarily a CONVERSATIONAL AI
2. ALWAYS respond in the SAME LANGUAGE
3. Be warm, friendly, humorous
// Add your custom instructions here
4. When discussing products, mention sustainability
5. Suggest eco-friendly alternatives when relevant
`;
```

## Testing

### Unit Tests

```bash
cd server
npm test
```

### Manual Testing

```bash
cd server
node test-conversation.js
```

### Test Specific Functions

```javascript
import {
  isInventoryIntent,
  fuzzyProductSearch,
} from "./services/chatbotService.js";

// Test intent detection
console.log(isInventoryIntent("hi bro")); // false
console.log(isInventoryIntent("order iphone")); // true

// Test fuzzy search
const products = [{ name: "iPhone 13 Pro", price: 999, stock: 50 }];
const matches = fuzzyProductSearch(products, "iphon");
console.log(matches); // [{ name: "iPhone 13 Pro", ... }]
```

## Debugging

### Enable Debug Logging

Add to `server/services/chatbotService.js`:

```javascript
export const isInventoryIntent = (message) => {
  const result = /* ... logic ... */;
  console.log(`[DEBUG] isInventoryIntent("${message}") = ${result}`);
  return result;
};
```

### Check Gemini API Calls

```javascript
export const callGeminiApi = async (query, conversationHistory) => {
  console.log(`[DEBUG] Calling Gemini API with query: "${query}"`);
  console.log(`[DEBUG] Conversation history length: ${conversationHistory.length}`);

  const result = await /* ... API call ... */;

  console.log(`[DEBUG] Gemini response: ${result.text.substring(0, 100)}...`);
  return result;
};
```

### Monitor Intent Recognition

```javascript
export const recognizeIntent = (message) => {
  const result = /* ... logic ... */;
  console.log(`[DEBUG] recognizeIntent("${message}") = ${result.intent}`);
  return result;
};
```

## Common Issues

### Issue: Gemini API Rate Limit

**Solution:** Fallback responses are automatically used. Check quota at https://ai.dev/usage

### Issue: Fuzzy Search Not Finding Products

**Solution:**

1. Check product names in database
2. Verify `isDeleted: false`
3. Test with `fuzzyProductSearch` directly

### Issue: Intent Detection Wrong

**Solution:**

1. Check inventory keywords
2. Test with `isInventoryIntent` directly
3. Add more specific keywords

### Issue: Conversation History Not Working

**Solution:**

1. Verify frontend sends `conversationHistory` array
2. Check array format: `[{ role, text }, ...]`
3. Ensure history is limited to last 5 messages

## Performance Optimization

### 1. Cache Product List

```javascript
let cachedProducts = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

export const getCachedProducts = async () => {
  if (cachedProducts && Date.now() - cacheTime < CACHE_TTL) {
    return cachedProducts;
  }

  cachedProducts = await Product.find({ isDeleted: false });
  cacheTime = Date.now();
  return cachedProducts;
};
```

### 2. Limit Conversation History

```javascript
// Frontend: Only send last 5 messages
const conversationHistory = messages.slice(-5);
```

### 3. Debounce User Input

```javascript
// Frontend: Debounce typing
const debouncedSend = debounce(handleSend, 300);
```

## Security Best Practices

### 1. Validate All Inputs

```javascript
if (!message || typeof message !== "string" || message.length > 1000) {
  return res.status(400).json({ error: "Invalid message" });
}
```

### 2. Sanitize User Messages

```javascript
const sanitizedMessage = message.trim().replace(/<[^>]*>/g, "");
```

### 3. Rate Limit API Calls

```javascript
// Use express-rate-limit
import rateLimit from "express-rate-limit";

const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
});

app.use("/api/chatbot", chatbotLimiter);
```

### 4. Protect Admin Endpoints

```javascript
if (intent === "inventory_overview" && userRole !== "admin") {
  return res.status(403).json({ error: "Access denied" });
}
```

## Deployment Checklist

- [ ] Set `GEMINI_API_KEY` in production environment
- [ ] Configure rate limiting
- [ ] Enable HTTPS
- [ ] Set up monitoring for API errors
- [ ] Configure logging
- [ ] Test all intents in production
- [ ] Verify fuzzy search performance
- [ ] Check Gemini API quota limits
- [ ] Set up error alerting
- [ ] Document API endpoints

## Resources

- **Gemini API Docs:** https://ai.google.dev/docs
- **Fast-check (PBT):** https://github.com/dubzzz/fast-check
- **Jest Testing:** https://jestjs.io/docs/getting-started
- **Express.js:** https://expressjs.com/
- **React:** https://react.dev/

## Support

For issues or questions:

1. Check `CONVERSATION_FIRST_CHATBOT.md` for user documentation
2. Run `node test-conversation.js` to verify setup
3. Check server logs for errors
4. Review Gemini API quota at https://ai.dev/usage

---

**Happy Coding! 🚀**
