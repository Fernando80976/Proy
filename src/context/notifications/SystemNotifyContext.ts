import { createContext, useContext } from 'react';

export type NotificationType = 'error' | 'warning' | 'info' | 'system';

export interface SystemNotifyContextType {
  showNotify: (message: string, type?: NotificationType, title?: string, onCloseAction?: () => void) => void;
}

export const SystemNotifyContext = createContext<SystemNotifyContextType | undefined>(undefined);

export const useSystemNotify = () => {
  const context = useContext(SystemNotifyContext);
  if (!context) {
    throw new Error('useSystemNotify debe usarse dentro de SystemNotifyProvider');
  }
  return context;
};