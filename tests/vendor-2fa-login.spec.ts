import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { TwoFactorPage } from './pages/two-factor.page';
import { ApiMocks } from './helpers/api-mocks';
import { createTestUser } from './fixtures/test-data';

/**
 * 2FA Login-Flow E2E Tests
 *
 * All API calls are intercepted via Playwright route mocks so these tests
 * run without a live backend.  The mocks mirror the { success, data }
 * envelope that ApiClient expects.
 *
 * Test organisation (mirrors the user journey):
 *   1. Login triggers 2FA redirect
 *   2. Code-verification page
 *   3. TOTP code submission (success & failure)
 *   4. Recovery-code fallback (success & failure)
 *   5. Navigation & edge cases
 */

test.describe('2FA Login Flow', () => {
  let loginPage: LoginPage;
  let twoFactorPage: TwoFactorPage;
  let mocks: ApiMocks;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    twoFactorPage = new TwoFactorPage(page);
    mocks = new ApiMocks(page);
  });

  // ── 1. Login triggers 2FA redirect ──────────────────────────────────────

  test.describe('Login triggers 2FA', () => {
    test('should redirect to verify-2fa when backend returns two_factor_required', async ({ page }) => {
      const testUser = createTestUser();
      await mocks.mockLoginRequiring2FA(testUser.email);

      await loginPage.goto();
      await loginPage.login(testUser.email, testUser.password);

      // loginMutation detects the flag and pushes to verify-2fa
      await loginPage.waitFor2FAScreen();
      expect(page.url()).toContain('/login/verify-2fa');
      expect(page.url()).toContain(encodeURIComponent(testUser.email));
    });
  });

  // ── 2. Code-verification page ───────────────────────────────────────────

  test.describe('2FA Code Page', () => {
    test('should display code page with the user email', async () => {
      const email = 'vendor@example.com';
      await twoFactorPage.goto(email);

      await twoFactorPage.assertCodePageLoaded();
      await twoFactorPage.assertEmailDisplayed(email);
      await twoFactorPage.assertNoError();
    });

    test('should redirect to /login when email param is missing', async ({ page }) => {
      await page.goto('/login/verify-2fa'); // no ?email=

      // Client-side useEffect redirects
      await page.waitForURL(/.*\/login$/, { timeout: 8000 });
    });
  });

  // ── 3. TOTP code submission ──────────────────────────────────────────────

  test.describe('TOTP Code Verification', () => {
    test('should verify a valid code and redirect to vendor dashboard', async ({ page }) => {
      const email = 'vendor@example.com';
      await mocks.mockVerify2FASuccess();
      await mocks.mockAuthMe(email); // dashboard will fetch /auth/me

      await twoFactorPage.goto(email);
      await twoFactorPage.assertCodePageLoaded();

      // 6-digit code auto-submits on the last keystroke
      await twoFactorPage.enterAndSubmitCode('123456');

      await page.waitForURL(/.*\/vendor\/dashboard/, { timeout: 10000 });
    });

    test('should show error for an invalid code', async () => {
      const email = 'vendor@example.com';
      await mocks.mockVerify2FAFailure('The provided code is invalid.');

      await twoFactorPage.goto(email);
      await twoFactorPage.assertCodePageLoaded();

      await twoFactorPage.enterAndSubmitCode('000000');

      await twoFactorPage.assertError();
    });

    test('should clear all digit inputs on reset', async () => {
      const email = 'vendor@example.com';
      await twoFactorPage.goto(email);
      await twoFactorPage.assertCodePageLoaded();

      // Type two digits then clear
      await twoFactorPage.page.locator('input[inputmode="numeric"]').first().focus();
      await twoFactorPage.page.keyboard.type('12');
      await twoFactorPage.clearCode();

      // Every input should be empty
      const inputs = twoFactorPage.page.locator('input[inputmode="numeric"]');
      for (let i = 0; i < 6; i++) {
        await expect(inputs.nth(i)).toHaveValue('');
      }
    });
  });

  // ── 4. Recovery-code fallback ────────────────────────────────────────────

  test.describe('Recovery Code Fallback', () => {
    test('should switch from code mode to recovery mode', async () => {
      await twoFactorPage.goto('vendor@example.com');
      await twoFactorPage.assertCodePageLoaded();

      await twoFactorPage.switchToRecoveryMode();
      await twoFactorPage.assertRecoveryPageLoaded();
    });

    test('should verify a valid recovery code and redirect to dashboard', async ({ page }) => {
      const email = 'vendor@example.com';
      await mocks.mockVerify2FASuccess();
      await mocks.mockAuthMe(email);

      await twoFactorPage.goto(email);
      await twoFactorPage.switchToRecoveryMode();
      await twoFactorPage.assertRecoveryPageLoaded();

      await twoFactorPage.enterRecoveryCode('abc12-def34');
      await twoFactorPage.submitRecoveryCode();

      await page.waitForURL(/.*\/vendor\/dashboard/, { timeout: 10000 });
    });

    test('should show error for an invalid recovery code', async () => {
      const email = 'vendor@example.com';
      await mocks.mockVerify2FAFailure('Recovery code is invalid or has already been used.');

      await twoFactorPage.goto(email);
      await twoFactorPage.switchToRecoveryMode();
      await twoFactorPage.assertRecoveryPageLoaded();

      await twoFactorPage.enterRecoveryCode('invalid-code');
      await twoFactorPage.submitRecoveryCode();

      await twoFactorPage.assertError();
    });

    test('should switch back to code mode from recovery mode', async () => {
      await twoFactorPage.goto('vendor@example.com');
      await twoFactorPage.switchToRecoveryMode();
      await twoFactorPage.assertRecoveryPageLoaded();

      await twoFactorPage.switchToCodeMode();
      await twoFactorPage.assertCodePageLoaded();
    });
  });

  // ── 5. Navigation & edge cases ───────────────────────────────────────────

  test.describe('Navigation', () => {
    test('should return to /login when the user clicks Back to login', async ({ page }) => {
      await twoFactorPage.goto('vendor@example.com');
      await twoFactorPage.assertCodePageLoaded();

      await twoFactorPage.goBackToLogin();
      await page.waitForURL(/.*\/login$/, { timeout: 5000 });
    });

    test('should keep the email visible across code ↔ recovery mode switches', async () => {
      const email = 'vendor@example.com';
      await twoFactorPage.goto(email);

      // Code mode
      await twoFactorPage.assertEmailDisplayed(email);

      // → recovery
      await twoFactorPage.switchToRecoveryMode();
      await twoFactorPage.assertEmailDisplayed(email);

      // → back to code
      await twoFactorPage.switchToCodeMode();
      await twoFactorPage.assertEmailDisplayed(email);
    });

    test('should clear the previous error when switching to recovery mode', async () => {
      const email = 'vendor@example.com';
      await mocks.mockVerify2FAFailure();

      await twoFactorPage.goto(email);

      // Trigger an error in code mode
      await twoFactorPage.enterAndSubmitCode('000000');
      await twoFactorPage.assertError();

      // Switching mode resets error state
      await twoFactorPage.switchToRecoveryMode();
      await twoFactorPage.assertNoError();
    });
  });
});
