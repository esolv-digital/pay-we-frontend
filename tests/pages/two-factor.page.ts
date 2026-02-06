import { Page, expect } from '@playwright/test';

/**
 * Page Object Model for the 2FA Verification Page (/login/verify-2fa)
 *
 * Covers both modes the page can be in:
 *   code     – 6-digit TOTP input (default)
 *   recovery – single recovery-code input
 */
export class TwoFactorPage {
  constructor(readonly page: Page) {}

  // ── Code-mode selectors ─────────────────────────────────────────────────
  private readonly digitInputs = 'input[inputmode="numeric"]';
  private readonly submitButton = 'button[type="submit"]';
  private readonly cancelButton = 'button:has-text("Cancel")';
  private readonly clearButton = 'button:has-text("Clear")';
  private readonly recoveryLink = 'button:has-text("Use a recovery code instead")';
  private readonly backToLoginButton = 'button:has-text("Back to login")';

  // ── Recovery-mode selectors ─────────────────────────────────────────────
  private readonly recoveryInput = 'input#recovery-code';
  private readonly backTo2FAButton = 'button:has-text("Back to 2FA verification")';

  // ── Shared selectors ────────────────────────────────────────────────────
  private readonly errorHeading = 'p:has-text("Verification Failed")';

  // ── Navigation ──────────────────────────────────────────────────────────

  async goto(email: string): Promise<void> {
    await this.page.goto(`/login/verify-2fa?email=${encodeURIComponent(email)}`);
    await this.page.waitForLoadState('networkidle');
  }

  // ── Assertions ──────────────────────────────────────────────────────────

  async assertCodePageLoaded(): Promise<void> {
    await expect(this.page.locator('h1:has-text("Two-Factor Authentication")')).toBeVisible();
    await expect(this.page.locator(this.digitInputs)).toHaveCount(6);
  }

  async assertRecoveryPageLoaded(): Promise<void> {
    await expect(this.page.locator('h1:has-text("Use Recovery Code")')).toBeVisible();
    await expect(this.page.locator(this.recoveryInput)).toBeVisible();
  }

  async assertEmailDisplayed(email: string): Promise<void> {
    await expect(this.page.locator(`span:has-text("${email}")`)).toBeVisible();
  }

  async assertError(): Promise<void> {
    await expect(this.page.locator(this.errorHeading)).toBeVisible();
  }

  async assertNoError(): Promise<void> {
    await expect(this.page.locator(this.errorHeading)).not.toBeVisible();
  }

  // ── Code-mode interactions ──────────────────────────────────────────────

  /**
   * Types each digit sequentially.  The component auto-advances focus and
   * auto-submits once the 6th digit is entered — no explicit click needed.
   */
  async enterAndSubmitCode(code: string): Promise<void> {
    await this.page.locator(this.digitInputs).first().focus();
    for (const ch of code) {
      await this.page.keyboard.type(ch);
    }
  }

  async submitCode(): Promise<void> {
    await this.page.locator(this.submitButton).click();
  }

  async clearCode(): Promise<void> {
    await this.page.locator(this.clearButton).click();
  }

  // ── Recovery-mode interactions ──────────────────────────────────────────

  async switchToRecoveryMode(): Promise<void> {
    await this.page.locator(this.recoveryLink).click();
  }

  async switchToCodeMode(): Promise<void> {
    await this.page.locator(this.backTo2FAButton).click();
  }

  async enterRecoveryCode(code: string): Promise<void> {
    await this.page.locator(this.recoveryInput).fill(code);
  }

  async submitRecoveryCode(): Promise<void> {
    await this.page.locator(this.submitButton).click();
  }

  // ── Shared navigation ───────────────────────────────────────────────────

  async goBackToLogin(): Promise<void> {
    await this.page.locator(this.backToLoginButton).click();
  }
}
