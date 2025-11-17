import { useAuthStore } from '@/lib/stores/auth-store';

/**
 * Hook to get the current vendor slug from the authenticated user
 *
 * This is required for all vendor API endpoints which use the pattern:
 * /vendors/{vendor_slug}/...
 *
 * The vendor slug is retrieved from:
 * user.organizations[0].vendors[0].slug
 *
 * Note: Currently assumes user has at least one organization with one vendor.
 * You may need to add organization/vendor selection logic if supporting multiple.
 *
 * @returns The vendor slug or null if not available
 */
export function useVendorSlug(): string | null {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  // Get the first organization's first vendor slug
  // Structure: user.organizations[0].vendors[0].slug
  const organization = user.organizations?.[0];
  const vendor = organization?.vendors?.[0];

  return vendor?.slug || null;
}

/**
 * Hook to get the current vendor slug with error handling
 * Throws an error if vendor slug is not available
 *
 * @returns The vendor slug (guaranteed to be defined)
 * @throws Error if vendor slug is not available
 */
export function useRequiredVendorSlug(): string {
  const vendorSlug = useVendorSlug();

  if (!vendorSlug) {
    throw new Error('Vendor slug not available. User may not be authenticated or not have vendor access.');
  }

  return vendorSlug;
}
