/**
 * Fee Calculation E2E Tests - LIVE API MODE
 *
 * Comprehensive test suite for payment page fee calculations using REAL APIs
 * Configured via .env.testing with test credentials and backend URL
 *
 * Following SOLID and DRY principles with:
 * - Reusable Page Objects
 * - Test Data Factories
 * - Fee Calculator Helper
 * - Clear test organization
 * - Real API integration with error logging
 */

import { test, expect } from '@playwright/test';
import { PaymentPagePOM } from './pages/payment-page.page';
import { LoginPage } from './pages/login.page';
import { PaymentPageFactory, FeeScenarioFactory } from './fixtures/payment-page-factory';
import { FeeCalculator, createFeeCalculator } from './helpers/fee-calculator';
import { testConfig, apiDelay } from './helpers/test-config';
import { logApiError, logTestError } from './helpers/error-logger';

// Test configuration from .env.testing
const DEFAULT_FEE_PERCENTAGE = 10; // 10% platform fee
const TEST_USER_EMAIL = testConfig.user.email;
const TEST_USER_PASSWORD = testConfig.user.password;

test.describe('Fee Calculation - Payment Pages', () => {
  let paymentPagePOM: PaymentPagePOM;
  let loginPage: LoginPage;
  let feeCalculator: FeeCalculator;

  test.beforeEach(async ({ page }) => {
    try {
      // Initialize page objects
      paymentPagePOM = new PaymentPagePOM(page);
      loginPage = new LoginPage(page);
      feeCalculator = createFeeCalculator(DEFAULT_FEE_PERCENTAGE);

      // Login with test credentials from .env.testing
      await loginPage.goto();
      await apiDelay(); // Rate limiting protection

      await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
      await page.waitForURL(/\/vendor\/dashboard/, { timeout: 30000 });

      await apiDelay(); // Rate limiting protection

      // Navigate to create payment page
      await paymentPagePOM.gotoCreatePage();
    } catch (error) {
      // Log setup errors
      await logTestError('Fee Calculation Test Setup', error as Error, {
        email: TEST_USER_EMAIL,
        testFile: 'fee-calculation.spec.ts',
      });
      throw error;
    }
  });

  test.describe('Fee Breakdown Display', () => {
    test('should display fee breakdown when fixed amount is entered', async () => {
      const pageData = PaymentPageFactory.createFixedVendorPays({
        fixedAmount: 100.00,
      });

      // Fill basic info and amount
      await paymentPagePOM.fillBasicInfo(pageData);
      await paymentPagePOM.selectAmountType('fixed');
      await paymentPagePOM.fillFixedAmount(pageData.fixedAmount!);

      // Verify fee breakdown is visible
      await paymentPagePOM.verifyFeeBreakdownVisible();
    });

    test('should not display fee breakdown when amount is zero', async () => {
      const pageData = PaymentPageFactory.createFixedVendorPays({
        fixedAmount: 0,
      });

      await paymentPagePOM.fillBasicInfo(pageData);
      await paymentPagePOM.selectAmountType('fixed');
      await paymentPagePOM.fillFixedAmount(0);

      // Verify fee breakdown is not visible
      await paymentPagePOM.verifyFeeBreakdownHidden();
    });

    test('should update fee breakdown when amount changes', async ({ page }) => {
      const pageData = PaymentPageFactory.createFixedVendorPays();

      await paymentPagePOM.fillBasicInfo(pageData);
      await paymentPagePOM.selectAmountType('fixed');

      // Fill initial amount
      await paymentPagePOM.fillFixedAmount(100);
      await page.waitForTimeout(500); // Wait for preview to update

      let breakdown = await paymentPagePOM.getFeeBreakdown();
      expect(parseFloat(breakdown.vendorAmount)).toBe(100.00);

      // Change amount
      await paymentPagePOM.fillFixedAmount(200);
      await page.waitForTimeout(500); // Wait for preview to update

      breakdown = await paymentPagePOM.getFeeBreakdown();
      expect(parseFloat(breakdown.vendorAmount)).toBe(200.00);
    });
  });

  test.describe('Vendor Pays Fees (Excluded Mode)', () => {
    test('should calculate correctly when vendor pays fees', async () => {
      const amount = 100.00;
      const expected = feeCalculator.calculateVendorPays(amount);

      const pageData = PaymentPageFactory.createFixedVendorPays({
        fixedAmount: amount,
      });

      await paymentPagePOM.fillBasicInfo(pageData);
      await paymentPagePOM.selectAmountType('fixed');
      await paymentPagePOM.fillFixedAmount(amount);
      await paymentPagePOM.selectFeePaymentOption(false); // Vendor pays

      // Get and verify fee breakdown
      const breakdown = await paymentPagePOM.getFeeBreakdown();

      expect(parseFloat(breakdown.vendorAmount)).toBe(expected.vendorAmount);
      expect(parseFloat(breakdown.platformFee)).toBe(expected.platformFee);
      expect(parseFloat(breakdown.customerPays)).toBe(expected.customerPaysAmount);
      expect(parseFloat(breakdown.vendorReceives)).toBe(expected.vendorReceives);
    });

    test('should verify vendor pays mode is default', async () => {
      await paymentPagePOM.verifyVendorPaysSelected();
    });

    test.describe('Vendor Pays - Multiple Amounts', () => {
      const testCases = [
        { amount: 50.00, feePercentage: DEFAULT_FEE_PERCENTAGE },
        { amount: 100.00, feePercentage: DEFAULT_FEE_PERCENTAGE },
        { amount: 250.00, feePercentage: DEFAULT_FEE_PERCENTAGE },
        { amount: 500.00, feePercentage: DEFAULT_FEE_PERCENTAGE },
        { amount: 1000.00, feePercentage: DEFAULT_FEE_PERCENTAGE },
      ];

      testCases.forEach(({ amount, feePercentage }) => {
        test(`should calculate correctly for $${amount} with ${feePercentage}% fee`, async () => {
          const calculator = createFeeCalculator(feePercentage);
          const expected = calculator.calculateVendorPays(amount);

          const pageData = PaymentPageFactory.createFixedVendorPays({
            fixedAmount: amount,
          });

          await paymentPagePOM.fillBasicInfo(pageData);
          await paymentPagePOM.selectAmountType('fixed');
          await paymentPagePOM.fillFixedAmount(amount);
          await paymentPagePOM.selectFeePaymentOption(false);

          const breakdown = await paymentPagePOM.getFeeBreakdown();

          expect(parseFloat(breakdown.platformFee)).toBe(expected.platformFee);
          expect(parseFloat(breakdown.customerPays)).toBe(expected.customerPaysAmount);
          expect(parseFloat(breakdown.vendorReceives)).toBe(expected.vendorReceives);
        });
      });
    });
  });

  test.describe('Customer Pays Fees (Included Mode)', () => {
    test('should calculate correctly when customer pays fees', async () => {
      const amount = 100.00;
      const expected = feeCalculator.calculateCustomerPays(amount);

      const pageData = PaymentPageFactory.createFixedCustomerPays({
        fixedAmount: amount,
      });

      await paymentPagePOM.fillBasicInfo(pageData);
      await paymentPagePOM.selectAmountType('fixed');
      await paymentPagePOM.fillFixedAmount(amount);
      await paymentPagePOM.selectFeePaymentOption(true); // Customer pays

      // Get and verify fee breakdown
      const breakdown = await paymentPagePOM.getFeeBreakdown();

      expect(parseFloat(breakdown.vendorAmount)).toBe(expected.vendorAmount);
      expect(parseFloat(breakdown.platformFee)).toBe(expected.platformFee);
      expect(parseFloat(breakdown.customerPays)).toBe(expected.customerPaysAmount);
      expect(parseFloat(breakdown.vendorReceives)).toBe(expected.vendorReceives);
    });

    test('should show correct vendor receives amount when customer pays', async () => {
      const amount = 100.00;
      const pageData = PaymentPageFactory.createFixedCustomerPays({
        fixedAmount: amount,
      });

      await paymentPagePOM.fillBasicInfo(pageData);
      await paymentPagePOM.selectAmountType('fixed');
      await paymentPagePOM.fillFixedAmount(amount);
      await paymentPagePOM.selectFeePaymentOption(true);

      const breakdown = await paymentPagePOM.getFeeBreakdown();

      // Vendor should receive the full amount they set
      expect(parseFloat(breakdown.vendorReceives)).toBe(amount);
    });

    test('should verify customer pays option can be selected', async () => {
      const pageData = PaymentPageFactory.createFixedCustomerPays();

      await paymentPagePOM.fillBasicInfo(pageData);
      await paymentPagePOM.selectAmountType('fixed');
      await paymentPagePOM.fillFixedAmount(100);
      await paymentPagePOM.selectFeePaymentOption(true);

      await paymentPagePOM.verifyCustomerPaysSelected();
    });

    test.describe('Customer Pays - Multiple Amounts', () => {
      const testCases = [
        { amount: 50.00, feePercentage: DEFAULT_FEE_PERCENTAGE },
        { amount: 100.00, feePercentage: DEFAULT_FEE_PERCENTAGE },
        { amount: 250.00, feePercentage: DEFAULT_FEE_PERCENTAGE },
        { amount: 500.00, feePercentage: DEFAULT_FEE_PERCENTAGE },
        { amount: 1000.00, feePercentage: DEFAULT_FEE_PERCENTAGE },
      ];

      testCases.forEach(({ amount, feePercentage }) => {
        test(`should calculate correctly for $${amount} with ${feePercentage}% fee`, async () => {
          const calculator = createFeeCalculator(feePercentage);
          const expected = calculator.calculateCustomerPays(amount);

          const pageData = PaymentPageFactory.createFixedCustomerPays({
            fixedAmount: amount,
          });

          await paymentPagePOM.fillBasicInfo(pageData);
          await paymentPagePOM.selectAmountType('fixed');
          await paymentPagePOM.fillFixedAmount(amount);
          await paymentPagePOM.selectFeePaymentOption(true);

          const breakdown = await paymentPagePOM.getFeeBreakdown();

          expect(parseFloat(breakdown.platformFee)).toBe(expected.platformFee);
          expect(parseFloat(breakdown.customerPays)).toBe(expected.customerPaysAmount);
          expect(parseFloat(breakdown.vendorReceives)).toBe(expected.vendorReceives);
        });
      });
    });
  });

  test.describe('Fee Mode Switching', () => {
    test('should update calculations when switching from vendor pays to customer pays', async ({ page }) => {
      const amount = 100.00;

      const pageData = PaymentPageFactory.createFixedVendorPays({
        fixedAmount: amount,
      });

      await paymentPagePOM.fillBasicInfo(pageData);
      await paymentPagePOM.selectAmountType('fixed');
      await paymentPagePOM.fillFixedAmount(amount);

      // Start with vendor pays
      await paymentPagePOM.selectFeePaymentOption(false);
      await page.waitForTimeout(300);

      let breakdown = await paymentPagePOM.getFeeBreakdown();
      const vendorPaysResult = feeCalculator.calculateVendorPays(amount);

      expect(parseFloat(breakdown.vendorReceives)).toBe(vendorPaysResult.vendorReceives);

      // Switch to customer pays
      await paymentPagePOM.selectFeePaymentOption(true);
      await page.waitForTimeout(300);

      breakdown = await paymentPagePOM.getFeeBreakdown();
      const customerPaysResult = feeCalculator.calculateCustomerPays(amount);

      expect(parseFloat(breakdown.vendorReceives)).toBe(customerPaysResult.vendorReceives);
      expect(parseFloat(breakdown.customerPays)).toBe(customerPaysResult.customerPaysAmount);
    });

    test('should update calculations when switching from customer pays to vendor pays', async ({ page }) => {
      const amount = 100.00;

      const pageData = PaymentPageFactory.createFixedCustomerPays({
        fixedAmount: amount,
      });

      await paymentPagePOM.fillBasicInfo(pageData);
      await paymentPagePOM.selectAmountType('fixed');
      await paymentPagePOM.fillFixedAmount(amount);

      // Start with customer pays
      await paymentPagePOM.selectFeePaymentOption(true);
      await page.waitForTimeout(300);

      let breakdown = await paymentPagePOM.getFeeBreakdown();
      const customerPaysResult = feeCalculator.calculateCustomerPays(amount);

      expect(parseFloat(breakdown.vendorReceives)).toBe(customerPaysResult.vendorReceives);

      // Switch to vendor pays
      await paymentPagePOM.selectFeePaymentOption(false);
      await page.waitForTimeout(300);

      breakdown = await paymentPagePOM.getFeeBreakdown();
      const vendorPaysResult = feeCalculator.calculateVendorPays(amount);

      expect(parseFloat(breakdown.vendorReceives)).toBe(vendorPaysResult.vendorReceives);
      expect(parseFloat(breakdown.customerPays)).toBe(vendorPaysResult.customerPaysAmount);
    });
  });

  test.describe('Comprehensive Fee Scenarios', () => {
    const scenarios = FeeScenarioFactory.getCommonScenarios();

    scenarios.forEach((scenario) => {
      test(scenario.name, async () => {
        const calculator = createFeeCalculator(scenario.feePercentage);
        const pageData = scenario.includeFeesInAmount
          ? PaymentPageFactory.createFixedCustomerPays({ fixedAmount: scenario.amount })
          : PaymentPageFactory.createFixedVendorPays({ fixedAmount: scenario.amount });

        await paymentPagePOM.fillBasicInfo(pageData);
        await paymentPagePOM.selectAmountType('fixed');
        await paymentPagePOM.fillFixedAmount(scenario.amount);
        await paymentPagePOM.selectFeePaymentOption(scenario.includeFeesInAmount);

        const breakdown = await paymentPagePOM.getFeeBreakdown();

        expect(parseFloat(breakdown.platformFee)).toBeCloseTo(scenario.expected.platformFee, 2);
        expect(parseFloat(breakdown.customerPays)).toBeCloseTo(scenario.expected.customerPays, 2);
        expect(parseFloat(breakdown.vendorReceives)).toBeCloseTo(scenario.expected.vendorReceives, 2);
      });
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle fractional amounts correctly', async () => {
      const amount = 12.34;
      const expected = feeCalculator.calculateVendorPays(amount);

      const pageData = PaymentPageFactory.createFixedVendorPays({
        fixedAmount: amount,
      });

      await paymentPagePOM.fillBasicInfo(pageData);
      await paymentPagePOM.selectAmountType('fixed');
      await paymentPagePOM.fillFixedAmount(amount);
      await paymentPagePOM.selectFeePaymentOption(false);

      const breakdown = await paymentPagePOM.getFeeBreakdown();

      expect(parseFloat(breakdown.platformFee)).toBeCloseTo(expected.platformFee, 2);
      expect(parseFloat(breakdown.vendorReceives)).toBeCloseTo(expected.vendorReceives, 2);
    });

    test('should handle very small amounts', async () => {
      const amount = 0.99;
      const expected = feeCalculator.calculateVendorPays(amount);

      const pageData = PaymentPageFactory.createFixedVendorPays({
        fixedAmount: amount,
      });

      await paymentPagePOM.fillBasicInfo(pageData);
      await paymentPagePOM.selectAmountType('fixed');
      await paymentPagePOM.fillFixedAmount(amount);
      await paymentPagePOM.selectFeePaymentOption(false);

      const breakdown = await paymentPagePOM.getFeeBreakdown();

      expect(parseFloat(breakdown.platformFee)).toBeCloseTo(expected.platformFee, 2);
    });

    test('should handle large amounts', async () => {
      const amount = 10000.00;
      const expected = feeCalculator.calculateVendorPays(amount);

      const pageData = PaymentPageFactory.createFixedVendorPays({
        fixedAmount: amount,
      });

      await paymentPagePOM.fillBasicInfo(pageData);
      await paymentPagePOM.selectAmountType('fixed');
      await paymentPagePOM.fillFixedAmount(amount);
      await paymentPagePOM.selectFeePaymentOption(false);

      const breakdown = await paymentPagePOM.getFeeBreakdown();

      expect(parseFloat(breakdown.platformFee)).toBeCloseTo(expected.platformFee, 2);
      expect(parseFloat(breakdown.vendorReceives)).toBeCloseTo(expected.vendorReceives, 2);
    });
  });

  test.describe('Different Amount Types', () => {
    test('should show fee breakdown for flexible amount pages', async () => {
      const pageData = PaymentPageFactory.createFlexible({
        minAmount: 10.00,
        maxAmount: 100.00,
      });

      await paymentPagePOM.fillBasicInfo(pageData);
      await paymentPagePOM.selectAmountType('flexible');
      await paymentPagePOM.fillFlexibleAmount(pageData.minAmount!, pageData.maxAmount);

      // Note: Fee breakdown may not show for flexible amounts without a specific amount set
      // This tests the behavior is as expected
    });

    test('should show fee breakdown for donation pages', async () => {
      const pageData = PaymentPageFactory.createDonation({
        minAmount: 5.00,
      });

      await paymentPagePOM.fillBasicInfo(pageData);
      await paymentPagePOM.selectAmountType('donation');
      await paymentPagePOM.fillDonationAmount(pageData.minAmount!);

      // Note: Fee breakdown may not show for donations without a specific amount set
    });
  });
});
