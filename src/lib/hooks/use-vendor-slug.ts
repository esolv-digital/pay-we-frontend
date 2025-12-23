import { useAuthStore } from '@/lib/stores/auth-store';
import { useAuth } from './use-auth';

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
 * @returns Object with vendor slug, loading state, and authenticated state
 */
export function useVendorSlug(): {
  vendorSlug: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
} {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const { isLoading } = useAuth();

  // Wait for store to hydrate before making decisions
  if (!hasHydrated) {
    return { vendorSlug: null, isLoading: true, isAuthenticated: false };
  }

  if (!user) {
    return { vendorSlug: null, isLoading, isAuthenticated: false };
  }

  // Get the first organization's first vendor slug
  // Structure: user.organizations[0].vendors[0].slug
  const organization = user.organizations?.[0];
  const vendor = organization?.vendors?.[0];

  return {
    vendorSlug: vendor?.slug || null,
    isLoading,
    isAuthenticated: true
  };
}

/**
 * Hook to get the current vendor slug with error handling
 * Returns null during loading phase, throws error only after loading completes
 *
 * @returns The vendor slug (or null during loading)
 * @throws Error if vendor slug is not available after loading completes
 */
export function useRequiredVendorSlug(): string | null {
  const { vendorSlug, isLoading, isAuthenticated } = useVendorSlug();

  // Don't throw error while still loading - return null to prevent queries from running
  if (isLoading) {
    return null;
  }

  // After loading completes, throw error if still no vendor slug
  if (!vendorSlug || !isAuthenticated) {
    throw new Error('Vendor slug not available. User may not be authenticated or not have vendor access.');
  }

  return vendorSlug;
}
