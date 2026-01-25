import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(255),
  last_name: z.string().min(1, 'Last name is required').max(255),
  middle_name: z.string().max(255).optional(),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().max(20).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string().min(8, 'Password confirmation must be at least 8 characters'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Onboarding Schema
export const onboardingSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(255),
  type: z.enum(['individual', 'corporate']).optional(),
  country_code: z.string().length(2, 'Country code must be 2 characters (e.g., NG, US)'),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Payment Page Schema
export const paymentPageSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  amount_type: z.enum(['fixed', 'flexible', 'donation']),
  fixed_amount: z.union([z.number().min(0), z.nan(), z.undefined()]).optional(),
  min_amount: z.union([z.number().min(0), z.nan(), z.undefined()]).optional(),
  max_amount: z.union([z.number().min(0), z.nan(), z.undefined()]).optional(),
  currency_code: z.string().length(3),
  collect_customer_info: z.boolean().optional(),
  collect_shipping_address: z.boolean().optional(),
  allow_quantity: z.boolean().optional(),
  redirect_url: z.string().url().optional().or(z.literal('')),
  // Fee handling: true = customer pays fees (added to amount), false = vendor pays (deducted)
  include_fees_in_amount: z.boolean().optional(),
}).refine(
  (data) => {
    // Validate fixed_amount when amount_type is 'fixed'
    if (data.amount_type === 'fixed') {
      return (
        data.fixed_amount !== undefined &&
        data.fixed_amount !== null &&
        !isNaN(data.fixed_amount) &&
        data.fixed_amount > 0
      );
    }
    return true;
  },
  {
    message: 'Fixed amount is required when amount type is fixed',
    path: ['fixed_amount'],
  }
).refine(
  (data) => {
    // Validate min_amount when amount_type is 'flexible' or 'donation'
    if (data.amount_type === 'flexible' || data.amount_type === 'donation') {
      return (
        data.min_amount !== undefined &&
        data.min_amount !== null &&
        !isNaN(data.min_amount) &&
        data.min_amount >= 0
      );
    }
    return true;
  },
  {
    message: 'Minimum amount is required for flexible and donation payment types (can be 0)',
    path: ['min_amount'],
  }
).refine(
  (data) => {
    // Validate max_amount > min_amount when amount_type is 'flexible'
    if (data.amount_type === 'flexible') {
      if (data.min_amount !== undefined && !isNaN(data.min_amount) && data.max_amount && !isNaN(data.max_amount)) {
        return data.max_amount > data.min_amount;
      }
    }
    return true;
  },
  {
    message: 'Maximum amount must be greater than minimum amount',
    path: ['max_amount'],
  }
);

export type PaymentPageFormData = z.infer<typeof paymentPageSchema>;

// KYC Review Schema
export const kycApprovalSchema = z.object({
  notes: z.string().optional(),
});

export const kycRejectionSchema = z.object({
  reason: z.string().min(20, 'Reason must be at least 20 characters'),
  notes: z.string().optional(),
});

export type KYCApprovalFormData = z.infer<typeof kycApprovalSchema>;
export type KYCRejectionFormData = z.infer<typeof kycRejectionSchema>;
