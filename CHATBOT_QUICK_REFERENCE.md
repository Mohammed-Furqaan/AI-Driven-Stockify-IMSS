# Intelligent Chatbot - Quick Reference Guide

## 🎯 Try These Commands

### Casual Conversation

```
✅ "Hi"
✅ "Hello"
✅ "How are you?"
✅ "Tell me a joke"
✅ "Thanks"
✅ "Help"
✅ "What can you do?"
```

### Partial Product Names

```
✅ "iphone" → Shows all iPhone models
✅ "sam" → Samsung products
✅ "lap" → Laptops
✅ "nik" → Nike products
✅ "ear" → Earphones/earbuds
✅ "watch" → Smartwatches
```

### Fuzzy Spelling

```
✅ "samsng" → Samsung
✅ "ipone" → iPhone
✅ "labtop" → Laptop
✅ "nikee" → Nike
```

### Order with Partial Names

```
✅ "Order 2 lap"
✅ "Buy iphone"
✅ "I want 3 nik shoes"
✅ "Purchase sam phone"
```

### Product Info with Partial Names

```
✅ "Show me iphone"
✅ "Details of lap"
✅ "Price of sam"
✅ "How many ear available?"
```

### Admin Commands (Admin Only)

```
✅ "Show all products"
✅ "What is low stock?"
✅ "Show inventory stats"
✅ "Top demanded products"
✅ "Show demand analytics"
```

## 🔑 Key Features

### 1. Smart Intent Detection

- Automatically detects if you want to order, search, or just chat
- Falls back to casual conversation if unclear
- No need to use specific keywords

### 2. Fuzzy Matching

- Understands misspellings
- Recognizes abbreviations
- Matches partial names
- Suggests alternatives

### 3. Confidence Scoring

- Shows confidence for functional commands
- Hides confidence for casual chat
- Visual progress bar indicator
- Color-coded (red/yellow/green)

### 4. Multiple Results

- Shows all matching products
- Sorted by relevance
- Includes match scores
- Provides suggestions

## 📱 UI Indicators

### Confidence Colors

- 🔴 Red (0-69%): Low confidence
- 🟡 Yellow (70-84%): Medium confidence
- 🟢 Green (85-100%): High confidence

### Message Types

- **User messages**: Blue background, right-aligned
- **Bot responses**: White background, left-aligned
- **Casual chat**: No confidence indicator
- **Functional**: Shows confidence + intent

### Loading States

- Animated dots while processing
- "StockBot is typing..." indicator
- Auto-scroll to latest message

## 🎨 Response Formats

### Order Confirmation

```
✅ Your order has been placed successfully!

Order ID: 507f1f77bcf86cd799439011
Product: Laptop Pro
Quantity: 2
Total Amount: $2,499.98
Status: pending
```

### Product Details

```
📦 iPhone 15

Price: $999.00
Stock: 45 units
Category: Electronics
Description: Latest iPhone with advanced features
```

### Multiple Products

```
Found 3 products matching "lap"

📦 Laptop Pro
Price: $1,299.00
Stock: 15 units
Category: Electronics

📦 Laptop Air
Price: $899.00
Stock: 23 units
Category: Electronics

📦 Laptop Mini
Price: $699.00
Stock: 30 units
Category: Electronics
```

### Inventory Stats (Admin)

```
📊 Inventory Overview

Total Products: 127
Total Stock Value: $45,678.90
Low Stock Items: 8

Categories:
- Electronics: 45 products
- Clothing: 32 products
- Food: 50 products
```

### Demand Analytics (Admin)

```
📈 Top Demanded Products

1. iPhone 15
   Demand Count: 234
   Current Stock: 45

2. Nike Air Max
   Demand Count: 189
   Current Stock: 23
```

## 🚀 Pro Tips

1. **Be Natural**: Just type what you want, the bot understands
2. **Use Abbreviations**: "lap", "iphone", "sam" all work
3. **Don't Worry About Spelling**: Fuzzy matching handles typos
4. **Multiple Results**: Bot shows all matches if query is ambiguous
5. **Casual Chat**: Say hi, ask questions, the bot is friendly
6. **Admin Features**: Login as admin for inventory analytics

## ⚡ Quick Examples

### Scenario 1: Casual Start

```
You: "Hi"
Bot: "Hello! I'm StockBot, your inventory assistant..."

You: "What can you do?"
Bot: "I can help you place orders, find products..."

You: "Show me iphone"
Bot: [Lists all iPhone models]

You: "Order the first one"
Bot: [Creates order for iPhone]
```

### Scenario 2: Quick Order

```
You: "Order 2 lap"
Bot: [Shows laptop options]

You: "I want the Laptop Pro"
Bot: ✅ Order placed successfully!
```

### Scenario 3: Product Search

```
You: "ear"
Bot: [Shows earphones, earbuds, headphones]

You: "How much is the first one?"
Bot: [Shows detailed price and info]
```

### Scenario 4: Admin Analytics

```
Admin: "Show demand"
Bot: 📈 Top Demanded Products...

Admin: "What's low on stock?"
Bot: ⚠️ Low Stock Alert...
```

## 🔧 Troubleshooting

### "No products found"

- Try using a shorter keyword
- Check spelling (fuzzy matching helps but isn't perfect)
- Try synonyms (e.g., "mobile" instead of "phone")

### "Access denied"

- Admin features require admin role
- Login with admin credentials
- Contact administrator for access

### "Please log in"

- Authentication token missing
- Login to the system first
- Token may have expired

### Low confidence warning

- Be more specific in your query
- Include product name or quantity
- Use keywords like "order", "show", "buy"

## 📞 Support

- **Documentation**: See `INTELLIGENT_CHATBOT.md`
- **Enhancements**: See `CHATBOT_ENHANCEMENTS.md`
- **Full Guide**: See `QUICKSTART.md`

---

**Ready to chat!** 🎉 Just type naturally and let StockBot help you.
