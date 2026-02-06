import { Page, expect } from '@playwright/test';

/**
 * Page Object Model for Vendor Settings Page
 *
 * Handles interactions with the vendor settings page including:
 * - Main tabs (Profile, Organization, Security, Notifications)
 * - Security sub-tabs (Settings, Devices, 2FA)
 * - Notifications sub-tabs (Preferences, History)
 */
export class VendorSettingsPage {
  constructor(readonly page: Page) {}

  // Selectors
  private readonly pageTitle = 'h1:has-text("Settings")';

  // Main tabs
  private readonly profileTab = 'button:has-text("Profile")';
  private readonly organizationTab = 'button:has-text("Organization")';
  private readonly securityTab = 'button:has-text("Security")';
  private readonly notificationsTab = 'button:has-text("Notifications")';

  // Security sub-tabs
  private readonly securitySettingsSubTab = 'button:has-text("Security Settings")';
  private readonly devicesSubTab = 'button:has-text("Devices")';
  private readonly twoFactorSubTab = 'button:has-text("Two-Factor Auth")';

  // Notifications sub-tabs
  private readonly preferencesSubTab = 'button:has-text("Preferences")';
  private readonly historySubTab = 'button:has-text("History")';

  /**
   * Navigate to vendor settings page
   */
  async goto() {
    await this.page.goto('/vendor/settings');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Assert settings page is loaded
   */
  async assertPageLoaded() {
    await expect(this.page.locator(this.pageTitle)).toBeVisible();
  }

  /**
   * Click on Profile tab
   */
  async clickProfileTab() {
    await this.page.click(this.profileTab);
    await this.page.waitForTimeout(200); // Wait for tab content to render
  }

  /**
   * Click on Organization tab
   */
  async clickOrganizationTab() {
    await this.page.click(this.organizationTab);
    await this.page.waitForTimeout(200);
  }

  /**
   * Click on Security tab
   */
  async clickSecurityTab() {
    await this.page.click(this.securityTab);
    await this.page.waitForTimeout(200);
  }

  /**
   * Click on Notifications tab
   */
  async clickNotificationsTab() {
    await this.page.click(this.notificationsTab);
    await this.page.waitForTimeout(200);
  }

  /**
   * Assert main tab is active
   */
  async assertTabIsActive(tabName: 'Profile' | 'Organization' | 'Security' | 'Notifications') {
    const tab = this.page.locator(`button:has-text("${tabName}")`);
    await expect(tab).toHaveClass(/border-blue-500/);
  }

  /**
   * Click on Security Settings sub-tab
   */
  async clickSecuritySettingsSubTab() {
    await this.page.click(this.securitySettingsSubTab);
    await this.page.waitForTimeout(200);
  }

  /**
   * Click on Devices sub-tab
   */
  async clickDevicesSubTab() {
    await this.page.click(this.devicesSubTab);
    await this.page.waitForTimeout(200);
  }

  /**
   * Click on Two-Factor Auth sub-tab
   */
  async clickTwoFactorSubTab() {
    await this.page.click(this.twoFactorSubTab);
    await this.page.waitForTimeout(200);
  }

  /**
   * Assert security sub-tab is active
   */
  async assertSecuritySubTabIsActive(subTabName: 'Security Settings' | 'Devices' | 'Two-Factor Auth') {
    const subTab = this.page.locator(`button:has-text("${subTabName}")`);
    await expect(subTab).toHaveClass(/border-blue-500/);
  }

  /**
   * Click on Preferences sub-tab (Notifications)
   */
  async clickPreferencesSubTab() {
    await this.page.click(this.preferencesSubTab);
    await this.page.waitForTimeout(200);
  }

  /**
   * Click on History sub-tab (Notifications)
   */
  async clickHistorySubTab() {
    await this.page.click(this.historySubTab);
    await this.page.waitForTimeout(200);
  }

  /**
   * Assert notifications sub-tab is active
   */
  async assertNotificationsSubTabIsActive(subTabName: 'Preferences' | 'History') {
    const subTab = this.page.locator(`button:has-text("${subTabName}")`);
    await expect(subTab).toHaveClass(/border-blue-500/);
  }

  // Profile tab assertions
  async assertProfileFormVisible() {
    await expect(this.page.locator('text=Full Name')).toBeVisible();
    await expect(this.page.locator('text=Email Address')).toBeVisible();
  }

  async assertProfileUpdateButtonVisible() {
    await expect(this.page.locator('button:has-text("Update Profile")')).toBeVisible();
  }

  // Organization tab assertions
  async assertOrganizationFormVisible() {
    await expect(this.page.locator('text=Organization Name')).toBeVisible();
    await expect(this.page.locator('text=Business Type')).toBeVisible();
  }

  async assertOrganizationUpdateButtonVisible() {
    await expect(this.page.locator('button:has-text("Update Organization")')).toBeVisible();
  }

  // Security Settings assertions
  async assertPasswordChangeFormVisible() {
    await expect(this.page.locator('text=Current Password')).toBeVisible();
    await expect(this.page.locator('text=New Password')).toBeVisible();
  }

  async assertChangePasswordButtonVisible() {
    await expect(this.page.locator('button:has-text("Change Password")')).toBeVisible();
  }

  async assertSocialAuthSectionVisible() {
    await expect(this.page.locator('text=Connected Accounts')).toBeVisible();
  }

  // Devices assertions
  async assertDevicesListVisible() {
    await expect(this.page.locator('text=Trusted Devices').or(this.page.locator('text=Device Management'))).toBeVisible();
  }

  async assertNoDevicesMessage() {
    await expect(this.page.locator('text=/No (trusted )?devices/i')).toBeVisible();
  }

  async getDevicesCount(): Promise<number> {
    const devices = this.page.locator('[data-testid="device-item"]').or(
      this.page.locator('.bg-white.rounded-lg.border').filter({ has: this.page.locator('text=/Device|Browser/i') })
    );
    return await devices.count();
  }

  // Two-Factor Auth assertions
  async assertTwoFactorSectionVisible() {
    await expect(this.page.locator('text=Two-Factor Authentication').or(this.page.locator('text=2FA'))).toBeVisible();
  }

  async assertTwoFactorStatusVisible() {
    const enabled = this.page.locator('text=/2FA.*Enabled/i');
    const disabled = this.page.locator('text=/2FA.*Disabled/i');
    await expect(enabled.or(disabled)).toBeVisible();
  }

  async isTwoFactorEnabled(): Promise<boolean> {
    const enabledText = this.page.locator('text=/Enabled|Active/i');
    return await enabledText.count() > 0;
  }

  // Notification Preferences assertions
  async assertNotificationPreferencesVisible() {
    await expect(this.page.locator('text=Notification Preferences').or(this.page.locator('text=Email Notifications'))).toBeVisible();
  }

  async assertSavePreferencesButtonVisible() {
    await expect(this.page.locator('button:has-text("Save Preferences")')).toBeVisible();
  }

  // Notification History assertions
  async assertNotificationHistoryVisible() {
    await expect(this.page.locator('text=Notification History').or(this.page.locator('text=Recent Notifications'))).toBeVisible();
  }

  async assertNoNotificationsMessage() {
    await expect(this.page.locator('text=/No notifications/i')).toBeVisible();
  }

  async getNotificationsCount(): Promise<number> {
    const notifications = this.page.locator('[data-testid="notification-item"]').or(
      this.page.locator('.bg-white.rounded-lg.border').filter({ has: this.page.locator('text=/ago|minutes|hours|days/i') })
    );
    return await notifications.count();
  }

  // Form interactions
  async fillProfileForm(data: { fullName?: string; email?: string; phone?: string }) {
    if (data.fullName) {
      await this.page.fill('input[name="full_name"]', data.fullName);
    }
    if (data.email) {
      await this.page.fill('input[name="email"]', data.email);
    }
    if (data.phone) {
      await this.page.fill('input[name="phone"]', data.phone);
    }
  }

  async submitProfileForm() {
    await this.page.click('button:has-text("Update Profile")');
  }

  async fillOrganizationForm(data: { name?: string; businessType?: string }) {
    if (data.name) {
      await this.page.fill('input[name="name"]', data.name);
    }
    if (data.businessType) {
      await this.page.selectOption('select[name="business_type"]', data.businessType);
    }
  }

  async submitOrganizationForm() {
    await this.page.click('button:has-text("Update Organization")');
  }

  async fillPasswordChangeForm(data: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    await this.page.fill('input[name="current_password"]', data.currentPassword);
    await this.page.fill('input[name="new_password"]', data.newPassword);
    await this.page.fill('input[name="confirm_password"]', data.confirmPassword);
  }

  async submitPasswordChangeForm() {
    await this.page.click('button:has-text("Change Password")');
  }

  // Success/Error messages
  async assertSuccessMessage(message?: string) {
    if (message) {
      await expect(this.page.locator(`text=${message}`)).toBeVisible();
    } else {
      await expect(this.page.locator('text=/success|updated|saved/i')).toBeVisible();
    }
  }

  async assertErrorMessage(message?: string) {
    if (message) {
      await expect(this.page.locator(`text=${message}`)).toBeVisible();
    } else {
      await expect(this.page.locator('text=/error|failed/i')).toBeVisible();
    }
  }
}
