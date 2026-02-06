/**
 * Payment Page Test Data Factory
 *
 * DRY Principle: Centralize test data creation
 * Factory Pattern: Create test data with sensible defaults
 */

import { PaymentPageData } from '../pages/payment-page.page';

export interface PaymentPageFactoryOptions {
  title?: string;
  description?: string;
  slug?: string;
  amountType?: 'fixed' | 'flexible' | 'donation';
  fixedAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  currencyCode?: string;
  includeFeesInAmount?: boolean;
}

export class PaymentPageFactory {
  private static counter = 0;

  /**
   * Create payment page with fixed amount (vendor pays fees)
   */
  static createFixedVendorPays(overrides?: Partial<PaymentPageFactoryOptions>): PaymentPageData {
    this.counter++;

    return {
      title: overrides?.title || `Test Payment Page ${this.counter}`,
      description: overrides?.description || 'Test payment page description',
      slug: overrides?.slug || `test-page-${this.counter}`,
      amountType: 'fixed',
      fixedAmount: overrides?.fixedAmount ?? 100.00,
      currencyCode: overrides?.currencyCode || 'USD',
      includeFeesInAmount: false, // Vendor pays
    };
  }

  /**
   * Create payment page with fixed amount (customer pays fees)
   */
  static createFixedCustomerPays(overrides?: Partial<PaymentPageFactoryOptions>): PaymentPageData {
    this.counter++;

    return {
      title: overrides?.title || `Test Payment Page ${this.counter}`,
      description: overrides?.description || 'Test payment page description',
      slug: overrides?.slug || `test-page-${this.counter}`,
      amountType: 'fixed',
      fixedAmount: overrides?.fixedAmount ?? 100.00,
      currencyCode: overrides?.currencyCode || 'USD',
      includeFeesInAmount: true, // Customer pays
    };
  }

  /**
   * Create payment page with flexible amount
   */
  static createFlexible(overrides?: Partial<PaymentPageFactoryOptions>): PaymentPageData {
    this.counter++;

    return {
      title: overrides?.title || `Flexible Payment Page ${this.counter}`,
      description: overrides?.description || 'Flexible payment page',
      slug: overrides?.slug || `flexible-page-${this.counter}`,
      amountType: 'flexible',
      minAmount: overrides?.minAmount ?? 10.00,
      maxAmount: overrides?.maxAmount ?? 1000.00,
      currencyCode: overrides?.currencyCode || 'USD',
      includeFeesInAmount: overrides?.includeFeesInAmount ?? false,
    };
  }

  /**
   * Create payment page for donations
   */
  static createDonation(overrides?: Partial<PaymentPageFactoryOptions>): PaymentPageData {
    this.counter++;

    return {
      title: overrides?.title || `Donation Page ${this.counter}`,
      description: overrides?.description || 'Support our cause',
      slug: overrides?.slug || `donation-${this.counter}`,
      amountType: 'donation',
      minAmount: overrides?.minAmount ?? 5.00,
      currencyCode: overrides?.currencyCode || 'USD',
      includeFeesInAmount: overrides?.includeFeesInAmount ?? false,
    };
  }

  /**
   * Create custom payment page
   */
  static create(data: PaymentPageFactoryOptions): PaymentPageData {
    this.counter++;

    return {
      title: data.title || `Payment Page ${this.counter}`,
      description: data.description,
      slug: data.slug || `page-${this.counter}`,
      amountType: data.amountType || 'fixed',
      fixedAmount: data.fixedAmount,
      minAmount: data.minAmount,
      maxAmount: data.maxAmount,
      currencyCode: data.currencyCode || 'USD',
      includeFeesInAmount: data.includeFeesInAmount ?? false,
    };
  }

  /**
   * Reset counter (useful for test isolation)
   */
  static resetCounter(): void {
    this.counter = 0;
  }
}

/**
 * Fee Scenario Test Data
 */
export interface FeeTestScenario {
  name: string;
  amount: number;
  feePercentage: number;
  includeFeesInAmount: boolean;
  expected: {
    platformFee: number;
    customerPays: number;
    vendorReceives: number;
  };
}

export class FeeScenarioFactory {
  /**
   * Create common fee calculation scenarios
   */
  static getCommonScenarios(): FeeTestScenario[] {
    return [
      // Scenario 1: $100, 10% fee, vendor pays
      {
        name: 'Vendor pays 10% on $100',
        amount: 100.00,
        feePercentage: 10,
        includeFeesInAmount: false,
        expected: {
          platformFee: 10.00,
          customerPays: 100.00,
          vendorReceives: 90.00,
        },
      },

      // Scenario 2: $100, 10% fee, customer pays
      {
        name: 'Customer pays 10% on $100',
        amount: 100.00,
        feePercentage: 10,
        includeFeesInAmount: true,
        expected: {
          platformFee: 10.00,
          customerPays: 110.00,
          vendorReceives: 100.00,
        },
      },

      // Scenario 3: $50, 5% fee, vendor pays
      {
        name: 'Vendor pays 5% on $50',
        amount: 50.00,
        feePercentage: 5,
        includeFeesInAmount: false,
        expected: {
          platformFee: 2.50,
          customerPays: 50.00,
          vendorReceives: 47.50,
        },
      },

      // Scenario 4: $50, 5% fee, customer pays
      {
        name: 'Customer pays 5% on $50',
        amount: 50.00,
        feePercentage: 5,
        includeFeesInAmount: true,
        expected: {
          platformFee: 2.50,
          customerPays: 52.50,
          vendorReceives: 50.00,
        },
      },

      // Scenario 5: $250, 3% fee, vendor pays
      {
        name: 'Vendor pays 3% on $250',
        amount: 250.00,
        feePercentage: 3,
        includeFeesInAmount: false,
        expected: {
          platformFee: 7.50,
          customerPays: 250.00,
          vendorReceives: 242.50,
        },
      },

      // Scenario 6: $250, 3% fee, customer pays
      {
        name: 'Customer pays 3% on $250',
        amount: 250.00,
        feePercentage: 3,
        includeFeesInAmount: true,
        expected: {
          platformFee: 7.50,
          customerPays: 257.50,
          vendorReceives: 250.00,
        },
      },

      // Scenario 7: Edge case - $0.99, 10% fee, vendor pays
      {
        name: 'Vendor pays 10% on $0.99',
        amount: 0.99,
        feePercentage: 10,
        includeFeesInAmount: false,
        expected: {
          platformFee: 0.10,
          customerPays: 0.99,
          vendorReceives: 0.89,
        },
      },

      // Scenario 8: Edge case - $0.99, 10% fee, customer pays
      {
        name: 'Customer pays 10% on $0.99',
        amount: 0.99,
        feePercentage: 10,
        includeFeesInAmount: true,
        expected: {
          platformFee: 0.10,
          customerPays: 1.09,
          vendorReceives: 0.99,
        },
      },

      // Scenario 9: Large amount - $1000, 2% fee, vendor pays
      {
        name: 'Vendor pays 2% on $1000',
        amount: 1000.00,
        feePercentage: 2,
        includeFeesInAmount: false,
        expected: {
          platformFee: 20.00,
          customerPays: 1000.00,
          vendorReceives: 980.00,
        },
      },

      // Scenario 10: Large amount - $1000, 2% fee, customer pays
      {
        name: 'Customer pays 2% on $1000',
        amount: 1000.00,
        feePercentage: 2,
        includeFeesInAmount: true,
        expected: {
          platformFee: 20.00,
          customerPays: 1020.00,
          vendorReceives: 1000.00,
        },
      },
    ];
  }

  /**
   * Get edge case scenarios
   */
  static getEdgeCaseScenarios(): FeeTestScenario[] {
    return [
      // Zero fee scenarios
      {
        name: 'Zero fee - vendor pays',
        amount: 100.00,
        feePercentage: 0,
        includeFeesInAmount: false,
        expected: {
          platformFee: 0.00,
          customerPays: 100.00,
          vendorReceives: 100.00,
        },
      },
      {
        name: 'Zero fee - customer pays',
        amount: 100.00,
        feePercentage: 0,
        includeFeesInAmount: true,
        expected: {
          platformFee: 0.00,
          customerPays: 100.00,
          vendorReceives: 100.00,
        },
      },

      // Fractional amounts
      {
        name: 'Fractional amount - $12.34, 7.5% fee, vendor pays',
        amount: 12.34,
        feePercentage: 7.5,
        includeFeesInAmount: false,
        expected: {
          platformFee: 0.93,
          customerPays: 12.34,
          vendorReceives: 11.41,
        },
      },
    ];
  }
}
