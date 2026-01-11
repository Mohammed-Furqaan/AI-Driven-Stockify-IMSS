/**
 * Manual Test Script for Conversation-First Chatbot
 * Tests the new Gemini API integration and intent detection
 */

import {
  isInventoryIntent,
  recognizeIntent,
  callOpenAI,
  fuzzyProductSearch,
} from "./services/chatbotService.js";

console.log("🤖 Testing Conversation-First Chatbot\n");
console.log("=".repeat(60));

// Test 1: Casual Conversation Detection
console.log("\n📝 Test 1: Casual Conversation Detection");
console.log("-".repeat(60));

const casualMessages = [
  "hi bro",
  "tell me a joke",
  "how are you",
  "explain blockchain",
  "what is AI",
  "ಹೇಗಿದ್ದೀಯಾ?", // Kannada
  "كيف حالك؟", // Arabic
];

casualMessages.forEach((msg) => {
  const isInventory = isInventoryIntent(msg);
  const intent = recognizeIntent(msg);
  console.log(`Message: "${msg}"`);
  console.log(`  Is Inventory: ${isInventory}`);
  console.log(`  Intent: ${intent.intent}`);
  console.log();
});

// Test 2: Inventory Intent Detection
console.log("\n📦 Test 2: Inventory Intent Detection");
console.log("-".repeat(60));

const inventoryMessages = [
  "order 2 iphone",
  "show me laptops",
  "what's the price of samsung",
  "buy nike shoes",
  "stock of canon camera",
];

inventoryMessages.forEach((msg) => {
  const isInventory = isInventoryIntent(msg);
  const intent = recognizeIntent(msg);
  console.log(`Message: "${msg}"`);
  console.log(`  Is Inventory: ${isInventory}`);
  console.log(`  Intent: ${intent.intent}`);
  console.log();
});

// Test 3: Fuzzy Product Search
console.log("\n🔍 Test 3: Fuzzy Product Search");
console.log("-".repeat(60));

const mockProducts = [
  { name: "iPhone 13 Pro", price: 999, stock: 50 },
  { name: "Samsung Galaxy S21", price: 799, stock: 30 },
  { name: "Dell Laptop XPS 15", price: 1299, stock: 20 },
  { name: "Canon EOS Camera", price: 599, stock: 15 },
  { name: "Nike Air Max Shoes", price: 129, stock: 100 },
];

const searchQueries = [
  "iphone",
  "sam",
  "lap",
  "canon",
  "samsng", // typo
  "laptp", // typo
  "iphon", // typo
];

searchQueries.forEach((query) => {
  const matches = fuzzyProductSearch(mockProducts, query);
  console.log(`Query: "${query}"`);
  console.log(`  Matches: ${matches.length}`);
  matches.slice(0, 3).forEach((p) => {
    console.log(`    - ${p.name}`);
  });
  console.log();
});

// Test 4: OpenAI API Call (if available)
console.log("\n🌟 Test 4: OpenAI API Integration");
console.log("-".repeat(60));

const testOpenAI = async () => {
  try {
    console.log("Testing OpenAI API with casual message...");
    const result = await callOpenAI("hi bro, how are you?");
    console.log(`Response: ${result.text.substring(0, 100)}...`);
    console.log(`Error: ${result.error}`);
  } catch (error) {
    console.log(`Error calling OpenAI API: ${error.message}`);
  }
};

testOpenAI().then(() => {
  console.log("\n" + "=".repeat(60));
  console.log("✅ All tests completed!");
  console.log("=".repeat(60));
});
