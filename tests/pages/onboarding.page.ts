import { Page, expect } from '@playwright/test';

/**
 * Page Object Model for Onboarding Page
 *
 * Handles all interactions with the onboarding flow
 */
export class OnboardingPage {
  constructor(readonly page: Page) {}

  // Selectors - Step 1: Organization Creation
  private readonly organizationNameInput = 'input[name="name"]';
  private readonly organizationTypeIndividual = 'input[value="individual"]';
  private readonly organizationTypeCorporate = 'input[value="corporate"]';
  private readonly countrySelect = 'button[role="combobox"]'; // Assuming shadcn/ui select
  private readonly countryOption = (code: string) => `[data-value="${code}"]`;
  private readonly submitButton = 'button[type="submit"]';
  private readonly logoutButton = 'button:has-text("Logout")';

  // Progress indicator
  private readonly progressBadge = '.badge, [class*="badge"]';

  /**
   * Navigate to onboarding page
   */
  async goto() {
    await this.page.goto('/onboarding');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill organization creation form (Step 1)
   */
  async fillOrganizationForm(data: {
    name: string;
    type: 'individual' | 'corporate';
    countryCode: string;
  }) {
    // Fill organization name
    await this.page.fill(this.organizationNameInput, data.name);

    // Select organization type
    const typeInput = data.type === 'individual'
      ? this.organizationTypeIndividual
      : this.organizationTypeCorporate;
    await this.page.click(typeInput);

    // Select country (using shadcn/ui select component)
    await this.selectCountry(data.countryCode);
  }

  /**
   * Select country from dropdown
   */
  async selectCountry(countryCode: string) {
    // Click to open dropdown
    await this.page.click(this.countrySelect);

    // Wait for dropdown to open
    await this.page.waitForTimeout(300);

    // Click on country option
    const option = this.page.locator(this.countryOption(countryCode));
    if (await option.count() > 0) {
      await option.click();
    } else {
      // Fallback: search by text
      await this.page.click(`[role="option"]:has-text("${countryCode}")`);
    }
  }

  /**
   * Submit current onboarding step
   */
  async submit() {
    await this.page.click(this.submitButton);
  }

  /**
   * Complete Step 1: Organization creation
   */
  async completeOrganizationSetup(data: {
    name: string;
    type: 'individual' | 'corporate';
    countryCode: string;
  }) {
    await this.fillOrganizationForm(data);
    await this.submit();
  }

  /**
   * Click logout button
   */
  async logout() {
    await this.page.click(this.logoutButton);
  }

  /**
   * Wait for redirect to dashboard
   */
  async waitForDashboardRedirect() {
    await this.page.waitForURL(/.*\/vendor\/dashboard/, { timeout: 15000 });
  }

  /**
   * Wait for redirect to login
   */
  async waitForLoginRedirect() {
    await this.page.waitForURL(/.*\/login/, { timeout: 10000 });
  }

  /**
   * Check if submit button is disabled
   */
  async isSubmitButtonDisabled(): Promise<boolean> {
    return await this.page.isDisabled(this.submitButton);
  }

  /**
   * Check if submit button shows loading state
   */
  async isSubmitButtonLoading(): Promise<boolean> {
    const buttonText = await this.page.textContent(this.submitButton);
    return buttonText?.includes('Setting up') || buttonText?.includes('...') || false;
  }

  /**
   * Get current step from progress indicator
   */
  async getCurrentStep(): Promise<string | null> {
    const badge = this.page.locator(this.progressBadge);
    if (await badge.count() > 0) {
      return await badge.first().textContent();
    }
    return null;
  }

  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string | null> {
    const errorLocator = this.page.locator('.text-red-600, [role="alert"]');
    if (await errorLocator.count() > 0) {
      return await errorLocator.first().textContent();
    }
    return null;
  }

  /**
   * Assert onboarding page is loaded (Step 1)
   */
  async assertPageLoaded() {
    await expect(this.page.locator('h1')).toContainText('Complete Your Setup');
    await expect(this.page.locator(this.submitButton)).toBeVisible();
  }

  /**
   * Assert step indicator shows correct step
   */
  async assertCurrentStep(step: string) {
    const currentStep = await this.getCurrentStep();
    expect(currentStep).toContain(step);
  }

  /**
   * Assert logout button is visible
   */
  async assertLogoutButtonVisible() {
    await expect(this.page.locator(this.logoutButton)).toBeVisible();
  }

  /**
   * Assert redirects to dashboard if already has organization
   */
  async assertRedirectsToDashboardIfComplete() {
    // Wait a bit to see if redirect happens
    await this.page.waitForTimeout(2000);

    // Should be on dashboard, not onboarding
    const url = this.page.url();
    expect(url).toMatch(/\/(vendor|admin)\/dashboard/);
  }

  /**
   * Assert validation error for field
   */
  async assertFieldError(field: string, errorText: string) {
    const errorLocator = this.page.locator(`[name="${field}"] ~ .text-red-600`);
    await expect(errorLocator).toContainText(errorText);
  }

  // ── Step-page navigation ──────────────────────────────────────────────

  async gotoProfileReview() {
    await this.page.goto('/onboarding/profile-review');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoKYC() {
    await this.page.goto('/onboarding/kyc');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoPayoutAccount() {
    await this.page.goto('/onboarding/payout-account');
    await this.page.waitForLoadState('networkidle');
  }

  // ── Wait helpers for inter-step redirects ─────────────────────────────

  async waitForProfileReviewRedirect() {
    await this.page.waitForURL(/.*\/onboarding\/profile-review/, { timeout: 10000 });
  }

  async waitForKYCRedirect() {
    await this.page.waitForURL(/.*\/onboarding\/kyc/, { timeout: 10000 });
  }

  async waitForPayoutRedirect() {
    await this.page.waitForURL(/.*\/onboarding\/payout-account/, { timeout: 10000 });
  }

  async waitForOnboardingRedirect() {
    await this.page.waitForURL(/.*\/onboarding\/?$/, { timeout: 10000 });
  }

  // ── Step 2: Profile Review ────────────────────────────────────────────

  async assertProfileReviewLoaded() {
    await expect(this.page.locator('h1:has-text("Review Your Profile")')).toBeVisible();
  }

  /** Displays the user's first + last name somewhere on the page. */
  async assertUserNameDisplayed(firstName: string, lastName: string) {
    await expect(this.page.locator(`:has-text("${firstName}")`).first()).toBeVisible();
    await expect(this.page.locator(`:has-text("${lastName}")`).first()).toBeVisible();
  }

  /** Displays the organisation name somewhere on the page. */
  async assertOrganizationNameDisplayed(orgName: string) {
    await expect(this.page.locator(`:has-text("${orgName}")`).first()).toBeVisible();
  }

  /** Click the "Continue →" button on the profile-review page. */
  async clickContinue() {
    await this.page.locator('button:has-text("Continue")').click();
  }

  // ── Step 3: KYC Upload ────────────────────────────────────────────────

  async assertKYCPageLoaded() {
    await expect(this.page.locator('h1:has-text("Upload KYC Documents")')).toBeVisible();
  }

  /** Click the "Skip for now" button (present on KYC and payout pages). */
  async clickSkipForNow() {
    await this.page.locator('button:has-text("Skip for now")').click();
  }

  /** Select a document type from the KYC dropdown. */
  async selectDocumentType(value: string) {
    await this.page.selectOption('#document-type', value);
  }

  // ── Step 4: Payout Account ────────────────────────────────────────────

  async assertPayoutPageLoaded() {
    await expect(this.page.locator('h1:has-text("Set Up Payout Account")')).toBeVisible();
  }

  /** Select bank or mobile_money radio on the payout page. */
  async selectPaymentMethod(method: 'bank' | 'mobile_money') {
    await this.page.locator(`input[value="${method}"]`).click();
  }

  /** Assert the mobile-money radio is NOT disabled. */
  async assertMobileMoneyEnabled() {
    await expect(this.page.locator('input[value="mobile_money"]')).not.toBeDisabled();
  }

  /** Assert the mobile-money radio IS disabled (unsupported country). */
  async assertMobileMoneyDisabled() {
    await expect(this.page.locator('input[value="mobile_money"]')).toBeDisabled();
  }

  /** Fill in the bank-account section (bank_code select + text fields). */
  async fillBankDetails(details: { bankCode: string; accountNumber: string; accountName: string }) {
    await this.page.selectOption('#bank_code', details.bankCode);
    await this.page.fill('#account_number', details.accountNumber);
    await this.page.fill('#account_name', details.accountName);
  }

  /** Fill in the mobile-money section. */
  async fillMobileMoneyDetails(details: { provider: string; mobileNumber: string; accountName: string }) {
    await this.page.selectOption('#mobile_provider', details.provider);
    await this.page.fill('#mobile_number', details.mobileNumber);
    // mobile-money shares the account_name field id with bank; the visible one is
    // '#mobile_account_name' but the registered input is still name="account_name".
    await this.page.fill('#mobile_account_name', details.accountName);
  }

  /** Click the primary "Complete Setup →" submit button on the payout page. */
  async clickCompleteSetup() {
    await this.page.locator('button[type="submit"]:has-text("Complete Setup")').click();
  }
}
