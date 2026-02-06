/**
 * Vendor Transactions E2E Tests
 *
 * Tests for the vendor transactions page, including:
 * - Transactions list display
 * - Metric cards
 * - Filtering (search, status, date range, settlement)
 * - Pagination
 * - Export functionality
 */

import { test, expect } from '@playwright/test';
import { VendorTransactionsPage } from './pages/vendor-transactions.page';
import { ApiMocks } from './helpers/api-mocks';

test.describe('Vendor Transactions', () => {
  let transactionsPage: VendorTransactionsPage;
  let mocks: ApiMocks;

  test.beforeEach(async ({ page }) => {
    transactionsPage = new VendorTransactionsPage(page);
    mocks = new ApiMocks(page);

    // Mock auth user with vendor access
    await mocks.mockAuthMe();
  });

  test.describe('Page Loading', () => {
    test('should load transactions page successfully', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();
      await transactionsPage.assertPageLoaded();
    });

    test('should display metric cards', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.assertMetricCardsVisible();
    });

    test('should display correct metric values', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics({
        total_transactions: 142,
        successful_transactions: 120,
        pending_transactions: 15,
        failed_transactions: 7,
      });

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      const metrics = await transactionsPage.getMetrics();

      expect(metrics.totalTransactions).toContain('142');
      expect(metrics.successful).toContain('120');
      expect(metrics.pending).toContain('15');
      expect(metrics.failed).toContain('7');
    });
  });

  test.describe('Transactions List', () => {
    test('should display transactions in table', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      const count = await transactionsPage.getTransactionRowsCount();
      expect(count).toBe(3); // Default mock has 3 transactions
    });

    test('should display transaction details correctly', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      const transactions = await transactionsPage.getTransactionRows();

      expect(transactions[0].reference).toContain('TXN001234');
      expect(transactions[0].customer).toContain('John Doe');
      expect(transactions[0].status).toMatch(/successful/i);
    });

    test('should show empty state when no transactions', async () => {
      await mocks.mockVendorTransactions([], { current_page: 1, total: 0 });
      await mocks.mockTransactionMetrics({
        total_transactions: 0,
        successful_transactions: 0,
        pending_transactions: 0,
        failed_transactions: 0,
      });

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.assertNoTransactionsFound();
    });
  });

  test.describe('Filters', () => {
    test('should display filters section', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.assertFiltersVisible();
    });

    test('should search transactions (auto-apply)', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.search('TXN001234');

      // Search auto-applies after debounce
      await transactionsPage.waitForTransactionsLoad();
    });

    test('should show unapplied changes badge when filters change', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.selectStatus('successful');

      const hasUnapplied = await transactionsPage.hasUnappliedChanges();
      expect(hasUnapplied).toBe(true);
    });

    test('should enable apply button when there are unapplied changes', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.selectStatus('successful');

      const isEnabled = await transactionsPage.isApplyFiltersEnabled();
      expect(isEnabled).toBe(true);
    });

    test('should apply filters when apply button is clicked', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.selectStatus('successful');
      await transactionsPage.applyFilters();

      // After applying, unapplied changes badge should disappear
      const hasUnapplied = await transactionsPage.hasUnappliedChanges();
      expect(hasUnapplied).toBe(false);
    });

    test('should clear all filters when clear button is clicked', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.selectStatus('successful');
      await transactionsPage.selectDateRange('this_month');
      await transactionsPage.clearAllFilters();

      // Filters should reset
      await transactionsPage.waitForTransactionsLoad();
    });

    test('should filter by status', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.selectStatus('successful');
      await transactionsPage.applyFilters();

      await transactionsPage.waitForTransactionsLoad();
    });

    test('should filter by date range', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.selectDateRange('this_month');
      await transactionsPage.applyFilters();

      await transactionsPage.waitForTransactionsLoad();
    });

    test('should filter by settlement status', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.selectSettlement('true');
      await transactionsPage.applyFilters();

      await transactionsPage.waitForTransactionsLoad();
    });

    test('should change per page value', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.selectPerPage(50);
      await transactionsPage.applyFilters();

      await transactionsPage.waitForTransactionsLoad();
    });
  });

  test.describe('Pagination', () => {
    test('should display pagination info', async () => {
      await mocks.mockVendorTransactions(
        [], // Use default transactions
        {
          current_page: 1,
          from: 1,
          last_page: 5,
          per_page: 20,
          to: 20,
          total: 100,
        }
      );
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.assertPaginationInfo(1, 20, 100);
    });

    test('should disable Previous button on first page', async () => {
      await mocks.mockVendorTransactions([], { current_page: 1, last_page: 5 });
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      const isDisabled = await transactionsPage.isPreviousDisabled();
      expect(isDisabled).toBe(true);
    });

    test('should disable Next button on last page', async () => {
      await mocks.mockVendorTransactions([], { current_page: 5, last_page: 5 });
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      const isDisabled = await transactionsPage.isNextDisabled();
      expect(isDisabled).toBe(true);
    });

    test('should navigate to next page', async () => {
      await mocks.mockVendorTransactions([], { current_page: 1, last_page: 5 });
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.clickNext();
      await transactionsPage.waitForTransactionsLoad();
    });

    test('should navigate to specific page', async () => {
      await mocks.mockVendorTransactions([], { current_page: 1, last_page: 5 });
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.goToPage(3);
      await transactionsPage.waitForTransactionsLoad();
    });
  });

  test.describe('Export', () => {
    test('should display export buttons', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await expect(transactionsPage.page.locator('button:has-text("Export CSV")')).toBeVisible();
      await expect(transactionsPage.page.locator('button:has-text("Export Excel")')).toBeVisible();
    });

    test('should trigger CSV export', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();
      await mocks.mockTransactionExport();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.exportCSV();
    });

    test('should trigger Excel export', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();
      await mocks.mockTransactionExport();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.exportExcel();
    });
  });

  test.describe('Transaction Details', () => {
    test('should navigate to transaction details when clicked', async () => {
      await mocks.mockVendorTransactions();
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.clickViewDetails(0);

      // Should navigate to transaction details page
      await transactionsPage.page.waitForURL(/.*\/vendor\/transactions\/txn-1/);
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle very large transaction counts', async () => {
      await mocks.mockVendorTransactions([], {
        current_page: 1,
        from: 1,
        last_page: 500,
        per_page: 20,
        to: 20,
        total: 10000,
      });
      await mocks.mockTransactionMetrics({
        total_transactions: 10000,
        successful_transactions: 8500,
        pending_transactions: 1000,
        failed_transactions: 500,
      });

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      await transactionsPage.assertPaginationInfo(1, 20, 10000);
      const metrics = await transactionsPage.getMetrics();
      expect(metrics.totalTransactions).toContain('10,000');
    });

    test('should handle transactions with missing customer info', async () => {
      await mocks.mockVendorTransactions([
        {
          id: 'txn-1',
          reference: 'TXN001234',
          customer_name: null,
          customer_email: null,
          amount: 250.00,
          currency_code: 'USD',
          status: 'successful',
          settled: true,
          created_at: new Date().toISOString(),
        },
      ]);
      await mocks.mockTransactionMetrics();

      await transactionsPage.goto();
      await transactionsPage.waitForTransactionsLoad();

      const transactions = await transactionsPage.getTransactionRows();
      expect(transactions[0].customer).toContain('N/A');
    });
  });
});
