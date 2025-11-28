import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/colors';
import { useThemeStore } from '../lib/stores/themeStore';

const { width } = Dimensions.get('window');

interface PinEntryProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  verifyPin: (pin: string) => boolean | Promise<boolean>;
  title?: string;
  subtitle?: string;
}

export default function PinEntry({
  visible,
  onSuccess,
  onCancel,
  verifyPin,
  title = 'Enter Parent PIN',
  subtitle = 'Enter your 4-digit PIN to continue',
}: PinEntryProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const shake = useSharedValue(0);
  
  useEffect(() => {
    if (!visible) {
      setPin('');
      setError(false);
    }
  }, [visible]);
  
  const handlePress = async (digit: string) => {
    if (pin.length >= 4) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);
    
    if (newPin.length === 4) {
      // Verify PIN (supports both sync and async verifyPin functions)
      setTimeout(async () => {
        try {
          const isValid = await Promise.resolve(verifyPin(newPin));
          if (isValid) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onSuccess();
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setError(true);
            shake.value = withSequence(
              withTiming(-10, { duration: 50 }),
              withTiming(10, { duration: 50 }),
              withTiming(-10, { duration: 50 }),
              withTiming(10, { duration: 50 }),
              withTiming(0, { duration: 50 })
            );
            setTimeout(() => setPin(''), 500);
          }
        } catch (err) {
          console.error('PIN verification error:', err);
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }, 100);
    }
  };
  
  const handleDelete = async () => {
    if (pin.length === 0) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin(pin.slice(0, -1));
    setError(false);
  };
  
  const dotsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));
  
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          
          {/* PIN Dots */}
          <Animated.View style={[styles.dotsContainer, dotsStyle]}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  pin.length > i && styles.dotFilled,
                  error && styles.dotError,
                ]}
              />
            ))}
          </Animated.View>
          
          {error && (
            <Text style={styles.errorText}>Incorrect PIN. Try again.</Text>
          )}
          
          {/* Number Pad */}
          <View style={styles.numpad}>
            {numbers.map((num, index) => (
              <Pressable
                key={index}
                style={[
                  styles.numButton,
                  num === '' && styles.numButtonEmpty,
                ]}
                onPress={() => {
                  if (num === '⌫') {
                    handleDelete();
                  } else if (num !== '') {
                    handlePress(num);
                  }
                }}
                disabled={num === ''}
              >
                {num !== '' && (
                  <Text style={[
                    styles.numText,
                    num === '⌫' && styles.deleteText,
                  ]}>
                    {num}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
          
          {/* Cancel Button */}
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxWidth: 350,
    backgroundColor: Colors.cardBg,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  lockIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dotError: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    marginBottom: 10,
    fontWeight: '600',
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 260,
    gap: 15,
    marginTop: 20,
  },
  numButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numButtonEmpty: {
    backgroundColor: 'transparent',
  },
  numText: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.text,
  },
  deleteText: {
    fontSize: 24,
  },
  cancelButton: {
    marginTop: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});


