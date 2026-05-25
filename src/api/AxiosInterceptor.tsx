// src/api/AxiosInterceptor.tsx
import { useEffect, useRef } from 'react'; // Añadimos useRef
import { useNavigate } from 'react-router-dom';
import apiCliente from './ApiClient';
import { useSystemNotify } from '../context/notifications/SystemNotifyContext';
import { queryClient } from './QueryClient';

export const AxiosInterceptor = ({ children }: { children: React.ReactNode }) => {
  const { showNotify } = useSystemNotify();
  const navigate = useNavigate();
  
  // Usamos una referencia para evitar redirecciones múltiples simultáneas
  const isRedirecting = useRef(false);

  useEffect(() => {
    const interceptor = apiCliente.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const url = error.config?.url || '';
          
          if (!url.includes('/auth/login') && !url.includes('/auth/verify')) {
            
            // Si ya estamos en proceso de redirección, no hacemos nada más
            if (isRedirecting.current) return Promise.reject(error);

            isRedirecting.current = true;

            showNotify(
              "¡ALERTA DE SISTEMA! Tu sesión ha expirado. Serás redirigido al inicio.",
              "warning",
              "SISTEMA",
              () => {
                // Esta es la onCloseAction. Solo se ejecuta cuando el usuario 
                // hace clic en "Aceptar Registro" o fuera del modal.
                isRedirecting.current = false;
                queryClient.clear()
                navigate('/Login'); 
              }
            );
          }
        }
        return Promise.reject(error);
      }
    );

    // Limpieza CRITICA: eject usa el ID que devuelve .use()
    return () => {
      apiCliente.interceptors.response.eject(interceptor);
    };
  }, [showNotify, navigate]);

  return <>{children}</>;
};