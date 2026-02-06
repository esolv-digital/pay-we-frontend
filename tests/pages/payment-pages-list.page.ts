import { Page, expect } from '@playwright/test';

/**
 * Page Object Model for Payment Pages List Page
 *
 * Handles interactions with the payment pages list/management view
 */
export class PaymentPagesListPage {
  constructor(readonly page: Page) {}

  // Selectors
  private readonly pageTitle = 'h1:has-text("Payment Pages")';
  private readonly createNewButton = 'a:has-text("Create New Page")';
  private readonly noPaymentPagesMessage = 'text=No payment pages yet';
  private readonly createFirstPageButton = 'a:has-text("Create Payment Page")';

  /**
   * Navigate to payment pages list
   */
  async goto() {
    await this.page.goto('/vendor/payment-pages');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Assert payment pages list page is loaded
   */
  async assertPageLoaded() {
    await expect(this.page.locator(this.pageTitle)).toBeVisible();
  }

  /**
   * Assert empty state is visible
   */
  async assertEmptyStateVisible() {
    await expect(this.page.locator(this.noPaymentPagesMessage)).toBeVisible();
    await expect(this.page.locator(this.createFirstPageButton)).toBeVisible();
  }

  /**
   * Click "Create New Page" button in header
   */
  async clickCreateNewPage() {
    await this.page.click(this.createNewButton);
  }

  /**
   * Click "Create Payment Page" button in empty state
   */
  async clickCreateFirstPage() {
    await this.page.click(this.createFirstPageButton);
  }

  /**
   * Wait for navigation to create page
   */
  async waitForCreatePageRedirect() {
    await this.page.waitForURL(/.*\/vendor\/payment-pages\/create/, { timeout: 10000 });
  }

  /**
   * Get count of payment page cards
   */
  async getPaymentPageCardsCount(): Promise<number> {
    const cards = this.page.locator('.bg-white.rounded-lg.shadow.hover\\:shadow-lg');
    return await cards.count();
  }

  /**
   * Get payment page card data by index
   */
  async getPaymentPageCard(index: number) {
    const card = this.page.locator('.bg-white.rounded-lg.shadow.hover\\:shadow-lg').nth(index);

    const title = await card.locator('h3').textContent();
    const description = await card.locator('p.text-gray-600').first().textContent();
    const status = await card.locator('.px-2.py-1.text-xs.font-medium.rounded-full').first().textContent();
    const amountTypeElement = card.locator('text=Type:').locator('..');
    const amountType = await amountTypeElement.textContent();

    return {
      title: title?.trim() || '',
      description: description?.trim() || '',
      status: status?.trim() || '',
      amountType: amountType?.trim() || '',
    };
  }

  /**
   * Click "Preview Page" button on a payment page card
   */
  async clickPreviewPage(index: number = 0) {
    const card = this.page.locator('.bg-white.rounded-lg.shadow.hover\\:shadow-lg').nth(index);
    await card.locator('a:has-text("Preview Page")').click();
  }

  /**
   * Click "Share" button on a payment page card
   */
  async clickShareButton(index: number = 0) {
    const card = this.page.locator('.bg-white.rounded-lg.shadow.hover\\:shadow-lg').nth(index);
    await card.locator('button:has-text("Share")').click();
  }

  /**
   * Click "QR Code" button on a payment page card
   */
  async clickQRCodeButton(index: number = 0) {
    const card = this.page.locator('.bg-white.rounded-lg.shadow.hover\\:shadow-lg').nth(index);
    await card.locator('button:has-text("QR Code")').click();
  }

  /**
   * Click "View" button on a payment page card
   */
  async clickViewButton(index: number = 0) {
    const card = this.page.locator('.bg-white.rounded-lg.shadow.hover\\:shadow-lg').nth(index);
    await card.locator('a:has-text("View")').click();
  }

  /**
   * Click "Edit" button on a payment page card
   */
  async clickEditButton(index: number = 0) {
    const card = this.page.locator('.bg-white.rounded-lg.shadow.hover\\:shadow-lg').nth(index);
    await card.locator('a:has-text("Edit")').click();
  }

  /**
   * Click delete button on a payment page card
   */
  async clickDeleteButton(index: number = 0) {
    const card = this.page.locator('.bg-white.rounded-lg.shadow.hover\\:shadow-lg').nth(index);
    await card.locator('button').filter({ has: this.page.locator('svg') }).last().click();
  }

  /**
   * Assert delete confirmation dialog is visible
   */
  async assertDeleteConfirmationVisible() {
    await expect(this.page.locator('text=/permanently delete/i')).toBeVisible();
  }

  /**
   * Click confirm delete in dialog
   */
  async confirmDelete() {
    await this.page.locator('button:has-text("Delete")').last().click();
  }

  /**
   * Click cancel in delete dialog
   */
  async cancelDelete() {
    await this.page.locator('button:has-text("Cancel")').click();
  }

  /**
   * Assert QR code modal is visible
   */
  async assertQRCodeModalVisible() {
    await expect(this.page.locator('text=/QR Code/i')).toBeVisible();
  }

  /**
   * Close QR code modal
   */
  async closeQRCodeModal() {
    // Look for close button or click outside modal
    const closeButton = this.page.locator('[aria-label="Close"]').or(
      this.page.locator('button:has-text("Close")')
    );
    await closeButton.click();
  }

  /**
   * Assert payment page card shows active status
   */
  async assertCardIsActive(index: number) {
    const card = this.page.locator('.bg-white.rounded-lg.shadow.hover\\:shadow-lg').nth(index);
    const statusBadge = card.locator('.bg-green-100.text-green-800');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText('Active');
  }

  /**
   * Assert payment page card shows inactive status
   */
  async assertCardIsInactive(index: number) {
    const card = this.page.locator('.bg-white.rounded-lg.shadow.hover\\:shadow-lg').nth(index);
    const statusBadge = card.locator('.bg-gray-100.text-gray-800');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText('Inactive');
  }

  /**
   * Get pagination info
   */
  async hasPagination(): Promise<boolean> {
    const pagination = this.page.locator('button:has-text("Previous")');
    return await pagination.count() > 0;
  }

  /**
   * Click "Previous" page button
   */
  async clickPreviousPage() {
    await this.page.click('button:has-text("Previous")');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click "Next" page button
   */
  async clickNextPage() {
    await this.page.click('button:has-text("Next")');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click specific page number
   */
  async clickPageNumber(pageNum: number) {
    await this.page.click(`button:has-text("${pageNum}")`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Assert page number is active
   */
  async assertPageIsActive(pageNum: number) {
    const pageButton = this.page.locator('button').filter({ hasText: pageNum.toString() });
    await expect(pageButton).toHaveClass(/bg-blue-600/);
  }

  /**
   * Wait for navigation to view page
   */
  async waitForViewPageRedirect() {
    await this.page.waitForURL(/.*\/vendor\/payment-pages\/[^/]+$/, { timeout: 10000 });
  }

  /**
   * Wait for navigation to edit page
   */
  async waitForEditPageRedirect() {
    await this.page.waitForURL(/.*\/vendor\/payment-pages\/[^/]+\/edit/, { timeout: 10000 });
  }

  /**
   * Assert loading skeleton is visible
   */
  async assertLoadingSkeletonVisible() {
    await expect(this.page.locator('.animate-pulse')).toBeVisible();
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete() {
    await this.page.waitForSelector('.animate-pulse', { state: 'detached', timeout: 10000 });
  }
}
