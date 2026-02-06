/**
 * Fee Calculator Helper
 *
 * Single Responsibility: Calculate fees for payment pages
 * Encapsulates fee calculation logic used across tests
 */

export interface FeeCalculationResult {
  vendorAmount: number;
  platformFee: number;
  customerPaysAmount: number;
  vendorReceives: number;
}

export class FeeCalculator {
  private readonly feePercentage: number;

  constructor(feePercentage: number) {
    if (feePercentage < 0 || feePercentage > 100) {
      throw new Error('Fee percentage must be between 0 and 100');
    }
    this.feePercentage = feePercentage;
  }

  /**
   * Calculate fees when vendor pays (fees excluded from amount)
   * Customer pays exact amount, vendor receives (amount - fee)
   */
  calculateVendorPays(amount: number): FeeCalculationResult {
    this.validateAmount(amount);

    const platformFee = this.roundToTwoDecimals(amount * this.feePercentage / 100);
    const vendorReceives = this.roundToTwoDecimals(amount - platformFee);

    return {
      vendorAmount: amount,
      platformFee,
      customerPaysAmount: amount,
      vendorReceives,
    };
  }

  /**
   * Calculate fees when customer pays (fees included in amount)
   * Customer pays (amount + fee), vendor receives full amount
   */
  calculateCustomerPays(amount: number): FeeCalculationResult {
    this.validateAmount(amount);

    const platformFee = this.roundToTwoDecimals(amount * this.feePercentage / 100);
    const customerPaysAmount = this.roundToTwoDecimals(amount + platformFee);

    return {
      vendorAmount: amount,
      platformFee,
      customerPaysAmount,
      vendorReceives: amount,
    };
  }

  /**
   * Format amount as currency string
   */
  formatCurrency(amount: number, currencySymbol: string = '$'): string {
    return `${currencySymbol}${amount.toFixed(2)}`;
  }

  /**
   * Parse currency string to number
   */
  parseCurrency(currencyString: string): number {
    // Remove currency symbols, commas, and whitespace
    const cleaned = currencyString.replace(/[$,\s]/g, '');
    const amount = parseFloat(cleaned);

    if (isNaN(amount)) {
      throw new Error(`Invalid currency string: ${currencyString}`);
    }

    return amount;
  }

  /**
   * Validate amount is positive
   */
  private validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
  }

  /**
   * Round to two decimal places
   */
  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Get fee percentage
   */
  getFeePercentage(): number {
    return this.feePercentage;
  }
}

/**
 * Factory function for creating fee calculators
 */
export function createFeeCalculator(feePercentage: number): FeeCalculator {
  return new FeeCalculator(feePercentage);
}
