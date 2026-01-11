# Database Seeding Guide

## Overview

This guide explains how to populate your Stockify IMS database with realistic sample data for testing and development.

## What Gets Created

The seed script (`seedDatabase.js`) creates:

### 📁 **10 Categories**

- Electronics
- Computers & Laptops
- Mobile Phones
- Office Supplies
- Furniture
- Networking
- Storage Devices
- Peripherals
- Software
- Cables & Adapters

### 🏢 **6 Suppliers**

- Tech Solutions Inc
- Global Electronics Ltd
- Office Depot Wholesale
- Computer World Distributors
- Mobile Tech Suppliers
- Furniture Express Co

### 📦 **30 Products**

Including:

- Laptops (Dell XPS, MacBook Pro, HP EliteBook)
- Mobile Phones (iPhone 15 Pro, Samsung Galaxy S24, Google Pixel 8)
- Office Furniture (Ergonomic chairs, standing desks)
- Peripherals (Keyboards, mice, monitors, webcams)
- Networking Equipment (Routers, switches)
- Storage Devices (SSDs, HDDs, USB drives)
- Office Supplies (Paper, staplers, markers)
- Cables & Adapters
- Software Licenses

### 🛒 **350+ Orders**

- Distributed over the last 90 days
- Realistic quantities based on product type
- Multiple customers
- Varied order patterns (more recent orders weighted higher)

### 👥 **Users**

- 1 Admin user
- 6 Customer users

## How to Run

### Method 1: Using npm script (Recommended)

```bash
cd server
npm run seed
```

### Method 2: Direct execution

```bash
cd server
node --env-file=.env seedDatabase.js
```

## Important Notes

⚠️ **WARNING**: This script will **DELETE ALL EXISTING DATA** in the following collections:

- Categories
- Suppliers
- Products
- Orders

Users are preserved (only created if they don't exist).

## Login Credentials

After seeding, you can log in with:

**Admin Account:**

- Email: `admin@stockify.com`
- Password: `password123`

**Customer Account:**

- Email: `customer@stockify.com`
- Password: `password123`

**Additional Customers:**

- `customer1@example.com` through `customer5@example.com`
- All use password: `password123`

## What to Do After Seeding

1. **Start the server:**

   ```bash
   npm start
   ```

2. **Login as admin** at `http://localhost:5173/login`

3. **Test Demand Prediction:**

   - Navigate to "Demand Prediction" in the sidebar
   - Select any product (all have sufficient order history)
   - Click "Predict Demand"
   - View charts and metrics

4. **Check Dashboard Alerts:**
   - Go to the main Dashboard
   - Scroll down to see "High Demand Alerts"
   - Products with predicted demand > current stock will appear

## Sample Data Characteristics

### Order Distribution

- **High-value items** (laptops, phones): 1-3 units per order
- **Medium-value items** (keyboards, routers): 1-5 units per order
- **Consumables** (paper, cables): 2-15 units per order

### Time Distribution

- Orders spread across 90 days
- More recent orders are weighted higher (realistic pattern)
- Random times throughout each day

### Product Stock Levels

- Varied from 15 to 500 units
- High-demand items have lower stock
- Consumables have higher stock

## Troubleshooting

### "Cannot connect to MongoDB"

- Ensure MongoDB is running
- Check your `.env` file has correct `MONGODB_URI`
- Verify network connectivity

### "User already exists" errors

- This is normal - the script preserves existing users
- Only creates users if they don't exist

### "Module not found" errors

- Run `npm install` to ensure all dependencies are installed
- Check that you're in the `server` directory

## Re-seeding

To re-seed the database (useful for testing):

1. Stop the server if running
2. Run the seed script again: `npm run seed`
3. All data will be cleared and recreated
4. Restart the server

## Customization

To modify the sample data:

1. Edit `seedDatabase.js`
2. Modify the arrays at the top:
   - `categories` - Add/remove categories
   - `suppliers` - Add/remove suppliers
   - `products` - Add/remove products
3. Adjust `targetOrders` variable to change order count
4. Run the seed script again

## Next Steps

After seeding:

1. ✅ Test all CRUD operations (Create, Read, Update, Delete)
2. ✅ Generate demand predictions for various products
3. ✅ Test the CRON job (or manually trigger bulk predictions)
4. ✅ Verify dashboard alerts appear correctly
5. ✅ Test with different user roles (admin vs customer)

## Support

If you encounter issues:

1. Check the console output for specific error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is accessible
4. Check that all dependencies are installed

---

**Happy Testing! 🚀**
