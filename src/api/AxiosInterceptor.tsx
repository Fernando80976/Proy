import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiCliente from './ApiClient';
import { useSystemNotify } from '../context/notifications/SystemNotifyContext';
import { queryClient } from './QueryClient';

export const AxiosInterceptor = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const { showNotify } = useSystemNotify();
  const navigate = useNavigate();
  const isRedirecting = useRef(false);

  useEffect(() => {
    const interceptor = apiCliente.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const url = error.config?.url || '';
          
          if (!url.includes('/auth/login') && !url.includes('/auth/verify')) {
            if (isRedirecting.current) return Promise.reject(error);

            isRedirecting.current = true;

            showNotify(
              t('auth.session_expired_notification'),
              'warning',
              t('common.system_notification.warning_title'),
              () => {
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

    return () => {
      apiCliente.interceptors.response.eject(interceptor);
    };
  }, [showNotify, navigate, t]);

  return <>{children}</>;
};