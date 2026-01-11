# Requirements Document

## Introduction

The Demand Prediction feature enhances the Stockify Inventory Management System by providing AI-driven forecasting capabilities. This feature analyzes historical order data to predict future product demand over the next 30 days, enabling proactive inventory management. The system will automatically compute predictions daily, display forecasts through interactive visualizations, and provide actionable reorder recommendations to prevent stockouts and optimize inventory levels.

## Glossary

- **Demand Prediction System**: The subsystem responsible for analyzing historical order data and generating future demand forecasts
- **Prediction Model**: The mathematical algorithm that computes demand forecasts using moving averages and linear trend analysis
- **Historical Sales Data**: Time-series data of product quantities ordered, aggregated by date
- **Forecast Period**: The 30-day future timeframe for which demand predictions are generated
- **Confidence Score**: A numerical value between 0 and 1 indicating the reliability of the prediction
- **Reorder Quantity**: The recommended number of units to purchase based on predicted demand and current stock levels
- **Safety Stock**: A buffer quantity added to reorder calculations to account for demand variability
- **Admin Panel**: The administrative interface accessible only to users with admin role
- **CRON Job**: An automated scheduled task that runs at specified intervals
- **Prediction Record**: A database document storing forecast data, metadata, and recommendations for a specific product

## Requirements

### Requirement 1: Historical Data Collection and Processing

**User Story:** As an admin, I want the system to collect and process historical order data, so that predictions are based on accurate sales patterns.

#### Acceptance Criteria

1. WHEN the Demand Prediction System retrieves order data THEN the system SHALL aggregate quantities by product and date from the Order collection
2. WHEN multiple orders exist for the same product on the same date THEN the Demand Prediction System SHALL sum the quantities into a single daily total
3. WHEN dates have no orders for a product THEN the Demand Prediction System SHALL fill missing dates with zero quantity to maintain time-series continuity
4. WHEN historical data spans less than 7 days THEN the Demand Prediction System SHALL return an error indicating insufficient data for prediction
5. WHEN the Demand Prediction System processes order data THEN the system SHALL create a history array containing date and quantity pairs sorted chronologically

### Requirement 2: Demand Forecast Computation

**User Story:** As an admin, I want the system to compute accurate demand forecasts using statistical methods, so that I can anticipate future inventory needs.

#### Acceptance Criteria

1. WHEN computing a forecast THEN the Prediction Model SHALL calculate a 30-day moving average from the most recent historical data
2. WHEN computing a forecast THEN the Prediction Model SHALL calculate a linear trend using least-squares regression on historical quantities
3. WHEN generating daily predictions THEN the Prediction Model SHALL combine trend and moving average values using the formula: forecast = 0.6 × trendValue + 0.4 × movingAverage
4. WHEN the Prediction Model generates forecasts THEN the system SHALL produce exactly 30 daily predictions starting from the day after the last historical date
5. WHEN the Prediction Model completes computation THEN the system SHALL calculate total predicted demand by summing all 30 daily forecast values
6. WHEN historical data shows high variability THEN the Prediction Model SHALL generate a lower confidence score
7. WHEN historical data shows consistent patterns THEN the Prediction Model SHALL generate a higher confidence score between 0.7 and 1.0

### Requirement 3: Reorder Recommendation Generation

**User Story:** As an admin, I want the system to recommend reorder quantities, so that I can maintain optimal stock levels based on predicted demand.

#### Acceptance Criteria

1. WHEN the Prediction Model calculates reorder quantity THEN the system SHALL use the formula: recommendedReorder = predictedTotal - currentStock + safetyStock
2. WHEN current stock exceeds predicted demand plus safety stock THEN the Demand Prediction System SHALL set recommended reorder quantity to zero
3. WHEN calculating safety stock THEN the Prediction Model SHALL use 20% of the predicted total demand
4. WHEN the reorder calculation produces a negative value THEN the Demand Prediction System SHALL return zero as the recommended quantity
5. WHEN the Prediction Model generates a reorder recommendation THEN the system SHALL include the current stock level in the prediction record

### Requirement 4: Prediction Data Persistence

**User Story:** As an admin, I want predictions to be stored in the database, so that I can access historical forecasts and track prediction accuracy over time.

#### Acceptance Criteria

1. WHEN a prediction is computed THEN the Demand Prediction System SHALL store the prediction in a Prediction collection with productId, productName, history, forecast, predictedTotalNext30, confidence, recommendedReorder, method, and generatedAt fields
2. WHEN storing a new prediction for a product THEN the Demand Prediction System SHALL replace any existing prediction for that product with the new data
3. WHEN a prediction is stored THEN the system SHALL record the timestamp of generation in the generatedAt field
4. WHEN a prediction is stored THEN the system SHALL record the method used as "moving-average-trend"
5. WHEN retrieving a stored prediction THEN the Demand Prediction System SHALL populate the product reference with name and current stock data

### Requirement 5: On-Demand Prediction API

**User Story:** As an admin, I want to trigger demand predictions for specific products through an API, so that I can get updated forecasts whenever needed.

#### Acceptance Criteria

1. WHEN an admin sends a POST request to /api/predictions/:productId THEN the Demand Prediction System SHALL verify the user has admin role before processing
2. WHEN an admin requests prediction for a valid product THEN the Demand Prediction System SHALL compute the forecast and return prediction data including history, forecast array, confidence, and reorder recommendation
3. WHEN an admin requests prediction for a non-existent product THEN the Demand Prediction System SHALL return a 404 error with message "Product not found"
4. WHEN an admin requests prediction for a product with insufficient data THEN the Demand Prediction System SHALL return a 400 error with message "Insufficient historical data"
5. WHEN the prediction computation succeeds THEN the Demand Prediction System SHALL return a 200 status with the complete prediction object

### Requirement 6: Prediction Retrieval API

**User Story:** As an admin, I want to retrieve stored predictions through an API, so that I can display forecast data in the admin panel without recomputing.

#### Acceptance Criteria

1. WHEN an admin sends a GET request to /api/predictions/:productId THEN the Demand Prediction System SHALL verify the user has admin role before processing
2. WHEN a stored prediction exists for the requested product THEN the Demand Prediction System SHALL return the prediction with all fields populated
3. WHEN no prediction exists for the requested product THEN the Demand Prediction System SHALL return a 404 error with message "No prediction found for this product"
4. WHEN retrieving a prediction THEN the Demand Prediction System SHALL include the current stock level from the Product collection
5. WHEN the prediction retrieval succeeds THEN the Demand Prediction System SHALL return a 200 status with the prediction object

### Requirement 7: Bulk Prediction Computation API

**User Story:** As an admin, I want to compute predictions for all products at once, so that I can ensure all inventory items have up-to-date forecasts.

#### Acceptance Criteria

1. WHEN an admin sends a POST request to /api/predictions/compute-all THEN the Demand Prediction System SHALL verify the user has admin role before processing
2. WHEN computing predictions for all products THEN the Demand Prediction System SHALL retrieve all non-deleted products from the Product collection
3. WHEN processing each product THEN the Demand Prediction System SHALL skip products with insufficient historical data without failing the entire operation
4. WHEN all products are processed THEN the Demand Prediction System SHALL return a summary containing total products processed, successful predictions, and failed predictions
5. WHEN the bulk computation completes THEN the Demand Prediction System SHALL return a 200 status with the summary object

### Requirement 8: Automated Daily Prediction Scheduling

**User Story:** As a system administrator, I want predictions to be computed automatically every day, so that forecasts remain current without manual intervention.

#### Acceptance Criteria

1. WHEN the server starts THEN the CRON Job SHALL initialize a scheduled task to run daily at 2:00 AM server time
2. WHEN the scheduled time arrives THEN the CRON Job SHALL trigger the bulk prediction computation for all products
3. WHEN the CRON Job executes THEN the system SHALL log the start time, completion time, and summary of results
4. WHEN the CRON Job encounters errors THEN the system SHALL log the error details without crashing the server
5. WHEN the CRON Job completes successfully THEN the system SHALL update all prediction records in the database

### Requirement 9: Admin Panel Prediction Interface

**User Story:** As an admin, I want a dedicated page in the admin panel to view demand predictions, so that I can analyze forecasts and make informed inventory decisions.

#### Acceptance Criteria

1. WHEN an admin navigates to /admin-dashboard/demand-prediction THEN the Admin Panel SHALL display the Demand Prediction page with product selection interface
2. WHEN the Demand Prediction page loads THEN the Admin Panel SHALL fetch and display a dropdown list of all available products
3. WHEN an admin selects a product and clicks "Predict Demand" THEN the Admin Panel SHALL send a request to compute or retrieve the prediction for that product
4. WHEN a prediction is loaded THEN the Admin Panel SHALL display a historical sales chart showing past order quantities by date
5. WHEN a prediction is loaded THEN the Admin Panel SHALL display a forecast chart showing predicted quantities for the next 30 days
6. WHEN a prediction is loaded THEN the Admin Panel SHALL display metrics including predicted 30-day demand, confidence percentage, recommended reorder quantity, prediction method, and generation timestamp
7. WHEN no prediction exists for a product THEN the Admin Panel SHALL display a message prompting the admin to generate a prediction
8. WHEN the prediction request fails THEN the Admin Panel SHALL display an error message with the failure reason

### Requirement 10: Admin Panel Navigation Integration

**User Story:** As an admin, I want the Demand Prediction feature accessible from the sidebar menu, so that I can easily navigate to the forecasting interface.

#### Acceptance Criteria

1. WHEN an admin views the sidebar THEN the Admin Panel SHALL display a "Demand Prediction" menu item with an appropriate icon
2. WHEN an admin clicks the "Demand Prediction" menu item THEN the Admin Panel SHALL navigate to /admin-dashboard/demand-prediction
3. WHEN the admin is on the Demand Prediction page THEN the Admin Panel SHALL highlight the "Demand Prediction" menu item as active
4. WHEN a user with customer role views the sidebar THEN the Admin Panel SHALL NOT display the "Demand Prediction" menu item

### Requirement 11: Dashboard Alert System

**User Story:** As an admin, I want to see alerts on the main dashboard for products with high predicted demand, so that I can quickly identify items requiring immediate attention.

#### Acceptance Criteria

1. WHEN the admin dashboard loads THEN the Admin Panel SHALL retrieve all stored predictions from the database
2. WHEN a prediction exists where predicted demand exceeds current stock THEN the Admin Panel SHALL display a high demand alert for that product
3. WHEN displaying an alert THEN the Admin Panel SHALL show the product name, predicted demand quantity, current stock quantity, and recommended reorder quantity
4. WHEN no high demand situations exist THEN the Admin Panel SHALL display a message indicating all stock levels are adequate
5. WHEN multiple products have high demand THEN the Admin Panel SHALL display alerts sorted by urgency (highest demand-to-stock ratio first)

### Requirement 12: Chart Visualization

**User Story:** As an admin, I want to see visual charts of historical and predicted data, so that I can quickly understand demand patterns and trends.

#### Acceptance Criteria

1. WHEN displaying the historical sales chart THEN the Admin Panel SHALL render a line chart with dates on the x-axis and quantities on the y-axis
2. WHEN displaying the forecast chart THEN the Admin Panel SHALL render a line chart with future dates on the x-axis and predicted quantities on the y-axis
3. WHEN rendering charts THEN the Admin Panel SHALL use distinct colors to differentiate historical data from forecast data
4. WHEN charts are displayed THEN the Admin Panel SHALL include axis labels, legends, and tooltips for data point values
5. WHEN the viewport is resized THEN the Admin Panel SHALL maintain chart responsiveness and readability
