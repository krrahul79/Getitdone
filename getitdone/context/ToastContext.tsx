import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import Toast, { ToastType } from '../components/Toast';

interface ToastContextType {
  showToast: (title: string, message: string, type?: ToastType) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [toastConfig, setToastConfig] = useState<{
    title: string;
    message: string;
    type: ToastType;
  }>({
    title: '',
    message: '',
    type: 'info',
  });

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  const showToast = useCallback((title: string, message: string, type: ToastType = 'info') => {
    setToastConfig({ title, message, type });
    setVisible(true);

    // Auto hiding is handled by a timer, but since we re-use state, 
    // we need to be careful about race conditions if needed.
    // For now, simple timeout works.
    setTimeout(() => {
        setVisible(false);
    }, 4000); 
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {visible && (
        <Toast
          visible={visible}
          title={toastConfig.title}
          message={toastConfig.message}
          type={toastConfig.type}
          onHide={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
