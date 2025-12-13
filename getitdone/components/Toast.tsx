import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  FadeInUp, 
  FadeOutUp, 
  SlideInUp, 
  SlideOutUp, 
  useSharedValue, 
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, FONTS } from '../constants/theme';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  title: string;
  message: string;
  type: ToastType;
  onHide: () => void;
}

const Toast = ({ visible, title, message, type, onHide }: ToastProps) => { 
  if (!visible) return null;

  const bgColors = {
    success: '#ecfdf5', // emerald-50
    error: '#fef2f2',   // red-50
    info: '#eff6ff',    // blue-50
  };

  const borderColors = {
    success: '#34d399', // emerald-400
    error: '#f87171',   // red-400
    info: '#60a5fa',    // blue-400
  };

  const iconName = {
    success: 'check-circle',
    error: 'exclamation-circle',
    info: 'info-circle',
  };

  const iconColor = {
    success: '#059669', // emerald-600
    error: '#dc2626',   // red-600
    info: '#2563eb',    // blue-600
  };

  return (
    <Animated.View 
      entering={SlideInUp.springify().damping(15)} 
      exiting={SlideOutUp}
      style={[
        styles.toastContainer, 
        { 
          backgroundColor: bgColors[type],
          borderLeftColor: borderColors[type],
        }
      ]}
    >
      <View style={styles.contentContainer}>
        <FontAwesome 
          name={iconName[type] as any} 
          size={24} 
          color={iconColor[type]} 
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: iconColor[type] }]}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
        <Pressable onPress={onHide} style={styles.closeBtn}>
          <FontAwesome name="times" size={16} color="#9ca3af" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default Toast; 

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50, // Safe area + margin
    left: 20,
    right: 20,
    borderRadius: 12,
    borderLeftWidth: 5,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 9999,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#374151',
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  }
});
