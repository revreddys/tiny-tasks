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
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/colors';
import { useThemeStore } from '../lib/stores/themeStore';

const { width } = Dimensions.get('window');

interface PinSetupProps {
  visible: boolean;
  onComplete: (pin: string) => void;
  onCancel: () => void;
  isChanging?: boolean;
  verifyCurrentPin?: (pin: string) => boolean;
}

type Step = 'current' | 'enter' | 'confirm';

export default function PinSetup({
  visible,
  onComplete,
  onCancel,
  isChanging = false,
  verifyCurrentPin,
}: PinSetupProps) {
  const [step, setStep] = useState<Step>(isChanging ? 'current' : 'enter');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');
  const shake = useSharedValue(0);
  
  useEffect(() => {
    if (!visible) {
      setStep(isChanging ? 'current' : 'enter');
      setPin('');
      setFirstPin('');
      setError('');
    }
  }, [visible, isChanging]);
  
  const handlePress = async (digit: string) => {
    if (pin.length >= 4) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPin = pin + digit;
    setPin(newPin);
    setError('');
    
    if (newPin.length === 4) {
      setTimeout(() => handlePinComplete(newPin), 100);
    }
  };
  
  const handlePinComplete = (enteredPin: string) => {
    if (step === 'current') {
      // Verify current PIN
      if (verifyCurrentPin && verifyCurrentPin(enteredPin)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStep('enter');
        setPin('');
      } else {
        showError('Incorrect current PIN');
      }
    } else if (step === 'enter') {
      // Save first entry and go to confirm
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFirstPin(enteredPin);
      setStep('confirm');
      setPin('');
    } else if (step === 'confirm') {
      // Check if PINs match
      if (enteredPin === firstPin) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onComplete(enteredPin);
      } else {
        showError("PINs don't match. Try again.");
        setStep('enter');
        setFirstPin('');
        setPin('');
      }
    }
  };
  
  const showError = (message: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setError(message);
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    setTimeout(() => setPin(''), 500);
  };
  
  const handleDelete = async () => {
    if (pin.length === 0) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin(pin.slice(0, -1));
    setError('');
  };
  
  const dotsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));
  
  const getTitle = () => {
    if (step === 'current') return 'Enter Current PIN';
    if (step === 'enter') return isChanging ? 'Enter New PIN' : 'Create PIN';
    return 'Confirm PIN';
  };
  
  const getSubtitle = () => {
    if (step === 'current') return 'Enter your current PIN to continue';
    if (step === 'enter') return 'Choose a 4-digit PIN';
    return 'Enter the same PIN again';
  };
  
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
            <Text style={styles.lockIcon}>
              {step === 'confirm' ? '✓' : '🔐'}
            </Text>
            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.subtitle}>{getSubtitle()}</Text>
          </View>
          
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            {(isChanging ? ['current', 'enter', 'confirm'] : ['enter', 'confirm']).map((s, i) => (
              <View
                key={s}
                style={[
                  styles.stepDot,
                  (isChanging 
                    ? (s === 'current' && (step === 'current' || step === 'enter' || step === 'confirm')) ||
                      (s === 'enter' && (step === 'enter' || step === 'confirm')) ||
                      (s === 'confirm' && step === 'confirm')
                    : (s === 'enter' && (step === 'enter' || step === 'confirm')) ||
                      (s === 'confirm' && step === 'confirm')
                  ) && styles.stepDotActive,
                ]}
              />
            ))}
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
          
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View style={styles.errorPlaceholder} />
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
    marginBottom: 20,
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
  stepIndicator: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 10,
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
    fontWeight: '600',
    height: 20,
  },
  errorPlaceholder: {
    height: 20,
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 260,
    gap: 15,
    marginTop: 15,
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
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});


