import React, { useState, useCallback } from 'react';
import { SystemNotifyContext, type NotificationType } from './SystemNotifyContext.ts';
import SystemNotification from '../../components/common/SystemNotification.tsx';

interface NotifyState {
  isOpen: boolean;
  message: string;
  type: NotificationType;
  title: string;
  onCloseAction?: () => void;
}

export const SystemNotifyProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<NotifyState>({
    isOpen: false,
    message: '',
    type: 'system',
    title: ''
  });

  const showNotify = useCallback((message: string, type: NotificationType = 'system', title = '', onCloseAction?: () => void) => {
    setState({ isOpen: true, message, type, title, onCloseAction });
  }, []);

  const hideNotify = useCallback(() => {
    // 1. Ejecutamos la acción si existe. 
    // Accedemos a la acción directamente desde el estado actual
    setState((prevState) => {
      if (prevState.onCloseAction) {
        prevState.onCloseAction();
      }
      // 2. Retornamos el nuevo estado (cerrado y limpio)
      return { 
        ...prevState, 
        isOpen: false, 
        onCloseAction: undefined 
      };
    });
  }, []);

  return (
    <SystemNotifyContext.Provider value={{ showNotify }}>
      {children}
      <SystemNotification 
        isOpen={state.isOpen}
        onClose={hideNotify}
        message={state.message}
        type={state.type}
        title={state.title}
      />
    </SystemNotifyContext.Provider>
  );
};