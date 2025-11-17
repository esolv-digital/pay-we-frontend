import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '@/lib/api/vendor';
import { showApiError, showSuccess } from '@/lib/utils/error-handler';
import type { CreatePaymentPageInput } from '@/types';

export function usePaymentPages() {
  return useQuery({
    queryKey: ['payment-pages'],
    queryFn: vendorApi.getPaymentPages,
  });
}

export function usePaymentPage(id: string) {
  return useQuery({
    queryKey: ['payment-page', id],
    queryFn: () => vendorApi.getPaymentPage(id),
    enabled: !!id,
  });
}

export function useCreatePaymentPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorApi.createPaymentPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-pages'] });
      showSuccess('Payment page created successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

export function useUpdatePaymentPage(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreatePaymentPageInput>) =>
      vendorApi.updatePaymentPage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-pages'] });
      queryClient.invalidateQueries({ queryKey: ['payment-page', id] });
      showSuccess('Payment page updated successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}

export function useDeletePaymentPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorApi.deletePaymentPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-pages'] });
      showSuccess('Payment page deleted successfully!');
    },
    onError: (error) => {
      showApiError(error);
    },
  });
}
