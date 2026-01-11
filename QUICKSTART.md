# Intelligent Chatbot - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites

- Node.js 16+ installed
- MongoDB running locally or connection string
- Terminal/Command Prompt

### Step 1: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### Step 2: Configure Environment

Create `server/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/inventory
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=AIzaSyDxS13PPWnUSPJ4jXXhx344QnK9nFSoo-I
```

### Step 3: Seed Database (Optional)

```bash
cd server
npm run seed
```

### Step 4: Start Services

**Terminal 1 - Backend:**

```bash
cd server
npm start
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### Step 5: Test the Chatbot

1. Open browser to `http://localhost:5173`
2. Login with your credentials
3. Navigate to StockBot
4. Try these commands:

```
"Order 2 laptops"
"Show me iPhone details"
"What products are low on stock?" (Admin only)
"Show demand analytics" (Admin only)
```

## 🎯 Quick Test Commands

### Customer Commands

```
✅ "Order 3 Nike shoes"
✅ "I want to buy iPhone"
✅ "Show me laptop details"
✅ "What is the price of headphones?"
✅ "How many tablets are available?"
```

### Admin Commands

```
✅ "Show all products"
✅ "What is low stock?"
✅ "Show inventory stats"
✅ "What are the top demanded products?"
✅ "Show demand for laptops"
```

## 🧪 Run Tests

```bash
cd server
npm test
```

Expected output:

```
✓ Property 1: Order creation decreases stock (100 runs)
✓ Property 2: Stock availability validation (100 runs)
✓ Property 3: Order total calculation (100 runs)
... (20 properties total)

Test Suites: 1 passed, 1 total
Tests: 20 passed, 20 total
Time: 5.234s
```

## 📊 Features Overview

| Feature          | Customer | Admin | Example                 |
| ---------------- | -------- | ----- | ----------------------- |
| Place Orders     | ✅       | ✅    | "Order 2 laptops"       |
| Product Info     | ✅       | ✅    | "Show iPhone details"   |
| Inventory Stats  | ❌       | ✅    | "Show all products"     |
| Low Stock Alerts | ❌       | ✅    | "What is low stock?"    |
| Demand Analytics | ❌       | ✅    | "Top demanded products" |

## 🔧 Troubleshooting

### "Authentication token missing"

**Fix**: Login first, then access chatbot

### "Access denied"

**Fix**: Admin features require admin role in database

### "Product not found"

**Fix**: Check spelling or seed database with sample data

### Tests failing

**Fix**: Run `npm install` in server directory

## 📚 Next Steps

1. **Read Full Documentation**: See `INTELLIGENT_CHATBOT.md`
2. **Review Design**: Check `.kiro/specs/intelligent-chatbot/design.md`
3. **Understand Properties**: Read `server/__tests__/README.md`
4. **Customize Intents**: Edit `server/services/chatbotService.js`

## 🎨 Customization

### Add New Intent

1. **Add pattern** in `chatbotService.js`:

```javascript
const intentPatterns = {
  // ... existing patterns
  track_shipment: [/\b(track|where is|status of)\b.*\b(order|shipment)\b/i],
};
```

2. **Add handler** in `chatbotController.js`:

```javascript
case "track_shipment":
  result = await handleShipmentTracking(entities);
  break;
```

3. **Add response** in `chatbotService.js`:

```javascript
case "track_shipment":
  return `📦 Your order is ${data.status}...`;
```

### Adjust Confidence Threshold

Edit `chatbotController.js`:

```javascript
if (confidence < 70) {
  // Change 70 to your threshold
  // Request clarification
}
```

## 🌟 Pro Tips

1. **Be Specific**: "Order 2 laptops" works better than "I want something"
2. **Use Product Names**: Exact names get better results
3. **Check Confidence**: Low confidence? Rephrase your query
4. **Admin Features**: Login as admin to access analytics
5. **Test Properties**: Run tests after any changes

## 📞 Support

- **Documentation**: `INTELLIGENT_CHATBOT.md`
- **API Reference**: See design.md
- **Test Guide**: `server/__tests__/README.md`
- **Requirements**: `.kiro/specs/intelligent-chatbot/requirements.md`

---

**Ready to go!** 🎉 Start chatting with StockBot and experience intelligent inventory management.
