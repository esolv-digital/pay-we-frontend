import { Page } from '@playwright/test';

/**
 * Playwright route-interception helpers for PayWe API endpoints.
 *
 * Every response is wrapped in the envelope that ApiClient expects:
 *   success  →  { success: true,  data: <payload> }
 *   error    →  { success: false, error: { code, message } }
 *
 * Usage:
 *   const mocks = new ApiMocks(page);
 *   await mocks.mockLoginRequiring2FA('user@example.com');
 */
export class ApiMocks {
  constructor(private page: Page) {}

  // ── Envelope helpers ──────────────────────────────────────────────────

  private static success<T>(data: T): string {
    return JSON.stringify({ success: true, data });
  }

  private static error(message: string, code: number = 422): string {
    return JSON.stringify({ success: false, error: { code, message } });
  }

  // ── Minimal mock objects ──────────────────────────────────────────────

  /**
   * Builds a mock AuthUser.  Includes an organisation so the dashboard
   * does not redirect back to /onboarding.
   */
  private static mockUser(email: string) {
    return {
      id: 'mock-user-1',
      email,
      first_name: 'Test',
      last_name: 'User',
      full_name: 'Test User',
      status: 'active',
      two_factor_enabled: true,
      is_super_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      has_vendor_access: true,
      has_admin_access: false,
      organizations: [
        {
          id: 'mock-org-1',
          name: 'Test Organisation',
          type: 'corporate',
          country_code: 'GH',
          status: 'active',
          kyc_status: 'approved',
          owner_id: 'mock-user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          vendors: [
            {
              id: 'mock-vendor-1',
              slug: 'test-vendor',
              name: 'Test Vendor',
            },
          ],
        },
      ],
    };
  }

  // ── Login mocks ───────────────────────────────────────────────────────

  /** Login returns two_factor_required — client should redirect to verify-2fa. */
  async mockLoginRequiring2FA(email: string): Promise<void> {
    await this.page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({
          user: ApiMocks.mockUser(email),
          two_factor_required: true,
          access_token: '',
          token_type: 'Bearer',
        }),
      });
    });
  }

  // ── 2FA verify mocks ──────────────────────────────────────────────────

  /** POST /api/auth/two-factor/verify succeeds. */
  async mockVerify2FASuccess(): Promise<void> {
    await this.page.route('**/api/auth/two-factor/verify', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({ message: 'Two-factor authentication successful' }),
      });
    });
  }

  /** POST /api/auth/two-factor/verify fails with a validation error. */
  async mockVerify2FAFailure(message = 'The provided code is invalid.'): Promise<void> {
    await this.page.route('**/api/auth/two-factor/verify', (route) => {
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: ApiMocks.error(message),
      });
    });
  }

  // ── Auth-me mocks ─────────────────────────────────────────────────────

  /** GET /api/auth/me returns a fully-hydrated vendor user (has organisation). */
  async mockAuthMe(email = 'test@example.com'): Promise<void> {
    await this.page.route('**/api/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success(ApiMocks.mockUser(email)),
      });
    });
  }

  /**
   * GET /api/auth/me – user has an organisation in the given country.
   * Useful for payout-account tests where mobile-money availability is
   * country-gated.
   */
  async mockAuthMeWithOrg(email = 'test@example.com', countryCode = 'GH'): Promise<void> {
    await this.page.route('**/api/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({
          ...ApiMocks.mockUser(email),
          organizations: [{
            ...ApiMocks.mockUser(email).organizations[0],
            country_code: countryCode,
          }],
        }),
      });
    });
  }

  /** GET /api/auth/me – user has no organisations (pre-step-1 state). */
  async mockAuthMeNoOrg(email = 'test@example.com'): Promise<void> {
    await this.page.route('**/api/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({ ...ApiMocks.mockUser(email), organizations: [] }),
      });
    });
  }

  // ── Onboarding status ─────────────────────────────────────────────────

  /**
   * GET /api/v1/onboarding/status – returns the current multi-step state.
   * `completedSteps` is a 1-based array of already-finished steps.
   */
  async mockOnboardingStatus(completedSteps: number[], currentStep: number, isComplete = false): Promise<void> {
    await this.page.route('**/api/v1/onboarding/status', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            current_step: currentStep,
            completed_steps: completedSteps,
            is_complete: isComplete,
            has_organization: completedSteps.includes(1),
            has_kyc_submitted: completedSteps.includes(3),
            has_payout_account: completedSteps.includes(4),
          },
        }),
      });
    });
  }

  // ── Step 1: organisation creation ─────────────────────────────────────

  /** POST /api/onboarding/organization succeeds. */
  async mockOrganizationCreation(): Promise<void> {
    await this.page.route('**/api/onboarding/organization', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({
          organization: { id: 'mock-org-1', name: 'Test Organization' },
          vendor: { id: 'mock-vendor-1' },
          onboarding_complete: false,
        }),
      });
    });
  }

  // ── Step 2: profile review ─────────────────────────────────────────────

  /** POST /api/v1/onboarding/profile-review succeeds. */
  async mockProfileReviewSuccess(): Promise<void> {
    await this.page.route('**/api/v1/onboarding/profile-review', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { message: 'Profile review completed' } }),
      });
    });
  }

  // ── Step 3: KYC ───────────────────────────────────────────────────────

  /**
   * POST /api/v1/onboarding/kyc succeeds.
   * `skipped = true` omits `kyc_submission` from the response, matching the
   * real API when the user skips.
   */
  async mockKYCSuccess(skipped = false): Promise<void> {
    await this.page.route('**/api/v1/onboarding/kyc', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: skipped
            ? { message: 'KYC step skipped' }
            : { message: 'KYC documents uploaded', kyc_submission: { id: 'mock-kyc-1', status: 'submitted' } },
        }),
      });
    });
  }

  // ── Step 4: payout account ─────────────────────────────────────────────

  /**
   * POST /api/v1/onboarding/payout succeeds.
   * `skipped = true` omits `payout_account`, matching the skip path.
   */
  async mockPayoutAccountSuccess(skipped = false): Promise<void> {
    await this.page.route('**/api/v1/onboarding/payout', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: skipped
            ? { message: 'Payout account setup skipped' }
            : { message: 'Payout account created', payout_account: { id: 'mock-payout-1' } },
        }),
      });
    });
  }

  // ── Final: complete onboarding ────────────────────────────────────────

  /** POST /api/v1/onboarding/complete succeeds and returns the full user. */
  async mockOnboardingComplete(): Promise<void> {
    await this.page.route('**/api/v1/onboarding/complete', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { user: ApiMocks.mockUser('test@example.com'), message: 'Onboarding completed' },
        }),
      });
    });
  }

  // ── Vendor Dashboard ──────────────────────────────────────────────────

  /**
   * GET /api/vendor/dashboard/:slug/stats – returns vendor dashboard statistics.
   */
  async mockVendorDashboardStats(stats?: {
    balance?: number;
    total_revenue?: number;
    total_transactions?: number;
    pending_disbursements?: number;
  }): Promise<void> {
    const defaultStats = {
      balance: 5000.00,
      total_revenue: 25000.00,
      total_transactions: 142,
      pending_disbursements: 3,
    };

    await this.page.route('**/api/vendor/dashboard/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({ ...defaultStats, ...stats }),
      });
    });
  }

  // ── Vendor Transactions ───────────────────────────────────────────────

  /**
   * GET /api/vendor/transactions – returns paginated transactions list.
   */
  async mockVendorTransactions(transactions?: any[], meta?: any): Promise<void> {
    const defaultTransactions = [
      {
        id: 'txn-1',
        reference: 'TXN001234',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        amount: 250.00,
        currency_code: 'USD',
        net_amount: 225.00,
        status: 'successful',
        settled: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'txn-2',
        reference: 'TXN001235',
        customer_name: 'Jane Smith',
        customer_phone: '+1234567890',
        amount: 500.00,
        currency_code: 'USD',
        net_amount: 450.00,
        status: 'pending',
        settled: false,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'txn-3',
        reference: 'TXN001236',
        customer_name: 'Bob Johnson',
        customer_email: 'bob@example.com',
        amount: 150.00,
        currency_code: 'USD',
        net_amount: 135.00,
        status: 'failed',
        settled: false,
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    const defaultMeta = {
      current_page: 1,
      from: 1,
      last_page: 1,
      per_page: 20,
      to: 3,
      total: 3,
    };

    await this.page.route('**/api/vendor/transactions**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({
          transactions: transactions || defaultTransactions,
          meta: meta || defaultMeta,
        }),
      });
    });
  }

  /**
   * GET /api/vendor/transactions/metrics – returns transaction metrics.
   */
  async mockTransactionMetrics(metrics?: {
    total_transactions?: number;
    total_amount?: number;
    successful_transactions?: number;
    successful_amount?: number;
    pending_transactions?: number;
    pending_amount?: number;
    failed_transactions?: number;
    failed_amount?: number;
  }): Promise<void> {
    const defaultMetrics = {
      total_transactions: 142,
      total_amount: 35500.00,
      successful_transactions: 120,
      successful_amount: 30000.00,
      pending_transactions: 15,
      pending_amount: 4500.00,
      failed_transactions: 7,
      failed_amount: 1000.00,
    };

    await this.page.route('**/api/vendor/transactions/metrics**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({ metrics: { ...defaultMetrics, ...metrics } }),
      });
    });
  }

  /**
   * POST /api/vendor/transactions/export – initiates transaction export.
   */
  async mockTransactionExport(): Promise<void> {
    await this.page.route('**/api/vendor/transactions/export', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({
          message: 'Export started. You will receive an email when ready.',
          export_id: 'export-123',
        }),
      });
    });
  }

  // ── Vendor Payment Pages ──────────────────────────────────────────────

  /**
   * GET /api/vendor/payment-pages – returns paginated payment pages list.
   */
  async mockPaymentPagesList(pages?: any[], meta?: any): Promise<void> {
    const defaultPages = [
      {
        id: 'page-1',
        title: 'Product Purchase Page',
        description: 'Payment page for our main product',
        slug: 'product-purchase',
        short_url: 'pay123',
        amount_type: 'fixed',
        fixed_amount: 100.00,
        currency_code: 'USD',
        is_active: true,
        include_fees_in_amount: false,
        created_at: new Date().toISOString(),
        vendor: {
          slug: 'test-vendor',
        },
      },
      {
        id: 'page-2',
        title: 'Donation Page',
        description: 'Accept donations',
        slug: 'donations',
        short_url: 'pay456',
        amount_type: 'donation',
        min_amount: 5.00,
        currency_code: 'USD',
        is_active: true,
        include_fees_in_amount: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        vendor: {
          slug: 'test-vendor',
        },
      },
      {
        id: 'page-3',
        title: 'Service Payment',
        description: 'Pay for our services',
        slug: 'services',
        short_url: 'pay789',
        amount_type: 'flexible',
        min_amount: 50.00,
        max_amount: 500.00,
        currency_code: 'USD',
        is_active: false,
        include_fees_in_amount: false,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        vendor: {
          slug: 'test-vendor',
        },
      },
    ];

    const defaultMeta = {
      current_page: 1,
      from: 1,
      last_page: 1,
      per_page: 12,
      to: 3,
      total: 3,
    };

    await this.page.route('**/api/vendor/payment-pages**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({
          data: pages || defaultPages,
          meta: meta || defaultMeta,
        }),
      });
    });
  }

  /**
   * DELETE /api/vendor/payment-pages/:id – deletes a payment page.
   */
  async mockDeletePaymentPage(): Promise<void> {
    await this.page.route('**/api/vendor/payment-pages/*', (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: ApiMocks.success({ message: 'Payment page deleted successfully' }),
        });
      } else {
        route.continue();
      }
    });
  }

  // ── Vendor Disbursements ──────────────────────────────────────────────

  /**
   * GET /api/vendor/disbursements/statistics – returns disbursement statistics.
   */
  async mockDisbursementStatistics(stats?: {
    available_balance?: number;
    pending_payouts?: number;
    withdrawable_balance?: number;
    unsettled_amount?: number;
    unsettled_transaction_count?: number;
    completed_this_month?: number;
    total_completed?: number;
    auto_payout_enabled?: boolean;
    has_default_payout_account?: boolean;
    minimum_payout_amount?: number;
    currency?: string;
  }): Promise<void> {
    const defaultStats = {
      available_balance: 5000.00,
      pending_payouts: 500.00,
      withdrawable_balance: 4500.00,
      unsettled_amount: 1200.00,
      unsettled_transaction_count: 5,
      completed_this_month: 3000.00,
      total_completed: 45000.00,
      auto_payout_enabled: false,
      has_default_payout_account: true,
      default_payout_account: {
        id: 'account-1',
        display_name: 'Bank ***1234',
      },
      minimum_payout_amount: 10.00,
      currency: 'USD',
    };

    await this.page.route('**/api/vendor/disbursements/statistics**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({ ...defaultStats, ...stats }),
      });
    });
  }

  /**
   * GET /api/vendor/payout-accounts – returns payout accounts list.
   */
  async mockPayoutAccounts(accounts?: any[]): Promise<void> {
    const defaultAccounts = [
      {
        id: 'account-1',
        type: 'bank',
        display_name: 'Bank ***1234',
        bank_name: 'Test Bank',
        account_number: '****1234',
        is_default: true,
        is_verified: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'account-2',
        type: 'mobile_money',
        display_name: 'MTN ***5678',
        provider: 'MTN',
        mobile_number: '****5678',
        is_default: false,
        is_verified: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    await this.page.route('**/api/vendor/payout-accounts**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success(accounts || defaultAccounts),
      });
    });
  }

  /**
   * GET /api/vendor/payouts – returns payouts list.
   */
  async mockPayouts(payouts?: any[], meta?: any): Promise<void> {
    const defaultPayouts = [
      {
        id: 'payout-1',
        batch_reference: 'BATCH001',
        gross_amount: 1000.00,
        fees_amount: 50.00,
        net_amount: 950.00,
        currency_code: 'USD',
        status: 'completed',
        status_label: 'Completed',
        payout_method: 'bank',
        is_automatic: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'payout-2',
        batch_reference: 'BATCH002',
        gross_amount: 500.00,
        fees_amount: 25.00,
        net_amount: 475.00,
        currency_code: 'USD',
        status: 'pending',
        status_label: 'Pending',
        payout_method: 'mobile_money',
        is_automatic: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    const defaultMeta = {
      current_page: 1,
      from: 1,
      last_page: 1,
      per_page: 5,
      to: 2,
      total: 2,
    };

    await this.page.route('**/api/vendor/payouts**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({
          data: payouts || defaultPayouts,
          meta: meta || defaultMeta,
        }),
      });
    });
  }

  /**
   * POST /api/vendor/disbursements/toggle-auto-payout – toggles auto-payout.
   */
  async mockToggleAutoPayout(): Promise<void> {
    await this.page.route('**/api/vendor/disbursements/toggle-auto-payout', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({
          message: 'Auto-payout setting updated',
          auto_payout_enabled: true,
        }),
      });
    });
  }

  // ── Settings mocks ────────────────────────────────────────────────────

  /**
   * GET /api/profile – Returns user profile data.
   */
  async mockGetProfile(profile?: any): Promise<void> {
    const defaultProfile = {
      id: 'mock-user-1',
      email: 'vendor@test.com',
      first_name: 'Test',
      last_name: 'User',
      full_name: 'Test User',
      phone: '+233123456789',
      country_code: 'GH',
      status: 'active',
      two_factor_enabled: true,
    };

    await this.page.route('**/api/profile', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: ApiMocks.success(profile || defaultProfile),
        });
      } else {
        route.continue();
      }
    });
  }

  /**
   * PUT /api/profile – Updates user profile.
   */
  async mockUpdateProfile(): Promise<void> {
    await this.page.route('**/api/profile', (route) => {
      if (route.request().method() === 'PUT') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: ApiMocks.success({
            message: 'Profile updated successfully',
          }),
        });
      } else {
        route.continue();
      }
    });
  }

  /**
   * POST /api/profile/password – Changes user password.
   */
  async mockChangePassword(shouldSucceed: boolean = true): Promise<void> {
    await this.page.route('**/api/profile/password', (route) => {
      if (shouldSucceed) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: ApiMocks.success({
            message: 'Password changed successfully',
          }),
        });
      } else {
        route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: ApiMocks.error('Current password is incorrect'),
        });
      }
    });
  }

  /**
   * GET /api/vendor/organization – Returns organization data.
   */
  async mockGetOrganization(org?: any): Promise<void> {
    const defaultOrg = {
      id: 'mock-org-1',
      name: 'Test Organisation',
      type: 'corporate',
      country_code: 'GH',
      business_type: 'software',
      registration_number: 'REG123456',
      website: 'https://example.com',
      address: '123 Main St',
      city: 'Accra',
      state: 'Greater Accra',
      postal_code: '00233',
      status: 'active',
      kyc_status: 'approved',
    };

    await this.page.route('**/api/vendor/organization**', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: ApiMocks.success(org || defaultOrg),
        });
      } else {
        route.continue();
      }
    });
  }

  /**
   * PUT /api/vendor/organization – Updates organization.
   */
  async mockUpdateOrganization(): Promise<void> {
    await this.page.route('**/api/vendor/organization**', (route) => {
      if (route.request().method() === 'PUT') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: ApiMocks.success({
            message: 'Organization updated successfully',
          }),
        });
      } else {
        route.continue();
      }
    });
  }

  /**
   * GET /api/two-factor/status – Returns 2FA status.
   */
  async mockTwoFactorStatus(enabled: boolean = true): Promise<void> {
    await this.page.route('**/api/two-factor/status', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({
          enabled,
          method: enabled ? 'totp' : null,
        }),
      });
    });
  }

  /**
   * POST /api/two-factor/enable – Enables 2FA.
   */
  async mockEnableTwoFactor(): Promise<void> {
    await this.page.route('**/api/two-factor/enable', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({
          qr_code: 'data:image/png;base64,mock-qr-code',
          secret: 'MOCK2FASECRET',
          recovery_codes: ['CODE1', 'CODE2', 'CODE3'],
        }),
      });
    });
  }

  /**
   * POST /api/two-factor/disable – Disables 2FA.
   */
  async mockDisableTwoFactor(): Promise<void> {
    await this.page.route('**/api/two-factor/disable', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({
          message: 'Two-factor authentication disabled',
        }),
      });
    });
  }

  /**
   * GET /api/notifications/preferences – Returns notification preferences.
   */
  async mockGetNotificationPreferences(prefs?: any): Promise<void> {
    const defaultPrefs = {
      email_notifications: true,
      payment_received: true,
      payout_completed: true,
      kyc_updates: true,
      security_alerts: true,
      marketing_emails: false,
    };

    await this.page.route('**/api/notifications/preferences', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: ApiMocks.success(prefs || defaultPrefs),
        });
      } else {
        route.continue();
      }
    });
  }

  /**
   * PUT /api/notifications/preferences – Updates notification preferences.
   */
  async mockUpdateNotificationPreferences(): Promise<void> {
    await this.page.route('**/api/notifications/preferences', (route) => {
      if (route.request().method() === 'PUT') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: ApiMocks.success({
            message: 'Notification preferences updated',
          }),
        });
      } else {
        route.continue();
      }
    });
  }

  /**
   * GET /api/notifications – Returns notification history.
   */
  async mockGetNotifications(notifications?: any[], meta?: any): Promise<void> {
    const defaultNotifications = [
      {
        id: 'notif-1',
        type: 'payment_received',
        title: 'Payment Received',
        message: 'You received a payment of $100.00',
        read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'notif-2',
        type: 'payout_completed',
        title: 'Payout Completed',
        message: 'Your payout of $500.00 has been completed',
        read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    const defaultMeta = {
      current_page: 1,
      from: 1,
      last_page: 1,
      per_page: 20,
      to: 2,
      total: 2,
    };

    await this.page.route('**/api/notifications**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({
          data: notifications || defaultNotifications,
          meta: meta || defaultMeta,
        }),
      });
    });
  }

  /**
   * GET /api/devices – Returns trusted devices.
   */
  async mockGetDevices(devices?: any[]): Promise<void> {
    const defaultDevices = [
      {
        id: 'device-1',
        device_name: 'Chrome on MacOS',
        device_type: 'browser',
        browser: 'Chrome',
        os: 'MacOS',
        last_used_at: new Date(Date.now() - 3600000).toISOString(),
        current: true,
      },
      {
        id: 'device-2',
        device_name: 'Safari on iPhone',
        device_type: 'mobile',
        browser: 'Safari',
        os: 'iOS',
        last_used_at: new Date(Date.now() - 86400000).toISOString(),
        current: false,
      },
    ];

    await this.page.route('**/api/devices**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: ApiMocks.success({
          devices: devices || defaultDevices,
        }),
      });
    });
  }

  /**
   * DELETE /api/devices/:id – Removes a trusted device.
   */
  async mockRemoveDevice(): Promise<void> {
    await this.page.route('**/api/devices/*', (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: ApiMocks.success({
            message: 'Device removed successfully',
          }),
        });
      } else {
        route.continue();
      }
    });
  }
}
