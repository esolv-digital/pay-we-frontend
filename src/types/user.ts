export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'suspended' | 'inactive';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}
