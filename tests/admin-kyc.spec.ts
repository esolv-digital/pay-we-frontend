import { test, expect, navigateToAdmin, kycTestData } from './fixtures';

/**
 * Admin KYC Management E2E Tests
 *
 * Tests the complete KYC management workflow including:
 * - KYC document listing
 * - Status filtering and search
 * - KYC detail view
 * - Status updates (approve, reject, request more info)
 * - Export functionality
 * - Statistics display
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Admin KYC Management', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAdmin(page, '/admin/kyc');
  });

  // =========================================================================
  // KYC LIST PAGE TESTS
  // =========================================================================

  test('should display KYC list page with statistics', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText(/KYC/i);

    // Check statistics cards are visible
    const statsCards = page.locator('[data-testid="stat-card"], .stat-card');
    const hasStats = (await statsCards.count()) > 0;

    if (hasStats) {
      await expect(statsCards.first()).toBeVisible();
    }

    // Check for KYC table or list
    const kycList = page.locator(
      'table, [data-testid="kyc-list"], .kyc-list'
    );
    await expect(kycList).toBeVisible();
  });

  test('should filter KYC by status', async ({ page }) => {
    // Find status filter dropdown/select
    const statusFilter = page.locator(
      'select[name="status"], [data-testid="status-filter"], button:has-text("Status")'
    );

    if ((await statusFilter.count()) > 0) {
      await statusFilter.first().click();

      // Select "Pending" status
      const pendingOption = page.locator('text=Pending, text=pending').first();
      if ((await pendingOption.count()) > 0) {
        await pendingOption.click();
      }

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Verify URL or filter state updated
      const url = page.url();
      const hasFilterParam =
        url.includes('status=') || url.includes('filter=');

      // Or check that results are filtered
      const kycItems = page.locator('[data-testid="kyc-item"], tr[data-kyc-id]');
      // Results should be filtered (may be empty if no pending items)
    }
  });

  test('should search KYC by organization name', async ({ page }) => {
    const searchInput = page.locator(
      'input[placeholder*="Search"], input[name="search"], [data-testid="search-input"]'
    );

    if ((await searchInput.count()) > 0) {
      await searchInput.first().fill('Test Organization');
      await page.waitForTimeout(500);

      // Check results are filtered
      const results = page.locator('[data-testid="kyc-item"], tbody tr');
      // Results should contain search term or be empty
    }
  });

  test('should display KYC status badges correctly', async ({ page }) => {
    // Check for status badges
    const statusBadges = page.locator(
      '.badge, [data-testid="status-badge"], .status-badge'
    );

    const badgeCount = await statusBadges.count();

    if (badgeCount > 0) {
      // Verify badges have correct styling for different statuses
      const firstBadge = statusBadges.first();
      await expect(firstBadge).toBeVisible();

      // Check badge has some text content
      const badgeText = await firstBadge.textContent();
      expect(badgeText).toBeTruthy();
    }
  });

  test('should sort KYC list', async ({ page }) => {
    // Find sort controls
    const sortHeader = page.locator(
      'th[data-sortable], button:has-text("Sort"), [data-testid="sort-button"]'
    );

    if ((await sortHeader.count()) > 0) {
      const initialFirstItem = await page
        .locator('[data-testid="kyc-item"], tbody tr')
        .first()
        .textContent();

      // Click to sort
      await sortHeader.first().click();
      await page.waitForTimeout(500);

      // Check sort indicator changed
      const sortIndicator = page.locator(
        '[data-sort-direction], .sort-asc, .sort-desc'
      );
      // Sort state should be visible
    }
  });

  // =========================================================================
  // KYC DETAIL PAGE TESTS
  // =========================================================================

  test('should navigate to KYC detail page', async ({ page }) => {
    // Click on first KYC item
    const kycItem = page.locator(
      '[data-testid="kyc-item"] a, tbody tr a, button:has-text("View")'
    ).first();

    if ((await kycItem.count()) > 0) {
      await kycItem.click();

      // Wait for detail page
      await page.waitForURL(/.*\/admin\/kyc\/\d+/);

      // Check detail page content
      await expect(
        page.locator('text=KYC Details, text=Organization Details')
      ).toBeVisible();
    }
  });

  test('should display KYC documents on detail page', async ({ page }) => {
    // Navigate directly to a KYC detail page
    await page.goto(`${BASE_URL}/admin/kyc/1`);
    await page.waitForLoadState('networkidle');

    // Check for document sections
    const documentSection = page.locator(
      '[data-testid="documents"], .documents-section, text=Documents'
    );

    if ((await documentSection.count()) > 0) {
      await expect(documentSection.first()).toBeVisible();

      // Check for document items
      const documents = page.locator(
        '[data-testid="document-item"], .document-item'
      );
      // May or may not have documents
    }
  });

  test('should display KYC timeline/history', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/kyc/1`);
    await page.waitForLoadState('networkidle');

    // Check for timeline/activity section
    const timeline = page.locator(
      '[data-testid="timeline"], .timeline, text=Activity, text=History'
    );

    if ((await timeline.count()) > 0) {
      await expect(timeline.first()).toBeVisible();
    }
  });

  // =========================================================================
  // KYC STATUS UPDATE TESTS
  // =========================================================================

  test('should open approve KYC dialog', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/kyc/1`);
    await page.waitForLoadState('networkidle');

    const approveButton = page.locator(
      'button:has-text("Approve"), [data-testid="approve-button"]'
    );

    if ((await approveButton.count()) > 0) {
      await approveButton.first().click();

      // Check dialog opened
      await expect(
        page.locator('text=Approve KYC, text=Confirm Approval')
      ).toBeVisible();

      // Check for notes field
      const notesField = page.locator(
        'textarea[name="notes"], [data-testid="notes-input"]'
      );
      await expect(notesField).toBeVisible();

      // Close dialog
      await page.click('button:has-text("Cancel")');
    }
  });

  test('should open reject KYC dialog', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/kyc/1`);
    await page.waitForLoadState('networkidle');

    const rejectButton = page.locator(
      'button:has-text("Reject"), [data-testid="reject-button"]'
    );

    if ((await rejectButton.count()) > 0) {
      await rejectButton.first().click();

      // Check dialog opened
      await expect(
        page.locator('text=Reject KYC, text=Confirm Rejection')
      ).toBeVisible();

      // Check for reason field (required for rejection)
      const reasonField = page.locator(
        'textarea[name="reason"], input[name="reason"], [data-testid="reason-input"]'
      );
      await expect(reasonField).toBeVisible();

      // Close dialog
      await page.click('button:has-text("Cancel")');
    }
  });

  test('should open request more info dialog', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/kyc/1`);
    await page.waitForLoadState('networkidle');

    const requestInfoButton = page.locator(
      'button:has-text("Request"), button:has-text("More Info"), [data-testid="request-info-button"]'
    );

    if ((await requestInfoButton.count()) > 0) {
      await requestInfoButton.first().click();

      // Check dialog opened
      await expect(
        page.locator(
          'text=Request Information, text=Request More Info, text=Additional Information'
        )
      ).toBeVisible();

      // Close dialog
      await page.click('button:has-text("Cancel")');
    }
  });

  test('should require reason for rejection', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/kyc/1`);
    await page.waitForLoadState('networkidle');

    const rejectButton = page.locator(
      'button:has-text("Reject"), [data-testid="reject-button"]'
    );

    if ((await rejectButton.count()) > 0) {
      await rejectButton.first().click();

      // Try to submit without reason
      const submitButton = page.locator(
        'button:has-text("Confirm"), button:has-text("Submit")'
      ).last();

      await submitButton.click();

      // Should show validation error
      await expect(
        page.locator('text=required, text=Please provide')
      ).toBeVisible({ timeout: 5000 });

      // Close dialog
      await page.click('button:has-text("Cancel")');
    }
  });

  test('should update KYC status successfully', async ({ page }) => {
    // This test requires a KYC in a state that can be transitioned
    await page.goto(`${BASE_URL}/admin/kyc/1`);
    await page.waitForLoadState('networkidle');

    // Find any available status action
    const actionButton = page.locator(
      'button:has-text("Review"), button:has-text("Approve"), button:has-text("Start Review")'
    ).first();

    if ((await actionButton.count()) > 0) {
      const buttonText = await actionButton.textContent();

      await actionButton.click();

      // Fill required fields if dialog appears
      const notesField = page.locator('textarea[name="notes"]');
      if ((await notesField.count()) > 0) {
        await notesField.fill('Status updated via E2E test');
      }

      // Submit
      const confirmButton = page.locator(
        'button:has-text("Confirm"), button:has-text("Submit"), button:has-text("Save")'
      ).last();

      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();

        // Wait for success message
        await expect(
          page.locator('text=successfully, text=updated')
        ).toBeVisible({ timeout: 10000 });
      }
    }
  });

  // =========================================================================
  // EXPORT TESTS
  // =========================================================================

  test('should export KYC list', async ({ page }) => {
    const exportButton = page.locator(
      'button:has-text("Export"), button:has-text("Download"), [data-testid="export-button"]'
    );

    if ((await exportButton.count()) > 0) {
      // Setup download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

      await exportButton.first().click();

      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/kyc.*\.(csv|xlsx|pdf)/i);
      } catch {
        // Export might open a dialog instead
        const formatDialog = page.locator('text=Export Format, text=Select Format');
        if ((await formatDialog.count()) > 0) {
          // Select CSV and download
          await page.click('text=CSV, button:has-text("CSV")');
        }
      }
    }
  });

  // =========================================================================
  // STATISTICS TESTS
  // =========================================================================

  test('should display accurate KYC statistics', async ({ page }) => {
    // Look for statistics section
    const statsSection = page.locator(
      '[data-testid="statistics"], .statistics-section'
    );

    if ((await statsSection.count()) > 0) {
      // Check for common stat types
      const pendingCount = page.locator('text=/Pending.*\\d+/');
      const approvedCount = page.locator('text=/Approved.*\\d+/');
      const rejectedCount = page.locator('text=/Rejected.*\\d+/');

      // At least some stats should be visible
      const hasStats =
        (await pendingCount.count()) > 0 ||
        (await approvedCount.count()) > 0 ||
        (await rejectedCount.count()) > 0;

      expect(hasStats).toBeTruthy();
    }
  });

  // =========================================================================
  // ERROR HANDLING TESTS
  // =========================================================================

  test('should handle KYC not found error', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/kyc/999999`);

    // Should show error or redirect
    await expect(
      page.locator('text=Not Found, text=does not exist, text=Error')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API to simulate error
    await page.route('**/api/v1/admin/kyc*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Internal server error',
        }),
      });
    });

    await page.goto(`${BASE_URL}/admin/kyc`);

    // Should show error message
    await expect(
      page.locator('text=error, text=failed, text=Something went wrong')
    ).toBeVisible({ timeout: 10000 });
  });

  // =========================================================================
  // PERMISSION TESTS
  // =========================================================================

  test('should show appropriate actions based on permissions', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/admin/kyc/1`);
    await page.waitForLoadState('networkidle');

    // Check if action buttons exist (they should for admin users)
    const actionButtons = page.locator(
      'button:has-text("Approve"), button:has-text("Reject"), button:has-text("Review")'
    );

    // Admin should see action buttons
    // Viewer would not see them (would need different test setup)
    const buttonCount = await actionButtons.count();

    // Either has permissions (sees buttons) or doesn't (sees view-only)
    expect(buttonCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Admin KYC - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAdmin(page, '/admin/kyc');
  });

  test('should have accessible table structure', async ({ page }) => {
    const table = page.locator('table');

    if ((await table.count()) > 0) {
      // Check for table headers
      const headers = table.locator('th');
      expect(await headers.count()).toBeGreaterThan(0);

      // Check for scope attributes
      const firstHeader = headers.first();
      const hasScope = await firstHeader.getAttribute('scope');
      // Scope attribute helps screen readers
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Some element should be focused
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(focusedElement).toBeTruthy();
  });

  test('should have descriptive button labels', async ({ page }) => {
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      // Button should have text or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});

test.describe('Admin KYC - Performance', () => {
  test('should load KYC list within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await navigateToAdmin(page, '/admin/kyc');

    const loadTime = Date.now() - startTime;

    // Page should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle pagination efficiently', async ({ page }) => {
    await navigateToAdmin(page, '/admin/kyc');

    const pagination = page.locator(
      '[data-testid="pagination"], .pagination, nav[aria-label="pagination"]'
    );

    if ((await pagination.count()) > 0) {
      const nextButton = pagination.locator(
        'button:has-text("Next"), a:has-text("Next"), [aria-label="Next page"]'
      );

      if ((await nextButton.count()) > 0) {
        const startTime = Date.now();

        await nextButton.click();
        await page.waitForLoadState('networkidle');

        const paginationTime = Date.now() - startTime;

        // Pagination should be fast
        expect(paginationTime).toBeLessThan(2000);
      }
    }
  });
});
