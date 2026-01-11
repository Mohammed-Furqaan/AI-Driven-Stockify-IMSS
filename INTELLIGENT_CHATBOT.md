# Intelligent Chatbot System - Complete Documentation

## Overview

The Intelligent Chatbot System transforms StockBot from a simple conversational interface into a fully functional business assistant capable of:

- 📦 **Automated Order Placement** - Place orders through natural language
- 🔍 **Product Information Queries** - Get detailed product information
- 📊 **Admin Analytics** - View inventory statistics and low stock alerts
- 📈 **Demand Tracking** - Track and analyze product demand
- 🎯 **Confidence Scoring** - Transparent AI confidence indicators
- ✅ **Property-Based Testing** - 20 correctness properties with 100+ test iterations each

## Architecture

### Hybrid NLP Pipeline

```
User Message → Intent Recognition → Entity Extraction → Confidence Calculation
     ↓                                                           ↓
Gemini API (fallback) ←─────────────────────────────────→ Business Logic
     ↓                                                           ↓
Natural Response ←──────────────────────────────────── Structured Data
```

### Components

1. **Frontend (React)**

   - `StockBot.jsx` - Enhanced chatbot UI with structured responses
   - Confidence indicators
   - Formatted order/product/analytics displays

2. **Backend (Express/Node.js)**

   - `chatbotService.js` - NLP processing (intent, entities, confidence)
   - `chatbotController.js` - Request routing and response formatting
   - `demandController.js` - Demand tracking and analytics
   - `productController.js` - Enhanced product search and inventory stats
   - `orderController.js` - Chatbot-driven order creation

3. **Database (MongoDB)**
   - Enhanced Product model with demand tracking fields
   - Existing Order and User models

## Features

### 1. Automated Order Placement

**User Input Examples:**

- "Order 2 laptops"
- "I want to buy 5 shoes"
- "Purchase iPhone"

**Process:**

1. Extract product name and quantity
2. Search for product in database
3. Validate stock availability
4. Create order and decrement stock
5. Increment demand counter
6. Return order confirmation

**Response Format:**

```
✅ Order Placed Successfully!
Order ID: 507f1f77bcf86cd799439011
Product: Laptop
Quantity: 2
Total: $2,499.98
Status: pending
```

**Error Handling:**

- Product not found → Suggests similar products
- Insufficient stock → Shows available quantity + alternatives from same category

### 2. Product Information Queries

**User Input Examples:**

- "Show me details of iPhone 15"
- "What is the price of Nike shoes?"
- "How many laptops are available?"

**Process:**

1. Extract product name
2. Fuzzy search in database
3. Increment demand counter for queried products
4. Return product details

**Response Format:**

```
📦 iPhone 15
Price: $999.00
Stock: 45 units
Category: Electronics
Description: Latest iPhone with advanced features
```

### 3. Admin Inventory Overview

**User Input Examples:**

- "Show me all products"
- "What is low stock?"
- "Show total items in inventory"

**Admin-Only Features:**

- Total product count
- Total stock value
- Low stock alerts (threshold: 10)
- Category distribution
- Best-selling products

**Response Format:**

```
📊 Inventory Overview
Total Products: 127
Total Value: $45,678.90
Low Stock Items: 8

Categories:
- Electronics: 45 products
- Clothing: 32 products
- Food: 50 products
```

### 4. Demand Tracking

**Automatic Tracking:**

- Product queries → +1 demand
- Orders → +quantity demand

**Admin Analytics:**

- Top 5 demanded products
- Demand count per product
- Trend analysis (via demand history)

**Response Format:**

```
📈 Top Demanded Products

1. iPhone 15
   Demand Count: 234
   Current Stock: 45

2. Nike Air Max
   Demand Count: 189
   Current Stock: 23
```

### 5. Confidence Scoring

Every chatbot interpretation includes:

- **Intent** - Recognized user goal
- **Confidence Score** - 0-100% certainty
- **Extracted Entities** - Product name, quantity, etc.

**Confidence Levels:**

- 🔴 Low (0-69%) → Requests clarification
- 🟡 Medium (70-84%) → Proceeds with caution
- 🟢 High (85-100%) → Executes confidently

**Threshold Enforcement:**

- Confidence < 70% → System asks for clarification
- No actions executed on low confidence

## API Endpoints

### POST /api/chatbot/message

Main chatbot endpoint for all user messages.

**Request:**

```json
{
  "message": "Order 2 laptops"
}
```

**Response:**

```json
{
  "success": true,
  "intent": "place_order",
  "confidence": 92,
  "response": "✅ Your order has been placed successfully!...",
  "data": {
    "order": {
      /* order object */
    }
  },
  "metadata": {
    "intent": "place_order",
    "confidence": 92,
    "entities": {
      "productName": "laptops",
      "quantity": 2
    },
    "processingTime": 145
  }
}
```

### GET /api/chatbot/demand/top

Get top demanded products (Admin only).

**Query Parameters:**

- `limit` (optional) - Number of products to return (default: 5)

**Response:**

```json
{
  "success": true,
  "products": [
    {
      "_id": "...",
      "name": "iPhone 15",
      "demandCount": 234,
      "stock": 45,
      "price": 999.0,
      "category": "Electronics"
    }
  ]
}
```

### GET /api/chatbot/demand/:productId

Get demand data for specific product (Admin only).

## Intent Recognition Patterns

### place_order

- "order [quantity] [product]"
- "buy [product]"
- "I want [product]"
- "purchase [quantity] [product]"

### product_info

- "show me [product]"
- "details of [product]"
- "price of [product]"
- "how many [product] available"

### inventory_overview (Admin)

- "show all products"
- "total inventory"
- "how many products"

### low_stock (Admin)

- "low stock"
- "running low"
- "stock alert"

### demand_analytics (Admin)

- "demand"
- "trending products"
- "most popular"
- "top products"

## Property-Based Testing

All 20 correctness properties are tested with 100+ iterations using fast-check:

1. ✅ Order creation preserves stock invariant
2. ✅ Stock availability validation
3. ✅ Order total calculation accuracy
4. ✅ Alternative product suggestion relevance
5. ✅ Entity extraction for order intent
6. ✅ Product search completeness
7. ✅ Product response completeness
8. ✅ Low stock filtering accuracy
9. ✅ Inventory statistics calculation accuracy
10. ✅ Role-based access enforcement
11. ✅ Demand counter increment on query
12. ✅ Demand counter increment on order
13. ✅ Demand counter monotonicity
14. ✅ Top demanded products ranking
15. ✅ Confidence score calculation
16. ✅ Confidence threshold enforcement
17. ✅ Intent and entity metadata completeness
18. ✅ Authentication validation on all endpoints
19. ✅ Conversation history persistence
20. ✅ Structured data formatting consistency

**Run Tests:**

```bash
cd server
npm install
npm test
```

## Installation & Setup

### 1. Install Dependencies

**Backend:**

```bash
cd server
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create `server/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/inventory
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Database Migration

The Product model now includes demand tracking fields. Existing products will automatically get default values:

- `demandCount`: 0
- `lastDemandUpdate`: current date
- `demandHistory`: []

### 4. Start Services

**Backend:**

```bash
cd server
npm start
```

**Frontend:**

```bash
cd frontend
npm run dev
```

## Usage Examples

### Customer Scenarios

**Scenario 1: Place an Order**

```
User: "I want to order 3 Nike shoes"
Bot: ✅ Order Placed Successfully!
     Order ID: 507f...
     Product: Nike Air Max
     Quantity: 3
     Total: $359.97
     Status: pending
```

**Scenario 2: Check Product Details**

```
User: "Show me iPhone 15 details"
Bot: 📦 iPhone 15
     Price: $999.00
     Stock: 45 units
     Category: Electronics
     Description: Latest iPhone with advanced features
```

**Scenario 3: Out of Stock**

```
User: "Order 100 laptops"
Bot: Sorry, "Laptop Pro" is out of stock. We only have 5 unit(s) available.

     📦 Alternative Products:
     - Laptop Air ($899.00, 23 in stock)
     - Laptop Mini ($699.00, 15 in stock)
```

### Admin Scenarios

**Scenario 1: Inventory Overview**

```
Admin: "Show me inventory stats"
Bot: 📊 Inventory Overview
     Total Products: 127
     Total Value: $45,678.90
     Low Stock Items: 8

     Categories:
     - Electronics: 45 products
     - Clothing: 32 products
```

**Scenario 2: Demand Analytics**

```
Admin: "What are the top demanded products?"
Bot: 📈 Top Demanded Products

     1. iPhone 15
        Demand Count: 234
        Current Stock: 45

     2. Nike Air Max
        Demand Count: 189
        Current Stock: 23
```

**Scenario 3: Low Stock Alert**

```
Admin: "Show low stock products"
Bot: ⚠️ Low Stock Alert

     - Laptop Pro: 5 units remaining (Price: $1,299.00)
     - Nike Shoes: 3 units remaining (Price: $119.99)
     - iPhone Case: 2 units remaining (Price: $29.99)
```

## Security

### Authentication

- All chatbot endpoints require valid JWT token
- Token extracted from Authorization header
- User ID and role extracted from token

### Authorization

- Admin-only endpoints check user role
- Non-admin users receive 403 Forbidden
- Clear error messages for access denial

### Input Validation

- All user input sanitized
- Quantities validated (positive integers)
- Product names validated (non-empty strings)
- Message length limits enforced

## Performance

### Optimization Strategies

1. **Database Indexing**

   - Index on `Product.name` for fast search
   - Index on `Product.demandCount` for analytics
   - Index on `Order.customer` for user orders

2. **Response Times**

   - Intent recognition: < 100ms
   - Product search: < 200ms
   - Order creation: < 500ms
   - Analytics queries: < 1s

3. **Caching** (Future Enhancement)
   - Cache frequently accessed products
   - Cache inventory statistics (5-min TTL)
   - Cache demand analytics (10-min TTL)

## Error Handling

### Error Types

1. **Validation Errors**

   - Invalid product name
   - Invalid quantity
   - Missing required fields

2. **Business Logic Errors**

   - Insufficient stock
   - Product not found
   - Unauthorized access

3. **System Errors**

   - Database connection failure
   - Gemini API failure
   - Network timeout

4. **Low Confidence Errors**
   - Ambiguous intent
   - Multiple product matches
   - Unclear quantity

### Error Response Format

```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": {
    "type": "business",
    "code": "INSUFFICIENT_STOCK",
    "suggestions": ["Try ordering less", "Check alternatives"]
  },
  "metadata": {
    "intent": "place_order",
    "confidence": 85
  }
}
```

## Future Enhancements

1. **Multi-language Support** - Support for multiple languages
2. **Voice Input** - Speech-to-text integration
3. **Order History** - "Show my recent orders"
4. **Price Alerts** - "Notify me when price drops"
5. **Bulk Orders** - "Order 5 laptops and 3 mice"
6. **Order Modification** - "Cancel my last order"
7. **Product Recommendations** - AI-powered suggestions
8. **Sentiment Analysis** - Detect customer satisfaction
9. **Chat Export** - Download conversation history
10. **Analytics Dashboard** - Visual demand trends

## Troubleshooting

### Common Issues

**Issue: "Authentication token missing"**

- Solution: Ensure user is logged in and token is stored in localStorage

**Issue: "Access denied" for admin features**

- Solution: Verify user role is "admin" in database

**Issue: "Product not found"**

- Solution: Check product name spelling, try fuzzy search

**Issue: Low confidence scores**

- Solution: Be more specific in queries, include product names and quantities

**Issue: Tests failing**

- Solution: Run `npm install` to ensure fast-check is installed

## Contributing

When adding new features:

1. Update requirements.md with new acceptance criteria
2. Add correctness properties to design.md
3. Implement property-based tests
4. Update this documentation
5. Test with 100+ iterations

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:

- Check this documentation
- Review the design.md and requirements.md files
- Run property-based tests to verify correctness
- Contact the development team

---

**Version:** 1.0.0  
**Last Updated:** 2025  
**Status:** ✅ Production Ready
