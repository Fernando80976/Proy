import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      // Aquí puedes añadir más cosas globales en el futuro
      staleTime: 1000 * 60 * 5, // 5 minutos por defecto
    },
  },
});