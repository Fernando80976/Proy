import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '../../services/AuthService';
import Preloader from './Preloader';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const ProtectedRoute = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(
    location.state?.skipCheck ? true : null
  );

  useEffect(() => {

    if (isAuthorized === true) return;
    
    const check = async () => {
      const resp = await authService.verifyToken();
      setIsAuthorized(resp);
    };
    check();
  }, [isAuthorized]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-background flex-1 flex items-center justify-center p-6">
        <Preloader message={t('class.loading_sync')} />
      </div>
    );
  }; 

  return isAuthorized ? <Outlet /> : <Navigate to="/Login" replace />;
};