import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Colors from '../constants/colors';
import { useThemeStore } from '../lib/stores/themeStore';

interface DateSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
}

// Helper to get local date string (not UTC!)
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const selectedDay = new Date(date);
  selectedDay.setHours(0, 0, 0, 0);
  
  if (selectedDay.getTime() === today.getTime()) {
    return 'Today';
  } else if (selectedDay.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

const isToday = (dateString: string): boolean => {
  const today = getLocalDateString();
  return dateString === today;
};

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const { colors, isDark } = useThemeStore();
  
  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (date) {
      const dateString = getLocalDateString(date);
      onDateChange(dateString);
      if (Platform.OS === 'ios') {
        setShowPicker(false);
      }
    }
  };
  
  const goToPreviousDay = () => {
    const current = new Date(selectedDate + 'T12:00:00'); // Use noon to avoid timezone issues
    current.setDate(current.getDate() - 1);
    onDateChange(getLocalDateString(current));
  };
  
  const goToNextDay = () => {
    const current = new Date(selectedDate + 'T12:00:00'); // Use noon to avoid timezone issues
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    current.setDate(current.getDate() + 1);
    
    // Don't allow future dates
    if (current <= today) {
      onDateChange(getLocalDateString(current));
    }
  };
  
  const goToToday = () => {
    const today = getLocalDateString();
    onDateChange(today);
  };
  
  const isTodaySelected = isToday(selectedDate);
  const maxDate = new Date();
  
  return (
    <View style={styles.container}>
      <View style={styles.dateRow}>
        {/* Previous Day Button */}
        <Pressable style={styles.arrowButton} onPress={goToPreviousDay}>
          <Text style={styles.arrowText}>◀</Text>
        </Pressable>
        
        {/* Date Display */}
        <Pressable style={styles.dateButton} onPress={() => setShowPicker(true)}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={[styles.dateText, !isTodaySelected && styles.dateTextPast]}>
            {formatDisplayDate(selectedDate)}
          </Text>
          {!isTodaySelected && (
            <View style={styles.pastBadge}>
              <Text style={styles.pastBadgeText}>Past</Text>
            </View>
          )}
        </Pressable>
        
        {/* Next Day Button */}
        <Pressable 
          style={[styles.arrowButton, isTodaySelected && styles.arrowDisabled]} 
          onPress={goToNextDay}
          disabled={isTodaySelected}
        >
          <Text style={[styles.arrowText, isTodaySelected && styles.arrowTextDisabled]}>▶</Text>
        </Pressable>
      </View>
      
      {/* Go to Today button (only show if not today) */}
      {!isTodaySelected && (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <Pressable style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>↩ Go to Today</Text>
          </Pressable>
        </Animated.View>
      )}
      
      {/* Date Picker Modal for iOS */}
      {Platform.OS === 'ios' && showPicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Date</Text>
                <Pressable onPress={() => setShowPicker(false)}>
                  <Text style={styles.doneButton}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={new Date(selectedDate + 'T00:00:00')}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={maxDate}
                textColor={Colors.text}
              />
            </View>
          </Pressable>
        </Modal>
      )}
      
      {/* Date Picker for Android */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={new Date(selectedDate + 'T00:00:00')}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={maxDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 15,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  arrowText: {
    fontSize: 18,
    color: Colors.textWhite,
    fontWeight: '700',
  },
  arrowTextDisabled: {
    opacity: 0.5,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  calendarIcon: {
    fontSize: 20,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  dateTextPast: {
    color: Colors.accent,
  },
  pastBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 5,
  },
  pastBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text,
  },
  todayButton: {
    marginTop: 10,
    backgroundColor: Colors.textWhite,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});


