import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import CategoryModel from "./models/Category.js";
import SupplierModel from "./models/Supplier.js";
import ProductModel from "./models/Product.js";
import OrderModel from "./models/Order.js";
import User from "./models/User.js";

// Load environment variables
dotenv.config();

// Sample data
const categories = [
  {
    categoryName: "Electronics",
    categoryDescription: "Electronic devices and accessories",
  },
  {
    categoryName: "Computers & Laptops",
    categoryDescription: "Desktop computers, laptops, and accessories",
  },
  {
    categoryName: "Mobile Phones",
    categoryDescription: "Smartphones and mobile accessories",
  },
  {
    categoryName: "Office Supplies",
    categoryDescription: "Stationery and office equipment",
  },
  {
    categoryName: "Furniture",
    categoryDescription: "Office and home furniture",
  },
  {
    categoryName: "Networking",
    categoryDescription: "Routers, switches, and networking equipment",
  },
  {
    categoryName: "Storage Devices",
    categoryDescription: "Hard drives, SSDs, and storage solutions",
  },
  {
    categoryName: "Peripherals",
    categoryDescription: "Keyboards, mice, monitors, and other peripherals",
  },
  {
    categoryName: "Software",
    categoryDescription: "Operating systems and software licenses",
  },
  {
    categoryName: "Cables & Adapters",
    categoryDescription: "Various cables, adapters, and connectors",
  },
];

const suppliers = [
  {
    name: "Tech Solutions Inc",
    email: "contact@techsolutions.com",
    number: "+1-555-0101",
    address: "123 Tech Street, Silicon Valley, CA 94025",
  },
  {
    name: "Global Electronics Ltd",
    email: "sales@globalelectronics.com",
    number: "+1-555-0102",
    address: "456 Innovation Ave, Austin, TX 78701",
  },
  {
    name: "Office Depot Wholesale",
    email: "wholesale@officedepot.com",
    number: "+1-555-0103",
    address: "789 Business Blvd, New York, NY 10001",
  },
  {
    name: "Computer World Distributors",
    email: "orders@computerworld.com",
    number: "+1-555-0104",
    address: "321 Hardware Lane, Seattle, WA 98101",
  },
  {
    name: "Mobile Tech Suppliers",
    email: "info@mobiletechsuppliers.com",
    number: "+1-555-0105",
    address: "654 Phone Plaza, Los Angeles, CA 90001",
  },
  {
    name: "Furniture Express Co",
    email: "sales@furnitureexpress.com",
    number: "+1-555-0106",
    address: "987 Comfort Road, Chicago, IL 60601",
  },
];

const products = [
  // Electronics
  {
    name: "Dell XPS 15 Laptop",
    description: "15.6-inch laptop with Intel i7, 16GB RAM, 512GB SSD",
    price: 1299.99,
    stock: 25,
    category: "Computers & Laptops",
    supplier: "Computer World Distributors",
  },
  {
    name: "MacBook Pro 14-inch",
    description: "Apple M2 Pro chip, 16GB RAM, 512GB SSD",
    price: 1999.99,
    stock: 15,
    category: "Computers & Laptops",
    supplier: "Tech Solutions Inc",
  },
  {
    name: "HP EliteBook 840",
    description: "Business laptop with Intel i5, 8GB RAM, 256GB SSD",
    price: 899.99,
    stock: 30,
    category: "Computers & Laptops",
    supplier: "Computer World Distributors",
  },
  // Mobile Phones
  {
    name: "iPhone 15 Pro",
    description: "128GB, Titanium finish, A17 Pro chip",
    price: 999.99,
    stock: 40,
    category: "Mobile Phones",
    supplier: "Mobile Tech Suppliers",
  },
  {
    name: "Samsung Galaxy S24",
    description: "256GB, Snapdragon 8 Gen 3, 8GB RAM",
    price: 849.99,
    stock: 35,
    category: "Mobile Phones",
    supplier: "Mobile Tech Suppliers",
  },
  {
    name: "Google Pixel 8",
    description: "128GB, Google Tensor G3, 8GB RAM",
    price: 699.99,
    stock: 28,
    category: "Mobile Phones",
    supplier: "Global Electronics Ltd",
  },
  // Office Supplies
  {
    name: "Ergonomic Office Chair",
    description: "Adjustable lumbar support, mesh back, 360° swivel",
    price: 249.99,
    stock: 50,
    category: "Furniture",
    supplier: "Furniture Express Co",
  },
  {
    name: "Standing Desk",
    description: "Electric height adjustable, 60x30 inches",
    price: 449.99,
    stock: 20,
    category: "Furniture",
    supplier: "Furniture Express Co",
  },
  {
    name: "Wireless Mouse",
    description: "Logitech MX Master 3S, Bluetooth, USB-C charging",
    price: 99.99,
    stock: 100,
    category: "Peripherals",
    supplier: "Tech Solutions Inc",
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB backlit, Cherry MX switches, USB-C",
    price: 149.99,
    stock: 75,
    category: "Peripherals",
    supplier: "Tech Solutions Inc",
  },
  // Networking
  {
    name: "TP-Link WiFi 6 Router",
    description: "AX3000, Dual-band, 4 Gigabit ports",
    price: 129.99,
    stock: 45,
    category: "Networking",
    supplier: "Global Electronics Ltd",
  },
  {
    name: "Netgear 8-Port Switch",
    description: "Gigabit Ethernet, unmanaged, metal case",
    price: 79.99,
    stock: 60,
    category: "Networking",
    supplier: "Global Electronics Ltd",
  },
  // Storage
  {
    name: "Samsung 1TB SSD",
    description: "870 EVO, SATA III, 560MB/s read speed",
    price: 89.99,
    stock: 80,
    category: "Storage Devices",
    supplier: "Computer World Distributors",
  },
  {
    name: "WD 4TB External HDD",
    description: "USB 3.0, portable, backup software included",
    price: 119.99,
    stock: 55,
    category: "Storage Devices",
    supplier: "Computer World Distributors",
  },
  {
    name: "SanDisk 256GB USB Drive",
    description: "USB 3.1, compact design, keychain loop",
    price: 29.99,
    stock: 150,
    category: "Storage Devices",
    supplier: "Tech Solutions Inc",
  },
  // Monitors
  {
    name: "Dell 27-inch Monitor",
    description: "4K UHD, IPS panel, USB-C, height adjustable",
    price: 399.99,
    stock: 35,
    category: "Peripherals",
    supplier: "Computer World Distributors",
  },
  {
    name: "LG UltraWide 34-inch",
    description: "3440x1440, curved, HDR10, 144Hz",
    price: 549.99,
    stock: 22,
    category: "Peripherals",
    supplier: "Global Electronics Ltd",
  },
  // Office Supplies
  {
    name: "Printer Paper Ream",
    description: "500 sheets, A4, 80gsm, bright white",
    price: 8.99,
    stock: 200,
    category: "Office Supplies",
    supplier: "Office Depot Wholesale",
  },
  {
    name: "Stapler Heavy Duty",
    description: "Metal construction, 100 sheet capacity",
    price: 24.99,
    stock: 85,
    category: "Office Supplies",
    supplier: "Office Depot Wholesale",
  },
  {
    name: "Whiteboard Markers Set",
    description: "12 colors, dry-erase, fine tip",
    price: 15.99,
    stock: 120,
    category: "Office Supplies",
    supplier: "Office Depot Wholesale",
  },
  // Cables & Adapters
  {
    name: "USB-C to HDMI Cable",
    description: "6ft, 4K@60Hz, braided nylon",
    price: 19.99,
    stock: 110,
    category: "Cables & Adapters",
    supplier: "Tech Solutions Inc",
  },
  {
    name: "Ethernet Cable Cat6",
    description: "25ft, gigabit speed, snagless connectors",
    price: 12.99,
    stock: 140,
    category: "Cables & Adapters",
    supplier: "Global Electronics Ltd",
  },
  {
    name: "USB Hub 7-Port",
    description: "USB 3.0, powered, individual switches",
    price: 34.99,
    stock: 65,
    category: "Cables & Adapters",
    supplier: "Tech Solutions Inc",
  },
  // Software
  {
    name: "Microsoft Office 365",
    description: "1-year subscription, 5 devices, 1TB OneDrive",
    price: 99.99,
    stock: 500,
    category: "Software",
    supplier: "Tech Solutions Inc",
  },
  {
    name: "Adobe Creative Cloud",
    description: "Annual subscription, all apps included",
    price: 599.99,
    stock: 100,
    category: "Software",
    supplier: "Tech Solutions Inc",
  },
  // Additional Electronics
  {
    name: "Webcam 1080p",
    description: "Full HD, auto-focus, built-in microphone",
    price: 69.99,
    stock: 90,
    category: "Peripherals",
    supplier: "Global Electronics Ltd",
  },
  {
    name: "Wireless Headset",
    description: "Noise-cancelling, 30hr battery, USB-C",
    price: 179.99,
    stock: 48,
    category: "Electronics",
    supplier: "Mobile Tech Suppliers",
  },
  {
    name: "Portable Charger 20000mAh",
    description: "Fast charging, USB-C PD, LED display",
    price: 49.99,
    stock: 95,
    category: "Electronics",
    supplier: "Mobile Tech Suppliers",
  },
  {
    name: "Smart Plug 4-Pack",
    description: "WiFi enabled, voice control, energy monitoring",
    price: 39.99,
    stock: 75,
    category: "Electronics",
    supplier: "Global Electronics Ltd",
  },
  {
    name: "Desk Lamp LED",
    description: "Adjustable brightness, USB charging port, touch control",
    price: 44.99,
    stock: 62,
    category: "Office Supplies",
    supplier: "Furniture Express Co",
  },
];

// Helper function to generate random date within last N days
const randomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
};

// Helper function to generate realistic order quantities based on product type
const getRealisticQuantity = (productName) => {
  // High-value items: 1-3 units
  if (
    productName.includes("Laptop") ||
    productName.includes("MacBook") ||
    productName.includes("iPhone") ||
    productName.includes("Monitor")
  ) {
    return Math.floor(Math.random() * 3) + 1;
  }
  // Medium-value items: 1-5 units
  if (
    productName.includes("Keyboard") ||
    productName.includes("Mouse") ||
    productName.includes("Headset") ||
    productName.includes("Router")
  ) {
    return Math.floor(Math.random() * 5) + 1;
  }
  // Low-value consumables: 2-15 units
  if (
    productName.includes("Paper") ||
    productName.includes("Cable") ||
    productName.includes("USB") ||
    productName.includes("Markers")
  ) {
    return Math.floor(Math.random() * 14) + 2;
  }
  // Default: 1-8 units
  return Math.floor(Math.random() * 8) + 1;
};

const seedDatabase = async () => {
  try {
    console.log("🚀 Starting database seeding...\n");

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error(
        "MONGO_URI or MONGODB_URI environment variable is not defined"
      );
    }
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await CategoryModel.deleteMany({});
    await SupplierModel.deleteMany({});
    await ProductModel.deleteMany({});
    await OrderModel.deleteMany({});
    console.log("✅ Existing data cleared\n");

    // Create admin and customer users if they don't exist
    console.log("👥 Creating users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    let adminUser = await User.findOne({ email: "admin@stockify.com" });
    if (!adminUser) {
      adminUser = await User.create({
        name: "Admin User",
        email: "admin@stockify.com",
        password: hashedPassword,
        address: "123 Admin Street, City, State 12345",
        role: "admin",
      });
      console.log("✅ Admin user created: admin@stockify.com / password123");
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    let customerUser = await User.findOne({ email: "customer@stockify.com" });
    if (!customerUser) {
      customerUser = await User.create({
        name: "Customer User",
        email: "customer@stockify.com",
        password: hashedPassword,
        address: "456 Customer Ave, City, State 67890",
        role: "customer",
      });
      console.log(
        "✅ Customer user created: customer@stockify.com / password123\n"
      );
    } else {
      console.log("ℹ️  Customer user already exists\n");
    }

    // Create additional customer users for variety
    const additionalCustomers = [];
    for (let i = 1; i <= 5; i++) {
      const existingCustomer = await User.findOne({
        email: `customer${i}@example.com`,
      });
      if (!existingCustomer) {
        const customer = await User.create({
          name: `Customer ${i}`,
          email: `customer${i}@example.com`,
          password: hashedPassword,
          address: `${100 + i} Customer Street, City, State`,
          role: "customer",
        });
        additionalCustomers.push(customer);
      } else {
        additionalCustomers.push(existingCustomer);
      }
    }
    additionalCustomers.push(customerUser);
    console.log(`✅ ${additionalCustomers.length} customer users ready\n`);

    // Insert categories
    console.log("📁 Creating categories...");
    const createdCategories = await CategoryModel.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categories created\n`);

    // Insert suppliers
    console.log("🏢 Creating suppliers...");
    const createdSuppliers = await SupplierModel.insertMany(suppliers);
    console.log(`✅ ${createdSuppliers.length} suppliers created\n`);

    // Create category and supplier lookup maps
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.categoryName] = cat._id;
    });

    const supplierMap = {};
    createdSuppliers.forEach((sup) => {
      supplierMap[sup.name] = sup._id;
    });

    // Insert products
    console.log("📦 Creating products...");
    const productsToInsert = products.map((product) => ({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      isDeleted: false,
      categoryId: categoryMap[product.category],
      supplierId: supplierMap[product.supplier],
    }));

    const createdProducts = await ProductModel.insertMany(productsToInsert);
    console.log(`✅ ${createdProducts.length} products created\n`);

    // Generate orders (300-400 orders over last 90 days)
    console.log("🛒 Generating orders...");
    const ordersToCreate = [];
    const targetOrders = 350;

    // Distribute orders across products with realistic patterns
    for (let i = 0; i < targetOrders; i++) {
      // Select random product (weighted towards popular items)
      const productIndex = Math.floor(
        Math.pow(Math.random(), 1.5) * createdProducts.length
      );
      const product = createdProducts[productIndex];

      // Select random customer
      const customer =
        additionalCustomers[
          Math.floor(Math.random() * additionalCustomers.length)
        ];

      // Generate realistic quantity
      const quantity = getRealisticQuantity(product.name);

      // Generate date within last 90 days (more recent orders more likely)
      const daysAgo = Math.floor(Math.pow(Math.random(), 0.7) * 90);
      const orderDate = randomDate(daysAgo);

      ordersToCreate.push({
        customer: customer._id,
        product: product._id,
        quantity: quantity,
        totalPrice: product.price * quantity,
        orderDate: orderDate,
      });
    }

    // Sort orders by date
    ordersToCreate.sort((a, b) => a.orderDate - b.orderDate);

    // Insert orders
    await OrderModel.insertMany(ordersToCreate);
    console.log(`✅ ${ordersToCreate.length} orders created\n`);

    // Generate statistics
    console.log("📊 Database Statistics:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Categories:     ${createdCategories.length}`);
    console.log(`Suppliers:      ${createdSuppliers.length}`);
    console.log(`Products:       ${createdProducts.length}`);
    console.log(`Orders:         ${ordersToCreate.length}`);
    console.log(`Users:          ${additionalCustomers.length + 1} (1 admin)`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Show order distribution
    console.log("📈 Order Distribution by Product (Top 10):");
    const orderCounts = {};
    ordersToCreate.forEach((order) => {
      const productId = order.product.toString();
      orderCounts[productId] = (orderCounts[productId] || 0) + 1;
    });

    const sortedProducts = Object.entries(orderCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    sortedProducts.forEach(([productId, count]) => {
      const product = createdProducts.find(
        (p) => p._id.toString() === productId
      );
      console.log(`  ${product.name.padEnd(35)} ${count} orders`);
    });

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n🔐 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:    admin@stockify.com / password123");
    console.log("Customer: customer@stockify.com / password123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
