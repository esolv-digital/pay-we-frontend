import type { Organization } from './auth';

export interface Vendor {
  id: string;
  organization_id: string;
  business_name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  currency_code: string;
  status: 'active' | 'inactive';
  balance: number;
  total_revenue: number;
  total_transactions: number;
  created_at: string;
  organization?: Organization;
}
