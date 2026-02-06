/**
 * Base Page Object Model
 *
 * Implements common page functionality following SOLID principles:
 * - Single Responsibility: Each method does one thing
 * - Open/Closed: Extensible without modification
 * - Liskov Substitution: Subclasses can replace base class
 * - Interface Segregation: Only relevant methods exposed
 * - Dependency Inversion: Depends on abstractions (Playwright Page)
 */

import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly baseUrl: string;

  constructor(page: Page, baseUrl: string = 'http://localhost:3000') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(`${this.baseUrl}${path}`);
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill input field with value (skips if disabled)
   */
  async fillInput(locator: Locator, value: string): Promise<void> {
    // Check if the field is enabled before filling
    const isEnabled = await locator.isEnabled().catch(() => false);
    if (!isEnabled) {
      console.log(`Skipping disabled field: ${await locator.getAttribute('name')}`);
      return;
    }

    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Fill number input with value (skips if disabled)
   */
  async fillNumberInput(locator: Locator, value: number): Promise<void> {
    // Check if the field is enabled before filling
    const isEnabled = await locator.isEnabled().catch(() => false);
    if (!isEnabled) {
      console.log(`Skipping disabled number field: ${await locator.getAttribute('name')}`);
      return;
    }

    await locator.clear();
    await locator.fill(value.toString());
  }

  /**
   * Click element with optional wait
   */
  async clickElement(locator: Locator, options?: { force?: boolean }): Promise<void> {
    await locator.click(options);
  }

  /**
   * Select option from dropdown by value
   */
  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Get text content of element
   */
  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) || '';
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, options?: { timeout?: number }): Promise<void> {
    await locator.waitFor({ state: 'visible', ...options });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(locator: Locator, options?: { timeout?: number }): Promise<void> {
    await locator.waitFor({ state: 'hidden', ...options });
  }

  /**
   * Check if element contains text
   */
  async containsText(locator: Locator, text: string): Promise<boolean> {
    const content = await this.getText(locator);
    return content.includes(text);
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(urlPattern?: string | RegExp): Promise<void> {
    if (urlPattern) {
      await this.page.waitForURL(urlPattern);
    } else {
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Check for error messages on page
   */
  async hasErrorMessage(): Promise<boolean> {
    const errorSelectors = [
      'text=/error/i',
      '[role="alert"]',
      '.error',
      '.text-red-600',
      '.text-red-500',
    ];

    for (const selector of errorSelectors) {
      const errorElement = this.page.locator(selector).first();
      if (await errorElement.isVisible()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Verify URL matches pattern
   */
  async verifyUrl(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  /**
   * Reload page
   */
  async reload(): Promise<void> {
    await this.page.reload();
  }
}
