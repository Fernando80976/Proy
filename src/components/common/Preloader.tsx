import { Loader2 } from 'lucide-react';

interface Props {
  message?: string;
}

const PreLoader = ({ message = "Sincronizando Con el Sistema..." }: Props) => {
  return (
    // Usamos flexbox con centrado total y altura dinámica
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-4 text-center">
      
      {/* Icono con tamaño adaptativo */}
      <Loader2 className="size-10 animate-spin text-system-glow md:size-16" />
      
      {/* Texto con ajuste de tamaño de fuente para móvil */}
      <p className="max-w-[80%] font-mono text-sm uppercase tracking-[0.2em] text-system-glow animate-pulse md:text-lg">
        {message}
      </p>
    </div>
  );
};

export default PreLoader;