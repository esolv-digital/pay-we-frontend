# E2E Test Suite Documentation

## Overview

This test suite follows **SOLID** and **DRY** principles to create maintainable, scalable E2E tests using Playwright.

## Architecture

### SOLID Principles Applied

#### 1. **Single Responsibility Principle (SRP)**
Each class has one reason to change:

- **`BasePage`**: Common page interactions
- **`PaymentPagePOM`**: Payment page-specific interactions
- **`FeeCalculator`**: Fee calculation logic
- **`PaymentPageFactory`**: Test data creation
- **`FeeScenarioFactory`**: Fee scenario generation

#### 2. **Open/Closed Principle (OCP)**
Classes are open for extension, closed for modification:

- **`BasePage`** can be extended by any page object without modifying it
- **Page Objects** inherit common functionality and add specific methods

#### 3. **Liskov Substitution Principle (LSP)**
Derived classes can substitute base classes:

- All page objects extending `BasePage` can be used wherever `BasePage` is expected
- All factories implement consistent interfaces

#### 4. **Interface Segregation Principle (ISP)**
Clients only depend on methods they use:

- **`PaymentPagePOM`** exposes only payment-page-specific methods
- **`FeeCalculator`** exposes only calculation methods

#### 5. **Dependency Inversion Principle (DIP)**
Depend on abstractions, not concretions:

- Page objects depend on Playwright's `Page` abstraction
- Tests depend on page object interfaces, not implementations

### DRY Principle Applied

#### Test Data Reuse
```typescript
// ❌ Before (Repetitive)
test('scenario 1', async () => {
  await page.fill('[name="title"]', 'Test Page');
  await page.fill('[name="amount"]', '100');
  // ...
});

test('scenario 2', async () => {
  await page.fill('[name="title"]', 'Test Page');
  await page.fill('[name="amount"]', '200');
  // ...
});

// ✅ After (DRY with Factories)
test('scenario 1', async () => {
  const pageData = PaymentPageFactory.createFixedVendorPays({ fixedAmount: 100 });
  await paymentPagePOM.createPaymentPage(pageData);
});

test('scenario 2', async () => {
  const pageData = PaymentPageFactory.createFixedVendorPays({ fixedAmount: 200 });
  await paymentPagePOM.createPaymentPage(pageData);
});
```

#### Calculation Logic Reuse
```typescript
// ❌ Before (Duplicated calculation logic)
test('vendor pays', async () => {
  const amount = 100;
  const fee = amount * 0.10;
  const vendorReceives = amount - fee;
  // assertions...
});

// ✅ After (DRY with FeeCalculator)
test('vendor pays', async () => {
  const expected = feeCalculator.calculateVendorPays(100);
  // assertions using expected.vendorReceives, expected.platformFee, etc.
});
```

#### Locator Reuse
```typescript
// ❌ Before (Repeated selectors)
await page.locator('input[name="title"]').fill('Test');
await page.locator('input[name="title"]').clear();

// ✅ After (Centralized in Page Objects)
class PaymentPagePOM {
  private readonly titleInput = page.locator('input[name="title"]');

  async fillTitle(title: string) {
    await this.titleInput.clear();
    await this.titleInput.fill(title);
  }
}
```

## Directory Structure

```
tests/
├── pages/                      # Page Object Models
│   ├── base.page.ts           # Base page with common functionality
│   ├── login.page.ts          # Login page object
│   ├── registration.page.ts   # Registration page object
│   ├── onboarding.page.ts     # Onboarding page object
│   └── payment-page.page.ts   # Payment page object
│
├── helpers/                    # Helper utilities
│   └── fee-calculator.ts      # Fee calculation logic
│
├── fixtures/                   # Test data and factories
│   ├── test-data.ts           # Common test data
│   └── payment-page-factory.ts # Payment page test data factory
│
├── vendor-registration.spec.ts # Registration tests
├── vendor-login.spec.ts       # Login tests
├── vendor-onboarding.spec.ts  # Onboarding tests
└── fee-calculation.spec.ts    # Fee calculation tests
```

## Page Object Pattern

### Base Page Object

All page objects extend `BasePage` which provides:

```typescript
abstract class BasePage {
  // Navigation
  async goto(path: string): Promise<void>
  async waitForPageLoad(): Promise<void>
  async waitForNavigation(urlPattern?: string | RegExp): Promise<void>

  // Interactions
  async fillInput(locator: Locator, value: string): Promise<void>
  async clickElement(locator: Locator): Promise<void>
  async selectOption(locator: Locator, value: string): Promise<void>

  // Assertions
  async isVisible(locator: Locator): Promise<boolean>
  async containsText(locator: Locator, text: string): Promise<boolean>
  async hasErrorMessage(): Promise<boolean>

  // Utilities
  async takeScreenshot(name: string): Promise<void>
  async verifyUrl(pattern: string | RegExp): Promise<void>
}
```

### Specific Page Objects

Specific page objects add domain-specific methods:

```typescript
class PaymentPagePOM extends BasePage {
  // Payment page specific methods
  async createPaymentPage(data: PaymentPageData): Promise<void>
  async fillFixedAmount(amount: number): Promise<void>
  async selectFeePaymentOption(includeFeesInAmount: boolean): Promise<void>
  async getFeeBreakdown(): Promise<FeeBreakdownDisplay>
}
```

## Test Data Factories

### Factory Pattern

Factories create test data with sensible defaults:

```typescript
// Simple usage
const pageData = PaymentPageFactory.createFixedVendorPays();

// With overrides
const pageData = PaymentPageFactory.createFixedVendorPays({
  fixedAmount: 250.00,
  currencyCode: 'GHS',
});

// Custom data
const pageData = PaymentPageFactory.create({
  title: 'Custom Page',
  amountType: 'flexible',
  minAmount: 10.00,
  maxAmount: 1000.00,
});
```

### Available Factories

1. **PaymentPageFactory**
   - `createFixedVendorPays()` - Fixed amount, vendor pays fees
   - `createFixedCustomerPays()` - Fixed amount, customer pays fees
   - `createFlexible()` - Flexible amount
   - `createDonation()` - Donation page
   - `create()` - Custom page

2. **FeeScenarioFactory**
   - `getCommonScenarios()` - 10 common fee scenarios
   - `getEdgeCaseScenarios()` - Edge case scenarios

## Fee Calculator Helper

### Usage

```typescript
import { createFeeCalculator } from './helpers/fee-calculator';

const feeCalculator = createFeeCalculator(10); // 10% fee

// Vendor pays fees
const result = feeCalculator.calculateVendorPays(100);
// {
//   vendorAmount: 100.00,
//   platformFee: 10.00,
//   customerPaysAmount: 100.00,
//   vendorReceives: 90.00
// }

// Customer pays fees
const result = feeCalculator.calculateCustomerPays(100);
// {
//   vendorAmount: 100.00,
//   platformFee: 10.00,
//   customerPaysAmount: 110.00,
//   vendorReceives: 100.00
// }

// Utility methods
feeCalculator.formatCurrency(100.50);  // "$100.50"
feeCalculator.parseCurrency("$100.50"); // 100.50
```

## Running Tests

```bash
# Run all tests
yarn test

# Run specific test file
yarn test tests/fee-calculation.spec.ts

# Run tests in UI mode
yarn test:ui

# Run tests in headed mode (see browser)
yarn test:headed

# Run tests for specific browser
yarn test:chromium
yarn test:firefox
yarn test:webkit

# Run tests with debugging
yarn test --debug
```

## Test Organization

### Fee Calculation Tests

Tests are organized into logical groups:

1. **Fee Breakdown Display**
   - Visibility conditions
   - Dynamic updates

2. **Vendor Pays Fees (Excluded Mode)**
   - Single amount tests
   - Multiple amount tests
   - Calculation accuracy

3. **Customer Pays Fees (Included Mode)**
   - Single amount tests
   - Multiple amount tests
   - Calculation accuracy

4. **Fee Mode Switching**
   - Vendor → Customer
   - Customer → Vendor

5. **Comprehensive Fee Scenarios**
   - 10 common scenarios (parameterized)

6. **Edge Cases**
   - Fractional amounts
   - Very small amounts
   - Large amounts

7. **Different Amount Types**
   - Flexible amounts
   - Donation pages

## Best Practices

### 1. Use Page Objects
```typescript
// ✅ Good
await paymentPagePOM.fillFixedAmount(100);

// ❌ Bad
await page.locator('input[name="fixed_amount"]').fill('100');
```

### 2. Use Factories for Test Data
```typescript
// ✅ Good
const pageData = PaymentPageFactory.createFixedVendorPays();

// ❌ Bad
const pageData = {
  title: 'Test Page',
  amountType: 'fixed',
  fixedAmount: 100,
  // ...
};
```

### 3. Use Helpers for Business Logic
```typescript
// ✅ Good
const expected = feeCalculator.calculateVendorPays(100);

// ❌ Bad
const fee = 100 * 0.10;
const vendorReceives = 100 - fee;
```

### 4. Descriptive Test Names
```typescript
// ✅ Good
test('should calculate correctly when vendor pays fees on $100 with 10% fee')

// ❌ Bad
test('test fee calculation')
```

### 5. Arrange-Act-Assert Pattern
```typescript
test('example', async () => {
  // Arrange
  const pageData = PaymentPageFactory.createFixedVendorPays();

  // Act
  await paymentPagePOM.createPaymentPage(pageData);
  const breakdown = await paymentPagePOM.getFeeBreakdown();

  // Assert
  expect(parseFloat(breakdown.platformFee)).toBe(10.00);
});
```

## Maintenance

### Adding New Tests

1. **New Page Object**
   ```typescript
   export class NewPagePOM extends BasePage {
     // Add page-specific locators and methods
   }
   ```

2. **New Test Data**
   ```typescript
   export class NewPageFactory {
     static create(): NewPageData {
       // Return test data with defaults
     }
   }
   ```

3. **New Helper**
   ```typescript
   export class NewHelper {
     // Add reusable business logic
   }
   ```

### Updating Existing Tests

When UI changes:
1. Update locators in Page Objects only
2. Tests remain unchanged (DRY benefit)

When business logic changes:
1. Update Helper classes
2. Tests remain unchanged

## Coverage

Current test coverage:

- ✅ Fee calculation (10+ scenarios)
- ✅ Vendor pays mode
- ✅ Customer pays mode
- ✅ Fee mode switching
- ✅ Edge cases (fractional, small, large amounts)
- ✅ Different amount types
- ✅ Registration flow
- ✅ Login flow
- ✅ Onboarding flow

## Future Enhancements

- [ ] Visual regression tests
- [ ] Performance tests
- [ ] API integration tests
- [ ] Mobile viewport tests
- [ ] Accessibility tests
- [ ] Error scenario tests

---

**Maintainers:** Follow SOLID and DRY principles when adding new tests.
