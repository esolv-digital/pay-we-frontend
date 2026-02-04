import { test as base, Page } from '@playwright/test';

/**
 * Authentication Fixtures for PayWe E2E Tests
 *
 * Provides reusable authentication utilities for all test suites.
 */

// Environment configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@paywe.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

// User roles for testing different permission levels
export const testUsers = {
  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@paywe.com',
    password: process.env.SUPER_ADMIN_PASSWORD || 'password',
    role: 'Super Admin',
  },
  admin: {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'Admin',
  },
  viewer: {
    email: process.env.VIEWER_EMAIL || 'viewer@paywe.com',
    password: process.env.VIEWER_PASSWORD || 'password',
    role: 'Viewer',
  },
};

/**
 * Login helper function
 */
export async function login(
  page: Page,
  email: string = ADMIN_EMAIL,
  password: string = ADMIN_PASSWORD
): Promise<void> {
  await page.goto(`${BASE_URL}/login`);

  // Wait for login form to be ready
  await page.waitForSelector('input[type="email"]', { state: 'visible' });

  // Fill credentials
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL(/.*\/(admin|dashboard)/, { timeout: 15000 });
}

/**
 * Logout helper function
 */
export async function logout(page: Page): Promise<void> {
  // Try to find and click logout button
  const logoutButton = page.locator(
    'button:has-text("Logout"), button:has-text("Sign out"), [data-testid="logout-button"]'
  );

  if ((await logoutButton.count()) > 0) {
    await logoutButton.first().click();
    await page.waitForURL(/.*\/login/);
  } else {
    // Fallback: navigate directly to login (clears session)
    await page.goto(`${BASE_URL}/login`);
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Check for presence of auth token in cookies or localStorage
    const cookies = await page.context().cookies();
    const hasAuthCookie = cookies.some(
      (c) => c.name.includes('token') || c.name.includes('session')
    );

    if (hasAuthCookie) return true;

    // Check localStorage
    const hasLocalStorageAuth = await page.evaluate(() => {
      return !!(
        localStorage.getItem('token') || localStorage.getItem('auth_token')
      );
    });

    return hasLocalStorageAuth;
  } catch {
    return false;
  }
}

/**
 * Navigate to admin page with authentication check
 */
export async function navigateToAdmin(
  page: Page,
  path: string = '/admin/dashboard'
): Promise<void> {
  await page.goto(`${BASE_URL}${path}`);
  await page.waitForLoadState('networkidle');

  // If redirected to login, authenticate first
  if (page.url().includes('/login')) {
    await login(page);
    await page.goto(`${BASE_URL}${path}`);
    await page.waitForLoadState('networkidle');
  }
}

// Extended test type with authentication fixtures
type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
  superAdminPage: Page;
};

/**
 * Extended Playwright test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  // Pre-authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    await login(page);
    await use(page);
  },

  // Admin dashboard page fixture
  adminPage: async ({ page }, use) => {
    await login(page, testUsers.admin.email, testUsers.admin.password);
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForLoadState('networkidle');
    await use(page);
  },

  // Super admin page fixture (for elevated permissions)
  superAdminPage: async ({ page }, use) => {
    await login(
      page,
      testUsers.superAdmin.email,
      testUsers.superAdmin.password
    );
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForLoadState('networkidle');
    await use(page);
  },
});

export { expect } from '@playwright/test';
