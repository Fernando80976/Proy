import { Toaster } from 'sonner';

export const ToastProvider = () => {
  return (
    <Toaster 
      theme="dark" 
      position="top-right"
      closeButton={true}
      
      toastOptions={{
        unstyled: true,
        className: "flex justify-center sm:justify-end w-full",
        style: {
          userSelect: 'none',
        },
      }}
    />
  );
};