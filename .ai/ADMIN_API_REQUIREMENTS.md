# Admin API Requirements — Complete Endpoint Specification

**Purpose**: This document lists ALL admin endpoints required by the PayWe frontend. The Postman collection currently has **zero admin endpoints**. The backend team must implement these for the admin dashboard to function.

**Base URL**: `{{base_url}}/api/v1`
**Authentication**: Bearer token (same as vendor endpoints)
**Response Envelope**: `{ success: true, message: "...", data: {...} }` or `{ success: true, data: [...], meta: { current_page, total, per_page, last_page } }`

---

## A. EXISTING FRONTEND — Backend Endpoints Needed

These admin pages are already built on the frontend. The backend must implement these endpoints.

### A1. Dashboard Statistics
| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/admin/statistics` | Platform-wide KPIs | `{ total_users, active_users, total_organizations, total_transactions, total_revenue, pending_kyc, active_vendors, system_status }` |

### A2. User Management
| Method | Endpoint | Description | Request Body / Query Params |
|--------|----------|-------------|----------------------------|
| GET | `/admin/users` | List users (paginated) | `?search=&status=active&role=&organization_id=&email_verified=&sort_by=created_at&sort_direction=desc&page=1&per_page=20` |
| POST | `/admin/users` | Create admin user | `{ first_name, last_name, email, phone, password, roles[] }` |
| GET | `/admin/users/{id}` | Get user details | — |
| PUT | `/admin/users/{id}` | Update user | `{ first_name, last_name, email, phone, roles[] }` |
| DELETE | `/admin/users/{id}` | Delete user | — |
| POST | `/admin/users/{id}/suspend` | Suspend user | `{ reason }` |
| POST | `/admin/users/{id}/activate` | Activate user | — |
| POST | `/admin/users/{id}/reset-password` | Send password reset | — |
| POST | `/admin/users/{id}/resend-verification` | Resend email verification | — |
| GET | `/admin/users/statistics` | User statistics | Response: `{ total, active, suspended, pending, by_role[] }` |

### A3. Organization Management
| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| GET | `/admin/organizations` | List organizations | `?search=&status[]=active&country=&business_type=&verified=&sort_by=created_at&sort_direction=desc&page=1&per_page=20` |
| GET | `/admin/organizations/{id}` | Get org details (with vendors, owner, balance) | — |
| POST | `/admin/organizations/{id}/suspend` | Suspend org | `{ reason }` |
| POST | `/admin/organizations/{id}/activate` | Activate org | — |
| GET | `/admin/organizations/statistics` | Org statistics | Response: `{ total, active, suspended, by_country[], by_business_type[], total_balance, total_transaction_volume }` |

### A4. Transaction Management
| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| GET | `/admin/transactions` | List all transactions | `?search=&status[]=&gateway[]=&organization_id=&vendor_id=&from_date=&to_date=&min_amount=&max_amount=&currency=&settled=&sort_by=created_at&sort_direction=desc&page=1&per_page=20` |
| GET | `/admin/transactions/{id}` | Transaction detail | — |
| GET | `/admin/transactions/metrics` | Transaction metrics | Same filters minus pagination. Response: `{ total_transactions, total_amount, completed, pending, failed, refunded, average_value, by_gateway[], by_status[] }` |
| GET | `/admin/transactions/export` | Export transactions | `?format=csv|xlsx&` + same filters. Returns file blob. |

### A5. KYC Management
| Method | Endpoint | Description | Query Params / Body |
|--------|----------|-------------|---------------------|
| GET | `/admin/kyc` | List KYC documents | `?search=&status=&sort_by=created_at&sort_direction=desc&page=1&per_page=20` |
| GET | `/admin/kyc/{id}` | KYC document detail | — |
| GET | `/admin/kyc/pending` | Pending KYC documents | — |
| PATCH | `/admin/kyc/{organizationId}/status` | Update KYC status | `{ status: 'in_review'|'needs_more_info'|'reviewed'|'approved'|'rejected', reason?, internal_notes? }` |
| GET | `/admin/kyc/statistics` | KYC statistics | `?date_from=&date_to=`. Response: `{ total, pending, in_review, approved, rejected, average_review_time_hours }` |
| GET | `/admin/kyc/export` | Export KYC data | `?format=csv|xlsx|pdf&` + filters. Returns file blob. |

### A6. Roles & Permissions
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/admin/roles` | List roles | `?search=&sort_by=name&sort_direction=asc&page=1&per_page=20` |
| POST | `/admin/roles` | Create role | `{ name, guard_name, permissions[] }` |
| GET | `/admin/roles/{id}` | Get role with permissions | — |
| PUT | `/admin/roles/{id}` | Update role | `{ name, permissions[] }` |
| DELETE | `/admin/roles/{id}` | Delete role | — |
| GET | `/admin/roles/{id}/users` | Users with this role | `?search=&page=1&per_page=20` |
| GET | `/admin/roles/statistics` | Role statistics | Response: `{ total_roles, total_permissions, roles_with_users, most_assigned_role, roles_by_user_count[] }` |
| GET | `/admin/permissions` | List all permissions | `?grouped=true` (optional grouping by category) |
| POST | `/admin/assign-roles` | Assign roles to user | `{ user_id, roles[] }` |
| POST | `/admin/assign-permissions` | Assign direct permissions | `{ user_id, permissions[] }` |

### A7. Activity Logs
| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| GET | `/admin/logs` | List activity logs | `?level=info|warning|error|critical&action=&from_date=&to_date=&ip_address=&user_id=&sort_by=created_at&sort_direction=desc&page=1&per_page=20` |
| GET | `/admin/logs/{id}` | Log entry detail | — |
| GET | `/admin/logs/statistics` | Log statistics | Response: `{ total, info, warning, error, critical, logs_today, logs_this_week, top_actions[], top_users[] }` |
| GET | `/admin/logs/export` | Export logs | `?format=csv|xlsx&` + filters. Returns file blob. |

### A8. Revenue Reports
| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| GET | `/admin/reports/revenue` | Revenue report | `?period=today|week|month|quarter|year|custom&from_date=&to_date=&gateway=&currency=&organization_id=&vendor_id=` |
| GET | `/admin/reports/revenue/export` | Export revenue report | `?format=csv|xlsx|pdf&` + same filters. Returns file blob. |

**Revenue Response**: `{ total_revenue, total_transactions, average_transaction_value, completed_revenue, pending_revenue, failed_transactions, revenue_growth_percentage, by_gateway[], by_organization[], top_vendors[], revenue_over_time[], period_start, period_end }`

### A9. Messaging Providers
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/admin/messaging-providers` | List providers | `?channel=email|sms|whatsapp&is_active=&page=1&per_page=20` |
| POST | `/admin/messaging-providers` | Create provider | `{ name, driver, channel, credentials, priority, is_active, countries[] }` |
| GET | `/admin/messaging-providers/{id}` | Provider detail | — |
| PUT | `/admin/messaging-providers/{id}` | Update provider | `{ name, credentials, priority, is_active, countries[] }` |
| DELETE | `/admin/messaging-providers/{id}` | Delete provider | — |
| POST | `/admin/messaging-providers/{id}/toggle` | Toggle active status | — |
| POST | `/admin/messaging-providers/{id}/reset-failures` | Reset failure count | — |
| GET | `/admin/messaging-providers/statistics` | Provider statistics | Response: `{ total, active, inactive, by_channel, health }` |

### A10. Login Attempts (Security)
| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| GET | `/admin/login-attempts` | List login attempts | `?from_date=&to_date=&email=&ip_address=&successful=&page=1&per_page=20` |
| GET | `/admin/login-attempts/suspicious` | Suspicious attempts only | Same filters |
| GET | `/admin/login-attempts/statistics` | Login statistics | `?from_date=&to_date=`. Response: `{ total, successful, failed, suspicious, by_country, unique_ips, unique_users }` |

### A11. Notification Logs
| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| GET | `/admin/notification-logs` | List notification logs | `?channel=email|sms|whatsapp&status=pending|sent|delivered|failed&from_date=&to_date=&user_id=&page=1&per_page=20` |
| GET | `/admin/notification-logs/statistics` | Notification statistics | Response: `{ sent, delivered, failed, pending, by_channel, delivery_rate }` |

---

## B. NEW FEATURES — Endpoints to Build

These are endpoints for **new admin features** that need both backend APIs and frontend implementation.

### B1. Countries Management
| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|-------------|
| GET | `/admin/countries` | List countries | `?search=&region=&is_active=&can_send=&can_receive=&sort_by=name&sort_direction=asc&page=1&per_page=50` |
| POST | `/admin/countries` | Create country | `{ code, name, currency_code, currency_symbol, region, phone_code, is_active, can_send, can_receive, platform_fee_percentage, min_transaction_amount, max_transaction_amount }` |
| GET | `/admin/countries/{id}` | Country detail (with payment methods & gateways) | — |
| PUT | `/admin/countries/{id}` | Update country | Same as create body |
| DELETE | `/admin/countries/{id}` | Delete country | — |
| PUT | `/admin/countries/{id}/payment-methods` | Assign/update payment methods | `{ payment_methods: [{ payment_method, is_active, is_default, display_order, additional_fee_percentage }] }` |
| PUT | `/admin/countries/{id}/gateways` | Assign/update gateways | `{ gateways: [{ gateway_id, is_active, priority }] }` |
| GET | `/admin/countries/statistics` | Country statistics | Response: `{ total, active, by_region[], total_payment_methods, active_payment_methods }` |

### B2. Payment Gateways Management
| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|-------------|
| GET | `/admin/gateways` | List gateways | `?search=&is_active=&provider=&sort_by=name&sort_direction=asc&page=1&per_page=20` |
| POST | `/admin/gateways` | Create gateway | `{ name, slug, provider, is_active, supported_currencies[], fee_percentage, flat_fee, credentials, webhook_secret, mode }` |
| GET | `/admin/gateways/{id}` | Gateway detail (with countries, transactions summary) | — |
| PUT | `/admin/gateways/{id}` | Update gateway | Same as create body |
| DELETE | `/admin/gateways/{id}` | Delete gateway | — |
| POST | `/admin/gateways/{id}/toggle` | Toggle active status | — |
| GET | `/admin/gateways/statistics` | Gateway statistics | Response: `{ total, active, transaction_volume_by_gateway[], success_rate_by_gateway[], total_processed }` |

**Gateway Object**: `{ id, name, slug, provider, is_active, supported_currencies[], countries[], fee_percentage, flat_fee, mode: 'live'|'test', health_status: 'healthy'|'degraded'|'failing', total_transactions, success_rate, last_failure_at, created_at, updated_at }`

### B3. Fee Management
| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|-------------|
| GET | `/admin/fees` | Get all fee configurations | Response includes global + gateway overrides list |
| PUT | `/admin/fees/global` | Update global fees | `{ platform_fee_percentage, gateway_fee_percentage, flat_fee, fee_bearer: 'customer'|'vendor'|'split', split_percentage? }` |
| GET | `/admin/fees/gateways/{gatewayId}` | Get gateway-specific fees | — |
| PUT | `/admin/fees/gateways/{gatewayId}` | Update gateway fees | `{ fee_percentage, flat_fee, fee_bearer }` |
| GET | `/admin/fees/organizations/{orgId}` | Get org fee overrides | — |
| PUT | `/admin/fees/organizations/{orgId}` | Update org fee override | `{ platform_fee_percentage?, gateway_fee_percentage?, flat_fee?, fee_bearer?, is_active }` |
| GET | `/admin/fees/vendors/{vendorId}` | Get vendor fee overrides | — |
| PUT | `/admin/fees/vendors/{vendorId}` | Update vendor fee override | `{ platform_fee_percentage?, gateway_fee_percentage?, flat_fee?, fee_bearer?, is_active }` |
| GET | `/admin/fees/statistics` | Fee statistics | Response: `{ global_fees, total_overrides, org_overrides, vendor_overrides, total_fees_collected, avg_fee_percentage }` |

**Fee Hierarchy**: Global → Gateway → Organization → Vendor (most specific wins)

### B4. Admin Vendors
| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| GET | `/admin/vendors` | List all vendors (system-wide) | `?search=&status=active|inactive|suspended&organization_id=&country=&currency_code=&sort_by=created_at&sort_direction=desc&page=1&per_page=20` |
| GET | `/admin/vendors/{id}` | Vendor detail (with org, owner, balance, recent transactions, payment pages, payout accounts) | — |
| POST | `/admin/vendors/{id}/suspend` | Suspend vendor | `{ reason }` |
| POST | `/admin/vendors/{id}/activate` | Activate vendor | — |
| GET | `/admin/vendors/statistics` | Vendor statistics | Response: `{ total, active, suspended, by_country[], by_currency[], total_balance, total_revenue }` |

**Vendor Object**: `{ id, slug, business_name, business_email, business_phone, country, currency_code, status, balance, total_revenue, total_transactions, auto_payout_enabled, fee_percentage, fee_bearer, organization: { id, name }, owner: { id, name, email }, created_at, updated_at }`

### B5. Admin Payment Pages
| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| GET | `/admin/payment-pages` | List all payment pages | `?search=&status=active|inactive|suspended&vendor_id=&organization_id=&amount_type=fixed|flexible&currency=&sort_by=created_at&sort_direction=desc&page=1&per_page=20` |
| GET | `/admin/payment-pages/{id}` | Payment page detail (with vendor, org, transactions summary, fees) | — |
| POST | `/admin/payment-pages/{id}/suspend` | Suspend page | `{ reason }` |
| POST | `/admin/payment-pages/{id}/activate` | Activate page | — |
| GET | `/admin/payment-pages/statistics` | Page statistics | Response: `{ total, active, suspended, total_revenue, by_currency[], by_amount_type[] }` |

### B6. Admin Disbursements
| Method | Endpoint | Description | Query Params / Body |
|--------|----------|-------------|---------------------|
| GET | `/admin/disbursements` | List all disbursements | `?search=&status=pending|processing|completed|failed|cancelled&vendor_id=&organization_id=&from_date=&to_date=&min_amount=&max_amount=&sort_by=created_at&sort_direction=desc&page=1&per_page=20` |
| GET | `/admin/disbursements/{id}` | Disbursement detail | — |
| POST | `/admin/disbursements/{id}/approve` | Approve disbursement | `{ notes? }` |
| POST | `/admin/disbursements/{id}/reject` | Reject disbursement | `{ reason }` |
| GET | `/admin/disbursements/statistics` | Disbursement statistics | Response: `{ total_disbursed, pending_count, pending_amount, completed_count, failed_count, average_amount, by_status[], by_vendor[] }` |
| GET | `/admin/disbursements/export` | Export disbursements | `?format=csv|xlsx&` + filters. Returns file blob. |

### B7. Admin Payout Accounts
| Method | Endpoint | Description | Query Params / Body |
|--------|----------|-------------|---------------------|
| GET | `/admin/payout-accounts` | List all payout accounts | `?search=&type=bank_transfer|mobile_money&is_verified=&vendor_id=&organization_id=&country=&sort_by=created_at&sort_direction=desc&page=1&per_page=20` |
| GET | `/admin/payout-accounts/{id}` | Account detail | — |
| POST | `/admin/payout-accounts/{id}/verify` | Mark account verified | `{ notes? }` |
| POST | `/admin/payout-accounts/{id}/flag` | Flag account for review | `{ reason }` |
| GET | `/admin/payout-accounts/statistics` | Account statistics | Response: `{ total, by_type[], verified, unverified, by_country[], flagged }` |

---

## C. Summary

| Section | Category | Endpoint Count |
|---------|----------|---------------|
| A1 | Dashboard | 1 |
| A2 | Users | 10 |
| A3 | Organizations | 5 |
| A4 | Transactions | 4 |
| A5 | KYC | 6 |
| A6 | Roles & Permissions | 10 |
| A7 | Activity Logs | 4 |
| A8 | Revenue Reports | 2 |
| A9 | Messaging Providers | 8 |
| A10 | Login Attempts | 3 |
| A11 | Notification Logs | 2 |
| **A Total** | **Existing Frontend** | **55 endpoints** |
| B1 | Countries | 8 |
| B2 | Gateways | 7 |
| B3 | Fees | 9 |
| B4 | Vendors | 5 |
| B5 | Payment Pages | 5 |
| B6 | Disbursements | 6 |
| B7 | Payout Accounts | 5 |
| **B Total** | **New Features** | **45 endpoints** |
| **Grand Total** | | **100 endpoints** |

---

## D. Priority for Backend Implementation

### P0 — Critical (needed for admin to function at all)
1. Dashboard Statistics (A1)
2. User Management (A2)
3. Organization Management (A3)
4. Transaction Management (A4)
5. KYC Management (A5)
6. Roles & Permissions (A6)

### P1 — High (core admin features)
7. Countries Management (B1)
8. Payment Gateways (B2)
9. Fee Management (B3)
10. Admin Vendors (B4)

### P2 — Medium (operational features)
11. Admin Payment Pages (B5)
12. Admin Disbursements (B6)
13. Admin Payout Accounts (B7)
14. Activity Logs (A7)
15. Revenue Reports (A8)

### P3 — Lower (monitoring & compliance)
16. Messaging Providers (A9)
17. Login Attempts (A10)
18. Notification Logs (A11)

---

*Generated: February 2026*
*Frontend: Next.js 16 App Router*
*Backend: Laravel API v1*
