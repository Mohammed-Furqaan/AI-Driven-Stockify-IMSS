# Design Document: Intelligent Chatbot System

## Overview

The Intelligent Chatbot System transforms the existing StockBot into a natural conversational AI assistant that prioritizes casual conversation while seamlessly integrating inventory management capabilities. The chatbot behaves like ChatGPT or Gemini by default, handling general conversation, humor, explanations, and multilingual interaction through the Gemini API. Inventory mode is activated only when product-related intent is clearly detected.

The design follows a conversation-first architecture where all messages are initially evaluated for inventory intent. Non-inventory messages are routed directly to Gemini API for natural conversation, while inventory-related messages trigger specialized business logic. The system uses fuzzy product search with typo tolerance and supports automatic language detection to provide a seamless, natural user experience across any language.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  React Frontend │
│   (StockBot)    │
│  - No confidence│
│    indicators   │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────────────────────────────────────┐
│         Express Backend                         │
│  ┌──────────────────────────────────────────┐  │
│  │   Chatbot Controller                     │  │
│  │  - Inventory Intent Detection            │  │
│  │  - Route to Gemini or Inventory Mode     │  │
│  └──────────┬───────────────────────────────┘  │
│             │                                   │
│      ┌──────┴──────┐                           │
│      │             │                           │
│  ┌───▼────┐   ┌───▼──────────────────────┐    │
│  │ Gemini │   │  Inventory Mode          │    │
│  │  API   │   │  - Fuzzy Product Search  │    │
│  │        │   │  - Order Processing      │    │
│  │ (Default)  │  - Entity Extraction     │    │
│  │ Casual │   │  - Demand Tracking       │    │
│  │ Chat   │   │  - Admin Analytics       │    │
│  └────────┘   └──────────┬───────────────┘    │
│                           │                     │
│               ┌───────────▼───────────────┐    │
│               │   Domain Controllers      │    │
│               │  - Order Controller       │    │
│               │  - Product Controller     │    │
│               │  - Demand Controller      │    │
│               └───────────┬───────────────┘    │
└───────────────────────────┼─────────────────────┘
                            │
                   ┌────────▼────────┐
                   │  MongoDB        │
                   │  - Products     │
                   │  - Orders       │
                   │  - Users        │
                   └─────────────────┘
```

### Component Interaction Flow

**Casual Conversation Flow (Default):**

1. **User Input**: User sends message like "hi bro", "tell me a joke", "explain blockchain"
2. **Intent Detection**: Backend quickly checks for inventory keywords (order, buy, stock, product names)
3. **Gemini Routing**: No inventory intent detected → route to Gemini API
4. **Language Detection**: Gemini automatically detects user's language
5. **Natural Response**: Gemini generates contextual, natural response in same language
6. **UI Rendering**: Frontend displays response without any technical indicators

**Inventory Mode Flow (Triggered Only When Needed):**

1. **User Input**: User sends message like "order 2 iphone", "show me samsng phones"
2. **Intent Detection**: Backend detects inventory keywords
3. **Fuzzy Product Search**: System uses substring matching, lowercase comparison, typo tolerance
4. **Entity Extraction**: Extract product name (fuzzy matched), quantity, user ID
5. **Business Logic**: Execute order creation, stock check, or product query
6. **Demand Tracking**: Increment demand counter for queried/ordered products
7. **Response Generation**: Format structured response with product/order details
8. **UI Rendering**: Display formatted data, then return to casual mode for next message

## Components and Interfaces

### 1. Frontend Components

#### StockBot Component (Enhanced)

**Responsibilities:**

- Render clean chat interface with message history
- Handle user input and form submission
- Display structured responses (orders, product details, analytics)
- Manage loading states and error handling
- NO confidence scores or technical indicators

**Key Methods:**

```javascript
handleSend(message); // Send message to backend
displayStructuredResponse(data); // Format and display complex data
renderNaturalResponse(text); // Display Gemini responses naturally
```

**State Management:**

```javascript
{
  messages: Array<{role, text, data}>,  // No metadata/confidence
  input: string,
  isTyping: boolean,
  currentUser: {id, role}
}
```

### 2. Backend Components

#### Chatbot Controller

**File:** `server/controllers/chatbotController.js`

**Responsibilities:**

- Route incoming chatbot requests
- Coordinate between NLP service and domain controllers
- Format responses for frontend consumption

**Endpoints:**

```javascript
POST /api/chatbot/message
  - Processes all chatbot messages
  - Returns: {intent, confidence, response, metadata}

GET /api/chatbot/demand
  - Retrieves demand analytics
  - Admin only
  - Returns: {products: [{name, demandCount, trend}]}
```

#### Chatbot Service

**File:** `server/services/chatbotService.js`

**Responsibilities:**

- Detect inventory intent vs casual conversation
- Route casual messages to Gemini API (primary behavior)
- Fuzzy product search with typo tolerance
- Entity extraction for inventory operations
- Multilingual support through Gemini

**Key Functions:**

```javascript
isInventoryIntent(message);
// Returns: boolean - true if inventory-related, false for casual chat

handleCasualConversation(message, conversationHistory);
// Routes to Gemini API for natural conversation
// Returns: {response: string, language: string}

fuzzyProductSearch(productName);
// Substring matching, lowercase comparison, typo tolerance
// Returns: matching products array

extractEntities(message, intent);
// Returns: {productName, quantity, category, etc.}

callGeminiAPI(message, systemInstructions);
// Integration with Gemini API
// Returns: natural language response in detected language
```

**Intent Types:**

- `casual`: General conversation (DEFAULT - routed to Gemini)
- `place_order`: User wants to create an order
- `product_info`: User wants product details
- `inventory_overview`: Admin wants inventory summary
- `demand_analytics`: Admin wants demand insights
- `low_stock`: Admin wants low stock alerts

#### Order Processing Module

**Enhancement to:** `server/controllers/orderController.js`

**New Function:**

```javascript
createOrderFromChatbot(userId, productName, quantity);
// Validates product existence
// Checks stock availability
// Creates order if valid
// Updates demand counter
// Returns: {success, order, message}
```

#### Product Search Module

**Enhancement to:** `server/controllers/productController.js`

**New Functions:**

```javascript
searchProductByName(name);
// Fuzzy search for products
// Returns: matching products with details

getProductDetails(productId);
// Returns: complete product information

getLowStockProducts((threshold = 10));
// Returns: products below stock threshold

getInventoryStats();
// Returns: aggregate statistics
```

#### Demand Analytics Module

**New File:** `server/controllers/demandController.js`

**Responsibilities:**

- Track product demand
- Generate demand insights
- Identify trending products

**Functions:**

```javascript
incrementDemand(productId, (amount = 1));
// Increments demand counter

getDemandByProduct(productId);
// Returns: demand data for specific product

getTopDemandedProducts((limit = 5));
// Returns: most demanded products

getDemandTrend(productId, (days = 30));
// Returns: demand trend analysis
```

## Data Models

### Product Model Enhancement

**File:** `server/models/Product.js`

**New Fields:**

```javascript
{
  // Existing fields...
  demandCount: {
    type: Number,
    default: 0,
    index: true  // For efficient sorting
  },
  lastDemandUpdate: {
    type: Date,
    default: Date.now
  },
  demandHistory: [{
    date: Date,
    count: Number
  }]  // Optional: for trend analysis
}
```

### Chatbot Interaction Log (New Model)

**File:** `server/models/ChatbotLog.js`

**Purpose:** Track chatbot interactions for analytics and improvement

```javascript
{
  userId: { type: ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  intent: { type: String, required: true },
  confidence: { type: Number, required: true },
  entities: { type: Object },
  response: { type: String },
  success: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now }
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Casual conversation routing

_For any_ message that does not contain inventory keywords (order, buy, stock, price, product names), the system should route the message to Gemini API for casual conversation handling.

**Validates: Requirements 1.1, 1.7**

### Property 2: Default casual mode

_For any_ message without product-related intent, the system should remain in casual conversation mode and never provide inventory-related responses or templates.

**Validates: Requirements 1.7, 6.2, 6.3**

### Property 3: Entity extraction for order intent

_For any_ message containing order intent with a product name, the entity extraction should identify the product name and quantity (defaulting to 1 if not specified).

**Validates: Requirements 2.1**

### Property 4: Fuzzy product matching with typos

_For any_ product query with typos or partial names (e.g., "samsng", "iphone", "lap"), the fuzzy search should find matching products using substring matching and typo tolerance.

**Validates: Requirements 2.2, 3.1, 3.2, 3.4**

### Property 5: Order creation preserves stock invariant

_For any_ valid order request with product P and quantity Q, if the order is successfully created, then the stock of product P should decrease by exactly Q, and the new stock should be non-negative.

**Validates: Requirements 2.3**

### Property 6: Order confirmation completeness

_For any_ successfully created order, the response should include order ID, product name, quantity, and total amount.

**Validates: Requirements 2.4**

### Property 7: Alternative product suggestion relevance

_For any_ out-of-stock product P in category C, all suggested alternative products should also belong to category C and have stock > 0.

**Validates: Requirements 2.5**

### Property 8: Product response completeness

_For any_ product query that returns matching products, each product in the response should include name, price, stock quantity, category, and description fields.

**Validates: Requirements 3.3**

### Property 9: Multiple product match completeness

_For any_ fuzzy query that matches multiple products, all matching products should be presented with their details.

**Validates: Requirements 3.5**

### Property 10: Admin product list completeness

_For any_ administrator request for all products, the system should retrieve and display the complete product list with names, prices, and stock quantities.

**Validates: Requirements 4.1**

### Property 11: Low stock filtering accuracy

_For any_ low stock query with threshold T, all returned products should have stock < T, and all products with stock < T should be returned.

**Validates: Requirements 4.2**

### Property 12: Inventory statistics calculation accuracy

_For any_ inventory statistics request, the total product count should equal the number of non-deleted products, and total stock value should equal the sum of (price \* stock) for all products.

**Validates: Requirements 4.3**

### Property 13: Best-selling products ranking

_For any_ request for best-selling products, the returned products should be sorted in descending order by order frequency.

**Validates: Requirements 4.4**

### Property 14: Role-based access enforcement

_For any_ admin-only request (inventory overview, demand analytics, low stock), if the requesting user's role is not "admin", the system should deny access and return an access-denied message without executing the query.

**Validates: Requirements 4.5**

### Property 15: Demand counter increment on query

_For any_ product information query for product P, the demand counter for P should increase by exactly 1 after the query completes.

**Validates: Requirements 5.1**

### Property 16: Demand counter increment on order

_For any_ successful order for product P with quantity Q, the demand counter for P should increase by exactly Q after the order is created.

**Validates: Requirements 5.2**

### Property 17: Demand query accuracy

_For any_ administrator request for demand information for a specific product, the system should retrieve and display the product name and current demand counter value.

**Validates: Requirements 5.3**

### Property 18: Top demanded products ranking

_For any_ demand analytics request for top N products, the returned products should be sorted in descending order by demand counter, and the count should not exceed N.

**Validates: Requirements 5.4**

### Property 19: Demand persistence

_For any_ demand counter update, the new value should be persisted to the database immediately.

**Validates: Requirements 5.5**

### Property 20: Inventory intent detection

_For any_ message containing inventory keywords (order, buy, stock, price) or product names, the system should activate inventory mode.

**Validates: Requirements 6.1**

### Property 21: Stateless mode switching

_For any_ message processed in inventory mode, the system should return to casual mode for the next message, ensuring each message is evaluated independently.

**Validates: Requirements 6.4**

### Property 22: Authentication validation on all endpoints

_For any_ chatbot endpoint request without a valid authentication token, the system should reject the request with a 401 status before processing any business logic.

**Validates: Requirements 7.5**

### Property 23: Structured data formatting consistency

_For any_ response containing structured data (orders, products, analytics), the data should be formatted with consistent field names and structure across all response types.

**Validates: Requirements 8.2**

### Property 24: Conversation history persistence

_For any_ sequence of messages within a session, all previous messages should remain accessible in the conversation history.

**Validates: Requirements 8.4**

### Property 25: No confidence indicators in UI

_For any_ response sent to the frontend, the response should not contain confidence scores, accuracy percentages, or any technical confidence indicators.

**Validates: Requirements 8.6**

## Error Handling

### Error Categories

1. **Validation Errors**

   - Invalid product name
   - Invalid quantity (negative, zero, non-numeric)
   - Missing required fields
   - Response: Clear error message with guidance

2. **Business Logic Errors**

   - Insufficient stock
   - Product not found
   - Unauthorized access
   - Response: Specific error with alternatives

3. **System Errors**

   - Database connection failure
   - External API (Gemini) failure
   - Network timeout
   - Response: Generic error with retry suggestion

4. **Low Confidence Errors**
   - Ambiguous intent
   - Multiple product matches
   - Unclear quantity
   - Response: Clarification request with options

### Error Response Format

```javascript
{
  success: false,
  error: {
    type: 'validation' | 'business' | 'system' | 'low_confidence',
    message: 'User-friendly error message',
    code: 'ERROR_CODE',
    suggestions: ['Alternative action 1', 'Alternative action 2']
  },
  metadata: {
    intent: 'recognized_intent',
    confidence: 45
  }
}
```

### Fallback Strategies

1. **Low Confidence**: Ask clarifying questions
2. **Product Not Found**: Suggest similar products using fuzzy matching
3. **Out of Stock**: Suggest alternatives from same category
4. **API Failure**: Fall back to rule-based responses
5. **Ambiguous Query**: Present multiple options for user selection

## Testing Strategy

### Unit Testing

**Framework:** Jest for backend, React Testing Library for frontend

**Backend Unit Tests:**

- Inventory intent detection for various message formats
- Fuzzy product search with typos and partial names
- Entity extraction for different product name patterns
- Order creation validation
- Stock decrement operations
- Demand counter increment
- Role-based access control
- Gemini API integration and fallback

**Frontend Unit Tests:**

- Message rendering for different response types
- Input validation
- Structured data formatting
- Error message display
- Conversation history management
- Loading state indicators

**Example Unit Tests:**

```javascript
// Intent detection
test('routes "hi bro" to Gemini API (casual mode)');
test('routes "order iphone" to inventory mode');
test('routes "tell me a joke" to Gemini API');
test('routes "show me samsng phones" to inventory mode with fuzzy search');

// Fuzzy product search
test('finds "Samsung" from query "sam"');
test('finds "iPhone" from query "iphone" (case insensitive)');
test('finds "Samsung" from typo "samsng"');
test('finds "Laptop" from partial "lap"');

// Entity extraction
test('extracts product name "Nike Shoes" from message');
test('extracts quantity 5 from "order 5 laptops"');
test("handles missing quantity by defaulting to 1");

// Edge cases
test("handles empty product name gracefully");
test("handles negative quantity with error");
test("handles non-existent product with fuzzy suggestions");
```

### Property-Based Testing

**Framework:** fast-check (JavaScript property-based testing library)

**Configuration:** Each property test should run a minimum of 100 iterations to ensure comprehensive coverage across the input space.

**Test Tagging:** Each property-based test must include a comment explicitly referencing the correctness property from this design document using the format: `**Feature: intelligent-chatbot, Property {number}: {property_text}**`

**Property Test Generators:**

```javascript
// Product generator
const productGen = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  price: fc.float({ min: 0.01, max: 10000 }),
  stock: fc.integer({ min: 0, max: 1000 }),
  category: fc.constantFrom("Electronics", "Clothing", "Food"),
});

// Order request generator
const orderRequestGen = fc.record({
  productName: fc.string({ minLength: 1 }),
  quantity: fc.integer({ min: 1, max: 100 }),
  userId: fc.uuid(),
});

// Message generator for intent recognition
const messageGen = fc.oneof(
  fc
    .constant("I want to order ")
    .chain((name) => fc.constant(name + fc.string())),
  fc
    .constant("Show me details of ")
    .chain((name) => fc.constant(name + fc.string()))
);
```

**Property Tests to Implement:**

1. **Stock Invariant Property** (Property 1)

   - Generate random products and order quantities
   - Verify stock decreases correctly and never goes negative

2. **Demand Monotonicity Property** (Property 2)

   - Generate sequences of queries and orders
   - Verify demand counter only increases

3. **Confidence Threshold Property** (Property 3)

   - Generate ambiguous messages
   - Verify system requests clarification when confidence < 70%

4. **Search Completeness Property** (Property 4)

   - Generate products with various names
   - Verify exact name matches always appear in results

5. **Access Control Property** (Property 5)

   - Generate requests with different user roles
   - Verify admin-only endpoints reject non-admin users

6. **Price Calculation Property** (Property 6)

   - Generate random prices and quantities
   - Verify total = price \* quantity always holds

7. **Alternative Suggestion Property** (Property 7)

   - Generate out-of-stock scenarios
   - Verify alternatives match original category

8. **Demand Atomicity Property** (Property 8)

   - Generate concurrent demand updates
   - Verify final count matches expected total

9. **Entity Extraction Property** (Property 9)

   - Generate messages with known product names
   - Verify extraction identifies the product

10. **Stock Validation Property** (Property 10)
    - Generate orders exceeding stock
    - Verify orders are rejected

### Integration Testing

**Scenarios:**

- End-to-end order placement flow
- Product search with demand tracking
- Admin analytics retrieval
- Error handling across components
- Gemini API integration with fallback

### Testing Best Practices

- Write implementation code first, then corresponding tests
- Use property-based tests for universal correctness properties
- Use unit tests for specific examples and edge cases
- Mock external dependencies (Gemini API) in unit tests
- Use real database for integration tests (test database)
- Ensure tests are deterministic and repeatable
- Each test should be independent and isolated

## Implementation Considerations

### Natural Language Processing Strategy

**Conversation-First Approach:**

1. **Gemini API for Casual Conversation** (PRIMARY - Default Behavior)

   - All messages without inventory intent go to Gemini
   - Handles humor, emotions, greetings, explanations
   - Automatic language detection and response
   - Natural, context-aware conversation like ChatGPT
   - No repetitive or template responses
   - Supports any language the user speaks

2. **Inventory Intent Detection** (Secondary - Triggered Only When Needed)
   - Fast keyword-based detection for inventory operations
   - Activates only for: order, buy, purchase, stock, price, product names
   - Fuzzy product search with typo tolerance
   - Entity extraction for quantities and product names
   - Returns to casual mode after handling request

**Inventory Intent Detection:**

```javascript
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
];

function isInventoryIntent(message) {
  const lowerMessage = message.toLowerCase();

  // Check for inventory keywords
  const hasInventoryKeyword = inventoryKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  // Check for product names in database (fuzzy match)
  const hasProductName = fuzzyMatchProductNames(message);

  return hasInventoryKeyword || hasProductName;
}
```

**Fuzzy Product Search Strategy:**

```javascript
function fuzzyProductSearch(query) {
  const lowerQuery = query.toLowerCase();

  // 1. Substring matching: "iphone" matches "iPhone 13 Pro"
  // 2. Partial name: "sam" matches "Samsung Galaxy"
  // 3. Typo tolerance: "samsng" matches "Samsung"
  // 4. Lowercase comparison: case-insensitive
  // 5. Multiple word matching: "canon cmra" matches "Canon Camera"

  return products.filter((product) => {
    const lowerName = product.name.toLowerCase();
    return (
      lowerName.includes(lowerQuery) ||
      levenshteinDistance(lowerName, lowerQuery) < 3 ||
      lowerQuery.split(" ").every((word) => lowerName.includes(word))
    );
  });
}
```

### Performance Optimization

1. **Database Indexing**

   - Index on `Product.name` for fast search
   - Index on `Product.demandCount` for analytics queries
   - Index on `Order.customer` for user order history

2. **Caching Strategy**

   - Cache frequently accessed products
   - Cache inventory statistics (5-minute TTL)
   - Cache demand analytics (10-minute TTL)

3. **Query Optimization**

   - Use projection to limit returned fields
   - Implement pagination for large result sets
   - Use aggregation pipeline for analytics

4. **Response Time Targets**
   - Intent recognition: < 100ms
   - Product search: < 200ms
   - Order creation: < 500ms
   - Analytics queries: < 1s

### Security Considerations

1. **Authentication**

   - Verify JWT token on all chatbot endpoints
   - Extract user ID and role from token
   - Reject unauthenticated requests

2. **Authorization**

   - Enforce role-based access for admin features
   - Validate user owns orders they query
   - Prevent unauthorized data access

3. **Input Validation**

   - Sanitize all user input to prevent injection
   - Validate quantities are positive integers
   - Limit message length to prevent DoS
   - Rate limiting on chatbot endpoint

4. **Data Privacy**
   - Log only necessary information
   - Anonymize logs for analytics
   - Comply with data retention policies

### Scalability Considerations

1. **Horizontal Scaling**

   - Stateless backend design
   - Session data in database, not memory
   - Load balancer compatible

2. **Database Scaling**

   - Read replicas for analytics queries
   - Sharding strategy for large product catalogs
   - Connection pooling

3. **API Rate Limiting**
   - Limit Gemini API calls to prevent quota exhaustion
   - Implement exponential backoff for retries
   - Cache Gemini responses for identical queries

## API Specifications

### POST /api/chatbot/message

**Request:**

```javascript
{
  message: string,
  userId: string,  // From JWT token
  sessionId: string  // Optional, for context
}
```

**Response:**

```javascript
{
  success: boolean,
  intent: string,
  confidence: number,
  response: string,
  data: {
    // Intent-specific data
    order?: Order,
    products?: Product[],
    analytics?: DemandAnalytics
  },
  metadata: {
    entities: object,
    processingTime: number
  }
}
```

### GET /api/chatbot/demand

**Query Parameters:**

- `productId` (optional): Specific product demand
- `limit` (optional): Number of top products to return

**Response:**

```javascript
{
  success: boolean,
  products: [{
    _id: string,
    name: string,
    demandCount: number,
    trend: 'increasing' | 'stable' | 'decreasing',
    lastUpdate: Date
  }]
}
```

### POST /api/chatbot/order

**Request:**

```javascript
{
  productName: string,
  quantity: number,
  userId: string  // From JWT token
}
```

**Response:**

```javascript
{
  success: boolean,
  order: {
    _id: string,
    product: Product,
    quantity: number,
    totalPrice: number,
    status: string,
    orderDate: Date
  },
  message: string
}
```

### GET /api/chatbot/product-info

**Query Parameters:**

- `name`: Product name (fuzzy search)
- `id`: Product ID (exact match)

**Response:**

```javascript
{
  success: boolean,
  products: [{
    _id: string,
    name: string,
    description: string,
    price: number,
    stock: number,
    category: Category,
    supplier: Supplier
  }],
  message: string
}
```

### GET /api/chatbot/inventory

**Admin Only**

**Response:**

```javascript
{
  success: boolean,
  stats: {
    totalProducts: number,
    totalValue: number,
    lowStockCount: number,
    categories: [{name: string, count: number}]
  },
  products: Product[]  // Optional, based on query
}
```

## Deployment Notes

1. **Environment Variables**

   - `GEMINI_API_KEY`: API key for Gemini integration (AIzaSyDOlm0FAnvPd3Uq4sIypnPDw-CnuqLtnJg)
   - `LOW_STOCK_THRESHOLD`: Stock level for low stock alerts (default: 10)
   - `DEMAND_CACHE_TTL`: Cache duration for demand analytics (default: 600s)
   - `GEMINI_MODEL`: Gemini model to use (default: gemini-pro)

2. **Database Migrations**

   - Add `demandCount` field to existing products (default: 0)
   - Create indexes on new fields
   - Create ChatbotLog collection

3. **Monitoring**

   - Track intent recognition accuracy
   - Monitor confidence score distribution
   - Alert on high error rates
   - Track API response times

4. **Rollout Strategy**
   - Deploy backend changes first
   - Test with admin users
   - Gradual rollout to customers
   - Monitor for issues and iterate
