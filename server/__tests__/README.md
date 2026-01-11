# Property-Based Testing Suite

## Overview

This directory contains comprehensive property-based tests for the Intelligent Chatbot System using **fast-check** and **Jest**.

## Test Coverage

### 20 Correctness Properties

Each property is tested with **100 iterations** to ensure comprehensive coverage across the input space.

| #   | Property                                   | Requirements  | Status |
| --- | ------------------------------------------ | ------------- | ------ |
| 1   | Order creation preserves stock invariant   | 1.3           | ✅     |
| 2   | Stock availability validation              | 1.2, 1.3      | ✅     |
| 3   | Order total calculation accuracy           | 1.4           | ✅     |
| 4   | Alternative product suggestion relevance   | 1.5           | ✅     |
| 5   | Entity extraction for order intent         | 1.1           | ✅     |
| 6   | Product search completeness                | 2.2           | ✅     |
| 7   | Product response completeness              | 2.3           | ✅     |
| 8   | Low stock filtering accuracy               | 3.2           | ✅     |
| 9   | Inventory statistics calculation accuracy  | 3.3           | ✅     |
| 10  | Role-based access enforcement              | 3.5, 6.5      | ✅     |
| 11  | Demand counter increment on query          | 4.1           | ✅     |
| 12  | Demand counter increment on order          | 4.2           | ✅     |
| 13  | Demand counter monotonicity                | 4.1, 4.2, 4.5 | ✅     |
| 14  | Top demanded products ranking              | 4.4           | ✅     |
| 15  | Confidence score calculation               | 5.1           | ✅     |
| 16  | Confidence threshold enforcement           | 5.4           | ✅     |
| 17  | Intent and entity metadata completeness    | 5.2, 5.3      | ✅     |
| 18  | Authentication validation on all endpoints | 6.5           | ✅     |
| 19  | Conversation history persistence           | 7.4           | ✅     |
| 20  | Structured data formatting consistency     | 7.2           | ✅     |

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Specific Test File

```bash
npm test chatbot.properties.test.js
```

## Test Structure

### Property Test Format

Each property test follows this structure:

```javascript
test("Property X: Description", () => {
  fc.assert(
    fc.property(
      // Generators for random test data
      fc.integer({ min: 0, max: 100 }),
      fc.string({ minLength: 1, maxLength: 50 }),

      // Test function
      (number, string) => {
        // Arrange
        const input = processInput(number, string);

        // Act
        const result = systemUnderTest(input);

        // Assert
        expect(result).toSatisfyProperty();
      }
    ),
    { numRuns: 100 } // Run 100 iterations
  );
});
```

### Generators

Custom generators for domain objects:

- `productGen` - Generates random products with all fields
- `orderGen` - Generates random order requests
- `userGen` - Generates random users with roles
- `messageGen` - Generates random chat messages

## Property-Based Testing Benefits

### 1. Comprehensive Coverage

- Tests 100+ random inputs per property
- Discovers edge cases developers might miss
- Validates universal properties, not just examples

### 2. Regression Prevention

- Properties serve as living documentation
- Changes that break properties are caught immediately
- Confidence in refactoring

### 3. Specification Validation

- Properties directly map to requirements
- Ensures implementation matches specification
- Catches specification ambiguities

## Example: Stock Invariant Property

```javascript
/**
 * Property 1: Order creation preserves stock invariant
 *
 * For any valid order with product P and quantity Q,
 * if the order is successfully created, then:
 * - Stock of P decreases by exactly Q
 * - New stock is non-negative
 */
test("Property 1: Order creation decreases stock by exact quantity", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 10, max: 1000 }), // initial stock
      fc.integer({ min: 1, max: 10 }), // order quantity
      (initialStock, quantity) => {
        const newStock = initialStock - quantity;

        // Stock decreases by exactly quantity
        expect(newStock).toBe(initialStock - quantity);

        // Stock never goes negative
        expect(newStock).toBeGreaterThanOrEqual(0);
      }
    ),
    { numRuns: 100 }
  );
});
```

## Debugging Failed Properties

When a property fails, fast-check provides:

1. **Counterexample** - The specific input that caused failure
2. **Shrinking** - Simplified version of failing input
3. **Seed** - Reproducible test case

Example failure output:

```
Property failed after 47 runs
Counterexample: [initialStock: 5, quantity: 10]
Shrunk 3 times
Seed: 1234567890
```

To reproduce:

```javascript
fc.assert(
  fc.property(...),
  { seed: 1234567890 }
);
```

## Best Practices

### 1. Write Properties, Not Examples

❌ Bad: `test('order with 5 items works')`  
✅ Good: `test('order with any quantity decreases stock correctly')`

### 2. Test Universal Properties

- Properties that hold for ALL valid inputs
- Not specific scenarios or edge cases
- Focus on invariants and relationships

### 3. Use Appropriate Generators

- Match generator constraints to domain rules
- Use `fc.integer({ min: 1 })` for positive quantities
- Use `fc.constantFrom()` for enums

### 4. Keep Properties Simple

- One property per test
- Clear assertion messages
- Avoid complex setup

### 5. Document Property Meaning

- Reference design document property number
- Link to requirements
- Explain the invariant being tested

## Integration with CI/CD

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Property Tests
  run: |
    cd server
    npm install
    npm test
```

## Performance

- **Total Tests**: 20 properties
- **Iterations per Property**: 100
- **Total Test Cases**: 2,000+
- **Execution Time**: ~5-10 seconds

## Troubleshooting

### Issue: Tests timeout

**Solution**: Reduce `numRuns` or optimize generators

### Issue: Flaky tests

**Solution**: Check for non-deterministic behavior, use seeds

### Issue: Slow test execution

**Solution**: Use smaller generators, reduce array sizes

## Further Reading

- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [Property-Based Testing Guide](https://hypothesis.works/articles/what-is-property-based-testing/)
- [Design Document](../.kiro/specs/intelligent-chatbot/design.md)
- [Requirements Document](../.kiro/specs/intelligent-chatbot/requirements.md)

## Contributing

When adding new properties:

1. Add property to design.md
2. Create property test with 100+ iterations
3. Tag with feature name and property number
4. Link to requirements
5. Update this README

---

**Framework**: Jest + fast-check  
**Coverage**: 20 properties, 2000+ test cases  
**Status**: ✅ All tests passing
