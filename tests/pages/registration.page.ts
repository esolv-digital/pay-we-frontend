import { Page, expect } from '@playwright/test';

/**
 * Page Object Model for Registration Page
 *
 * Handles all interactions with the registration form
 */
export class RegistrationPage {
  constructor(readonly page: Page) {}

  // Selectors
  private readonly firstNameInput = 'input[name="first_name"]';
  private readonly lastNameInput = 'input[name="last_name"]';
  private readonly middleNameInput = 'input[name="middle_name"]';
  private readonly emailInput = 'input[name="email"]';
  private readonly phoneInput = 'input[name="phone"]';
  private readonly passwordInput = 'input[name="password"]';
  private readonly passwordConfirmationInput = 'input[name="password_confirmation"]';
  private readonly submitButton = 'button[type="submit"]';
  private readonly loginLink = 'a[href="/login"]';
  private readonly backToHomeLink = 'a[href="/"]';

  // Error message selectors
  private readonly errorMessage = '.text-red-600';
  private readonly fieldError = (field: string) => `#${field} + .text-red-600, [name="${field}"] ~ .text-red-600`;

  /**
   * Navigate to registration page
   */
  async goto() {
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill registration form
   */
  async fillForm(data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    phone?: string;
    password: string;
    passwordConfirmation: string;
  }) {
    await this.page.fill(this.firstNameInput, data.firstName);
    await this.page.fill(this.lastNameInput, data.lastName);

    if (data.middleName) {
      await this.page.fill(this.middleNameInput, data.middleName);
    }

    await this.page.fill(this.emailInput, data.email);

    if (data.phone) {
      await this.page.fill(this.phoneInput, data.phone);
    }

    await this.page.fill(this.passwordInput, data.password);
    await this.page.fill(this.passwordConfirmationInput, data.passwordConfirmation);
  }

  /**
   * Submit registration form
   */
  async submit() {
    await this.page.click(this.submitButton);
  }

  /**
   * Register with provided data (fill + submit)
   */
  async register(data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    phone?: string;
    password: string;
    passwordConfirmation: string;
  }) {
    await this.fillForm(data);
    await this.submit();
  }

  /**
   * Wait for redirect to onboarding page
   */
  async waitForOnboardingRedirect() {
    await this.page.waitForURL(/.*\/onboarding/, { timeout: 15000 });
  }

  /**
   * Wait for redirect to login page
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
    return buttonText?.includes('Creating') || buttonText?.includes('...') || false;
  }

  /**
   * Get error message for a specific field
   */
  async getFieldError(field: string): Promise<string | null> {
    const errorLocator = this.page.locator(this.fieldError(field));
    if (await errorLocator.count() > 0) {
      return await errorLocator.first().textContent();
    }
    return null;
  }

  /**
   * Get all visible error messages
   */
  async getAllErrors(): Promise<string[]> {
    const errorLocators = this.page.locator(this.errorMessage);
    const count = await errorLocators.count();
    const errors: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await errorLocators.nth(i).textContent();
      if (text) errors.push(text);
    }

    return errors;
  }

  /**
   * Check if a specific error message is visible
   */
  async hasError(errorText: string): Promise<boolean> {
    const errors = await this.getAllErrors();
    return errors.some(error => error.includes(errorText));
  }

  /**
   * Click "Sign in here" link to go to login
   */
  async goToLogin() {
    await this.page.click(this.loginLink);
  }

  /**
   * Click "Back to home" link
   */
  async goToHome() {
    await this.page.click(this.backToHomeLink);
  }

  /**
   * Assert registration page is loaded
   */
  async assertPageLoaded() {
    await expect(this.page.locator('h1')).toContainText('Create Account');
    await expect(this.page.locator(this.submitButton)).toBeVisible();
  }

  /**
   * Assert specific field has error
   */
  async assertFieldError(field: string, expectedError: string) {
    const error = await this.getFieldError(field);
    expect(error).toBeTruthy();
    expect(error).toContain(expectedError);
  }

  /**
   * Assert form data is preserved (after validation error)
   */
  async assertFormDataPreserved(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) {
    if (data.firstName) {
      await expect(this.page.locator(this.firstNameInput)).toHaveValue(data.firstName);
    }
    if (data.lastName) {
      await expect(this.page.locator(this.lastNameInput)).toHaveValue(data.lastName);
    }
    if (data.email) {
      await expect(this.page.locator(this.emailInput)).toHaveValue(data.email);
    }
  }

  /**
   * Clear all form fields
   */
  async clearForm() {
    await this.page.fill(this.firstNameInput, '');
    await this.page.fill(this.lastNameInput, '');
    await this.page.fill(this.middleNameInput, '');
    await this.page.fill(this.emailInput, '');
    await this.page.fill(this.phoneInput, '');
    await this.page.fill(this.passwordInput, '');
    await this.page.fill(this.passwordConfirmationInput, '');
  }
}
