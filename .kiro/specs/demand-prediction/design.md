# Design Document

## Overview

The Demand Prediction feature extends the Stockify Inventory Management System with predictive analytics capabilities. The system analyzes historical order data using statistical forecasting methods to predict product demand for the next 30 days. The architecture follows the existing MERN stack pattern with Express.js backend services, MongoDB data persistence, and React frontend components.

The prediction engine implements a hybrid forecasting algorithm combining moving averages and linear trend analysis to generate reliable demand forecasts. Predictions are computed on-demand via API endpoints and automatically refreshed daily through a CRON scheduler. The admin panel provides interactive visualizations using Recharts to display historical sales patterns and future demand forecasts, along with actionable reorder recommendations.

## Architecture

### System Components

The Demand Prediction feature integrates into the existing three-tier architecture:

**Backend Layer (Node.js/Express)**

- Prediction Controller: Handles HTTP requests for prediction operations
- Prediction Service: Implements forecasting algorithms and business logic
- Prediction Model: Defines MongoDB schema for storing predictions
- Prediction Routes: Defines API endpoints with authentication middleware
- CRON Scheduler: Automates daily prediction computation

**Data Layer (MongoDB)**

- Prediction Collection: Stores forecast data and metadata
- Order Collection: Source of historical sales data (existing)
- Product Collection: Source of current stock levels (existing)

**Frontend Layer (React)**

- DemandPrediction Page: Main interface for viewing and generating predictions
- PredictionCharts Component: Renders historical and forecast visualizations
- PredictionMetrics Component: Displays key prediction statistics
- DashboardAlerts Component: Shows high-demand warnings on main dashboard
- Sidebar Component: Updated to include navigation link (existing, modified)

### Data Flow

1. **On-Demand Prediction Flow**:

   - Admin selects product in UI → POST /api/predictions/:productId
   - Controller validates admin role → Service fetches order history
   - Service aggregates data by date → Service computes forecast
   - Service stores prediction in DB → Controller returns prediction to UI
   - UI renders charts and metrics

2. **Scheduled Prediction Flow**:

   - CRON triggers at 2:00 AM → Calls compute-all endpoint
   - Service fetches all products → Iterates through each product
   - For each: fetch orders → compute forecast → store prediction
   - Logs summary of successful/failed predictions

3. **Dashboard Alert Flow**:
   - Dashboard loads → Fetches all predictions
   - Compares predicted demand vs current stock
   - Filters products where predicted > stock
   - Renders alert cards sorted by urgency

### Integration Points

- **Authentication**: Uses existing `authMiddleware` for route protection
- **Role Authorization**: Checks `req.user.role === 'admin'` for admin-only endpoints
- **Product Data**: References existing Product model for stock levels
- **Order Data**: Queries existing Order model for historical sales
- **Routing**: Mounts prediction routes at `/api/predictions` in server/index.js
- **Navigation**: Adds menu item to existing Sidebar component
- **Dashboard**: Extends existing dashboard controller with alert logic

## Components and Interfaces

### Backend Components

#### Prediction Model (server/models/Prediction.js)

```javascript
{
  productId: ObjectId (ref: 'Product', required, unique),
  productName: String (required),
  history: [{
    date: Date (required),
    quantity: Number (required)
  }],
  forecast: [{
    date: Date (required),
    predicted: Number (required)
  }],
  predictedTotalNext30: Number (required),
  confidence: Number (required, min: 0, max: 1),
  recommendedReorder: Number (required, min: 0),
  method: String (default: 'moving-average-trend'),
  generatedAt: Date (default: Date.now)
}
```

#### Prediction Service (server/services/predictionService.js)

**Functions**:

- `collectHistoricalData(productId)`: Aggregates order quantities by date

  - Input: productId (ObjectId)
  - Output: Array of {date, quantity} objects sorted chronologically
  - Fills missing dates with zero quantity

- `calculateMovingAverage(data, windowSize)`: Computes moving average

  - Input: data (array of quantities), windowSize (number, default 30)
  - Output: Single number representing average

- `calculateLinearTrend(data)`: Performs least-squares regression

  - Input: data (array of quantities)
  - Output: Function that predicts value for given day index

- `generateForecast(history, days)`: Creates 30-day forecast

  - Input: history (array of {date, qty}), days (number, default 30)
  - Output: Array of {date, predicted} objects
  - Formula: 0.6 × trend + 0.4 × movingAverage

- `calculateConfidence(history)`: Computes confidence score

  - Input: history (array of quantities)
  - Output: Number between 0 and 1
  - Based on coefficient of variation (lower variation = higher confidence)

- `calculateReorderQuantity(predictedTotal, currentStock)`: Recommends reorder

  - Input: predictedTotal (number), currentStock (number)
  - Output: Number (minimum 0)
  - Formula: max(0, predictedTotal - currentStock + safetyStock)
  - Safety stock = 20% of predictedTotal

- `computePrediction(productId)`: Main orchestration function
  - Fetches product details
  - Collects historical data
  - Validates sufficient data (minimum 7 days)
  - Generates forecast
  - Calculates metrics
  - Stores prediction in database
  - Returns complete prediction object

#### Prediction Controller (server/controllers/predictionController.js)

**Endpoints**:

- `computePrediction(req, res)`: POST /api/predictions/:productId

  - Validates admin role
  - Calls predictionService.computePrediction()
  - Returns 200 with prediction or appropriate error status

- `getPrediction(req, res)`: GET /api/predictions/:productId

  - Validates admin role
  - Queries Prediction model by productId
  - Populates product reference
  - Returns 200 with prediction or 404 if not found

- `computeAllPredictions(req, res)`: POST /api/predictions/compute-all
  - Validates admin role
  - Fetches all non-deleted products
  - Iterates and computes predictions
  - Collects success/failure counts
  - Returns 200 with summary object

#### Prediction Routes (server/routes/prediction.js)

```javascript
router.post("/:productId", authMiddleware, checkAdmin, computePrediction);
router.get("/:productId", authMiddleware, checkAdmin, getPrediction);
router.post("/compute-all", authMiddleware, checkAdmin, computeAllPredictions);
```

#### Admin Middleware (server/middleware/checkAdmin.js)

```javascript
// New middleware to verify admin role
const checkAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }
  next();
};
```

#### CRON Scheduler (server/cron/predictionScheduler.js)

```javascript
import cron from "node-cron";

// Schedule: '0 2 * * *' (2:00 AM daily)
cron.schedule("0 2 * * *", async () => {
  console.log("Starting daily prediction computation...");
  // Call compute-all logic
  // Log results
});
```

### Frontend Components

#### DemandPrediction Page (frontend/src/pages/DemandPrediction.jsx)

**State**:

- `products`: Array of all products for dropdown
- `selectedProduct`: Currently selected product ID
- `prediction`: Loaded prediction data
- `loading`: Boolean for loading state
- `error`: Error message string

**Functions**:

- `fetchProducts()`: Loads product list on mount
- `handlePredictDemand()`: Triggers prediction computation
- `fetchPrediction()`: Retrieves stored prediction

**UI Structure**:

- Header with title
- Product selection dropdown
- "Predict Demand" button
- Loading spinner
- Error message display
- PredictionCharts component (when data loaded)
- PredictionMetrics component (when data loaded)

#### PredictionCharts Component (frontend/src/components/PredictionCharts.jsx)

**Props**:

- `history`: Array of {date, quantity}
- `forecast`: Array of {date, predicted}

**Rendering**:

- Two side-by-side Recharts LineChart components
- Historical chart: Blue line, dates on x-axis, quantities on y-axis
- Forecast chart: Green line, future dates on x-axis, predicted values on y-axis
- Responsive container with proper sizing
- Tooltips showing exact values on hover
- Axis labels and legends

#### PredictionMetrics Component (frontend/src/components/PredictionMetrics.jsx)

**Props**:

- `predictedTotal`: Number
- `confidence`: Number (0-1)
- `recommendedReorder`: Number
- `method`: String
- `generatedAt`: Date string

**Rendering**:

- Grid of metric cards with icons
- Predicted 30-day demand (formatted number)
- Confidence percentage (formatted as %)
- Recommended reorder quantity
- Prediction method
- Generation timestamp (formatted date)
- Consistent styling with existing dashboard cards

#### DashboardAlerts Component (frontend/src/components/DashboardAlerts.jsx)

**State**:

- `alerts`: Array of high-demand products

**Functions**:

- `fetchAlerts()`: Loads predictions and filters high-demand items

**Rendering**:

- Alert cards with warning icon
- Product name
- Predicted demand vs current stock
- Recommended reorder quantity
- Sorted by urgency (demand/stock ratio)
- Empty state message when no alerts

#### Updated Sidebar (frontend/src/components/Sidebar.jsx)

**Changes**:

- Add new menu item to `menuItems` array (admin only):
  ```javascript
  {
    name: "Demand Prediction",
    path: "/admin-dashboard/demand-prediction",
    icon: <FaChartLine />,
    isParent: false
  }
  ```
- Import FaChartLine from react-icons/fa

#### Updated Dashboard Controller (server/controllers/dashboardController.js)

**New Function**:

- `getHighDemandAlerts(req, res)`: GET /api/dashboard/alerts
  - Fetches all predictions
  - Populates product stock data
  - Filters where predictedTotalNext30 > stock
  - Sorts by (predicted - stock) descending
  - Returns array of alert objects

## Data Models

### Prediction Schema

```javascript
const predictionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    unique: true,
  },
  productName: {
    type: String,
    required: true,
  },
  history: [
    {
      date: {
        type: Date,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  forecast: [
    {
      date: {
        type: Date,
        required: true,
      },
      predicted: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  predictedTotalNext30: {
    type: Number,
    required: true,
    min: 0,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  recommendedReorder: {
    type: Number,
    required: true,
    min: 0,
  },
  method: {
    type: String,
    default: "moving-average-trend",
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

predictionSchema.index({ productId: 1 });
predictionSchema.index({ generatedAt: -1 });
```

### Data Relationships

- Prediction.productId → Product.\_id (one-to-one)
- Order.product → Product.\_id (many-to-one, existing)
- Prediction stores denormalized productName for performance
- Prediction.history derived from Order aggregation
- Prediction.forecast computed from history

### Data Validation

- productId must reference existing Product
- history array must have at least 7 entries for valid prediction
- All quantity and predicted values must be non-negative
- confidence must be between 0 and 1
- dates in history and forecast must be chronologically ordered
- forecast must contain exactly 30 entries

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

After analyzing all acceptance criteria, several redundancies were identified:

- **Authorization properties**: Multiple endpoints test admin role verification (5.1, 6.1, 7.1) - can be consolidated into one property
- **Data structure properties**: Multiple criteria test the same prediction object structure (4.1, 4.3, 4.4, 5.2) - can be consolidated
- **Chart rendering properties**: Multiple criteria test chart display (9.4, 9.5, 12.1, 12.2, 12.4) - can be consolidated
- **Retrieval properties**: Multiple criteria test prediction retrieval (4.5, 6.2, 6.4) - can be consolidated
- **Reorder calculation properties**: Multiple criteria test non-negative reorder (3.2, 3.4) and safety stock (3.3 is part of 3.1) - can be consolidated
- **Confidence properties**: High and low confidence (2.6, 2.7) test the same relationship - can be consolidated

The following properties provide unique validation value after removing redundancies:

Property 1: Order aggregation by date
_For any_ set of orders for a product, aggregating by date should produce daily totals where each date's quantity equals the sum of all order quantities for that date
**Validates: Requirements 1.1, 1.2**

Property 2: Missing date filling
_For any_ date range with gaps in order data, the history array should contain entries for all dates with zero quantity for dates without orders
**Validates: Requirements 1.3**

Property 3: Chronological ordering
_For any_ set of orders regardless of insertion order, the resulting history array should be sorted chronologically by date in ascending order
**Validates: Requirements 1.5**

Property 4: Moving average calculation
_For any_ sequence of historical quantities, the 30-day moving average should equal the arithmetic mean of the last 30 values (or all values if fewer than 30)
**Validates: Requirements 2.1**

Property 5: Linear trend calculation
_For any_ sequence of historical quantities, the linear trend function should minimize the sum of squared residuals (least-squares property)
**Validates: Requirements 2.2**

Property 6: Forecast combination formula
_For any_ computed trend value and moving average value, the forecast value should equal 0.6 × trendValue + 0.4 × movingAverage
**Validates: Requirements 2.3**

Property 7: Forecast length and dates
_For any_ historical data ending on date D, the forecast array should contain exactly 30 entries with consecutive dates starting from D+1
**Validates: Requirements 2.4**

Property 8: Predicted total summation
_For any_ forecast array, the predictedTotalNext30 value should equal the sum of all predicted values in the forecast array
**Validates: Requirements 2.5**

Property 9: Confidence and variability relationship
_For any_ two sets of historical data, the set with higher coefficient of variation should produce a lower confidence score
**Validates: Requirements 2.6, 2.7**

Property 10: Reorder quantity formula
_For any_ predicted total and current stock, the recommended reorder should equal max(0, predictedTotal - currentStock + 0.2 × predictedTotal)
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

Property 11: Prediction object structure
_For any_ stored prediction, the document should contain all required fields: productId, productName, history, forecast, predictedTotalNext30, confidence, recommendedReorder, method, and generatedAt
**Validates: Requirements 4.1, 4.3, 4.4**

Property 12: Prediction upsert behavior
_For any_ product, storing a new prediction should result in exactly one prediction document for that product in the database
**Validates: Requirements 4.2**

Property 13: Product reference population
_For any_ retrieved prediction, the productId reference should be populated with the product's current name and stock data
**Validates: Requirements 4.5, 6.2, 6.4**

Property 14: Admin-only access
_For any_ prediction API endpoint, requests from non-admin users should be rejected with 403 status
**Validates: Requirements 5.1, 6.1, 7.1**

Property 15: Deleted product exclusion
_For any_ bulk computation operation, products with isDeleted=true should not be included in the processing
**Validates: Requirements 7.2**

Property 16: Batch error resilience
_For any_ bulk computation including products with insufficient data, the operation should continue processing remaining products and return counts of successes and failures
**Validates: Requirements 7.3, 7.4**

Property 17: Product list loading
_For any_ admin user loading the Demand Prediction page, the product dropdown should be populated with all non-deleted products from the API
**Validates: Requirements 9.2**

Property 18: Prediction API invocation
_For any_ product selection and "Predict Demand" button click, the UI should send a POST request to /api/predictions/:productId
**Validates: Requirements 9.3**

Property 19: Chart data rendering
_For any_ loaded prediction, both historical and forecast charts should receive and display their respective data arrays with correct date and quantity mappings
**Validates: Requirements 9.4, 9.5, 12.1, 12.2, 12.4**

Property 20: Metrics display completeness
_For any_ loaded prediction, all five metrics (predicted total, confidence %, reorder quantity, method, timestamp) should be displayed with correct values
**Validates: Requirements 9.6**

Property 21: Navigation functionality
_For any_ admin user clicking the "Demand Prediction" menu item, the application should navigate to /admin-dashboard/demand-prediction
**Validates: Requirements 10.2**

Property 22: Active menu highlighting
_For any_ page route, the sidebar menu item matching that route should have the active state styling applied
**Validates: Requirements 10.3**

Property 23: Role-based menu visibility
_For any_ user with role="customer", the "Demand Prediction" menu item should not be rendered in the sidebar
**Validates: Requirements 10.4**

Property 24: Alert data fetching
_For any_ admin dashboard load, the system should fetch all predictions from the API
**Validates: Requirements 11.1**

Property 25: High demand alert filtering
_For any_ set of predictions, alerts should be displayed only for products where predictedTotalNext30 > currentStock
**Validates: Requirements 11.2**

Property 26: Alert content completeness
_For any_ displayed alert, it should show product name, predicted demand, current stock, and recommended reorder quantity
**Validates: Requirements 11.3**

Property 27: Alert sorting by urgency
_For any_ multiple high-demand products, alerts should be sorted in descending order by (predictedDemand - currentStock) ratio
**Validates: Requirements 11.5**

## Error Handling

### Backend Error Scenarios

**Insufficient Historical Data**

- Condition: Product has fewer than 7 days of order history
- Response: 400 Bad Request
- Message: "Insufficient historical data for prediction. Minimum 7 days required."
- Handling: Return early from computePrediction, do not store prediction

**Product Not Found**

- Condition: productId does not exist in Product collection
- Response: 404 Not Found
- Message: "Product not found"
- Handling: Return error before attempting data collection

**No Prediction Found**

- Condition: GET request for product with no stored prediction
- Response: 404 Not Found
- Message: "No prediction found for this product"
- Handling: Return error from getPrediction controller

**Unauthorized Access**

- Condition: Non-admin user attempts to access prediction endpoints
- Response: 403 Forbidden
- Message: "Access denied. Admin role required."
- Handling: checkAdmin middleware blocks request before controller

**Database Errors**

- Condition: MongoDB connection failure or query error
- Response: 500 Internal Server Error
- Message: "Database error occurred"
- Handling: Catch exceptions, log error details, return generic message to client

**Computation Errors**

- Condition: Mathematical operation fails (e.g., division by zero in trend calculation)
- Response: 500 Internal Server Error
- Message: "Error computing prediction"
- Handling: Wrap calculations in try-catch, log error, return error response

### Frontend Error Scenarios

**API Request Failure**

- Condition: Network error or server returns error status
- Handling: Display error message in UI, show retry option
- UI: Red alert banner with error text

**No Products Available**

- Condition: Product list API returns empty array
- Handling: Display message "No products available"
- UI: Empty state with informative text

**Prediction Load Failure**

- Condition: Prediction API returns 404 or error
- Handling: Display message prompting user to generate prediction
- UI: Info message with "Generate Prediction" button

**Loading States**

- Condition: API request in progress
- Handling: Show loading spinner, disable buttons
- UI: Spinner overlay on content area

**Invalid Product Selection**

- Condition: User clicks "Predict Demand" without selecting product
- Handling: Display validation message
- UI: Warning message "Please select a product"

## Testing Strategy

### Unit Testing

The testing approach combines unit tests for specific examples and edge cases with property-based tests for universal correctness properties.

**Unit Test Coverage**:

1. **Prediction Service Functions**

   - Test `collectHistoricalData` with sample orders
   - Test `calculateMovingAverage` with known input/output pairs
   - Test `calculateLinearTrend` with linear data sequences
   - Test `generateForecast` with mock history data
   - Test `calculateConfidence` with high and low variance data
   - Test `calculateReorderQuantity` with various stock levels

2. **API Endpoints**

   - Test POST /api/predictions/:productId with valid product
   - Test GET /api/predictions/:productId with existing prediction
   - Test POST /api/predictions/compute-all with multiple products
   - Test error responses for invalid inputs

3. **Frontend Components**

   - Test DemandPrediction page renders correctly
   - Test product dropdown populates from API
   - Test "Predict Demand" button triggers API call
   - Test charts render with sample data
   - Test metrics display correct values
   - Test error states display properly

4. **Integration Points**
   - Test admin middleware blocks non-admin users
   - Test CRON scheduler initializes correctly
   - Test dashboard alerts fetch and filter predictions

**Testing Framework**: Jest for backend, React Testing Library for frontend

### Property-Based Testing

Property-based tests verify universal properties across randomly generated inputs to catch edge cases and ensure algorithmic correctness.

**Property Test Library**: fast-check (JavaScript property-based testing library)

**Configuration**: Each property test should run minimum 100 iterations with randomly generated data

**Property Test Coverage**:

1. **Property 1: Order aggregation by date**

   - Generate: Random arrays of orders with various dates and quantities
   - Verify: Aggregated daily totals match manual summation
   - Tag: **Feature: demand-prediction, Property 1: Order aggregation by date**

2. **Property 2: Missing date filling**

   - Generate: Random date ranges with gaps
   - Verify: All dates in range present, missing dates have quantity 0
   - Tag: **Feature: demand-prediction, Property 2: Missing date filling**

3. **Property 3: Chronological ordering**

   - Generate: Random orders in any order
   - Verify: History array sorted by date ascending
   - Tag: **Feature: demand-prediction, Property 3: Chronological ordering**

4. **Property 4: Moving average calculation**

   - Generate: Random quantity sequences
   - Verify: Moving average equals arithmetic mean of window
   - Tag: **Feature: demand-prediction, Property 4: Moving average calculation**

5. **Property 5: Linear trend calculation**

   - Generate: Random quantity sequences
   - Verify: Trend line minimizes sum of squared residuals
   - Tag: **Feature: demand-prediction, Property 5: Linear trend calculation**

6. **Property 6: Forecast combination formula**

   - Generate: Random trend and moving average values
   - Verify: Forecast = 0.6 × trend + 0.4 × MA
   - Tag: **Feature: demand-prediction, Property 6: Forecast combination formula**

7. **Property 7: Forecast length and dates**

   - Generate: Random historical data with various end dates
   - Verify: Forecast has 30 entries, dates consecutive from last date + 1
   - Tag: **Feature: demand-prediction, Property 7: Forecast length and dates**

8. **Property 8: Predicted total summation**

   - Generate: Random forecast arrays
   - Verify: predictedTotalNext30 equals sum of forecast values
   - Tag: **Feature: demand-prediction, Property 8: Predicted total summation**

9. **Property 10: Reorder quantity formula**

   - Generate: Random predicted totals and stock levels
   - Verify: Reorder = max(0, predicted - stock + 0.2 × predicted)
   - Tag: **Feature: demand-prediction, Property 10: Reorder quantity formula**

10. **Property 12: Prediction upsert behavior**

    - Generate: Multiple predictions for same product
    - Verify: Only one prediction document exists per product
    - Tag: **Feature: demand-prediction, Property 12: Prediction upsert behavior**

11. **Property 16: Batch error resilience**

    - Generate: Mix of products with sufficient and insufficient data
    - Verify: Operation completes, returns correct success/failure counts
    - Tag: **Feature: demand-prediction, Property 16: Batch error resilience**

12. **Property 25: High demand alert filtering**

    - Generate: Random predictions with various demand/stock ratios
    - Verify: Only predictions where demand > stock appear in alerts
    - Tag: **Feature: demand-prediction, Property 25: High demand alert filtering**

13. **Property 27: Alert sorting by urgency**
    - Generate: Multiple high-demand products with different ratios
    - Verify: Alerts sorted by (demand - stock) descending
    - Tag: **Feature: demand-prediction, Property 27: Alert sorting by urgency**

**Property Test Implementation Notes**:

- Use fast-check's `fc.array()`, `fc.integer()`, `fc.date()` generators
- Create custom generators for Order and Product objects
- Ensure generated data respects domain constraints (non-negative quantities, valid dates)
- Each property test must reference its corresponding design property in a comment
- Tests should be co-located with implementation files where possible

### Test Execution

**Backend Tests**:

```bash
cd server
npm test
```

**Frontend Tests**:

```bash
cd frontend
npm test
```

**Coverage Goals**:

- Unit test coverage: 80% of lines
- Property test coverage: All critical algorithms (forecasting, aggregation, calculations)
- Integration test coverage: All API endpoints with authentication

## Implementation Notes

### Dependencies to Install

**Backend**:

```bash
cd server
npm install node-cron
```

**Frontend**:
No new dependencies needed (Recharts already installed)

**Testing** (if implementing tests):

```bash
cd server
npm install --save-dev jest fast-check
cd ../frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### File Structure

```
server/
├── models/
│   └── Prediction.js (new)
├── controllers/
│   ├── predictionController.js (new)
│   └── dashboardController.js (modify - add alerts)
├── services/
│   └── predictionService.js (new)
├── routes/
│   └── prediction.js (new)
├── middleware/
│   └── checkAdmin.js (new)
├── cron/
│   └── predictionScheduler.js (new)
└── index.js (modify - mount routes, start cron)

frontend/src/
├── pages/
│   └── DemandPrediction.jsx (new)
├── components/
│   ├── PredictionCharts.jsx (new)
│   ├── PredictionMetrics.jsx (new)
│   ├── DashboardAlerts.jsx (new)
│   └── Sidebar.jsx (modify - add menu item)
└── App.jsx (modify - add route)
```

### Configuration

**Environment Variables** (server/.env):

- No new environment variables required
- Uses existing JWT_SECRET, PORT, MONGODB_URI

**CRON Schedule**:

- Expression: `'0 2 * * *'` (2:00 AM daily)
- Timezone: Server local time
- Can be configured via environment variable if needed

### Performance Considerations

**Database Indexing**:

- Index on Prediction.productId for fast lookups
- Index on Prediction.generatedAt for sorting recent predictions
- Index on Order.product and Order.orderDate for aggregation queries

**Query Optimization**:

- Use aggregation pipeline for order data collection (single query)
- Limit historical data retrieval to last 90 days for performance
- Cache product list in frontend to reduce API calls

**Computation Optimization**:

- Forecast computation is O(n) where n is history length
- Moving average is O(1) with sliding window
- Linear regression is O(n) with single pass
- Batch computation processes products sequentially (can be parallelized if needed)

### Security Considerations

**Authentication**:

- All prediction endpoints require valid JWT token
- Token validated by existing authMiddleware

**Authorization**:

- All prediction endpoints require admin role
- checkAdmin middleware verifies req.user.role === 'admin'
- Frontend hides prediction features from non-admin users

**Input Validation**:

- Validate productId is valid MongoDB ObjectId
- Validate product exists before processing
- Sanitize all user inputs to prevent injection

**Data Access**:

- Predictions scoped to system-wide data (admin view)
- No user-specific prediction data (all admins see same predictions)
- Product and order data already protected by existing auth

### Scalability Considerations

**Data Volume**:

- Predictions stored per product (not per user)
- One prediction document per product (upsert pattern)
- Historical data limited to relevant timeframe
- Old predictions can be archived if needed

**Computation Load**:

- CRON job runs during low-traffic hours (2 AM)
- Batch computation can be rate-limited if needed
- On-demand predictions cached in database
- Consider job queue (Bull, Agenda) for large product catalogs

**Frontend Performance**:

- Charts render efficiently with Recharts
- Lazy load prediction page
- Debounce product selection changes
- Paginate alerts if many products have high demand

## Deployment Checklist

1. Install node-cron dependency in server
2. Create all new backend files (model, controller, service, routes, middleware, cron)
3. Update server/index.js to mount prediction routes and start CRON
4. Create all new frontend files (page, components)
5. Update frontend Sidebar.jsx to add menu item
6. Update frontend App.jsx to add route
7. Test all API endpoints with Postman/Thunder Client
8. Test frontend UI flows manually
9. Verify CRON job initializes on server start
10. Run unit tests and property tests
11. Check database indexes are created
12. Verify admin-only access works correctly
13. Test with production-like data volumes
14. Monitor server logs for CRON execution
15. Document API endpoints for team

## Future Enhancements

**Advanced Forecasting**:

- Implement seasonal adjustment for products with seasonal patterns
- Add exponential smoothing methods (Holt-Winters)
- Support multiple forecasting models with accuracy comparison
- Machine learning models (LSTM, Prophet) for complex patterns

**Enhanced Analytics**:

- Prediction accuracy tracking (compare predictions to actual sales)
- Confidence interval visualization (upper/lower bounds)
- Trend analysis (increasing/decreasing demand)
- Category-level demand aggregation

**User Experience**:

- Bulk prediction generation from UI
- Export predictions to CSV/Excel
- Email notifications for high-demand alerts
- Customizable alert thresholds
- Historical prediction comparison

**Performance**:

- Background job queue for batch computations
- Caching layer (Redis) for frequently accessed predictions
- Parallel processing for bulk computations
- Incremental updates (only recompute changed products)

**Business Features**:

- Multi-warehouse support with location-specific predictions
- Supplier lead time integration
- Automatic purchase order generation
- Budget constraints for reorder recommendations
- Seasonal product handling
