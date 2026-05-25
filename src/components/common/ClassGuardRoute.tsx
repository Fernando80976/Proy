import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { classService } from '../../services/ClassService';
import Preloader from './Preloader';
import { useLocation } from 'react-router-dom';

interface ClassGuardRouteProps {
  requireClass: boolean; // true: requiere clase (redirige a /Selection si no tiene), false: requiere NO tener clase (redirige a /Game/Status si tiene)
}

export const ClassGuardRoute = ({ requireClass }: ClassGuardRouteProps) => {
  const location = useLocation();

  const hasAssignedClassFromState = location.state?.hasAssignedClass;

   // Si ya se validó la clase en el login, no hace falta volver a chequear

  const { data: hasClass, isLoading, isError } = useQuery({
    queryKey: ['verify-class'],
    queryFn: classService.verifyClass,
    staleTime: 30_000, // 30 segundos
    gcTime: 5 * 60_000, // 5 minutos
    refetchOnWindowFocus: false,
    enabled: typeof hasAssignedClassFromState !== 'boolean',
  });

  const finalHasClass = typeof hasAssignedClassFromState === 'boolean' ? hasAssignedClassFromState : hasClass;
  //COMENTAR PARA PROBAR EL PRELOUDER DE LAS PANTALLAS DE JUEGO
  if (isLoading && typeof hasAssignedClassFromState !== 'boolean') {
        return (
      <div className="min-h-screen bg-background flex-1 flex items-center justify-center p-6">
        <Preloader message="Sincronizando datos con el Sistema..." />
      </div>
      
    );
  }

  if (isError) {
    // En caso de error (ej. token expirado), redirigir al login
    return <Navigate to="/Login" replace />;
  }

  //COMENTAR PARA PROBAR EL PRELOUDER DE LAS PANTALLAS DE JUEGO
  if (requireClass && !finalHasClass && !isLoading) {
    // Requiere clase pero no tiene: redirigir a selección
    return <Navigate to="/Selection" replace />;
  }

  if (!requireClass && finalHasClass) {
    // Requiere NO tener clase pero tiene: redirigir al juego
    return <Navigate to="/Game/Status" replace />;
  }

  // Permite el acceso
  return <Outlet />;
};