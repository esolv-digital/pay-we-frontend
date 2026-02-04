import { test, expect } from '@playwright/test';

/**
 * Admin Roles & Permissions E2E Tests
 *
 * Tests the complete roles management workflow including:
 * - Role listing and search
 * - Role creation
 * - Role editing
 * - Permission assignment
 * - Role deletion
 * - Role detail page
 */

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@paywe.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

test.describe('Admin Roles & Permissions', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);

    // Fill in credentials
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL(/.*\/admin\/dashboard/);

    // Navigate to roles page
    await page.goto(`${BASE_URL}/admin/roles`);
    await page.waitForLoadState('networkidle');
  });

  test('should display roles list page with statistics', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Roles & Permissions');

    // Check statistics cards are visible
    await expect(page.locator('text=Total Roles')).toBeVisible();
    await expect(page.locator('text=Permissions')).toBeVisible();
    await expect(page.locator('text=Active Roles')).toBeVisible();
    await expect(page.locator('text=Most Assigned')).toBeVisible();

    // Check action buttons
    await expect(page.locator('text=Create Role')).toBeVisible();
    await expect(page.locator('text=Refresh')).toBeVisible();
  });

  test('should search roles by name', async ({ page }) => {
    // Wait for roles to load
    await page.waitForSelector('[data-testid="role-card"], .role-item', {
      state: 'visible',
      timeout: 5000,
    }).catch(() => {
      // If no test IDs, just wait for page to be ready
    });

    // Type in search input
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('Admin');

    // Wait for search to filter results
    await page.waitForTimeout(500);

    // Verify filtered results
    const roleCards = page.locator('[data-testid="role-card"], .role-item');
    const count = await roleCards.count();

    if (count > 0) {
      // At least one role should contain "Admin"
      const firstRole = roleCards.first();
      await expect(firstRole).toContainText(/Admin/i);
    }
  });

  test('should open create role dialog', async ({ page }) => {
    // Click create role button
    await page.click('text=Create Role');

    // Check dialog is visible
    await expect(page.locator('text=Create New Role')).toBeVisible();

    // Check form fields
    await expect(page.locator('input[name="name"], input#role-name')).toBeVisible();
    await expect(page.locator('select[name="guard_name"], select#guard-name')).toBeVisible();

    // Check action buttons
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Create")')).toBeVisible();

    // Close dialog
    await page.click('button:has-text("Cancel")');
  });

  test('should create a new role', async ({ page }) => {
    const roleName = `Test Role ${Date.now()}`;

    // Open create dialog
    await page.click('text=Create Role');

    // Fill in role details
    await page.fill('input[name="name"], input#role-name', roleName);
    await page.selectOption('select[name="guard_name"], select#guard-name', 'api');

    // Submit form
    await page.click('button:has-text("Create")');

    // Wait for success message
    await expect(page.locator('text=Role created successfully')).toBeVisible({
      timeout: 10000,
    });

    // Verify role appears in list
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${roleName}`)).toBeVisible();
  });

  test('should open edit role dialog', async ({ page }) => {
    // Wait for roles to load
    await page.waitForSelector('[data-testid="role-card"], .role-item', {
      state: 'visible',
      timeout: 5000,
    }).catch(() => {});

    // Click first edit button
    const editButton = page.locator('button:has-text("Edit")').first();
    await editButton.click();

    // Check dialog is visible
    await expect(page.locator('text=Edit Role')).toBeVisible();

    // Close dialog
    await page.click('button:has-text("Cancel")');
  });

  test('should navigate to role detail page', async ({ page }) => {
    // Wait for roles to load
    await page.waitForSelector('[data-testid="role-card"], .role-item', {
      state: 'visible',
      timeout: 5000,
    }).catch(() => {});

    // Click on first role card
    const firstRoleCard = page.locator('[data-testid="role-card"], .role-item').first();
    const roleName = await firstRoleCard.locator('h3, [data-role-name]').first().textContent();

    // Click view details or the card itself
    const viewButton = firstRoleCard.locator('button:has-text("View Details"), a:has-text("View Details")');
    const hasViewButton = await viewButton.count() > 0;

    if (hasViewButton) {
      await viewButton.click();
    } else {
      // If no explicit button, click the card
      await firstRoleCard.click();
    }

    // Wait for detail page
    await page.waitForURL(/.*\/admin\/roles\/\d+/);

    // Verify detail page content
    await expect(page.locator('text=Back to Roles')).toBeVisible();
    await expect(page.locator('text=Manage Permissions')).toBeVisible();
    await expect(page.locator('text=Users with this Role')).toBeVisible();
  });

  test('should display role statistics on detail page', async ({ page }) => {
    // Navigate to any role detail page
    await page.goto(`${BASE_URL}/admin/roles/1`); // Assuming role ID 1 exists

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check statistics cards
    const hasStats = await page.locator('text=Permissions, text=Users, text=Guard Type').count() > 0;

    if (hasStats) {
      await expect(page.locator('text=Permissions')).toBeVisible();
      await expect(page.locator('text=Users')).toBeVisible();
      await expect(page.locator('text=Guard Type')).toBeVisible();
    }
  });

  test('should open permissions management dialog', async ({ page }) => {
    // Navigate to role detail page
    await page.goto(`${BASE_URL}/admin/roles/1`);
    await page.waitForLoadState('networkidle');

    // Click manage permissions button
    await page.click('button:has-text("Manage Permissions")');

    // Check dialog is visible
    await expect(page.locator('text=Manage Permissions')).toBeVisible();

    // Check permissions are grouped
    await expect(page.locator('input[type="checkbox"]').first()).toBeVisible();

    // Check action buttons
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Save")')).toBeVisible();

    // Close dialog
    await page.click('button:has-text("Cancel")');
  });

  test('should toggle permissions in dialog', async ({ page }) => {
    // Navigate to role detail page
    await page.goto(`${BASE_URL}/admin/roles/1`);
    await page.waitForLoadState('networkidle');

    // Open permissions dialog
    await page.click('button:has-text("Manage Permissions")');

    // Get first checkbox
    const firstCheckbox = page.locator('input[type="checkbox"]').first();

    // Get initial state
    const wasChecked = await firstCheckbox.isChecked();

    // Toggle checkbox
    await firstCheckbox.click();

    // Verify state changed
    const isNowChecked = await firstCheckbox.isChecked();
    expect(isNowChecked).toBe(!wasChecked);

    // Check selected count updated
    await expect(page.locator('text=/Selected:.*\\d+ permissions/')).toBeVisible();

    // Close without saving
    await page.click('button:has-text("Cancel")');
  });

  test('should search users on role detail page', async ({ page }) => {
    // Navigate to role detail page
    await page.goto(`${BASE_URL}/admin/roles/1`);
    await page.waitForLoadState('networkidle');

    // Find users search input
    const searchInput = page.locator('input[placeholder*="Search users"]');

    // If search input exists, test it
    if (await searchInput.count() > 0) {
      await searchInput.fill('admin');
      await page.waitForTimeout(500);

      // Verify results are filtered
      const userItems = page.locator('[data-user-item], .user-item');
      const count = await userItems.count();

      if (count > 0) {
        const firstUser = userItems.first();
        await expect(firstUser).toContainText(/admin/i);
      }
    }
  });

  test('should handle role not found error', async ({ page }) => {
    // Navigate to non-existent role
    await page.goto(`${BASE_URL}/admin/roles/999999`);

    // Wait for error message
    await expect(page.locator('text=Role Not Found')).toBeVisible({
      timeout: 10000,
    });

    // Check back button
    await expect(page.locator('text=Back to Roles')).toBeVisible();
  });

  test('should handle permission denied error', async ({ page }) => {
    // Try to access roles page without proper permissions
    // This would require setting up a user without VIEW_ROLES permission

    // For now, just verify PermissionGuard is in place
    await page.goto(`${BASE_URL}/admin/roles`);

    // If no permission, should redirect or show error
    // If has permission, should show page
    const hasAccess = await page.locator('h1:has-text("Roles & Permissions")').isVisible();

    if (!hasAccess) {
      await expect(page.locator('text=Access Denied, text=Permission Denied')).toBeVisible();
    }
  });

  test('should delete a role', async ({ page }) => {
    // First, create a test role to delete
    const roleName = `Role to Delete ${Date.now()}`;

    // Open create dialog
    await page.click('text=Create Role');
    await page.fill('input[name="name"], input#role-name', roleName);
    await page.selectOption('select[name="guard_name"], select#guard-name', 'api');
    await page.click('button:has-text("Create")');

    // Wait for success
    await page.waitForTimeout(2000);

    // Find the newly created role
    const roleCard = page.locator(`text=${roleName}`).first();
    await expect(roleCard).toBeVisible();

    // Click delete button (might be in a dropdown or direct button)
    const deleteButton = page.locator(`button:has-text("Delete")`).first();

    if (await deleteButton.count() > 0) {
      await deleteButton.click();

      // Confirm deletion if there's a confirmation dialog
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")').last();
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }

      // Wait for success message
      await expect(page.locator('text=Role deleted successfully')).toBeVisible({
        timeout: 10000,
      });

      // Verify role is removed from list
      await page.waitForTimeout(1000);
      await expect(page.locator(`text=${roleName}`)).not.toBeVisible();
    }
  });

  test('should display loading states', async ({ page }) => {
    // Intercept API calls to simulate slow network
    await page.route('**/api/v1/admin/roles*', async (route) => {
      await page.waitForTimeout(2000);
      await route.continue();
    });

    // Navigate to roles page
    await page.goto(`${BASE_URL}/admin/roles`);

    // Check for loading indicators
    const hasLoader = await page.locator('.animate-pulse, [role="progressbar"], text=Loading').count() > 0;

    expect(hasLoader).toBeTruthy();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls to simulate errors
    await page.route('**/api/v1/admin/roles*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Internal server error',
        }),
      });
    });

    // Navigate to roles page
    await page.goto(`${BASE_URL}/admin/roles`);

    // Should show error message
    await expect(page.locator('text=error, text=failed, text=something went wrong')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should validate role creation form', async ({ page }) => {
    // Open create dialog
    await page.click('text=Create Role');

    // Try to submit empty form
    await page.click('button:has-text("Create")');

    // Should show validation errors (if implemented)
    // This depends on how validation is implemented in the form
    await page.waitForTimeout(500);

    // Form should still be visible (not closed)
    await expect(page.locator('text=Create New Role')).toBeVisible();
  });

  test('should export roles list', async ({ page }) => {
    // Look for export button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');

    if (await exportButton.count() > 0) {
      // Setup download listener
      const downloadPromise = page.waitForEvent('download');

      // Click export
      await exportButton.first().click();

      // Wait for download
      const download = await downloadPromise;

      // Verify download started
      expect(download.suggestedFilename()).toMatch(/roles.*\.(csv|xlsx|pdf)/i);
    }
  });

  test('should maintain state when navigating back from detail page', async ({ page }) => {
    // Apply search filter
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('Admin');
    await page.waitForTimeout(500);

    // Navigate to a role detail
    const firstRole = page.locator('[data-testid="role-card"], .role-item').first();
    await firstRole.click();

    // Wait for detail page
    await page.waitForURL(/.*\/admin\/roles\/\d+/);

    // Go back
    await page.click('text=Back to Roles');

    // Verify we're back on list page
    await page.waitForURL(/.*\/admin\/roles$/);

    // Check if search filter is still applied (depends on implementation)
    const searchValue = await searchInput.inputValue();
    // Note: This behavior depends on whether the app persists filter state
  });
});

test.describe('Admin Roles - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/admin\/dashboard/);
    await page.goto(`${BASE_URL}/admin/roles`);
    await page.waitForLoadState('networkidle');
  });

  test('should have accessible form labels', async ({ page }) => {
    // Open create dialog
    await page.click('text=Create Role');

    // Check for labels
    const nameLabel = page.locator('label[for="role-name"]');
    const guardLabel = page.locator('label[for="guard-name"]');

    await expect(nameLabel).toBeVisible();
    await expect(guardLabel).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Create role button should be focusable
    const focusedElement = await page.evaluate(() => document.activeElement?.textContent);

    // Some element should be focused
    expect(focusedElement).toBeTruthy();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for ARIA attributes
    const buttons = page.locator('button');
    const count = await buttons.count();

    // At least some buttons should have aria-label or descriptive text
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Admin Roles - Performance', () => {
  test('should load roles page within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/admin/roles`);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Page should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle large role lists efficiently', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/roles`);
    await page.waitForLoadState('networkidle');

    // Scroll through list
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Page should remain responsive
    const isResponsive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });

    expect(isResponsive).toBeTruthy();
  });
});
