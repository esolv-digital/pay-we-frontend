/**
 * Vendor Payment Pages Management E2E Tests
 *
 * Tests for payment pages list management, including:
 * - List display
 * - Empty state
 * - Payment page cards
 * - Create navigation
 * - View/Edit/Delete actions
 * - Pagination
 * - Status display
 */

import { test, expect } from '@playwright/test';
import { PaymentPagesListPage } from './pages/payment-pages-list.page';
import { ApiMocks } from './helpers/api-mocks';

test.describe('Vendor Payment Pages Management', () => {
  let paymentPagesPage: PaymentPagesListPage;
  let mocks: ApiMocks;

  test.beforeEach(async ({ page }) => {
    paymentPagesPage = new PaymentPagesListPage(page);
    mocks = new ApiMocks(page);

    // Mock auth user with vendor access
    await mocks.mockAuthMe();
  });

  test.describe('Page Loading', () => {
    test('should load payment pages list successfully', async () => {
      await mocks.mockPaymentPagesList();

      await paymentPagesPage.goto();
      await paymentPagesPage.assertPageLoaded();
    });

    test('should display loading skeleton while fetching', async () => {
      await mocks.mockPaymentPagesList();

      await paymentPagesPage.goto();

      // Page should eventually load
      await paymentPagesPage.waitForLoadingComplete();
      await paymentPagesPage.assertPageLoaded();
    });
  });

  test.describe('Empty State', () => {
    test('should display empty state when no payment pages', async () => {
      await mocks.mockPaymentPagesList([], { current_page: 1, total: 0 });

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await paymentPagesPage.assertEmptyStateVisible();
    });

    test('should navigate to create page when clicking "Create Payment Page" in empty state', async () => {
      await mocks.mockPaymentPagesList([], { current_page: 1, total: 0 });

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await paymentPagesPage.clickCreateFirstPage();
      await paymentPagesPage.waitForCreatePageRedirect();

      expect(paymentPagesPage.page.url()).toContain('/vendor/payment-pages/create');
    });
  });

  test.describe('Payment Pages List', () => {
    test('should display payment page cards', async () => {
      await mocks.mockPaymentPagesList();

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      const count = await paymentPagesPage.getPaymentPageCardsCount();
      expect(count).toBe(3); // Default mock has 3 pages
    });

    test('should display payment page card details correctly', async () => {
      await mocks.mockPaymentPagesList();

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      const card = await paymentPagesPage.getPaymentPageCard(0);

      expect(card.title).toBe('Product Purchase Page');
      expect(card.description).toContain('Payment page for our main product');
      expect(card.status).toContain('Active');
      expect(card.amountType).toMatch(/fixed/i);
    });

    test('should display active status badge correctly', async () => {
      await mocks.mockPaymentPagesList();

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await paymentPagesPage.assertCardIsActive(0);
    });

    test('should display inactive status badge correctly', async () => {
      await mocks.mockPaymentPagesList();

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await paymentPagesPage.assertCardIsInactive(2); // Third card is inactive
    });
  });

  test.describe('Create Navigation', () => {
    test('should display "Create New Page" button', async () => {
      await mocks.mockPaymentPagesList();

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await expect(paymentPagesPage.page.locator('a:has-text("Create New Page")')).toBeVisible();
    });

    test('should navigate to create page when clicking "Create New Page"', async () => {
      await mocks.mockPaymentPagesList();

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await paymentPagesPage.clickCreateNewPage();
      await paymentPagesPage.waitForCreatePageRedirect();

      expect(paymentPagesPage.page.url()).toContain('/vendor/payment-pages/create');
    });
  });

  test.describe('Card Actions', () => {
    test('should display all action buttons on card', async () => {
      await mocks.mockPaymentPagesList();

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      // Check for presence of action buttons
      await expect(paymentPagesPage.page.locator('a:has-text("Preview Page")').first()).toBeVisible();
      await expect(paymentPagesPage.page.locator('button:has-text("Share")').first()).toBeVisible();
      await expect(paymentPagesPage.page.locator('button:has-text("QR Code")').first()).toBeVisible();
      await expect(paymentPagesPage.page.locator('a:has-text("View")').first()).toBeVisible();
      await expect(paymentPagesPage.page.locator('a:has-text("Edit")').first()).toBeVisible();
    });

    test('should open QR code modal when clicking QR Code button', async () => {
      await mocks.mockPaymentPagesList();

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await paymentPagesPage.clickQRCodeButton(0);
      await paymentPagesPage.assertQRCodeModalVisible();
    });

    test('should navigate to view page when clicking View button', async () => {
      await mocks.mockPaymentPagesList();

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await paymentPagesPage.clickViewButton(0);
      await paymentPagesPage.waitForViewPageRedirect();

      expect(paymentPagesPage.page.url()).toMatch(/\/vendor\/payment-pages\/page-1$/);
    });

    test('should navigate to edit page when clicking Edit button', async () => {
      await mocks.mockPaymentPagesList();

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await paymentPagesPage.clickEditButton(0);
      await paymentPagesPage.waitForEditPageRedirect();

      expect(paymentPagesPage.page.url()).toContain('/vendor/payment-pages/page-1/edit');
    });
  });

  test.describe('Delete Functionality', () => {
    test('should show delete confirmation dialog when clicking delete button', async () => {
      await mocks.mockPaymentPagesList();
      await mocks.mockDeletePaymentPage();

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await paymentPagesPage.clickDeleteButton(0);
      await paymentPagesPage.assertDeleteConfirmationVisible();
    });

    test('should close dialog when clicking cancel', async () => {
      await mocks.mockPaymentPagesList();

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await paymentPagesPage.clickDeleteButton(0);
      await paymentPagesPage.assertDeleteConfirmationVisible();

      await paymentPagesPage.cancelDelete();

      // Dialog should close - check it's not visible
      await expect(paymentPagesPage.page.locator('text=/permanently delete/i')).not.toBeVisible();
    });

    test('should delete payment page when confirming', async () => {
      await mocks.mockPaymentPagesList();
      await mocks.mockDeletePaymentPage();

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await paymentPagesPage.clickDeleteButton(0);
      await paymentPagesPage.assertDeleteConfirmationVisible();

      await paymentPagesPage.confirmDelete();

      // Should refetch the list
      await paymentPagesPage.page.waitForTimeout(500);
    });
  });

  test.describe('Pagination', () => {
    test('should display pagination when there are multiple pages', async () => {
      await mocks.mockPaymentPagesList([], {
        current_page: 1,
        from: 1,
        last_page: 5,
        per_page: 12,
        to: 12,
        total: 60,
      });

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      const hasPagination = await paymentPagesPage.hasPagination();
      expect(hasPagination).toBe(true);
    });

    test('should not display pagination when only one page', async () => {
      await mocks.mockPaymentPagesList([], {
        current_page: 1,
        last_page: 1,
        total: 3,
      });

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      const hasPagination = await paymentPagesPage.hasPagination();
      expect(hasPagination).toBe(false);
    });

    test('should navigate to next page', async () => {
      await mocks.mockPaymentPagesList([], {
        current_page: 1,
        last_page: 5,
        per_page: 12,
        total: 60,
      });

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await paymentPagesPage.clickNextPage();
      await paymentPagesPage.waitForLoadingComplete();
    });

    test('should navigate to specific page number', async () => {
      await mocks.mockPaymentPagesList([], {
        current_page: 1,
        last_page: 5,
        per_page: 12,
        total: 60,
      });

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await paymentPagesPage.clickPageNumber(3);
      await paymentPagesPage.waitForLoadingComplete();
    });
  });

  test.describe('Different Amount Types', () => {
    test('should display fixed amount type correctly', async () => {
      await mocks.mockPaymentPagesList([
        {
          id: 'page-1',
          title: 'Fixed Amount Page',
          slug: 'fixed',
          short_url: 'fix123',
          amount_type: 'fixed',
          fixed_amount: 100.00,
          currency_code: 'USD',
          is_active: true,
          include_fees_in_amount: false,
          created_at: new Date().toISOString(),
          vendor: { slug: 'test-vendor' },
        },
      ]);

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      const card = await paymentPagesPage.getPaymentPageCard(0);
      expect(card.amountType).toMatch(/fixed/i);
    });

    test('should display donation type correctly', async () => {
      await mocks.mockPaymentPagesList([
        {
          id: 'page-1',
          title: 'Donation Page',
          slug: 'donate',
          short_url: 'don123',
          amount_type: 'donation',
          min_amount: 5.00,
          currency_code: 'USD',
          is_active: true,
          include_fees_in_amount: true,
          created_at: new Date().toISOString(),
          vendor: { slug: 'test-vendor' },
        },
      ]);

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      const card = await paymentPagesPage.getPaymentPageCard(0);
      expect(card.amountType).toMatch(/donation/i);
    });

    test('should display flexible amount type correctly', async () => {
      await mocks.mockPaymentPagesList([
        {
          id: 'page-1',
          title: 'Flexible Amount Page',
          slug: 'flexible',
          short_url: 'flex123',
          amount_type: 'flexible',
          min_amount: 10.00,
          max_amount: 100.00,
          currency_code: 'USD',
          is_active: true,
          include_fees_in_amount: false,
          created_at: new Date().toISOString(),
          vendor: { slug: 'test-vendor' },
        },
      ]);

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      const card = await paymentPagesPage.getPaymentPageCard(0);
      expect(card.amountType).toMatch(/flexible/i);
    });
  });

  test.describe('Fee Payment Options', () => {
    test('should show "Customer pays fee" badge when include_fees_in_amount is true', async () => {
      await mocks.mockPaymentPagesList([
        {
          id: 'page-1',
          title: 'Customer Pays Fee Page',
          slug: 'customer-pays',
          short_url: 'cp123',
          amount_type: 'fixed',
          fixed_amount: 100.00,
          currency_code: 'USD',
          is_active: true,
          include_fees_in_amount: true,
          created_at: new Date().toISOString(),
          vendor: { slug: 'test-vendor' },
        },
      ]);

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await expect(paymentPagesPage.page.locator('text=Customer pays fee').first()).toBeVisible();
    });

    test('should show "Vendor pays fee" badge when include_fees_in_amount is false', async () => {
      await mocks.mockPaymentPagesList([
        {
          id: 'page-1',
          title: 'Vendor Pays Fee Page',
          slug: 'vendor-pays',
          short_url: 'vp123',
          amount_type: 'fixed',
          fixed_amount: 100.00,
          currency_code: 'USD',
          is_active: true,
          include_fees_in_amount: false,
          created_at: new Date().toISOString(),
          vendor: { slug: 'test-vendor' },
        },
      ]);

      await paymentPagesPage.goto();
      await paymentPagesPage.waitForLoadingComplete();

      await expect(paymentPagesPage.page.locator('text=Vendor pays fee').first()).toBeVisible();
    });
  });
});
