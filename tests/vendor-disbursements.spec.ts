/**
 * Vendor Disbursements E2E Tests
 *
 * Tests for the vendor disbursements/payouts page, including:
 * - Balance cards display
 * - Auto-payout toggle
 * - Payout accounts
 * - Unsettled transactions
 * - Tabs navigation
 * - Request payout functionality
 */

import { test, expect } from '@playwright/test';
import { VendorDisbursementsPage } from './pages/vendor-disbursements.page';
import { ApiMocks } from './helpers/api-mocks';

test.describe('Vendor Disbursements', () => {
  let disbursementsPage: VendorDisbursementsPage;
  let mocks: ApiMocks;

  test.beforeEach(async ({ page }) => {
    disbursementsPage = new VendorDisbursementsPage(page);
    mocks = new ApiMocks(page);

    // Mock auth user with vendor access
    await mocks.mockAuthMe();
  });

  test.describe('Page Loading', () => {
    test('should load disbursements page successfully', async () => {
      await mocks.mockDisbursementStatistics();
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();
      await disbursementsPage.assertPageLoaded();
    });

    test('should display balance cards', async () => {
      await mocks.mockDisbursementStatistics();
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();
      await disbursementsPage.assertBalanceCardsVisible();
    });

    test('should display correct balance values', async () => {
      await mocks.mockDisbursementStatistics({
        available_balance: 5000.00,
        pending_payouts: 500.00,
        withdrawable_balance: 4500.00,
      });
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      const balances = await disbursementsPage.getBalances();
      expect(balances.availableBalance).toContain('5,000');
      expect(balances.pendingPayouts).toContain('500');
      expect(balances.withdrawableBalance).toContain('4,500');
    });
  });

  test.describe('Auto-Payout', () => {
    test('should display auto-payout section', async () => {
      await mocks.mockDisbursementStatistics();
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();
      await disbursementsPage.assertAutoPayoutSectionVisible();
    });

    test('should show auto-payout as disabled by default', async () => {
      await mocks.mockDisbursementStatistics({ auto_payout_enabled: false });
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      const isEnabled = await disbursementsPage.isAutoPayoutEnabled();
      expect(isEnabled).toBe(false);
    });

    test('should show auto-payout as enabled when true', async () => {
      await mocks.mockDisbursementStatistics({ auto_payout_enabled: true });
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      const isEnabled = await disbursementsPage.isAutoPayoutEnabled();
      expect(isEnabled).toBe(true);
    });

    test('should toggle auto-payout when clicking toggle', async () => {
      await mocks.mockDisbursementStatistics({ auto_payout_enabled: false });
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();
      await mocks.mockToggleAutoPayout();

      await disbursementsPage.goto();

      await disbursementsPage.clickAutoPayoutToggle();
      // Toggle mutation should be called
    });

    test('should display default account info', async () => {
      await mocks.mockDisbursementStatistics({ has_default_payout_account: true });
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await disbursementsPage.assertDefaultAccountDisplayed('Bank ***1234');
    });

    test('should show "No default account set" when none', async () => {
      await mocks.mockDisbursementStatistics({ has_default_payout_account: false });
      await mocks.mockPayoutAccounts([]);
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await disbursementsPage.assertNoDefaultAccountSet();
    });

    test('should display minimum payout amount', async () => {
      await mocks.mockDisbursementStatistics({ minimum_payout_amount: 10.00 });
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      const minimumText = await disbursementsPage.getMinimumPayoutAmount();
      expect(minimumText).toContain('10');
    });
  });

  test.describe('Payout Accounts', () => {
    test('should show no accounts warning when no accounts exist', async () => {
      await mocks.mockDisbursementStatistics();
      await mocks.mockPayoutAccounts([]);
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await disbursementsPage.assertNoAccountsWarningVisible();
    });

    test('should not show warning when accounts exist', async () => {
      await mocks.mockDisbursementStatistics();
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await expect(disbursementsPage.page.locator('text=No payout account added')).not.toBeVisible();
    });
  });

  test.describe('Unsettled Transactions', () => {
    test('should display unsettled transactions card when present', async () => {
      await mocks.mockDisbursementStatistics({
        unsettled_transaction_count: 5,
        unsettled_amount: 1200.00,
      });
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await disbursementsPage.assertUnsettledTransactionsVisible(5, '1,200');
    });

    test('should not display unsettled card when count is zero', async () => {
      await mocks.mockDisbursementStatistics({
        unsettled_transaction_count: 0,
        unsettled_amount: 0,
      });
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await expect(disbursementsPage.page.locator('text=Unsettled Transactions')).not.toBeVisible();
    });
  });

  test.describe('Request Payout Button', () => {
    test('should display request payout button', async () => {
      await mocks.mockDisbursementStatistics();
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await disbursementsPage.assertRequestPayoutButtonVisible();
    });

    test('should disable button when no accounts', async () => {
      await mocks.mockDisbursementStatistics();
      await mocks.mockPayoutAccounts([]);
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await disbursementsPage.assertRequestPayoutButtonDisabled();
    });

    test('should disable button when withdrawable balance is zero', async () => {
      await mocks.mockDisbursementStatistics({ withdrawable_balance: 0 });
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await disbursementsPage.assertRequestPayoutButtonDisabled();
    });
  });

  test.describe('Tabs Navigation', () => {
    test('should display all tabs', async () => {
      await mocks.mockDisbursementStatistics();
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await expect(disbursementsPage.page.locator('button:has-text("Overview")')).toBeVisible();
      await expect(disbursementsPage.page.locator('button:has-text("Payout Accounts")')).toBeVisible();
      await expect(disbursementsPage.page.locator('button:has-text("Payout History")')).toBeVisible();
    });

    test('should show overview tab as active by default', async () => {
      await mocks.mockDisbursementStatistics();
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await disbursementsPage.assertTabIsActive('Overview');
    });

    test('should display overview tab content', async () => {
      await mocks.mockDisbursementStatistics();
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await disbursementsPage.assertOverviewTabVisible();
    });

    test('should switch to Payout Accounts tab', async () => {
      await mocks.mockDisbursementStatistics();
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await disbursementsPage.clickTab('Payout Accounts');
      await disbursementsPage.assertPayoutAccountsListVisible();
    });

    test('should switch to Payout History tab', async () => {
      await mocks.mockDisbursementStatistics();
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await disbursementsPage.clickTab('Payout History');
      await disbursementsPage.assertPayoutHistoryVisible();
    });
  });

  test.describe('Summary Statistics', () => {
    test('should display summary stats on overview tab', async () => {
      await mocks.mockDisbursementStatistics({
        completed_this_month: 3000.00,
        total_completed: 45000.00,
      });
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      const stats = await disbursementsPage.getSummaryStats();
      expect(stats.completedThisMonth).toContain('3,000');
      expect(stats.totalCompleted).toContain('45,000');
    });

    test('should display zero values correctly', async () => {
      await mocks.mockDisbursementStatistics({
        completed_this_month: 0,
        total_completed: 0,
      });
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      const stats = await disbursementsPage.getSummaryStats();
      expect(stats.completedThisMonth).toContain('0');
      expect(stats.totalCompleted).toContain('0');
    });
  });

  test.describe('Recent Payouts', () => {
    test('should display recent payouts on overview tab', async () => {
      await mocks.mockDisbursementStatistics();
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      const count = await disbursementsPage.getRecentPayoutsCount();
      expect(count).toBe(2); // Default mock has 2 payouts
    });

    test('should show "No payouts yet" when no payouts', async () => {
      await mocks.mockDisbursementStatistics();
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts([], { current_page: 1, total: 0 });

      await disbursementsPage.goto();

      await disbursementsPage.assertNoPayoutsYet();
    });

    test('should navigate to history tab when clicking "View all"', async () => {
      await mocks.mockDisbursementStatistics();
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await disbursementsPage.clickViewAllPayouts();
      await disbursementsPage.assertTabIsActive('Payout History');
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle very large balance values', async () => {
      await mocks.mockDisbursementStatistics({
        available_balance: 1000000.00,
        pending_payouts: 50000.00,
        withdrawable_balance: 950000.00,
      });
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      const balances = await disbursementsPage.getBalances();
      expect(balances.availableBalance).toMatch(/1,000,000/);
      expect(balances.withdrawableBalance).toMatch(/950,000/);
    });

    test('should handle fractional currency values', async () => {
      await mocks.mockDisbursementStatistics({
        available_balance: 1234.56,
        pending_payouts: 123.45,
        withdrawable_balance: 1111.11,
      });
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      const balances = await disbursementsPage.getBalances();
      expect(balances.availableBalance).toContain('1,234');
      expect(balances.withdrawableBalance).toContain('1,111');
    });

    test('should handle many unsettled transactions', async () => {
      await mocks.mockDisbursementStatistics({
        unsettled_transaction_count: 500,
        unsettled_amount: 50000.00,
      });
      await mocks.mockPayoutAccounts();
      await mocks.mockPayouts();

      await disbursementsPage.goto();

      await disbursementsPage.assertUnsettledTransactionsVisible(500, '50,000');
    });
  });
});
