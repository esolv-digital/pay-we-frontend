/**
 * Payment Page Object Model
 *
 * Handles payment page creation and management
 * Extends BasePage for common functionality
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export interface PaymentPageData {
  title: string;
  description?: string;
  slug?: string;
  amountType: 'fixed' | 'flexible' | 'donation';
  fixedAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  currencyCode?: string;
  includeFeesInAmount: boolean;
}

export interface FeeBreakdownDisplay {
  vendorAmount: string;
  platformFee: string;
  customerPays: string;
  vendorReceives: string;
}

export class PaymentPagePOM extends BasePage {
  // Form fields
  private readonly titleInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly slugInput: Locator;
  private readonly amountTypeSelect: Locator;
  private readonly fixedAmountInput: Locator;
  private readonly minAmountInput: Locator;
  private readonly maxAmountInput: Locator;
  private readonly currencySelect: Locator;

  // Fee handling radio buttons
  private readonly vendorPaysRadio: Locator;
  private readonly customerPaysRadio: Locator;

  // Fee breakdown preview
  private readonly feeBreakdownPreview: Locator;
  private readonly previewVendorAmount: Locator;
  private readonly previewPlatformFee: Locator;
  private readonly previewCustomerPays: Locator;
  private readonly previewVendorReceives: Locator;

  // Actions
  private readonly submitButton: Locator;
  private readonly cancelButton: Locator;

  // Messages
  private readonly successMessage: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.titleInput = page.locator('input[name="title"]');
    this.descriptionInput = page.locator('textarea[name="description"]');
    this.slugInput = page.locator('input[name="slug"]');
    this.amountTypeSelect = page.locator('select[name="amount_type"]');
    this.fixedAmountInput = page.locator('input[name="fixed_amount"]');
    this.minAmountInput = page.locator('input[name="min_amount"]');
    this.maxAmountInput = page.locator('input[name="max_amount"]');
    this.currencySelect = page.locator('select[name="currency_code"]');

    // Fee handling (look for radio buttons with specific checked states)
    this.vendorPaysRadio = page.locator('input[type="radio"]:has-text("Deduct fee from amount")').or(
      page.locator('label:has-text("Deduct fee from amount") input[type="radio"]')
    );
    this.customerPaysRadio = page.locator('input[type="radio"]:has-text("Add fee to amount")').or(
      page.locator('label:has-text("Add fee to amount") input[type="radio"]')
    );

    // Fee breakdown preview
    this.feeBreakdownPreview = page.locator('text=Payment Breakdown Preview').locator('..');
    this.previewVendorAmount = this.feeBreakdownPreview.locator('text=/Amount you set/i').locator('..');
    this.previewPlatformFee = this.feeBreakdownPreview.locator('text=/Platform fee/i').locator('..');
    this.previewCustomerPays = this.feeBreakdownPreview.locator('text=/Customer pays/i').locator('..');
    this.previewVendorReceives = this.feeBreakdownPreview.locator('text=/You receive/i').locator('..');

    // Actions
    this.submitButton = page.locator('button[type="submit"]', { hasText: /create|save/i });
    this.cancelButton = page.locator('a:has-text("Back to Payment Pages")');

    // Messages
    this.successMessage = page.locator('[role="alert"]').filter({ hasText: /success/i });
    this.errorMessage = page.locator('[role="alert"]').filter({ hasText: /error|fail/i });
  }

  /**
   * Navigate to create payment page
   */
  async gotoCreatePage(): Promise<void> {
    await this.goto('/vendor/payment-pages/create');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to edit payment page
   */
  async gotoEditPage(pageId: string): Promise<void> {
    await this.goto(`/vendor/payment-pages/${pageId}/edit`);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to payment pages list
   */
  async gotoListPage(): Promise<void> {
    await this.goto('/vendor/payment-pages');
    await this.waitForPageLoad();
  }

  /**
   * Fill basic payment page information
   */
  async fillBasicInfo(data: Pick<PaymentPageData, 'title' | 'description' | 'slug'>): Promise<void> {
    if (data.title) {
      await this.fillInput(this.titleInput, data.title);
    }

    if (data.description) {
      await this.fillInput(this.descriptionInput, data.description);
    }

    // Slug is usually auto-generated, but can be overridden
    if (data.slug) {
      await this.fillInput(this.slugInput, data.slug);
    }
  }

  /**
   * Select amount type
   */
  async selectAmountType(amountType: PaymentPageData['amountType']): Promise<void> {
    await this.selectOption(this.amountTypeSelect, amountType);
  }

  /**
   * Fill fixed amount
   */
  async fillFixedAmount(amount: number): Promise<void> {
    await this.waitForElement(this.fixedAmountInput);
    await this.fillNumberInput(this.fixedAmountInput, amount);
  }

  /**
   * Fill flexible amount range
   */
  async fillFlexibleAmount(minAmount: number, maxAmount?: number): Promise<void> {
    await this.waitForElement(this.minAmountInput);
    await this.fillNumberInput(this.minAmountInput, minAmount);

    if (maxAmount) {
      await this.fillNumberInput(this.maxAmountInput, maxAmount);
    }
  }

  /**
   * Fill donation amount
   */
  async fillDonationAmount(minAmount: number): Promise<void> {
    await this.waitForElement(this.minAmountInput);
    await this.fillNumberInput(this.minAmountInput, minAmount);
  }

  /**
   * Select currency
   */
  async selectCurrency(currencyCode: string): Promise<void> {
    await this.selectOption(this.currencySelect, currencyCode);
  }

  /**
   * Select fee payment option
   */
  async selectFeePaymentOption(includeFeesInAmount: boolean): Promise<void> {
    if (includeFeesInAmount) {
      await this.clickElement(this.customerPaysRadio);
    } else {
      await this.clickElement(this.vendorPaysRadio);
    }
  }

  /**
   * Get fee breakdown display values
   */
  async getFeeBreakdown(): Promise<FeeBreakdownDisplay> {
    await this.waitForElement(this.feeBreakdownPreview);

    const vendorAmount = await this.extractAmountFromText(await this.getText(this.previewVendorAmount));
    const platformFee = await this.extractAmountFromText(await this.getText(this.previewPlatformFee));
    const customerPays = await this.extractAmountFromText(await this.getText(this.previewCustomerPays));
    const vendorReceives = await this.extractAmountFromText(await this.getText(this.previewVendorReceives));

    return {
      vendorAmount,
      platformFee,
      customerPays,
      vendorReceives,
    };
  }

  /**
   * Verify fee breakdown is displayed
   */
  async verifyFeeBreakdownVisible(): Promise<void> {
    await expect(this.feeBreakdownPreview).toBeVisible();
  }

  /**
   * Verify fee breakdown is not displayed
   */
  async verifyFeeBreakdownHidden(): Promise<void> {
    await expect(this.feeBreakdownPreview).not.toBeVisible();
  }

  /**
   * Submit payment page form
   */
  async submitForm(): Promise<void> {
    await this.clickElement(this.submitButton);
  }

  /**
   * Create complete payment page
   */
  async createPaymentPage(data: PaymentPageData): Promise<void> {
    await this.fillBasicInfo({
      title: data.title,
      description: data.description,
      slug: data.slug,
    });

    await this.selectAmountType(data.amountType);

    // Fill amount based on type
    if (data.amountType === 'fixed' && data.fixedAmount) {
      await this.fillFixedAmount(data.fixedAmount);
    } else if (data.amountType === 'flexible') {
      await this.fillFlexibleAmount(data.minAmount || 0, data.maxAmount);
    } else if (data.amountType === 'donation') {
      await this.fillDonationAmount(data.minAmount || 0);
    }

    // Select currency if provided
    if (data.currencyCode) {
      await this.selectCurrency(data.currencyCode);
    }

    // Select fee payment option
    await this.selectFeePaymentOption(data.includeFeesInAmount);

    // Submit form
    await this.submitForm();
  }

  /**
   * Verify success message
   */
  async verifySuccessMessage(): Promise<void> {
    await expect(this.successMessage).toBeVisible();
  }

  /**
   * Verify error message
   */
  async verifyErrorMessage(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  /**
   * Verify redirected to list page
   */
  async verifyRedirectedToList(): Promise<void> {
    await this.verifyUrl(/\/vendor\/payment-pages$/);
  }

  /**
   * Extract amount from text (e.g., "$100.00" -> "100.00")
   */
  private async extractAmountFromText(text: string): Promise<string> {
    // Match patterns like $100.00, 100.00, etc.
    const match = text.match(/\$?(\d+\.?\d*)/);
    return match ? match[1] : '0.00';
  }

  /**
   * Get current fee payment option
   */
  async getFeePaymentOption(): Promise<'vendor' | 'customer'> {
    const vendorPaysChecked = await this.vendorPaysRadio.isChecked();
    return vendorPaysChecked ? 'vendor' : 'customer';
  }

  /**
   * Verify vendor pays option is selected
   */
  async verifyVendorPaysSelected(): Promise<void> {
    await expect(this.vendorPaysRadio).toBeChecked();
  }

  /**
   * Verify customer pays option is selected
   */
  async verifyCustomerPaysSelected(): Promise<void> {
    await expect(this.customerPaysRadio).toBeChecked();
  }
}
