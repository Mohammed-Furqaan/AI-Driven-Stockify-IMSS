# Demand Prediction Feature Documentation

## Overview

The Demand Prediction feature is an AI-driven forecasting system integrated into the Stockify Inventory Management System. It analyzes historical order data to predict future product demand over the next 30 days, enabling proactive inventory management and preventing stockouts.

## How Prediction Works

### Algorithm

The prediction system uses a hybrid statistical forecasting approach combining:

1. **30-Day Moving Average**: Calculates the average demand over the last 30 days (or all available days if fewer than 30)
2. **Linear Trend Analysis**: Uses least-squares regression to identify upward or downward trends in demand
3. **Weighted Combination**: Combines both methods using the formula:
   ```
   Forecast = 0.6 × Trend Value + 0.4 × Moving Average
   ```

### Data Requirements

- **Minimum Data**: At least 7 days of historical order data
- **Data Source**: Order collection in MongoDB
- **Aggregation**: Orders are grouped by product and date, with quantities summed per day
- **Gap Filling**: Missing dates are filled with zero quantity to maintain time-series continuity

### Confidence Score

The system calculates a confidence score (0 to 1) based on data variability:

- **High Confidence (0.7-1.0)**: Consistent historical patterns
- **Medium Confidence (0.5-0.7)**: Moderate variability
- **Low Confidence (0.3-0.5)**: High variability in demand

The confidence score uses the coefficient of variation (CV):

```
CV = Standard Deviation / Mean
Confidence = max(0.3, min(1.0, 1.0 - CV × 0.7))
```

### Reorder Recommendations

The system calculates recommended reorder quantities using:

```
Safety Stock = 20% of Predicted Total Demand
Recommended Reorder = max(0, Predicted Total - Current Stock + Safety Stock)
```

If current stock exceeds predicted demand plus safety stock, the reorder recommendation is zero.

## API Usage

### Authentication

All prediction endpoints require:

- Valid JWT token in Authorization header
- Admin role (customer users cannot access)

**Header Format**:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### 1. Compute Prediction for Single Product

**Endpoint**: `POST /api/predictions/:productId`

**Description**: Computes a new prediction for a specific product and stores it in the database.

**Request**:

```bash
curl -X POST http://localhost:3000/api/predictions/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "prediction": {
    "_id": "...",
    "productId": "507f1f77bcf86cd799439011",
    "productName": "Laptop",
    "history": [
      { "date": "2025-01-01T00:00:00.000Z", "quantity": 5 },
      { "date": "2025-01-02T00:00:00.000Z", "quantity": 3 }
    ],
    "forecast": [
      { "date": "2025-02-01T00:00:00.000Z", "predicted": 4.2 },
      { "date": "2025-02-02T00:00:00.000Z", "predicted": 4.5 }
    ],
    "predictedTotalNext30": 135.6,
    "confidence": 0.78,
    "recommendedReorder": 50,
    "method": "moving-average-trend",
    "generatedAt": "2025-01-31T10:30:00.000Z"
  }
}
```

**Error Responses**:

- `400 Bad Request`: Insufficient historical data (< 7 days)
- `404 Not Found`: Product does not exist
- `403 Forbidden`: User is not an admin

#### 2. Get Stored Prediction

**Endpoint**: `GET /api/predictions/:productId`

**Description**: Retrieves the most recent stored prediction for a product.

**Request**:

```bash
curl -X GET http://localhost:3000/api/predictions/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "prediction": {
    // Same structure as compute endpoint
  }
}
```

**Error Responses**:

- `404 Not Found`: No prediction exists for this product
- `403 Forbidden`: User is not an admin

#### 3. Compute Predictions for All Products

**Endpoint**: `POST /api/predictions/compute-all`

**Description**: Computes predictions for all non-deleted products in the system.

**Request**:

```bash
curl -X POST http://localhost:3000/api/predictions/compute-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "summary": {
    "totalProducts": 50,
    "successful": 45,
    "failed": 5,
    "errors": [
      {
        "productId": "...",
        "productName": "New Product",
        "error": "Insufficient historical data for prediction. Minimum 7 days required."
      }
    ]
  }
}
```

#### 4. Get High Demand Alerts

**Endpoint**: `GET /api/dashboard/alerts`

**Description**: Retrieves products where predicted demand exceeds current stock.

**Request**:

```bash
curl -X GET http://localhost:3000/api/dashboard/alerts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "alerts": [
    {
      "productId": "...",
      "productName": "Laptop",
      "predictedDemand": 150,
      "currentStock": 50,
      "recommendedReorder": 120,
      "urgency": 100
    }
  ]
}
```

## CRON Job

### Schedule

The system automatically computes predictions for all products daily at **2:00 AM** server time.

### Configuration

The CRON job is defined in `server/cron/predictionScheduler.js` and initialized when the server starts.

**CRON Expression**: `0 2 * * *`

- `0` - Minute (0)
- `2` - Hour (2 AM)
- `*` - Day of month (every day)
- `*` - Month (every month)
- `*` - Day of week (every day)

### Logs

The CRON job logs the following information:

- Start time
- End time
- Duration
- Total products processed
- Successful predictions
- Failed predictions
- Error details for failures

**Example Log Output**:

```
[CRON] Starting daily prediction computation at 2025-01-31T02:00:00.000Z
[CRON] Daily prediction computation completed at 2025-01-31T02:05:30.000Z
[CRON] Duration: 330 seconds
[CRON] Total products: 50
[CRON] Successful: 45
[CRON] Failed: 5
```

### Manual Trigger

To manually trigger the bulk computation without waiting for the scheduled time:

```bash
curl -X POST http://localhost:3000/api/predictions/compute-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Modifying Schedule

To change the CRON schedule, edit `server/cron/predictionScheduler.js`:

```javascript
// Current: Daily at 2:00 AM
cron.schedule("0 2 * * *", async () => { ... });

// Example: Every 6 hours
cron.schedule("0 */6 * * *", async () => { ... });

// Example: Weekly on Sunday at 3:00 AM
cron.schedule("0 3 * * 0", async () => { ... });
```

## UI Usage

### Accessing Demand Prediction

1. Log in as an **admin user**
2. Navigate to the sidebar menu
3. Click on **"Demand Prediction"** (chart icon)

### Generating a Prediction

1. Select a product from the dropdown menu
2. Click the **"Predict Demand"** button
3. Wait for the computation to complete (usually 1-3 seconds)
4. View the results:
   - **Historical Sales Chart**: Shows past order quantities by date
   - **30-Day Forecast Chart**: Shows predicted demand for next 30 days
   - **Metrics Cards**: Display key statistics

### Understanding Metrics

**Predicted Demand**

- Total quantity expected to be ordered in the next 30 days
- Used for inventory planning

**Confidence**

- Percentage indicating prediction reliability
- Higher confidence = more consistent historical patterns

**Reorder Qty**

- Recommended number of units to purchase
- Includes safety stock (20% buffer)
- Zero if current stock is sufficient

**Method**

- Algorithm used: "MA + Trend" (Moving Average + Trend)

**Generated**

- Timestamp when prediction was computed
- Predictions can be regenerated anytime

### Dashboard Alerts

The main admin dashboard displays **High Demand Alerts** for products where:

- Predicted demand > Current stock
- Action is needed to prevent stockouts

**Alert Information**:

- Product name
- Predicted demand (next 30 days)
- Current stock level
- Shortage amount
- Recommended reorder quantity

Alerts are sorted by urgency (highest shortage first).

## Alert System

### How Alerts Work

1. System fetches all stored predictions
2. Compares predicted demand vs current stock for each product
3. Filters products where `predictedTotalNext30 > currentStock`
4. Sorts by urgency: `(predictedDemand - currentStock)`
5. Displays on admin dashboard

### Alert Display

**High Demand Alert Card**:

- Orange background (warning color)
- Product name
- Predicted demand vs current stock comparison
- Shortage amount (urgency)
- Recommended reorder quantity
- "Action Needed" badge

**No Alerts State**:

- Green background (success color)
- Message: "All stock levels are adequate"

### Responding to Alerts

When an alert appears:

1. Review the predicted demand and current stock
2. Check the recommended reorder quantity
3. Consider lead time from suppliers
4. Place purchase orders accordingly
5. Monitor stock levels regularly

## Troubleshooting

### "Insufficient historical data" Error

**Problem**: Product has fewer than 7 days of order history

**Solutions**:

- Wait until product has at least 7 days of sales data
- Manually track demand for new products
- Use similar product predictions as reference

### "Product not found" Error

**Problem**: Product ID is invalid or product was deleted

**Solutions**:

- Verify product exists in the system
- Check that product is not marked as deleted
- Use correct product ID from the database

### Prediction Not Updating

**Problem**: Prediction shows old data

**Solutions**:

- Click "Predict Demand" button to regenerate
- Wait for next CRON job execution (2:00 AM)
- Manually trigger bulk computation via API

### Charts Not Displaying

**Problem**: Charts are blank or not rendering

**Solutions**:

- Ensure Recharts library is installed: `npm install recharts`
- Check browser console for JavaScript errors
- Verify prediction data is loaded correctly
- Refresh the page

### CRON Job Not Running

**Problem**: Predictions not updating automatically

**Solutions**:

- Check server logs for CRON initialization message
- Verify node-cron is installed: `npm install node-cron`
- Ensure server is running continuously (not restarting)
- Check server timezone matches expected schedule

### Access Denied (403 Error)

**Problem**: Cannot access prediction endpoints

**Solutions**:

- Verify user is logged in as admin
- Check JWT token is valid and not expired
- Ensure Authorization header is included in requests
- Verify user role is "admin" in database

## Technical Details

### Database Schema

**Prediction Collection**:

```javascript
{
  productId: ObjectId (unique, indexed),
  productName: String,
  history: [{ date: Date, quantity: Number }],
  forecast: [{ date: Date, predicted: Number }],
  predictedTotalNext30: Number,
  confidence: Number (0-1),
  recommendedReorder: Number,
  method: String,
  generatedAt: Date (indexed)
}
```

### File Structure

**Backend**:

```
server/
├── models/
│   └── Prediction.js
├── controllers/
│   ├── predictionController.js
│   └── dashboardController.js (modified)
├── services/
│   └── predictionService.js
├── routes/
│   ├── prediction.js
│   └── dashboard.js (modified)
├── middleware/
│   └── checkAdmin.js
├── cron/
│   └── predictionScheduler.js
└── index.js (modified)
```

**Frontend**:

```
frontend/src/
├── components/
│   ├── DemandPrediction.jsx
│   ├── PredictionCharts.jsx
│   ├── PredictionMetrics.jsx
│   ├── DashboardAlerts.jsx
│   ├── Sidebar.jsx (modified)
│   └── Summary.jsx (modified)
└── App.jsx (modified)
```

### Dependencies

**Backend**:

- `node-cron`: ^3.0.0 (CRON scheduling)
- `mongoose`: ^8.19.2 (MongoDB ODM)
- `express`: ^5.1.0 (Web framework)

**Frontend**:

- `recharts`: ^3.4.1 (Chart library)
- `axios`: ^1.12.2 (HTTP client)
- `lucide-react`: ^0.554.0 (Icons)

### Performance Considerations

**Computation Time**:

- Single product: 100-500ms
- Bulk computation (50 products): 5-30 seconds
- Depends on order history size

**Database Queries**:

- Order aggregation: Indexed on product and orderDate
- Prediction lookup: Indexed on productId
- Alert fetching: Populates product references

**Optimization Tips**:

- Limit historical data to last 90 days for large datasets
- Run bulk computations during low-traffic hours (2 AM)
- Cache predictions in frontend to reduce API calls
- Use pagination for alert lists if many products

## Future Enhancements

Potential improvements for future versions:

1. **Advanced Algorithms**:

   - Seasonal adjustment (SARIMA)
   - Exponential smoothing (Holt-Winters)
   - Machine learning models (LSTM, Prophet)

2. **Enhanced Analytics**:

   - Prediction accuracy tracking
   - Confidence intervals (upper/lower bounds)
   - Category-level demand aggregation
   - Supplier lead time integration

3. **User Experience**:

   - Bulk prediction generation from UI
   - Export predictions to CSV/Excel
   - Email notifications for high-demand alerts
   - Customizable alert thresholds
   - Historical prediction comparison

4. **Performance**:
   - Background job queue (Bull, Agenda)
   - Redis caching layer
   - Parallel processing for bulk computations
   - Incremental updates (only changed products)

## Support

For issues or questions:

1. Check this documentation
2. Review server logs for error messages
3. Verify all dependencies are installed
4. Ensure database connection is working
5. Test API endpoints with Postman/Thunder Client

## Version History

**v1.0.0** (January 2025)

- Initial release
- Moving average + linear trend algorithm
- CRON scheduling
- Admin panel UI
- Dashboard alerts
- API endpoints for prediction management
