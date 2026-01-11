# 🤖 StockBot Hybrid System Guide

## Overview

StockBot now combines **Gemini AI (frontend)** with **Advanced Inventory Features** to provide both natural conversation and powerful inventory management.

## 🎯 Key Features

### ✅ **Gemini AI Integration (Frontend)**

- Natural conversation in any language
- Humor, emotions, and casual chat
- Context-aware responses
- Conversation history support

### ✅ **Advanced Inventory Features**

- **Fuzzy Product Search** - Handles typos and partial names
- **Order Placement** - Place orders through chat
- **Low Stock Alerts** - Check products running low
- **Demand Analytics** - View trending products
- **Inventory Overview** - Get stock summaries
- **Supplier & Category Info** - View suppliers and categories

## 🔧 How It Works

### **Conversation Flow**

```
User Message
     ↓
Is Inventory Intent?
     ↓
    NO → Gemini API (Casual Conversation)
     ↓
   YES → Detect Specific Intent
         ↓
         ├─ place_order → Place Order
         ├─ product_info → Search Products
         ├─ low_stock → Low Stock Alert
         ├─ demand_analytics → Demand Insights
         ├─ inventory_overview → Stock Summary
         ├─ supplier_info → Supplier List
         └─ category_info → Category List
         ↓
         Formatted Response
```

### **Intent Detection**

The system automatically detects if your message is:

- **Casual conversation** → Routes to Gemini
- **Inventory-related** → Routes to backend APIs

**Inventory Keywords:**

- order, buy, purchase
- stock, price, cost
- inventory, product, available
- demand, analytics, trending
- supplier, category, low stock

## 💬 Example Conversations

### **Casual Conversation (Gemini)**

```
You: hi bro
Bot: Hey there! 👋 How's it going?

You: tell me a joke
Bot: Why don't programmers like nature? It has too many bugs! 🐛😄

You: explain AI
Bot: AI (Artificial Intelligence) is...

You: ಹೇಗಿದ್ದೀಯಾ? (Kannada)
Bot: ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ! 😊
```

### **Inventory Operations**

```
You: order 2 iphone
Bot: ✅ Order Placed Successfully!

📦 Order Details:
• Order ID: 123abc
• Product: iPhone 13 Pro
• Quantity: 2
• Total: $1998.00
• Status: pending

---

You: show me samsng phones (typo)
Bot: 📦 Samsung Galaxy S21

💰 Price: $799.00
📊 Stock: 30 units
🏷️ Category: Electronics
📝 High-performance smartphone...

---

You: low stock
Bot: ⚠️ Low Stock Alert

• Canon Camera: 5 units ($599.00)
• Nike Shoes: 8 units ($129.00)
• Dell Laptop: 3 units ($1299.00)

---

You: trending products
Bot: 📈 Top Demanded Products

1. iPhone 13 Pro
   📊 Demand: 245 | 📦 Stock: 50

2. Samsung Galaxy S21
   📊 Demand: 189 | 📦 Stock: 30

---

You: how many products
Bot: 📦 You currently have 47 different products in stock.

---

You: supplier list
Bot: 🏭 You have 5 active suppliers: Apple Inc., Samsung Electronics, Dell Technologies, Nike Inc., Canon USA.
```

## 🔑 Setup Instructions

### **1. Add Gemini API Key**

**File:** `frontend/src/components/StockBot.jsx`

**Line 4:**

```javascript
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
```

**Get your key:** https://ai.google.dev/

### **2. Ensure Backend is Running**

```bash
cd server
npm start
```

The backend provides:

- Product search API
- Order placement API
- Inventory stats API
- Demand analytics API

### **3. Start Frontend**

```bash
cd frontend
npm run dev
```

## 📊 Features Breakdown

### **1. Fuzzy Product Search**

- Handles typos: "samsng" → Samsung
- Partial names: "iphone", "lap", "sam"
- Case-insensitive matching
- Returns best matches

### **2. Order Placement**

- Extract product name and quantity
- Validate stock availability
- Create order in database
- Return confirmation

### **3. Low Stock Alerts**

- Check products below threshold (10 units)
- Display product name, stock, and price
- Admin feature

### **4. Demand Analytics**

- Show top 5 most demanded products
- Display demand count and current stock
- Admin feature

### **5. Inventory Overview**

- Total product count
- Supplier list
- Category list

### **6. Conversation History**

- Maintains last 5 messages
- Provides context to Gemini
- Natural follow-up conversations

## 🎨 UI Features

- Clean conversation interface
- Structured data formatting
- Loading indicators
- Auto-scroll to latest message
- Mobile responsive
- No technical indicators

## 🔒 Security

- Authentication required for inventory operations
- Token-based API calls
- Error handling for unauthorized access
- Input validation

## 🐛 Troubleshooting

### **Issue: Gemini API Error**

**Solution:** Check your API key and quota at https://ai.dev/usage

### **Issue: Inventory Features Not Working**

**Solution:**

1. Ensure backend is running on port 3000
2. Check authentication token in localStorage
3. Verify API endpoints are accessible

### **Issue: Products Not Found**

**Solution:**

1. Check database has products
2. Verify fuzzy search endpoint exists
3. Test with exact product names first

## 📈 Performance

- Intent detection: < 10ms (frontend)
- Gemini API: 500-2000ms
- Backend API: 100-500ms
- Total response: < 2s

## 🎯 Best Practices

1. **Use natural language** - The bot understands casual queries
2. **Be specific** - "order 2 iphone" is better than "order phone"
3. **Try typos** - The fuzzy search handles misspellings
4. **Ask follow-ups** - Conversation history provides context
5. **Mix modes** - Chat casually, then ask about inventory

## 🚀 Advanced Usage

### **Chaining Queries**

```
You: hi
Bot: Hey there! 👋

You: show me laptops
Bot: [Shows laptop products]

You: order 1 dell laptop
Bot: [Places order]

You: thanks!
Bot: You're welcome! 😊
```

### **Multilingual**

```
You: नमस्ते (Hindi)
Bot: नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?

You: show me products
Bot: [Shows products in English - inventory data]
```

## 📚 Technical Details

### **Frontend Components**

1. **isInventoryIntent()** - Detects inventory keywords
2. **detectIntent()** - Identifies specific intent
3. **extractEntities()** - Extracts product name and quantity
4. **callGeminiApi()** - Calls Gemini with history
5. **searchProducts()** - Fuzzy product search
6. **placeOrder()** - Order placement
7. **getLowStock()** - Low stock products
8. **getDemandAnalytics()** - Demand insights
9. **fetchInventorySummary()** - Inventory stats

### **Response Formatters**

1. **formatOrderResponse()** - Order confirmations
2. **formatProductResponse()** - Product details
3. **formatLowStockResponse()** - Low stock alerts
4. **formatDemandResponse()** - Demand analytics

## 🎉 Summary

**StockBot is now a hybrid system that:**

- ✅ Chats naturally using Gemini AI (frontend)
- ✅ Handles inventory operations via backend APIs
- ✅ Supports fuzzy product search
- ✅ Places orders through conversation
- ✅ Provides analytics and insights
- ✅ Works in multiple languages
- ✅ Maintains conversation context

**The best of both worlds! 🚀**
