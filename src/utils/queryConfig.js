import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Keep unused data in cache for 30 minutes
    },
  },
});

// Prefetch common queries
export const prefetchCommonQueries = async () => {
  await Promise.all([
    // Prefetch initial farmers data
    queryClient.prefetchQuery({
      queryKey: ['farmers', { page: 1, limit: 10 }],
      queryFn: () => api.getFarmers(1, 10),
    }),
    // Prefetch common lookup data
    queryClient.prefetchQuery({
      queryKey: ['districts'],
      queryFn: () => api.getDistricts(),
    }),
  ]);
};

// Optimized query hooks
export const useOptimizedQueries = {
  // Get farmers with optimized pagination and filtering
  useFarmers: ({ page, limit, filters } = {}) => {
    return useQuery({
      queryKey: ['farmers', { page, limit, ...filters }],
      queryFn: () => api.getFarmers(page, limit, filters),
      keepPreviousData: true, // Keep previous data while fetching new data
      select: (data) => ({
        farmers: data.farmers,
        totalPages: data.totalPages,
        stats: data.stats,
      }),
    });
  },

  // Get single farmer with optimized caching
  useFarmer: (id) => {
    return useQuery({
      queryKey: ['farmer', id],
      queryFn: () => api.getFarmerById(id),
      enabled: !!id, // Only fetch when ID is available
    });
  },
};

// Mutation hooks with optimistic updates
export const useOptimizedMutations = {
  // Create farmer with optimistic update
  useCreateFarmer: () => {
    return useMutation({
      mutationFn: (data) => api.createFarmer(data),
      onMutate: async (newFarmer) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['farmers'] });

        // Snapshot the previous value
        const previousFarmers = queryClient.getQueryData(['farmers']);

        // Optimistically update
        queryClient.setQueryData(['farmers'], (old) => ({
          ...old,
          farmers: [newFarmer, ...old.farmers],
        }));

        return { previousFarmers };
      },
      onError: (err, newFarmer, context) => {
        queryClient.setQueryData(['farmers'], context.previousFarmers);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['farmers'] });
      },
    });
  },

  // Update farmer status with optimistic update
  useUpdateFarmerStatus: () => {
    return useMutation({
      mutationFn: ({ id, status }) => api.updateFarmerStatus(id, status),
      onMutate: async ({ id, status }) => {
        await queryClient.cancelQueries({ queryKey: ['farmers'] });
        const previousFarmers = queryClient.getQueryData(['farmers']);

        queryClient.setQueryData(['farmers'], (old) => ({
          ...old,
          farmers: old.farmers.map((f) =>
            f.id === id ? { ...f, status } : f
          ),
        }));

        return { previousFarmers };
      },
      onError: (err, variables, context) => {
        queryClient.setQueryData(['farmers'], context.previousFarmers);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['farmers'] });
      },
    });
  },
};