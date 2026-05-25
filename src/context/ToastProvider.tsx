import { Toaster } from 'sonner';

export const ToastProvider = () => {
  return (
    <Toaster 
      theme="dark" 
      position="top-right"
      closeButton={true}
      
      //className="pointer-events-none" 
      toastOptions={{
        unstyled: true, // Esto es vital para que Sonner no meta sus propios estilos
        // Añadimos una clase base para asegurar que el toast personalizado se centre en móvil
        className: "flex justify-center sm:justify-end w-full",
        style: {
          userSelect: 'none',   // Evita que se seleccione texto al intentar "arrastrar"
        },
      }}
    />
  );
};