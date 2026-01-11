# Requirements Document

## Introduction

This document specifies the requirements for upgrading the existing chatbot in the MERN inventory and order management system to be a natural conversational AI assistant powered by Gemini API that seamlessly integrates inventory management capabilities. The chatbot prioritizes casual conversation as its primary behavior, functioning like ChatGPT or Gemini for general queries, while intelligently switching to inventory mode only when product-related intent is detected. The system supports multilingual conversation with automatic language detection and fuzzy product search for natural interaction.

## Glossary

- **Chatbot System**: The conversational AI component powered by Gemini API that handles both casual conversation and inventory operations
- **Casual Conversation Mode**: The default chatbot behavior where Gemini API handles general conversation, humor, explanations, and non-inventory queries
- **Inventory Mode**: The specialized mode activated only when product-related intent is detected (ordering, stock checking, product queries)
- **Intent Recognition**: The process of identifying whether user input requires inventory operations or casual conversation
- **Fuzzy Product Search**: Approximate string matching that handles typos, partial names, and synonyms to find products
- **Multilingual Support**: Automatic detection of user's language and response generation in the same language
- **Demand Counter**: A numeric field tracking how many times a product has been queried or ordered
- **Inventory Database**: The persistent storage containing product information including stock levels, prices, and metadata
- **Order Entity**: A database record representing a customer purchase transaction
- **Product Entity**: A database record representing an item available for sale
- **User Role**: The classification of a user as either customer or administrator, determining access permissions
- **Stock Availability**: The current quantity of a product available for purchase
- **Gemini API**: Google's generative AI API used for natural language understanding and response generation

## Requirements

### Requirement 1

**User Story:** As a user, I want to have natural casual conversations with the chatbot like ChatGPT or Gemini, so that I can get help with any topic, enjoy friendly interaction, and receive intelligent responses in any language.

#### Acceptance Criteria

1. WHEN a user sends a message that is not related to inventory operations, THE Chatbot System SHALL route the message to Gemini API for natural conversation handling
2. WHEN the Chatbot System receives casual conversation input, THE Chatbot System SHALL generate responses that understand humor, emotions, greetings, and general knowledge queries
3. WHEN a user sends a message in any language, THE Chatbot System SHALL automatically detect the language and respond in the same language
4. WHEN a user asks for explanations or information on any topic, THE Chatbot System SHALL provide clear, intelligent responses similar to ChatGPT or Gemini
5. WHEN the Chatbot System responds to casual conversation, THE Chatbot System SHALL never provide repetitive, robotic, or template-based replies
6. WHEN a user engages in friendly banter, jokes, or emotional conversation, THE Chatbot System SHALL respond naturally and appropriately
7. THE Chatbot System SHALL treat casual conversation as the default mode, only switching to inventory mode when product-related intent is clearly detected

### Requirement 2

**User Story:** As a customer, I want to place orders through natural language conversation with the chatbot, so that I can purchase products without navigating complex UI forms.

#### Acceptance Criteria

1. WHEN a customer sends a message containing order intent with product name and optional quantity, THE Chatbot System SHALL extract the product name, quantity, and user identifier from the message
2. WHEN the Chatbot System receives an order request, THE Chatbot System SHALL use fuzzy matching to find products even with typos, partial names, or casual references
3. WHEN a validated product has sufficient stock for the requested quantity, THE Chatbot System SHALL create an Order Entity and decrement the product stock
4. WHEN an order is successfully created, THE Chatbot System SHALL respond with order confirmation including order ID, product name, quantity, and total amount
5. WHEN a requested product has insufficient stock, THE Chatbot System SHALL respond with an out-of-stock message and suggest alternative products from the same category

### Requirement 3

**User Story:** As a customer, I want to ask the chatbot about product details using casual or incomplete names, so that I can find products naturally without knowing exact names.

#### Acceptance Criteria

1. WHEN a user queries product information with incomplete names like "iphone", "sam", or "lap", THE Chatbot System SHALL use fuzzy matching to find all related products
2. WHEN a user makes typos in product names like "samsng" or "laptp", THE Chatbot System SHALL use approximate string matching to identify intended products
3. WHEN a matching product is found, THE Chatbot System SHALL respond with product name, price, stock quantity, category, and description
4. WHEN no exact match is found, THE Chatbot System SHALL use substring search and lowercase comparison to find closest matches
5. WHEN multiple products match the fuzzy query, THE Chatbot System SHALL present all matching products with their details

### Requirement 4

**User Story:** As an administrator, I want to query inventory overview and statistics through the chatbot, so that I can monitor stock levels and product performance without accessing separate dashboards.

#### Acceptance Criteria

1. WHEN an administrator requests all products, THE Chatbot System SHALL retrieve and display the complete product list with names, prices, and stock quantities
2. WHEN an administrator requests low stock information, THE Chatbot System SHALL retrieve and display products where stock quantity falls below a defined threshold
3. WHEN an administrator requests inventory statistics, THE Chatbot System SHALL calculate and display total product count, total stock value, and category distribution
4. WHEN an administrator requests best-selling products, THE Chatbot System SHALL retrieve and display products ordered most frequently
5. WHEN a non-administrator user requests admin-only information, THE Chatbot System SHALL respond with an access-denied message

### Requirement 5

**User Story:** As a product manager, I want the system to track product demand based on customer interactions, so that I can identify trending products and optimize inventory planning.

#### Acceptance Criteria

1. WHEN a customer queries information about a Product Entity, THE Chatbot System SHALL increment the Demand Counter for that product by one
2. WHEN a customer places an order for a Product Entity, THE Chatbot System SHALL increment the Demand Counter for that product by the order quantity
3. WHEN an administrator requests demand information for a specific product, THE Chatbot System SHALL retrieve and display the product name and current Demand Counter value
4. WHEN an administrator requests overall demand analytics, THE Chatbot System SHALL retrieve and display the top five products ranked by Demand Counter value
5. WHEN demand data is updated, THE Chatbot System SHALL persist the new Demand Counter value to the Inventory Database immediately

### Requirement 6

**User Story:** As a user, I want the chatbot to seamlessly blend casual conversation with inventory operations, so that I can naturally transition between chatting and managing products without mode switching.

#### Acceptance Criteria

1. WHEN a user message contains product-related keywords like "order", "buy", "stock", "price", or product names, THE Chatbot System SHALL activate inventory mode
2. WHEN a user message does not contain inventory-related intent, THE Chatbot System SHALL remain in casual conversation mode using Gemini API
3. WHEN the Chatbot System is in casual conversation mode, THE Chatbot System SHALL never provide inventory-related responses or templates
4. WHEN the Chatbot System switches to inventory mode, THE Chatbot System SHALL process the request and return to casual mode for the next message
5. THE Chatbot System SHALL detect inventory intent with high accuracy to avoid false positives in casual conversation

### Requirement 7

**User Story:** As a developer, I want well-defined backend APIs for chatbot operations, so that the chatbot can reliably interact with the inventory and order management system.

#### Acceptance Criteria

1. THE Chatbot System SHALL expose an endpoint that accepts order requests and returns order confirmation or error messages
2. THE Chatbot System SHALL expose an endpoint that accepts product search queries and returns matching product information
3. THE Chatbot System SHALL expose an endpoint that returns inventory overview data for administrator users
4. THE Chatbot System SHALL expose an endpoint that returns demand analytics data for administrator users
5. WHEN any chatbot endpoint receives a request, THE Chatbot System SHALL validate user authentication and authorization before processing

### Requirement 8

**User Story:** As a user, I want a clean and responsive chatbot interface without confidence scores or technical indicators, so that I can interact naturally with the system on any device.

#### Acceptance Criteria

1. THE Chatbot System SHALL display messages in a conversation format with clear visual distinction between user and bot messages
2. WHEN the Chatbot System responds with structured data, THE Chatbot System SHALL format the information in an easily readable layout
3. WHEN the Chatbot System is processing a request, THE Chatbot System SHALL display a loading indicator to the user
4. THE Chatbot System SHALL maintain conversation history within the current session for context
5. THE Chatbot System SHALL render correctly on mobile, tablet, and desktop screen sizes
6. THE Chatbot System SHALL NOT display confidence scores, accuracy percentages, or any technical confidence indicators in the user interface
