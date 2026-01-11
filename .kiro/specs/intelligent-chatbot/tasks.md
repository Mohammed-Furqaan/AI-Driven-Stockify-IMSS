# Implementation Plan

- [ ] 1. Update Gemini API integration for conversation-first approach

  - Update GEMINI_API_KEY to new value: AIzaSyDOlm0FAnvPd3Uq4sIypnPDw-CnuqLtnJg
  - Modify chatbot service to route all non-inventory messages to Gemini API by default
  - Implement conversation context management for Gemini API calls
  - Add system instructions to Gemini for natural, friendly conversation
  - Ensure Gemini handles multilingual conversation automatically
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ] 2. Implement inventory intent detection

  - [ ] 2.1 Create isInventoryIntent function

    - Check for inventory keywords: order, buy, purchase, stock, price, cost, inventory, product, available, demand, analytics
    - Check for product names in database using fuzzy matching
    - Return boolean indicating if message requires inventory mode
    - _Requirements: 6.1, 6.5_

  - [ ] 2.2 Update chatbot controller routing logic

    - Call isInventoryIntent first for all messages
    - Route to Gemini API if false (casual conversation)
    - Route to inventory handlers if true
    - Ensure stateless behavior - each message evaluated independently
    - _Requirements: 1.7, 6.2, 6.4_

  - [ ]\* 2.3 Write property test for casual conversation routing
    - **Property 1: Casual conversation routing**
    - **Property 2: Default casual mode**
    - **Validates: Requirements 1.1, 1.7, 6.2, 6.3**

- [ ] 3. Implement fuzzy product search

  - [ ] 3.1 Create fuzzy search function with multiple strategies

    - Implement substring matching (case-insensitive)
    - Implement Levenshtein distance for typo tolerance
    - Implement partial name matching ("iphone" matches "iPhone 13 Pro")
    - Implement multi-word matching
    - Return all matching products sorted by relevance
    - _Requirements: 2.2, 3.1, 3.2, 3.4_

  - [ ] 3.2 Update product search endpoints to use fuzzy matching

    - Replace exact name matching with fuzzy search
    - Ensure all product queries use fuzzy matching
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

  - [ ]\* 3.3 Write property test for fuzzy product matching
    - **Property 4: Fuzzy product matching with typos**
    - **Validates: Requirements 2.2, 3.1, 3.2, 3.4**

- [ ] 4. Update order processing with fuzzy search

  - [ ] 4.1 Modify createOrderFromChatbot to use fuzzy product search

    - Use fuzzy search instead of exact name matching
    - Handle multiple matches by selecting best match or asking for clarification
    - Maintain existing stock validation and order creation logic
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]\* 4.2 Write property test for entity extraction
    - **Property 3: Entity extraction for order intent**
    - **Validates: Requirements 2.1**

- [ ] 5. Remove confidence score system

  - [ ] 5.1 Remove confidence calculation from chatbot service

    - Delete calculateConfidence function
    - Remove confidence score from all response objects
    - Remove confidence threshold checks
    - _Requirements: 8.6_

  - [ ] 5.2 Update chatbot controller to not include confidence in responses

    - Remove confidence field from response metadata
    - Remove confidence-based clarification logic
    - _Requirements: 8.6_

  - [ ]\* 5.3 Write property test for no confidence indicators
    - **Property 25: No confidence indicators in UI**
    - **Validates: Requirements 8.6**

- [ ] 6. Update frontend to remove confidence indicators

  - [ ] 6.1 Remove confidence score display from StockBot component

    - Remove showConfidenceIndicator function
    - Remove confidence-related UI elements
    - Remove confidence from message metadata
    - _Requirements: 8.6_

  - [ ] 6.2 Simplify message rendering for natural conversation

    - Display Gemini responses naturally without technical indicators
    - Maintain structured formatting for inventory responses (orders, products)
    - _Requirements: 8.1, 8.2_

- [ ] 7. Enhance casual conversation handling

  - [ ] 7.1 Update Gemini API system instructions

    - Instruct Gemini to be friendly, natural, and conversational
    - Support humor, emotions, greetings, and explanations
    - Never provide repetitive or robotic responses
    - Handle any topic like ChatGPT or Gemini
    - _Requirements: 1.2, 1.5, 1.6_

  - [ ] 7.2 Implement conversation history for Gemini context

    - Pass recent conversation history to Gemini API
    - Maintain context across multiple messages
    - _Requirements: 8.4_

  - [ ]\* 7.3 Write property test for conversation history
    - **Property 24: Conversation history persistence**
    - **Validates: Requirements 8.4**

- [ ] 8. Update existing inventory features to work with new architecture

  - [ ] 8.1 Verify order creation with fuzzy search

    - Test order placement with typos and partial names
    - Ensure stock decrement works correctly
    - Ensure demand counter increments on orders
    - _Requirements: 2.3, 2.4, 5.2_

  - [ ] 8.2 Verify product queries with fuzzy search

    - Test product information queries with incomplete names
    - Ensure all required fields are returned
    - Ensure demand counter increments on queries
    - _Requirements: 3.3, 3.5, 5.1_

  - [ ] 8.3 Verify admin features still work

    - Test inventory overview
    - Test low stock queries
    - Test demand analytics
    - Test role-based access control
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]\* 8.4 Write property tests for inventory operations
    - **Property 5: Order creation preserves stock invariant**
    - **Property 6: Order confirmation completeness**
    - **Property 7: Alternative product suggestion relevance**
    - **Property 8: Product response completeness**
    - **Property 9: Multiple product match completeness**
    - **Validates: Requirements 2.3, 2.4, 2.5, 3.3, 3.5**

- [ ] 9. Implement property tests for admin and demand features

  - [ ]\* 9.1 Write property tests for admin features

    - **Property 10: Admin product list completeness**
    - **Property 11: Low stock filtering accuracy**
    - **Property 12: Inventory statistics calculation accuracy**
    - **Property 13: Best-selling products ranking**
    - **Property 14: Role-based access enforcement**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

  - [ ]\* 9.2 Write property tests for demand tracking

    - **Property 15: Demand counter increment on query**
    - **Property 16: Demand counter increment on order**
    - **Property 17: Demand query accuracy**
    - **Property 18: Top demanded products ranking**
    - **Property 19: Demand persistence**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

  - [ ]\* 9.3 Write property tests for mode switching and authentication
    - **Property 20: Inventory intent detection**
    - **Property 21: Stateless mode switching**
    - **Property 22: Authentication validation on all endpoints**
    - **Property 23: Structured data formatting consistency**
    - **Validates: Requirements 6.1, 6.4, 7.5, 8.2**

- [ ] 10. Test end-to-end conversation flows

  - Test casual conversation in multiple languages
  - Test seamless switching from casual to inventory mode
  - Test fuzzy product search with various typos and partial names
  - Test order placement with fuzzy matching
  - Test that casual conversation never triggers inventory responses
  - _Requirements: 1.1, 1.3, 1.7, 2.2, 3.1, 6.1, 6.2, 6.3_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
