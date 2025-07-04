import React, { createContext, useContext, useState, useCallback } from 'react';
import Confirm, { ConfirmButton, ConfirmProps } from './Confirm';

interface ConfirmContextType {
  showConfirm: (props: Omit<ConfirmProps, 'visible' | 'onDismiss'>) => Promise<number>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

interface ConfirmState extends Omit<ConfirmProps, 'visible' | 'onDismiss'> {
  visible: boolean;
  resolve: (value: number) => void;
}

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const showConfirm = useCallback((props: Omit<ConfirmProps, 'visible' | 'onDismiss'>) => {
    return new Promise<number>((resolve) => {
      setConfirmState({
        ...props,
        visible: true,
        resolve,
      });
    });
  }, []);

  const handleDismiss = useCallback(() => {
    if (confirmState) {
      confirmState.resolve(-1); // Cancel
      setConfirmState(null);
    }
  }, [confirmState]);

  const handleButtonPress = useCallback((button: ConfirmButton, index: number) => {
    if (confirmState) {
      if (button.onPress) {
        button.onPress();
      }
      confirmState.resolve(index);
      setConfirmState(null);
    }
  }, [confirmState]);

  const handleConfirmDismiss = useCallback(() => {
    handleDismiss();
  }, [handleDismiss]);

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {confirmState && (
        <Confirm
          {...confirmState}
          onDismiss={handleConfirmDismiss}
          buttons={confirmState.buttons?.map((button, index) => ({
            ...button,
            onPress: () => handleButtonPress(button, index),
          }))}
        />
      )}
    </ConfirmContext.Provider>
  );
};

// Convenience function to match Alert.alert API
export const confirm = (
  title: string,
  message?: string,
  buttons?: ConfirmButton[],
  options?: {
    cancelable?: boolean;
    onDismiss?: () => void;
  }
): Promise<number> => {
  // This function should be used within a component that has access to the ConfirmProvider
  // For global usage, you can create a singleton or use the useConfirm hook
  console.warn('confirm() function must be used within a ConfirmProvider. Use useConfirm hook instead.');
  return Promise.resolve(-1);
};

export default ConfirmProvider; 