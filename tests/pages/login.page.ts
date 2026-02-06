import { Page, expect } from '@playwright/test';

/**
 * Page Object Model for Login Page
 *
 * Handles all interactions with the login form
 */
export class LoginPage {
  constructor(readonly page: Page) {}

  // Selectors
  private readonly emailInput = 'input[type="email"], input[name="email"]';
  private readonly passwordInput = 'input[type="password"], input[name="password"]';
  private readonly rememberMeCheckbox = 'input[type="checkbox"][name="remember"]';
  private readonly submitButton = 'button[type="submit"]';
  private readonly registerLink = 'a[href="/register"]';
  private readonly forgotPasswordLink = 'a[href*="forgot"]';
  private readonly errorMessage = '.text-red-600, [role="alert"]';

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
    // Wait for the login form to be ready
    await this.page.waitForSelector(this.emailInput, { state: 'visible', timeout: 20000 });
  }

  /**
   * Fill login credentials
   */
  async fillCredentials(email: string, password: string, remember: boolean = false) {
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);

    if (remember) {
      const checkbox = this.page.locator(this.rememberMeCheckbox);
      if (await checkbox.count() > 0) {
        await checkbox.check();
      }
    }
  }

  /**
   * Submit login form
   */
  async submit() {
    await this.page.click(this.submitButton);
  }

  /**
   * Login with credentials (fill + submit)
   */
  async login(email: string, password: string, remember: boolean = false) {
    await this.fillCredentials(email, password, remember);
    await this.submit();
  }

  /**
   * Wait for redirect to dashboard
   */
  async waitForDashboardRedirect() {
    // Can redirect to either /vendor/dashboard or /admin/dashboard
    await this.page.waitForURL(/.*\/(vendor|admin)\/dashboard/, { timeout: 15000 });
  }

  /**
   * Wait for redirect to onboarding
   */
  async waitForOnboardingRedirect() {
    await this.page.waitForURL(/.*\/onboarding/, { timeout: 15000 });
  }

  /**
   * Wait for 2FA verification screen
   */
  async waitFor2FAScreen() {
    await this.page.waitForURL(/.*\/login\/verify-2fa/, { timeout: 10000 });
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
    return buttonText?.includes('Signing') || buttonText?.includes('...') || false;
  }

  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string | null> {
    const errorLocator = this.page.locator(this.errorMessage);
    if (await errorLocator.count() > 0) {
      return await errorLocator.first().textContent();
    }
    return null;
  }

  /**
   * Check if specific error is displayed
   */
  async hasError(errorText: string): Promise<boolean> {
    const error = await this.getErrorMessage();
    return error?.includes(errorText) || false;
  }

  /**
   * Click register link
   */
  async goToRegister() {
    await this.page.click(this.registerLink);
  }

  /**
   * Click forgot password link
   */
  async goToForgotPassword() {
    const link = this.page.locator(this.forgotPasswordLink);
    if (await link.count() > 0) {
      await link.click();
    }
  }

  /**
   * Assert login page is loaded
   */
  async assertPageLoaded() {
    await expect(this.page.locator('h1, h2').filter({ hasText: /sign in|log in|login/i })).toBeVisible();
    await expect(this.page.locator(this.submitButton)).toBeVisible();
  }

  /**
   * Assert invalid credentials error is shown
   */
  async assertInvalidCredentialsError() {
    const error = await this.getErrorMessage();
    expect(error).toBeTruthy();
    expect(error?.toLowerCase()).toMatch(/invalid|incorrect|wrong/);
  }

  /**
   * Assert credentials are preserved after error
   */
  async assertEmailPreserved(email: string) {
    await expect(this.page.locator(this.emailInput)).toHaveValue(email);
  }

  /**
   * Clear form
   */
  async clearForm() {
    await this.page.fill(this.emailInput, '');
    await this.page.fill(this.passwordInput, '');
  }
}
