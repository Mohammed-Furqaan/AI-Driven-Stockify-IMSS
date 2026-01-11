# Implementation Plan

- [x] 1. Set up backend infrastructure and data model

  - Create Prediction model with all required fields and indexes
  - Create checkAdmin middleware for role-based authorization
  - Install node-cron dependency for scheduling
  - _Requirements: 4.1, 4.2, 5.1_

- [x] 2. Implement prediction service core algorithms

  - _Requirements: 1.1, 1.3, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2_

- [x] 2.1 Implement historical data collection function

  - Write collectHistoricalData function to aggregate orders by product and date
  - Implement date gap filling with zero quantities
  - Ensure chronological sorting of history array
  - _Requirements: 1.1, 1.3, 1.5_

- [ ]\* 2.2 Write property test for order aggregation

  - **Property 1: Order aggregation by date**
  - **Validates: Requirements 1.1, 1.2**

- [ ]\* 2.3 Write property test for missing date filling

  - **Property 2: Missing date filling**
  - **Validates: Requirements 1.3**

- [ ]\* 2.4 Write property test for chronological ordering

  - **Property 3: Chronological ordering**
  - **Validates: Requirements 1.5**

- [x] 2.5 Implement moving average calculation

  - Write calculateMovingAverage function with 30-day window
  - Handle cases where history is shorter than window size
  - _Requirements: 2.1_

- [ ]\* 2.6 Write property test for moving average

  - **Property 4: Moving average calculation**
  - **Validates: Requirements 2.1**

- [x] 2.7 Implement linear trend calculation

  - Write calculateLinearTrend function using least-squares regression
  - Return function that predicts value for any day index
  - _Requirements: 2.2_

- [ ]\* 2.8 Write property test for linear trend

  - **Property 5: Linear trend calculation**
  - **Validates: Requirements 2.2**

- [x] 2.9 Implement forecast generation

  - Write generateForecast function combining trend and moving average
  - Apply formula: 0.6 × trend + 0.4 × MA for each of 30 days
  - Generate date array starting from day after last historical date
  - _Requirements: 2.3, 2.4_

- [ ]\* 2.10 Write property test for forecast combination formula

  - **Property 6: Forecast combination formula**
  - **Validates: Requirements 2.3**

- [ ]\* 2.11 Write property test for forecast length and dates

  - **Property 7: Forecast length and dates**
  - **Validates: Requirements 2.4**

- [x] 2.12 Implement confidence score calculation

  - Write calculateConfidence function based on coefficient of variation
  - Return value between 0 and 1 (higher for consistent data)
  - _Requirements: 2.6_

- [x] 2.13 Implement predicted total summation

  - Sum all forecast values to get predictedTotalNext30
  - _Requirements: 2.5_

- [ ]\* 2.14 Write property test for predicted total summation

  - **Property 8: Predicted total summation**
  - **Validates: Requirements 2.5**

- [x] 2.15 Implement reorder quantity calculation

  - Write calculateReorderQuantity function with formula: max(0, predicted - stock + 0.2 × predicted)
  - Ensure non-negative results
  - _Requirements: 3.1, 3.2_

- [ ]\* 2.16 Write property test for reorder quantity formula

  - **Property 10: Reorder quantity formula**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 3. Implement main prediction orchestration

  - _Requirements: 1.4, 4.1, 4.2, 4.5_

- [x] 3.1 Implement computePrediction orchestration function

  - Fetch product details by ID
  - Call collectHistoricalData
  - Validate minimum 7 days of data
  - Call all calculation functions in sequence
  - Build complete prediction object
  - Upsert prediction to database (replace existing)
  - Return prediction with populated product reference
  - _Requirements: 1.4, 4.1, 4.2, 4.5_

- [ ]\* 3.2 Write property test for prediction object structure

  - **Property 11: Prediction object structure**
  - **Validates: Requirements 4.1, 4.3, 4.4**

- [ ]\* 3.3 Write property test for prediction upsert behavior

  - **Property 12: Prediction upsert behavior**
  - **Validates: Requirements 4.2**

- [ ]\* 3.4 Write unit tests for edge cases

  - Test insufficient data error (< 7 days)
  - Test product not found error
  - Test successful prediction flow
  - _Requirements: 1.4, 5.3_

- [x] 4. Implement prediction API endpoints

  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4_

- [x] 4.1 Create prediction controller with computePrediction endpoint

  - Implement POST /api/predictions/:productId handler
  - Validate productId parameter
  - Call predictionService.computePrediction
  - Handle errors and return appropriate status codes
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4.2 Create getPrediction endpoint

  - Implement GET /api/predictions/:productId handler
  - Query Prediction model by productId
  - Populate product reference with current stock
  - Return 404 if not found
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]\* 4.3 Write property test for product reference population

  - **Property 13: Product reference population**
  - **Validates: Requirements 4.5, 6.2, 6.4**

- [x] 4.4 Create computeAllPredictions endpoint

  - Implement POST /api/predictions/compute-all handler
  - Fetch all products where isDeleted = false
  - Iterate through products and compute predictions
  - Skip products with insufficient data without failing
  - Collect success and failure counts
  - Return summary object with counts
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ]\* 4.5 Write property test for deleted product exclusion

  - **Property 15: Deleted product exclusion**
  - **Validates: Requirements 7.2**

- [ ]\* 4.6 Write property test for batch error resilience

  - **Property 16: Batch error resilience**
  - **Validates: Requirements 7.3, 7.4**

- [x] 4.7 Create prediction routes file

  - Define routes with authMiddleware and checkAdmin
  - Mount POST /:productId, GET /:productId, POST /compute-all
  - Export router
  - _Requirements: 5.1, 6.1, 7.1_

- [ ]\* 4.8 Write property test for admin-only access

  - **Property 14: Admin-only access**
  - **Validates: Requirements 5.1, 6.1, 7.1**

- [ ]\* 4.9 Write unit tests for API endpoints

  - Test successful prediction computation
  - Test successful prediction retrieval
  - Test bulk computation with mixed results
  - Test error responses (404, 400, 403)
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3_

- [x] 5. Integrate prediction routes into server

  - _Requirements: 5.1, 6.1, 7.1_

- [x] 5.1 Update server/index.js to mount prediction routes

  - Import prediction router
  - Add app.use('/api/predictions', predictionRouter)
  - Ensure proper middleware order
  - _Requirements: 5.1, 6.1, 7.1_

- [x] 6. Implement CRON scheduler for automated predictions

  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 6.1 Create CRON scheduler file

  - Import node-cron and prediction service
  - Schedule task for '0 2 \* \* \*' (2:00 AM daily)
  - Call compute-all logic in scheduled task
  - Log start time, completion time, and results
  - Wrap in try-catch to prevent server crashes
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 6.2 Initialize CRON scheduler in server startup

  - Import scheduler in server/index.js
  - Call initialization function after server starts
  - Log scheduler status
  - _Requirements: 8.1_

- [x] 7. Implement dashboard alerts for high demand

  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 7.1 Add getHighDemandAlerts function to dashboard controller

  - Fetch all predictions from database
  - Populate product references with current stock
  - Filter predictions where predictedTotalNext30 > stock
  - Sort by (predicted - stock) descending
  - Return array of alert objects
  - _Requirements: 11.1, 11.2, 11.5_

- [ ]\* 7.2 Write property test for high demand alert filtering

  - **Property 25: High demand alert filtering**
  - **Validates: Requirements 11.2**

- [ ]\* 7.3 Write property test for alert sorting by urgency

  - **Property 27: Alert sorting by urgency**
  - **Validates: Requirements 11.5**

- [x] 7.4 Add route for alerts endpoint

  - Add GET /api/dashboard/alerts route
  - Protect with authMiddleware and checkAdmin
  - _Requirements: 11.1_

- [ ]\* 7.5 Write unit tests for alert functionality

  - Test alert filtering logic
  - Test alert sorting
  - Test empty state (no high demand)
  - _Requirements: 11.1, 11.2, 11.4, 11.5_

- [x] 8. Create frontend Demand Prediction page

  - _Requirements: 9.1, 9.2, 9.3, 9.7, 9.8_

- [x] 8.1 Create DemandPrediction page component

  - Set up component state (products, selectedProduct, prediction, loading, error)
  - Implement fetchProducts function to load product list on mount
  - Implement handlePredictDemand function to trigger prediction API
  - Implement fetchPrediction function to retrieve stored prediction
  - Add product dropdown with all products
  - Add "Predict Demand" button
  - Add loading spinner during API calls
  - Add error message display
  - Add empty state message when no prediction exists
  - _Requirements: 9.1, 9.2, 9.3, 9.7, 9.8_

- [ ]\* 8.2 Write property test for product list loading

  - **Property 17: Product list loading**
  - **Validates: Requirements 9.2**

- [ ]\* 8.3 Write property test for prediction API invocation

  - **Property 18: Prediction API invocation**
  - **Validates: Requirements 9.3**

- [ ]\* 8.4 Write unit tests for DemandPrediction page

  - Test page renders with product dropdown
  - Test "Predict Demand" button click triggers API
  - Test loading state displays spinner
  - Test error state displays message
  - Test empty state displays prompt
  - _Requirements: 9.1, 9.2, 9.3, 9.7, 9.8_

- [x] 9. Create prediction visualization components

  - _Requirements: 9.4, 9.5, 9.6, 12.1, 12.2, 12.4_

- [x] 9.1 Create PredictionCharts component

  - Accept history and forecast props
  - Render two Recharts LineChart components side-by-side
  - Configure historical chart with blue line, dates on x-axis, quantities on y-axis
  - Configure forecast chart with green line, future dates on x-axis, predicted on y-axis
  - Add tooltips, axis labels, and legends
  - Make charts responsive with ResponsiveContainer
  - _Requirements: 9.4, 9.5, 12.1, 12.2, 12.4_

- [ ]\* 9.2 Write property test for chart data rendering

  - **Property 19: Chart data rendering**
  - **Validates: Requirements 9.4, 9.5, 12.1, 12.2, 12.4**

- [x] 9.3 Create PredictionMetrics component

  - Accept predictedTotal, confidence, recommendedReorder, method, generatedAt props
  - Render grid of metric cards with icons
  - Display predicted 30-day demand (formatted number)
  - Display confidence as percentage
  - Display recommended reorder quantity
  - Display prediction method
  - Display generation timestamp (formatted date)
  - Style consistently with existing dashboard cards
  - _Requirements: 9.6_

- [ ]\* 9.4 Write property test for metrics display completeness

  - **Property 20: Metrics display completeness**
  - **Validates: Requirements 9.6**

- [ ]\* 9.5 Write unit tests for visualization components

  - Test PredictionCharts renders with data
  - Test PredictionMetrics displays all metrics
  - Test chart tooltips work
  - _Requirements: 9.4, 9.5, 9.6_

- [x] 9.6 Integrate charts and metrics into DemandPrediction page

  - Conditionally render PredictionCharts when prediction loaded
  - Conditionally render PredictionMetrics when prediction loaded
  - Pass correct props from prediction data
  - _Requirements: 9.4, 9.5, 9.6_

- [x] 10. Create dashboard alerts component

  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 10.1 Create DashboardAlerts component

  - Set up component state for alerts array
  - Implement fetchAlerts function to load predictions on mount
  - Filter predictions where predicted > stock
  - Sort alerts by urgency (demand - stock ratio)
  - Render alert cards with warning icon
  - Display product name, predicted demand, current stock, recommended reorder
  - Display empty state message when no alerts
  - Style consistently with existing dashboard
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]\* 10.2 Write property test for alert data fetching

  - **Property 24: Alert data fetching**
  - **Validates: Requirements 11.1**

- [ ]\* 10.3 Write property test for alert content completeness

  - **Property 26: Alert content completeness**
  - **Validates: Requirements 11.3**

- [ ]\* 10.4 Write unit tests for DashboardAlerts component

  - Test alerts fetch on mount
  - Test alerts display with correct data
  - Test empty state displays message
  - Test alerts sorted by urgency
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 10.5 Integrate DashboardAlerts into main dashboard page

  - Import DashboardAlerts component
  - Add to dashboard layout
  - Position appropriately with existing dashboard cards
  - _Requirements: 11.1_

- [x] 11. Update sidebar navigation

  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 11.1 Add Demand Prediction menu item to Sidebar

  - Import FaChartLine icon from react-icons/fa
  - Add new menu item to menuItems array (admin only)
  - Set name: "Demand Prediction"
  - Set path: "/admin-dashboard/demand-prediction"
  - Set icon: FaChartLine
  - Set isParent: false
  - Ensure not added to customerItems array
  - _Requirements: 10.1, 10.4_

- [ ]\* 11.2 Write property test for navigation functionality

  - **Property 21: Navigation functionality**
  - **Validates: Requirements 10.2**

- [ ]\* 11.3 Write property test for active menu highlighting

  - **Property 22: Active menu highlighting**
  - **Validates: Requirements 10.3**

- [ ]\* 11.4 Write property test for role-based menu visibility

  - **Property 23: Role-based menu visibility**
  - **Validates: Requirements 10.4**

- [ ]\* 11.5 Write unit tests for sidebar updates

  - Test "Demand Prediction" menu item appears for admin
  - Test menu item does not appear for customer
  - Test navigation to correct route
  - Test active state highlighting
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 12. Add frontend routing for Demand Prediction page

  - _Requirements: 9.1, 10.2_

- [x] 12.1 Update App.jsx to add Demand Prediction route

  - Import DemandPrediction component
  - Add route for /admin-dashboard/demand-prediction
  - Ensure route is protected (admin only)
  - _Requirements: 9.1, 10.2_

- [x] 13. Final integration and testing checkpoint

  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Create documentation

  - _Requirements: All_

- [x] 14.1 Create DEMAND_PREDICTION.md documentation file

  - Document how prediction algorithm works
  - Document API endpoints with request/response examples
  - Document CRON job setup and configuration
  - Document UI usage instructions
  - Document alert system functionality
  - Include troubleshooting section
  - _Requirements: All_
