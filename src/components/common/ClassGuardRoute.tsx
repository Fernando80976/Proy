import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { classService } from '../../services/ClassService';
import Preloader from './Preloader';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ClassGuardRouteProps {
  requireClass: boolean;
}

export const ClassGuardRoute = ({ requireClass }: ClassGuardRouteProps) => {
  const location = useLocation();
  const { t } = useTranslation();
  const hasAssignedClassFromState = location.state?.hasAssignedClass;

   

  const { data: hasClass, isLoading, isError } = useQuery({
    queryKey: ['verify-class'],
    queryFn: classService.verifyClass,
    staleTime: 30_000, // 30 segundos
    gcTime: 5 * 60_000, // 5 minutos
    refetchOnWindowFocus: false,
    enabled: typeof hasAssignedClassFromState !== 'boolean',
  });

  const finalHasClass = typeof hasAssignedClassFromState === 'boolean' ? hasAssignedClassFromState : hasClass;
  
  if (isLoading && typeof hasAssignedClassFromState !== 'boolean') {
        return (
      <div className="min-h-screen bg-background flex-1 flex items-center justify-center p-6">
        <Preloader message={t('class.loading_sync')} />
      </div>
      
    );
  }

  if (isError) {
  
    return <Navigate to="/Login" replace />;
  }

  
  if (requireClass && !finalHasClass && !isLoading) {
  
    return <Navigate to="/Selection" replace />;
  }

  if (!requireClass && finalHasClass) {
  
    return <Navigate to="/Game/Status" replace />;
  }

  
  return <Outlet />;
};