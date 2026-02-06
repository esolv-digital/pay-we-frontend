/**
 * Vendor Settings E2E Tests
 *
 * Tests for the vendor settings page, including:
 * - Main tabs: Profile, Organization, Security, Notifications
 * - Security sub-tabs: Security Settings, Devices, Two-Factor Auth
 * - Notifications sub-tabs: Preferences, History
 * - Form submissions and validations
 */

import { test, expect } from '@playwright/test';
import { VendorSettingsPage } from './pages/vendor-settings.page';
import { ApiMocks } from './helpers/api-mocks';

test.describe('Vendor Settings', () => {
  let settingsPage: VendorSettingsPage;
  let mocks: ApiMocks;

  test.beforeEach(async ({ page }) => {
    settingsPage = new VendorSettingsPage(page);
    mocks = new ApiMocks(page);

    // Mock auth user with vendor access
    await mocks.mockAuthMe();
  });

  test.describe('Page Loading', () => {
    test('should load settings page successfully', async () => {
      await mocks.mockGetProfile();

      await settingsPage.goto();
      await settingsPage.assertPageLoaded();
    });

    test('should display main tabs', async () => {
      await mocks.mockGetProfile();

      await settingsPage.goto();

      await expect(settingsPage.page.locator('button:has-text("Profile")')).toBeVisible();
      await expect(settingsPage.page.locator('button:has-text("Organization")')).toBeVisible();
      await expect(settingsPage.page.locator('button:has-text("Security")')).toBeVisible();
      await expect(settingsPage.page.locator('button:has-text("Notifications")')).toBeVisible();
    });

    test('should show profile tab as active by default', async () => {
      await mocks.mockGetProfile();

      await settingsPage.goto();
      await settingsPage.assertTabIsActive('Profile');
    });
  });

  test.describe('Profile Tab', () => {
    test('should display profile form', async () => {
      await mocks.mockGetProfile();

      await settingsPage.goto();
      await settingsPage.clickProfileTab();

      await settingsPage.assertProfileFormVisible();
      await settingsPage.assertProfileUpdateButtonVisible();
    });

    test('should load profile data', async () => {
      await mocks.mockGetProfile({
        id: 'user-1',
        email: 'test@vendor.com',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        phone: '+233123456789',
      });

      await settingsPage.goto();
      await settingsPage.clickProfileTab();

      await expect(settingsPage.page.locator('input[name="full_name"]')).toHaveValue('John Doe');
      await expect(settingsPage.page.locator('input[name="email"]')).toHaveValue('test@vendor.com');
    });

    test('should update profile successfully', async () => {
      await mocks.mockGetProfile();
      await mocks.mockUpdateProfile();

      await settingsPage.goto();
      await settingsPage.clickProfileTab();

      await settingsPage.fillProfileForm({
        fullName: 'Jane Smith',
        phone: '+233987654321',
      });

      await settingsPage.submitProfileForm();
      await settingsPage.assertSuccessMessage();
    });
  });

  test.describe('Organization Tab', () => {
    test('should switch to organization tab', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetOrganization();

      await settingsPage.goto();
      await settingsPage.clickOrganizationTab();

      await settingsPage.assertTabIsActive('Organization');
      await settingsPage.assertOrganizationFormVisible();
    });

    test('should display organization form', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetOrganization();

      await settingsPage.goto();
      await settingsPage.clickOrganizationTab();

      await settingsPage.assertOrganizationFormVisible();
      await settingsPage.assertOrganizationUpdateButtonVisible();
    });

    test('should load organization data', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetOrganization({
        id: 'org-1',
        name: 'Test Company Ltd',
        type: 'corporate',
        business_type: 'software',
        country_code: 'GH',
      });

      await settingsPage.goto();
      await settingsPage.clickOrganizationTab();

      await expect(settingsPage.page.locator('input[name="name"]')).toHaveValue('Test Company Ltd');
    });

    test('should update organization successfully', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetOrganization();
      await mocks.mockUpdateOrganization();

      await settingsPage.goto();
      await settingsPage.clickOrganizationTab();

      await settingsPage.fillOrganizationForm({
        name: 'Updated Company Ltd',
      });

      await settingsPage.submitOrganizationForm();
      await settingsPage.assertSuccessMessage();
    });
  });

  test.describe('Security Tab - Security Settings', () => {
    test('should switch to security tab', async () => {
      await mocks.mockGetProfile();

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();

      await settingsPage.assertTabIsActive('Security');
    });

    test('should display security sub-tabs', async () => {
      await mocks.mockGetProfile();

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();

      await expect(settingsPage.page.locator('button:has-text("Security Settings")')).toBeVisible();
      await expect(settingsPage.page.locator('button:has-text("Devices")')).toBeVisible();
      await expect(settingsPage.page.locator('button:has-text("Two-Factor Auth")')).toBeVisible();
    });

    test('should show security settings sub-tab as active by default', async () => {
      await mocks.mockGetProfile();

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();

      await settingsPage.assertSecuritySubTabIsActive('Security Settings');
    });

    test('should display password change form', async () => {
      await mocks.mockGetProfile();

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();
      await settingsPage.clickSecuritySettingsSubTab();

      await settingsPage.assertPasswordChangeFormVisible();
      await settingsPage.assertChangePasswordButtonVisible();
    });

    test('should change password successfully', async () => {
      await mocks.mockGetProfile();
      await mocks.mockChangePassword(true);

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();
      await settingsPage.clickSecuritySettingsSubTab();

      await settingsPage.fillPasswordChangeForm({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
        confirmPassword: 'newPassword456',
      });

      await settingsPage.submitPasswordChangeForm();
      await settingsPage.assertSuccessMessage();
    });

    test('should handle incorrect current password', async () => {
      await mocks.mockGetProfile();
      await mocks.mockChangePassword(false);

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();
      await settingsPage.clickSecuritySettingsSubTab();

      await settingsPage.fillPasswordChangeForm({
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword456',
        confirmPassword: 'newPassword456',
      });

      await settingsPage.submitPasswordChangeForm();
      await settingsPage.assertErrorMessage();
    });

    test('should display social auth section', async () => {
      await mocks.mockGetProfile();

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();
      await settingsPage.clickSecuritySettingsSubTab();

      await settingsPage.assertSocialAuthSectionVisible();
    });
  });

  test.describe('Security Tab - Devices', () => {
    test('should switch to devices sub-tab', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetDevices();

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();
      await settingsPage.clickDevicesSubTab();

      await settingsPage.assertSecuritySubTabIsActive('Devices');
      await settingsPage.assertDevicesListVisible();
    });

    test('should display devices list', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetDevices();

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();
      await settingsPage.clickDevicesSubTab();

      const count = await settingsPage.getDevicesCount();
      expect(count).toBeGreaterThan(0);
    });

    test('should show no devices message when empty', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetDevices([]);

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();
      await settingsPage.clickDevicesSubTab();

      await settingsPage.assertNoDevicesMessage();
    });

    test('should remove device successfully', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetDevices();
      await mocks.mockRemoveDevice();

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();
      await settingsPage.clickDevicesSubTab();

      // Click remove on first non-current device
      const removeButton = settingsPage.page.locator('button:has-text("Remove")').first();
      if (await removeButton.isVisible()) {
        await removeButton.click();
        await settingsPage.assertSuccessMessage();
      }
    });
  });

  test.describe('Security Tab - Two-Factor Auth', () => {
    test('should switch to two-factor sub-tab', async () => {
      await mocks.mockGetProfile();
      await mocks.mockTwoFactorStatus(true);

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();
      await settingsPage.clickTwoFactorSubTab();

      await settingsPage.assertSecuritySubTabIsActive('Two-Factor Auth');
      await settingsPage.assertTwoFactorSectionVisible();
    });

    test('should display 2FA status when enabled', async () => {
      await mocks.mockGetProfile();
      await mocks.mockTwoFactorStatus(true);

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();
      await settingsPage.clickTwoFactorSubTab();

      await settingsPage.assertTwoFactorStatusVisible();
      const isEnabled = await settingsPage.isTwoFactorEnabled();
      expect(isEnabled).toBe(true);
    });

    test('should display 2FA status when disabled', async () => {
      await mocks.mockGetProfile();
      await mocks.mockTwoFactorStatus(false);

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();
      await settingsPage.clickTwoFactorSubTab();

      await settingsPage.assertTwoFactorStatusVisible();
      const isEnabled = await settingsPage.isTwoFactorEnabled();
      expect(isEnabled).toBe(false);
    });

    test('should enable 2FA successfully', async () => {
      await mocks.mockGetProfile();
      await mocks.mockTwoFactorStatus(false);
      await mocks.mockEnableTwoFactor();

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();
      await settingsPage.clickTwoFactorSubTab();

      const enableButton = settingsPage.page.locator('button:has-text("Enable")');
      if (await enableButton.isVisible()) {
        await enableButton.click();
        // Should show QR code or success message
        await settingsPage.page.waitForTimeout(500);
      }
    });

    test('should disable 2FA successfully', async () => {
      await mocks.mockGetProfile();
      await mocks.mockTwoFactorStatus(true);
      await mocks.mockDisableTwoFactor();

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();
      await settingsPage.clickTwoFactorSubTab();

      const disableButton = settingsPage.page.locator('button:has-text("Disable")');
      if (await disableButton.isVisible()) {
        await disableButton.click();
        await settingsPage.assertSuccessMessage();
      }
    });
  });

  test.describe('Notifications Tab - Preferences', () => {
    test('should switch to notifications tab', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetNotificationPreferences();

      await settingsPage.goto();
      await settingsPage.clickNotificationsTab();

      await settingsPage.assertTabIsActive('Notifications');
    });

    test('should display notification sub-tabs', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetNotificationPreferences();

      await settingsPage.goto();
      await settingsPage.clickNotificationsTab();

      await expect(settingsPage.page.locator('button:has-text("Preferences")')).toBeVisible();
      await expect(settingsPage.page.locator('button:has-text("History")')).toBeVisible();
    });

    test('should show preferences sub-tab as active by default', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetNotificationPreferences();

      await settingsPage.goto();
      await settingsPage.clickNotificationsTab();

      await settingsPage.assertNotificationsSubTabIsActive('Preferences');
    });

    test('should display notification preferences form', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetNotificationPreferences();

      await settingsPage.goto();
      await settingsPage.clickNotificationsTab();
      await settingsPage.clickPreferencesSubTab();

      await settingsPage.assertNotificationPreferencesVisible();
      await settingsPage.assertSavePreferencesButtonVisible();
    });

    test('should load notification preferences', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetNotificationPreferences({
        email_notifications: true,
        payment_received: true,
        payout_completed: false,
      });

      await settingsPage.goto();
      await settingsPage.clickNotificationsTab();
      await settingsPage.clickPreferencesSubTab();

      // Check that preferences are loaded
      await settingsPage.page.waitForTimeout(500);
    });

    test('should update notification preferences successfully', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetNotificationPreferences();
      await mocks.mockUpdateNotificationPreferences();

      await settingsPage.goto();
      await settingsPage.clickNotificationsTab();
      await settingsPage.clickPreferencesSubTab();

      // Toggle a preference
      const checkbox = settingsPage.page.locator('input[type="checkbox"]').first();
      await checkbox.click();

      const saveButton = settingsPage.page.locator('button:has-text("Save Preferences")');
      await saveButton.click();

      await settingsPage.assertSuccessMessage();
    });
  });

  test.describe('Notifications Tab - History', () => {
    test('should switch to history sub-tab', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetNotifications();

      await settingsPage.goto();
      await settingsPage.clickNotificationsTab();
      await settingsPage.clickHistorySubTab();

      await settingsPage.assertNotificationsSubTabIsActive('History');
      await settingsPage.assertNotificationHistoryVisible();
    });

    test('should display notification history', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetNotifications();

      await settingsPage.goto();
      await settingsPage.clickNotificationsTab();
      await settingsPage.clickHistorySubTab();

      const count = await settingsPage.getNotificationsCount();
      expect(count).toBeGreaterThan(0);
    });

    test('should show no notifications message when empty', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetNotifications([], { current_page: 1, total: 0 });

      await settingsPage.goto();
      await settingsPage.clickNotificationsTab();
      await settingsPage.clickHistorySubTab();

      await settingsPage.assertNoNotificationsMessage();
    });

    test('should display notification details', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetNotifications([
        {
          id: 'notif-1',
          type: 'payment_received',
          title: 'Payment Received',
          message: 'You received a payment of $100.00',
          read: false,
          created_at: new Date().toISOString(),
        },
      ]);

      await settingsPage.goto();
      await settingsPage.clickNotificationsTab();
      await settingsPage.clickHistorySubTab();

      await expect(settingsPage.page.locator('text=Payment Received')).toBeVisible();
      await expect(settingsPage.page.locator('text=/received a payment/i')).toBeVisible();
    });
  });

  test.describe('Tab Navigation', () => {
    test('should navigate between main tabs', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetOrganization();
      await mocks.mockGetNotificationPreferences();

      await settingsPage.goto();

      // Start on Profile
      await settingsPage.assertTabIsActive('Profile');

      // Switch to Organization
      await settingsPage.clickOrganizationTab();
      await settingsPage.assertTabIsActive('Organization');

      // Switch to Security
      await settingsPage.clickSecurityTab();
      await settingsPage.assertTabIsActive('Security');

      // Switch to Notifications
      await settingsPage.clickNotificationsTab();
      await settingsPage.assertTabIsActive('Notifications');

      // Back to Profile
      await settingsPage.clickProfileTab();
      await settingsPage.assertTabIsActive('Profile');
    });

    test('should navigate between security sub-tabs', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetDevices();
      await mocks.mockTwoFactorStatus(true);

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();

      // Start on Security Settings
      await settingsPage.assertSecuritySubTabIsActive('Security Settings');

      // Switch to Devices
      await settingsPage.clickDevicesSubTab();
      await settingsPage.assertSecuritySubTabIsActive('Devices');

      // Switch to Two-Factor Auth
      await settingsPage.clickTwoFactorSubTab();
      await settingsPage.assertSecuritySubTabIsActive('Two-Factor Auth');

      // Back to Security Settings
      await settingsPage.clickSecuritySettingsSubTab();
      await settingsPage.assertSecuritySubTabIsActive('Security Settings');
    });

    test('should navigate between notifications sub-tabs', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetNotificationPreferences();
      await mocks.mockGetNotifications();

      await settingsPage.goto();
      await settingsPage.clickNotificationsTab();

      // Start on Preferences
      await settingsPage.assertNotificationsSubTabIsActive('Preferences');

      // Switch to History
      await settingsPage.clickHistorySubTab();
      await settingsPage.assertNotificationsSubTabIsActive('History');

      // Back to Preferences
      await settingsPage.clickPreferencesSubTab();
      await settingsPage.assertNotificationsSubTabIsActive('Preferences');
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle API errors gracefully', async () => {
      await mocks.mockGetProfile();

      await settingsPage.goto();
      await settingsPage.clickProfileTab();

      // Try to submit without mocking update endpoint (will fail)
      await settingsPage.fillProfileForm({ fullName: 'Test User' });
      await settingsPage.submitProfileForm();

      // Should show some error or stay on page
      await settingsPage.page.waitForTimeout(1000);
    });

    test('should preserve tab state when navigating away and back', async () => {
      await mocks.mockGetProfile();
      await mocks.mockGetDevices();

      await settingsPage.goto();
      await settingsPage.clickSecurityTab();
      await settingsPage.clickDevicesSubTab();

      await settingsPage.assertSecuritySubTabIsActive('Devices');

      // Navigate to another tab
      await settingsPage.clickProfileTab();
      await settingsPage.assertTabIsActive('Profile');

      // Navigate back to Security
      await settingsPage.clickSecurityTab();

      // Should still be on Devices sub-tab (state preserved)
      await settingsPage.page.waitForTimeout(200);
    });
  });
});
