import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '@/lib/api/vendor';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import { useRequiredVendorSlug } from './use-vendor-slug';
import type { CreatePaymentPageInput, UpdatePaymentPageInput } from '@/types';

export function usePaymentPages(filters?: {
  page?: number;
  per_page?: number;
  is_active?: boolean;
  amount_type?: 'fixed' | 'flexible' | 'donation';
  search?: string;
}) {
  const vendorSlug = useRequiredVendorSlug();

  return useQuery({
    queryKey: ['payment-pages', vendorSlug, filters],
    queryFn: () => vendorApi.getPaymentPages(vendorSlug, filters),
    enabled: !!vendorSlug,
  });
}

export function usePaymentPage(id: string) {
  const vendorSlug = useRequiredVendorSlug();

  return useQuery({
    queryKey: ['payment-page', vendorSlug, id],
    queryFn: () => vendorApi.getPaymentPage(vendorSlug, id),
    enabled: !!vendorSlug && !!id,
  });
}

export function useCreatePaymentPage() {
  const vendorSlug = useRequiredVendorSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentPageInput) =>
      vendorApi.createPaymentPage(vendorSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-pages', vendorSlug] });
      showSuccess('Payment page created successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

export function useUpdatePaymentPage(id: string) {
  const vendorSlug = useRequiredVendorSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePaymentPageInput) =>
      vendorApi.updatePaymentPage(vendorSlug, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-pages', vendorSlug] });
      queryClient.invalidateQueries({ queryKey: ['payment-page', vendorSlug, id] });
      showSuccess('Payment page updated successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

export function useDeletePaymentPage() {
  const vendorSlug = useRequiredVendorSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vendorApi.deletePaymentPage(vendorSlug, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-pages', vendorSlug] });
      showSuccess('Payment page deleted successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

export function useTogglePaymentPage() {
  const vendorSlug = useRequiredVendorSlug();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vendorApi.togglePaymentPage(vendorSlug, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-pages', vendorSlug] });
      showSuccess('Payment page status updated successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}
