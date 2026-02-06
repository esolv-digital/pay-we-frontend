import { Page, expect } from '@playwright/test';

/**
 * Page Object Model for Vendor Transactions Page
 *
 * Handles all interactions with the vendor transactions page
 */
export class VendorTransactionsPage {
  constructor(readonly page: Page) {}

  // Selectors
  private readonly pageTitle = 'h1:has-text("Transactions")';
  private readonly loadingIndicator = '.animate-pulse';
  private readonly searchInput = 'input[placeholder*="Reference"]';
  private readonly statusFilter = '#status-filter';
  private readonly dateRangeFilter = '#date-range-filter';
  private readonly settlementFilter = '#settlement-filter';
  private readonly perPageFilter = '#per-page-filter';
  private readonly applyFiltersButton = 'button:has-text("Apply Filters")';
  private readonly clearFiltersButton = 'button:has-text("Clear All Filters")';
  private readonly exportCSVButton = 'button:has-text("Export CSV")';
  private readonly exportExcelButton = 'button:has-text("Export Excel")';

  /**
   * Navigate to vendor transactions page
   */
  async goto() {
    await this.page.goto('/vendor/transactions');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for transactions page to finish loading
   */
  async waitForTransactionsLoad() {
    // Wait for loading indicator to disappear (if present)
    const loadingLocator = this.page.locator(this.loadingIndicator);
    if (await loadingLocator.count() > 0) {
      await this.page.waitForSelector(this.loadingIndicator, { state: 'detached', timeout: 10000 });
    }
  }

  /**
   * Assert transactions page is loaded
   */
  async assertPageLoaded() {
    await expect(this.page.locator(this.pageTitle)).toBeVisible();
  }

  /**
   * Assert metric cards are visible
   */
  async assertMetricCardsVisible() {
    await expect(this.page.locator('text=Total Transactions')).toBeVisible();
    await expect(this.page.locator('text=Successful')).toBeVisible();
    await expect(this.page.locator('text=Pending')).toBeVisible();
    await expect(this.page.locator('text=Failed')).toBeVisible();
  }

  /**
   * Get metric values
   */
  async getMetrics() {
    // Find metric cards and extract values
    const totalTransactions = await this.getMetricCardValue('Total Transactions');
    const successful = await this.getMetricCardValue('Successful');
    const pending = await this.getMetricCardValue('Pending');
    const failed = await this.getMetricCardValue('Failed');

    return {
      totalTransactions,
      successful,
      pending,
      failed,
    };
  }

  /**
   * Get a specific metric card value
   */
  private async getMetricCardValue(title: string): Promise<string> {
    const card = this.page.locator('.bg-white.rounded-lg.shadow', {
      has: this.page.locator(`text=${title}`),
    });
    const value = card.locator('.text-2xl.font-bold').first();
    return await value.textContent() || '';
  }

  /**
   * Enter search query
   */
  async search(query: string) {
    await this.page.fill(this.searchInput, query);
    // Search auto-applies with debounce, wait a bit
    await this.page.waitForTimeout(600);
  }

  /**
   * Clear search
   */
  async clearSearch() {
    await this.page.click(`${this.searchInput} ~ button[aria-label="Clear search"]`);
  }

  /**
   * Select status filter
   */
  async selectStatus(status: string) {
    await this.page.selectOption(this.statusFilter, status);
  }

  /**
   * Select date range filter
   */
  async selectDateRange(range: string) {
    await this.page.selectOption(this.dateRangeFilter, range);
  }

  /**
   * Select settlement filter
   */
  async selectSettlement(value: 'true' | 'false' | '') {
    await this.page.selectOption(this.settlementFilter, value);
  }

  /**
   * Select per page value
   */
  async selectPerPage(value: number) {
    await this.page.selectOption(this.perPageFilter, value.toString());
  }

  /**
   * Click apply filters button
   */
  async applyFilters() {
    await this.page.click(this.applyFiltersButton);
    await this.waitForTransactionsLoad();
  }

  /**
   * Click clear all filters button
   */
  async clearAllFilters() {
    await this.page.click(this.clearFiltersButton);
    await this.waitForTransactionsLoad();
  }

  /**
   * Check if apply filters button is enabled
   */
  async isApplyFiltersEnabled(): Promise<boolean> {
    return await this.page.locator(this.applyFiltersButton).isEnabled();
  }

  /**
   * Check if "Unapplied changes" badge is visible
   */
  async hasUnappliedChanges(): Promise<boolean> {
    const badge = this.page.locator('text=Unapplied changes');
    return await badge.count() > 0;
  }

  /**
   * Click export CSV button
   */
  async exportCSV() {
    await this.page.click(this.exportCSVButton);
  }

  /**
   * Click export Excel button
   */
  async exportExcel() {
    await this.page.click(this.exportExcelButton);
  }

  /**
   * Get table rows count
   */
  async getTransactionRowsCount(): Promise<number> {
    const rows = this.page.locator('tbody tr');
    return await rows.count();
  }

  /**
   * Get transaction data from table
   */
  async getTransactionRows() {
    const rows = this.page.locator('tbody tr');
    const count = await rows.count();
    const transactions = [];

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const reference = await row.locator('td').nth(0).textContent();
      const customer = await row.locator('td').nth(1).textContent();
      const amount = await row.locator('td').nth(2).textContent();
      const status = await row.locator('td').nth(3).textContent();
      const date = await row.locator('td').nth(4).textContent();

      transactions.push({
        reference: reference?.trim() || '',
        customer: customer?.trim() || '',
        amount: amount?.trim() || '',
        status: status?.trim() || '',
        date: date?.trim() || '',
      });
    }

    return transactions;
  }

  /**
   * Click on a transaction's "View Details" link
   */
  async clickViewDetails(index: number = 0) {
    const viewDetailsLink = this.page.locator('a:has-text("View Details")').nth(index);
    await viewDetailsLink.click();
  }

  /**
   * Assert "No transactions found" message is visible
   */
  async assertNoTransactionsFound() {
    await expect(this.page.locator('text=No transactions found')).toBeVisible();
  }

  /**
   * Assert pagination info shows correct range
   */
  async assertPaginationInfo(from: number, to: number, total: number) {
    const infoText = `Showing ${from} to ${to} of ${total} transactions`;
    await expect(this.page.locator(`text=${infoText}`)).toBeVisible();
  }

  /**
   * Click on a specific page number
   */
  async goToPage(pageNumber: number) {
    await this.page.click(`button:has-text("${pageNumber}")`);
    await this.waitForTransactionsLoad();
  }

  /**
   * Click "Previous" button
   */
  async clickPrevious() {
    await this.page.click('button:has-text("Previous")');
    await this.waitForTransactionsLoad();
  }

  /**
   * Click "Next" button
   */
  async clickNext() {
    await this.page.click('button:has-text("Next")');
    await this.waitForTransactionsLoad();
  }

  /**
   * Check if "Previous" button is disabled
   */
  async isPreviousDisabled(): Promise<boolean> {
    return await this.page.locator('button:has-text("Previous")').isDisabled();
  }

  /**
   * Check if "Next" button is disabled
   */
  async isNextDisabled(): Promise<boolean> {
    return await this.page.locator('button:has-text("Next")').isDisabled();
  }

  /**
   * Assert filters section is visible
   */
  async assertFiltersVisible() {
    await expect(this.page.locator('text=Filters')).toBeVisible();
    await expect(this.page.locator(this.searchInput)).toBeVisible();
    await expect(this.page.locator(this.statusFilter)).toBeVisible();
    await expect(this.page.locator(this.dateRangeFilter)).toBeVisible();
  }

  /**
   * Assert loading overlay is visible during refetch
   */
  async assertLoadingOverlayVisible() {
    await expect(this.page.locator('text=Updating transactions...')).toBeVisible();
  }
}
