import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Modal, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import Colors from '@/constants/Colors';

export interface ConfirmButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  disabled?: boolean;
}

export interface ConfirmProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: ConfirmButton[];
  onDismiss?: () => void;
  showCancelButton?: boolean;
  cancelText?: string;
  confirmText?: string;
  destructive?: boolean;
  icon?: React.ReactNode;
  customButtons?: ConfirmButton[];
}

const Confirm: React.FC<ConfirmProps> = ({
  visible,
  title,
  message,
  buttons,
  onDismiss,
  showCancelButton = true,
  cancelText = 'Cancel',
  confirmText = 'OK',
  destructive = false,
  icon,
  customButtons,
}) => {
  const { bottom } = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const defaultButtons: ConfirmButton[] = useMemo(() => {
    if (customButtons) return customButtons;
    
    const btn: ConfirmButton[] = [];
    
    if (showCancelButton) {
      btn.push({
        text: cancelText,
        style: 'cancel',
        onPress: onDismiss,
      });
    }
    
    btn.push({
      text: confirmText,
      style: destructive ? 'destructive' : 'default',
    });
    
    return btn;
  }, [customButtons, showCancelButton, cancelText, confirmText, destructive, onDismiss]);

  const finalButtons = buttons || defaultButtons;

  const handleButtonPress = useCallback((button: ConfirmButton) => {
    if (button.disabled) return;
    
    if (button.onPress) {
      button.onPress();
    }
    
    onDismiss?.();
  }, [onDismiss]);

  const getButtonStyle = useCallback((style?: string) => {
    switch (style) {
      case 'destructive':
        return 'bg-red-300 active:bg-red-400';
      case 'cancel':
        return 'bg-white/10 active:bg-white/20';
      default:
        return 'bg-accent active:bg-accent/80';
    }
  }, []);

  const getButtonTextStyle = useCallback((style?: string) => {
    switch (style) {
      case 'destructive':
        return 'text-black font-semibold';
      case 'cancel':
        return 'text-white font-semibold';
      default:
        return 'text-black font-semibold';
    }
  }, []);

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View 
        className="flex-1 justify-center items-center px-6 bg-primary/40"
        style={{ opacity: fadeAnim }}
      >
        <Animated.View
          className="bg-primary border border-white/10 rounded-[2.8em]
          p-4 w-full max-w-sm gap-4"
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* Icon */}
          {icon && (
            <View className="items-center">
              {icon}
            </View>
          )}

          <View className='gap-2'>
            {/* Title */}
            <Text className="text-xl font-semibold text-secondary text-center">
              {title}
            </Text>

            {/* Message */}
            {message && (
              <Text className="text-base text-secondary/80 text-center leading-5">
                {message}
              </Text>
            )}
          </View>

          {/* Buttons */}
          <View className={`flex-row gap-4 ${finalButtons.length === 1 ? 'justify-center' : ''}`}>
            {finalButtons.map((button, index) => (
              <Pressable
                key={index}
                onPress={() => handleButtonPress(button)}
                disabled={button.disabled}
                className={`flex-1 p-4 rounded-full ${getButtonStyle(button.style)} ${
                  button.disabled ? 'opacity-50' : ''
                }`}
              >
                <Text className={`text-center text-base leading-tight ${getButtonTextStyle(button.style)}`}>
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};



export default Confirm; 