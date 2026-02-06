import { Page, expect } from '@playwright/test';

/**
 * Page Object Model for Vendor Dashboard Page
 *
 * Handles all interactions with the vendor dashboard
 */
export class VendorDashboardPage {
  constructor(readonly page: Page) {}

  // Selectors
  private readonly pageTitle = 'h1:has-text("Dashboard")';
  private readonly loadingIndicator = '.animate-pulse';

  // Metric cards
  private readonly availableBalanceCard = 'text=Available Balance';
  private readonly totalRevenueCard = 'text=Total Revenue';
  private readonly totalTransactionsCard = 'text=Total Transactions';
  private readonly pendingDisbursementsCard = 'text=Pending Disbursements';

  // Quick actions
  private readonly createPaymentPageLink = 'a:has-text("Create Payment Page")';
  private readonly viewTransactionsLink = 'a:has-text("View Transactions")';
  private readonly requestPayoutLink = 'a:has-text("Request Payout")';

  /**
   * Navigate to vendor dashboard
   */
  async goto() {
    await this.page.goto('/vendor/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for dashboard to finish loading
   */
  async waitForDashboardLoad() {
    // Wait for loading indicator to disappear
    await this.page.waitForSelector(this.loadingIndicator, { state: 'detached', timeout: 10000 });
  }

  /**
   * Assert dashboard page is loaded
   */
  async assertPageLoaded() {
    await expect(this.page.locator(this.pageTitle)).toBeVisible();
  }

  /**
   * Assert metric cards are visible
   */
  async assertMetricCardsVisible() {
    await expect(this.page.locator(this.availableBalanceCard)).toBeVisible();
    await expect(this.page.locator(this.totalRevenueCard)).toBeVisible();
    await expect(this.page.locator(this.totalTransactionsCard)).toBeVisible();
    await expect(this.page.locator(this.pendingDisbursementsCard)).toBeVisible();
  }

  /**
   * Get metric values from dashboard
   */
  async getMetricValues() {
    const availableBalance = await this.getMetricValue('Available Balance');
    const totalRevenue = await this.getMetricValue('Total Revenue');
    const totalTransactions = await this.getMetricValue('Total Transactions');
    const pendingDisbursements = await this.getMetricValue('Pending Disbursements');

    return {
      availableBalance,
      totalRevenue,
      totalTransactions,
      pendingDisbursements,
    };
  }

  /**
   * Get a specific metric value by label
   */
  private async getMetricValue(label: string): Promise<string> {
    const metricCard = this.page.locator('.bg-white.p-6.rounded-lg.shadow', {
      has: this.page.locator(`text=${label}`),
    });

    const valueElement = metricCard.locator('.text-2xl.font-bold');
    return await valueElement.textContent() || '';
  }

  /**
   * Assert quick actions section is visible
   */
  async assertQuickActionsVisible() {
    await expect(this.page.locator('text=Quick Actions')).toBeVisible();
    await expect(this.page.locator(this.createPaymentPageLink)).toBeVisible();
    await expect(this.page.locator(this.viewTransactionsLink)).toBeVisible();
    await expect(this.page.locator(this.requestPayoutLink)).toBeVisible();
  }

  /**
   * Click on "Create Payment Page" quick action
   */
  async clickCreatePaymentPage() {
    await this.page.click(this.createPaymentPageLink);
  }

  /**
   * Click on "View Transactions" quick action
   */
  async clickViewTransactions() {
    await this.page.click(this.viewTransactionsLink);
  }

  /**
   * Click on "Request Payout" quick action
   */
  async clickRequestPayout() {
    await this.page.click(this.requestPayoutLink);
  }

  /**
   * Wait for navigation to payment pages create page
   */
  async waitForPaymentPageCreateRedirect() {
    await this.page.waitForURL(/.*\/vendor\/payment-pages\/create/, { timeout: 10000 });
  }

  /**
   * Wait for navigation to transactions page
   */
  async waitForTransactionsRedirect() {
    await this.page.waitForURL(/.*\/vendor\/transactions/, { timeout: 10000 });
  }

  /**
   * Wait for navigation to disbursements page
   */
  async waitForDisbursementsRedirect() {
    await this.page.waitForURL(/.*\/vendor\/disbursements/, { timeout: 10000 });
  }

  /**
   * Assert dashboard shows correct stats
   */
  async assertStats(expectedStats: {
    balance?: number;
    totalRevenue?: number;
    totalTransactions?: number;
    pendingDisbursements?: number;
  }) {
    const metrics = await this.getMetricValues();

    if (expectedStats.balance !== undefined) {
      expect(metrics.availableBalance).toContain(expectedStats.balance.toString());
    }

    if (expectedStats.totalRevenue !== undefined) {
      expect(metrics.totalRevenue).toContain(expectedStats.totalRevenue.toString());
    }

    if (expectedStats.totalTransactions !== undefined) {
      expect(metrics.totalTransactions).toContain(expectedStats.totalTransactions.toString());
    }

    if (expectedStats.pendingDisbursements !== undefined) {
      expect(metrics.pendingDisbursements).toContain(expectedStats.pendingDisbursements.toString());
    }
  }
}
