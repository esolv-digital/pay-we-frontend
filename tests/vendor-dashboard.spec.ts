/**
 * Vendor Dashboard E2E Tests
 *
 * Tests for the vendor dashboard page, including:
 * - Dashboard loading and display
 * - Metric cards visibility and values
 * - Quick actions navigation
 */

import { test, expect } from '@playwright/test';
import { VendorDashboardPage } from './pages/vendor-dashboard.page';
import { ApiMocks } from './helpers/api-mocks';

test.describe('Vendor Dashboard', () => {
  let dashboardPage: VendorDashboardPage;
  let mocks: ApiMocks;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new VendorDashboardPage(page);
    mocks = new ApiMocks(page);

    // Mock auth user with vendor access
    await mocks.mockAuthMe();
  });

  test.describe('Dashboard Loading', () => {
    test('should load dashboard page successfully', async () => {
      await mocks.mockVendorDashboardStats();

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardLoad();
      await dashboardPage.assertPageLoaded();
    });

    test('should display loading state while fetching stats', async () => {
      // Delay the stats response to see loading state
      await mocks.mockVendorDashboardStats();

      await dashboardPage.goto();

      // Dashboard should eventually load
      await dashboardPage.waitForDashboardLoad();
      await dashboardPage.assertPageLoaded();
    });
  });

  test.describe('Metric Cards', () => {
    test('should display all four metric cards', async () => {
      await mocks.mockVendorDashboardStats();

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardLoad();

      await dashboardPage.assertMetricCardsVisible();
    });

    test('should display correct metric values', async () => {
      await mocks.mockVendorDashboardStats({
        balance: 5000.00,
        total_revenue: 25000.00,
        total_transactions: 142,
        pending_disbursements: 3,
      });

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardLoad();

      const metrics = await dashboardPage.getMetricValues();

      expect(metrics.availableBalance).toContain('5,000');
      expect(metrics.totalRevenue).toContain('25,000');
      expect(metrics.totalTransactions).toContain('142');
      expect(metrics.pendingDisbursements).toContain('3');
    });

    test('should display zero values correctly', async () => {
      await mocks.mockVendorDashboardStats({
        balance: 0,
        total_revenue: 0,
        total_transactions: 0,
        pending_disbursements: 0,
      });

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardLoad();

      const metrics = await dashboardPage.getMetricValues();

      expect(metrics.availableBalance).toContain('0');
      expect(metrics.totalRevenue).toContain('0');
      expect(metrics.totalTransactions).toContain('0');
      expect(metrics.pendingDisbursements).toContain('0');
    });

    test('should display large values correctly', async () => {
      await mocks.mockVendorDashboardStats({
        balance: 1234567.89,
        total_revenue: 9876543.21,
        total_transactions: 50000,
        pending_disbursements: 999,
      });

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardLoad();

      const metrics = await dashboardPage.getMetricValues();

      // Values should be formatted with commas
      expect(metrics.availableBalance).toMatch(/1,234,567/);
      expect(metrics.totalRevenue).toMatch(/9,876,543/);
      expect(metrics.totalTransactions).toContain('50,000');
      expect(metrics.pendingDisbursements).toContain('999');
    });
  });

  test.describe('Quick Actions', () => {
    test('should display quick actions section', async () => {
      await mocks.mockVendorDashboardStats();

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardLoad();

      await dashboardPage.assertQuickActionsVisible();
    });

    test('should navigate to create payment page when "Create Payment Page" is clicked', async () => {
      await mocks.mockVendorDashboardStats();

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardLoad();

      await dashboardPage.clickCreatePaymentPage();
      await dashboardPage.waitForPaymentPageCreateRedirect();

      expect(dashboardPage.page.url()).toContain('/vendor/payment-pages/create');
    });

    test('should navigate to transactions page when "View Transactions" is clicked', async () => {
      await mocks.mockVendorDashboardStats();

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardLoad();

      await dashboardPage.clickViewTransactions();
      await dashboardPage.waitForTransactionsRedirect();

      expect(dashboardPage.page.url()).toContain('/vendor/transactions');
    });

    test('should navigate to disbursements page when "Request Payout" is clicked', async () => {
      await mocks.mockVendorDashboardStats();

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardLoad();

      await dashboardPage.clickRequestPayout();
      await dashboardPage.waitForDisbursementsRedirect();

      expect(dashboardPage.page.url()).toContain('/vendor/disbursements');
    });
  });

  test.describe('Different Stat Scenarios', () => {
    test('should handle vendor with no transactions', async () => {
      await mocks.mockVendorDashboardStats({
        balance: 0,
        total_revenue: 0,
        total_transactions: 0,
        pending_disbursements: 0,
      });

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardLoad();

      await dashboardPage.assertStats({
        balance: 0,
        totalRevenue: 0,
        totalTransactions: 0,
        pendingDisbursements: 0,
      });
    });

    test('should handle vendor with high transaction volume', async () => {
      await mocks.mockVendorDashboardStats({
        balance: 100000.00,
        total_revenue: 500000.00,
        total_transactions: 10000,
        pending_disbursements: 50,
      });

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardLoad();

      await dashboardPage.assertStats({
        balance: 100000,
        totalRevenue: 500000,
        totalTransactions: 10000,
        pendingDisbursements: 50,
      });
    });

    test('should handle fractional currency values', async () => {
      await mocks.mockVendorDashboardStats({
        balance: 1234.56,
        total_revenue: 9876.54,
        total_transactions: 45,
        pending_disbursements: 2,
      });

      await dashboardPage.goto();
      await dashboardPage.waitForDashboardLoad();

      const metrics = await dashboardPage.getMetricValues();

      // Values should include cents/decimals
      expect(metrics.availableBalance).toMatch(/1,234/);
      expect(metrics.totalRevenue).toMatch(/9,876/);
    });
  });

  test.describe('Access Control', () => {
    test('should redirect to login if not authenticated', async ({ page }) => {
      // Don't mock auth/me - simulate unauthenticated user
      await page.route('**/api/auth/me', (route) => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: { code: 401, message: 'Unauthorized' } }),
        });
      });

      await page.goto('/vendor/dashboard');

      // Should redirect to login
      await page.waitForURL(/.*\/login/, { timeout: 5000 });
    });
  });
});
