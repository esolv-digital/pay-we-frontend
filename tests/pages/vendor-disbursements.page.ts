import { Page, expect } from '@playwright/test';

/**
 * Page Object Model for Vendor Disbursements Page
 *
 * Handles all interactions with the vendor disbursements/payouts page
 */
export class VendorDisbursementsPage {
  constructor(readonly page: Page) {}

  // Selectors
  private readonly pageTitle = 'h1:has-text("Disbursements")';
  private readonly requestPayoutButton = 'button:has-text("Request Payout")';

  // Balance cards
  private readonly availableBalanceCard = 'text=Available Balance';
  private readonly pendingPayoutsCard = 'text=Pending Payouts';
  private readonly withdrawableBalanceCard = 'text=Withdrawable Balance';

  // Auto-payout section
  private readonly autoPayoutToggle = 'button[aria-label*="auto-payout"]';
  private readonly autoPayoutSection = 'text=Auto-Payout';
  private readonly defaultAccountSection = 'text=Default Account';

  // Warnings/Alerts
  private readonly noAccountsWarning = 'text=No payout account added';
  private readonly addAccountButton = 'button:has-text("Add Account")';
  private readonly unsettledTransactionsCard = 'text=Unsettled Transactions';

  // Tabs
  private readonly overviewTab = 'button:has-text("Overview")';
  private readonly accountsTab = 'button:has-text("Payout Accounts")';
  private readonly historyTab = 'button:has-text("Payout History")';

  /**
   * Navigate to disbursements page
   */
  async goto() {
    await this.page.goto('/vendor/disbursements');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Assert disbursements page is loaded
   */
  async assertPageLoaded() {
    await expect(this.page.locator(this.pageTitle)).toBeVisible();
  }

  /**
   * Assert balance cards are visible
   */
  async assertBalanceCardsVisible() {
    await expect(this.page.locator(this.availableBalanceCard)).toBeVisible();
    await expect(this.page.locator(this.pendingPayoutsCard)).toBeVisible();
    await expect(this.page.locator(this.withdrawableBalanceCard)).toBeVisible();
  }

  /**
   * Get balance values from cards
   */
  async getBalances() {
    const availableBalance = await this.getCardValue('Available Balance');
    const pendingPayouts = await this.getCardValue('Pending Payouts');
    const withdrawableBalance = await this.getCardValue('Withdrawable Balance');

    return {
      availableBalance,
      pendingPayouts,
      withdrawableBalance,
    };
  }

  /**
   * Get a specific card value by title
   */
  private async getCardValue(title: string): Promise<string> {
    const card = this.page.locator('.bg-white.p-6.rounded-lg.shadow', {
      has: this.page.locator(`text=${title}`),
    });
    const value = card.locator('.text-3xl.font-bold');
    return await value.textContent() || '';
  }

  /**
   * Assert auto-payout section is visible
   */
  async assertAutoPayoutSectionVisible() {
    await expect(this.page.locator(this.autoPayoutSection)).toBeVisible();
  }

  /**
   * Check if auto-payout is enabled
   */
  async isAutoPayoutEnabled(): Promise<boolean> {
    const toggle = this.page.locator(this.autoPayoutToggle);
    const classes = await toggle.getAttribute('class');
    return classes?.includes('bg-blue-600') || false;
  }

  /**
   * Click auto-payout toggle
   */
  async clickAutoPayoutToggle() {
    await this.page.click(this.autoPayoutToggle);
  }

  /**
   * Assert default account is displayed
   */
  async assertDefaultAccountDisplayed(accountName?: string) {
    await expect(this.page.locator(this.defaultAccountSection)).toBeVisible();
    if (accountName) {
      await expect(this.page.locator(`text=${accountName}`)).toBeVisible();
    }
  }

  /**
   * Assert "No default account set" message is visible
   */
  async assertNoDefaultAccountSet() {
    await expect(this.page.locator('text=No default account set')).toBeVisible();
  }

  /**
   * Click "Change" or "Set Default" button in default account section
   */
  async clickChangeDefaultAccount() {
    await this.page.click('button:has-text("Change"), button:has-text("Set Default")');
  }

  /**
   * Assert "Request Payout" button is visible
   */
  async assertRequestPayoutButtonVisible() {
    await expect(this.page.locator(this.requestPayoutButton)).toBeVisible();
  }

  /**
   * Assert "Request Payout" button is disabled
   */
  async assertRequestPayoutButtonDisabled() {
    await expect(this.page.locator(this.requestPayoutButton)).toBeDisabled();
  }

  /**
   * Click "Request Payout" button
   */
  async clickRequestPayout() {
    await this.page.click(this.requestPayoutButton);
  }

  /**
   * Assert "No payout account" warning is visible
   */
  async assertNoAccountsWarningVisible() {
    await expect(this.page.locator(this.noAccountsWarning)).toBeVisible();
  }

  /**
   * Click "Add Account" button in warning
   */
  async clickAddAccountInWarning() {
    await this.page.locator(this.noAccountsWarning).locator('..').locator(this.addAccountButton).click();
  }

  /**
   * Assert unsettled transactions card is visible
   */
  async assertUnsettledTransactionsVisible(count: number, amount: string) {
    await expect(this.page.locator(this.unsettledTransactionsCard)).toBeVisible();
    await expect(this.page.locator(`text=${count} transactions`)).toBeVisible();
    await expect(this.page.locator(`text=${amount}`)).toBeVisible();
  }

  /**
   * Click tab by name
   */
  async clickTab(tabName: 'Overview' | 'Payout Accounts' | 'Payout History') {
    const tabMap = {
      'Overview': this.overviewTab,
      'Payout Accounts': this.accountsTab,
      'Payout History': this.historyTab,
    };
    await this.page.click(tabMap[tabName]);
  }

  /**
   * Assert tab is active
   */
  async assertTabIsActive(tabName: string) {
    const tab = this.page.locator(`button:has-text("${tabName}")`);
    await expect(tab).toHaveClass(/border-blue-500/);
  }

  /**
   * Assert overview tab content is visible
   */
  async assertOverviewTabVisible() {
    await expect(this.page.locator('text=Completed This Month')).toBeVisible();
    await expect(this.page.locator('text=Total Completed')).toBeVisible();
    await expect(this.page.locator('text=Quick Actions')).toBeVisible();
  }

  /**
   * Get recent payouts count
   */
  async getRecentPayoutsCount(): Promise<number> {
    const rows = this.page.locator('tbody tr');
    return await rows.count();
  }

  /**
   * Assert "No payouts yet" message is visible
   */
  async assertNoPayoutsYet() {
    await expect(this.page.locator('text=No payouts yet')).toBeVisible();
  }

  /**
   * Click "View all" link for recent payouts
   */
  async clickViewAllPayouts() {
    await this.page.click('button:has-text("View all")');
  }

  /**
   * Get summary stat values
   */
  async getSummaryStats() {
    const completedThisMonth = await this.getStatValue('Completed This Month');
    const totalCompleted = await this.getStatValue('Total Completed');

    return {
      completedThisMonth,
      totalCompleted,
    };
  }

  /**
   * Get a specific stat value by label
   */
  private async getStatValue(label: string): Promise<string> {
    const stat = this.page.locator('.bg-gray-50.rounded-lg.p-4', {
      has: this.page.locator(`text=${label}`),
    });
    const value = stat.locator('.text-2xl.font-bold');
    return await value.textContent() || '';
  }

  /**
   * Click "Add Payout Account" quick action
   */
  async clickAddPayoutAccountQuickAction() {
    await this.page.locator('button:has-text("Add Payout Account")').first().click();
  }

  /**
   * Click "Request Payout" quick action
   */
  async clickRequestPayoutQuickAction() {
    await this.page.locator('button:has-text("Request Payout")').last().click();
  }

  /**
   * Assert add payout account dialog is visible
   */
  async assertAddAccountDialogVisible() {
    // Dialog should have form for adding account
    await expect(this.page.locator('text=Bank Account, text=Mobile Money')).toBeVisible();
  }

  /**
   * Assert request payout dialog is visible
   */
  async assertRequestPayoutDialogVisible() {
    await expect(this.page.locator('text=Amount')).toBeVisible();
  }

  /**
   * Close dialog
   */
  async closeDialog() {
    await this.page.press('body', 'Escape');
  }

  /**
   * Assert payout accounts list is visible (Accounts tab)
   */
  async assertPayoutAccountsListVisible() {
    // Should be on accounts tab
    await this.assertTabIsActive('Payout Accounts');
  }

  /**
   * Assert payout history table is visible (History tab)
   */
  async assertPayoutHistoryVisible() {
    // Should be on history tab
    await this.assertTabIsActive('Payout History');
  }

  /**
   * Get minimum payout amount text
   */
  async getMinimumPayoutAmount(): Promise<string | null> {
    const minimumText = this.page.locator('text=/Minimum payout:/');
    if (await minimumText.count() > 0) {
      return await minimumText.textContent();
    }
    return null;
  }
}
