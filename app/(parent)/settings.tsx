import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../lib/stores/authStore';
import { useChildStore } from '../../lib/stores/childStore';
import { usePasscodeStore } from '../../lib/stores/passcodeStore';
import { useThemeStore } from '../../lib/stores/themeStore';
import Colors from '../../constants/colors';
import PinSetup from '../../components/PinSetup';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { children, loadChildren } = useChildStore();
  const { 
    loadPasscodes, 
    getParentPasscode,
    setParentPasscode, 
    removeParentPasscode, 
    verifyParentPasscode,
    hasPasscode,
    setPasscode,
    removePasscode,
    verifyPasscode,
  } = usePasscodeStore();
  const { mode, isDark, setMode, colors } = useThemeStore();
  
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  
  useEffect(() => {
    loadPasscodes();
    if (user) {
      loadChildren(user.uid);
    }
  }, [user]);
  
  // Parent PIN handlers
  const handleSetupParentPin = () => {
    setEditingChildId(null);
    setIsChangingPin(false);
    setShowPinSetup(true);
  };
  
  const handleChangeParentPin = () => {
    setEditingChildId(null);
    setIsChangingPin(true);
    setShowPinSetup(true);
  };
  
  const handleRemoveParentPin = () => {
    Alert.alert(
      'Remove Parent PIN?',
      'Anyone will be able to access parent settings from the profile screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeParentPasscode();
            Alert.alert('Done', 'Parent PIN has been removed');
          },
        },
      ]
    );
  };
  
  // Child PIN handlers
  const handleSetupChildPin = (childId: string) => {
    setEditingChildId(childId);
    setIsChangingPin(false);
    setShowPinSetup(true);
  };
  
  const handleChangeChildPin = (childId: string) => {
    setEditingChildId(childId);
    setIsChangingPin(true);
    setShowPinSetup(true);
  };
  
  const handleRemoveChildPin = (childId: string, childName: string) => {
    Alert.alert(
      `Remove ${childName}'s PIN?`,
      'Anyone will be able to access this profile without a PIN.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removePasscode(childId);
            Alert.alert('Done', `${childName}'s PIN has been removed`);
          },
        },
      ]
    );
  };
  
  const handlePinComplete = async (pin: string) => {
    try {
      if (editingChildId) {
        await setPasscode(editingChildId, pin);
        const childName = children.find(c => c.id === editingChildId)?.name || 'Child';
        setShowPinSetup(false);
        setEditingChildId(null);
        Alert.alert('Success! 🔒', `${childName}'s profile is now protected with a PIN.`);
      } else {
        await setParentPasscode(pin);
        setShowPinSetup(false);
        Alert.alert('Success! 🔒', 'Parent profile is now protected with a PIN.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save PIN. Please try again.');
    }
  };
  
  const getCurrentVerifyFn = () => {
    if (editingChildId) {
      return async (pin: string) => await verifyPasscode(editingChildId, pin);
    }
    return verifyParentPasscode;
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Parent PIN Section */}
        <Animated.View entering={FadeInUp.springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>👨‍👩‍👧 Parent Profile PIN</Text>
          
          <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Parent PIN</Text>
                <Text style={[styles.settingDesc, { color: colors.textLight }]}>
                  {getParentPasscode() 
                    ? 'Protected - requires PIN to access.'
                    : 'Set a PIN to protect the parent profile.'}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.background }]}>
                <Text style={[
                  styles.statusText, 
                  getParentPasscode() ? styles.statusOn : styles.statusOff
                ]}>
                  {getParentPasscode() ? '🟢 ON' : '🔴 OFF'}
                </Text>
              </View>
            </View>
            
            <View style={styles.buttonRow}>
              {getParentPasscode() ? (
                <>
                  <Pressable style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={handleChangeParentPin}>
                    <Text style={[styles.actionButtonText, { color: colors.text }]}>Change PIN</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.actionButton, styles.dangerButton]} 
                    onPress={handleRemoveParentPin}
                  >
                    <Text style={styles.dangerButtonText}>Remove</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleSetupParentPin}>
                  <Text style={[styles.primaryButtonText, { color: colors.textWhite }]}>Set Up PIN</Text>
                </Pressable>
              )}
            </View>
          </View>
        </Animated.View>
        
        {/* Child PINs Section */}
        {children.length > 0 && (
          <Animated.View entering={FadeInUp.delay(100).springify()}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>👶 Child Profile PINs</Text>
            
            {children.map((child, index) => (
              <View key={child.id} style={[styles.card, { backgroundColor: colors.cardBg }]}>
                <View style={styles.settingRow}>
                  <View style={styles.childInfo}>
                    <Text style={styles.childEmoji}>
                      {child.avatar.base === 'bear' ? '🐻' : 
                       child.avatar.base === 'bunny' ? '🐰' :
                       child.avatar.base === 'cat' ? '🐱' :
                       child.avatar.base === 'dog' ? '🐶' :
                       child.avatar.base === 'panda' ? '🐼' :
                       child.avatar.base === 'fox' ? '🦊' :
                       child.avatar.base === 'lion' ? '🦁' :
                       child.avatar.base === 'unicorn' ? '🦄' :
                       child.avatar.base === 'dragon' ? '🐲' : '🐻'}
                    </Text>
                    <View style={styles.settingInfo}>
                      <Text style={[styles.settingTitle, { color: colors.text }]}>{child.name}'s PIN</Text>
                      <Text style={[styles.settingDesc, { color: colors.textLight }]}>
                        {hasPasscode(child.id) 
                          ? 'Protected - requires PIN to access.'
                          : 'No PIN set for this profile.'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.background }]}>
                    <Text style={[
                      styles.statusText, 
                      hasPasscode(child.id) ? styles.statusOn : styles.statusOff
                    ]}>
                      {hasPasscode(child.id) ? '🔒' : '🔓'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.buttonRow}>
                  {hasPasscode(child.id) ? (
                    <>
                      <Pressable 
                        style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]} 
                        onPress={() => handleChangeChildPin(child.id)}
                      >
                        <Text style={[styles.actionButtonText, { color: colors.text }]}>Change</Text>
                      </Pressable>
                      <Pressable 
                        style={[styles.actionButton, styles.dangerButton]} 
                        onPress={() => handleRemoveChildPin(child.id, child.name)}
                      >
                        <Text style={styles.dangerButtonText}>Remove</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable 
                      style={[styles.primaryButton, { backgroundColor: colors.primary }]} 
                      onPress={() => handleSetupChildPin(child.id)}
                    >
                      <Text style={[styles.primaryButtonText, { color: colors.textWhite }]}>Set Up PIN</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </Animated.View>
        )}
        
        {/* Theme Section */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🎨 Appearance</Text>
          
          <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Theme</Text>
                <Text style={[styles.settingDesc, { color: colors.textLight }]}>
                  {mode === 'light' ? 'Bright and cheerful' : 
                   mode === 'dark' ? 'Easy on the eyes' : 
                   'Follows system setting'}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '⚙️'}
                </Text>
              </View>
            </View>
            
            <View style={styles.themeButtons}>
              <Pressable 
                style={[
                  styles.themeButton, 
                  mode === 'light' && styles.themeButtonActive,
                  { backgroundColor: mode === 'light' ? colors.primary : colors.inputBg }
                ]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMode('light');
                }}
              >
                <Text style={styles.themeEmoji}>☀️</Text>
                <Text style={[
                  styles.themeLabel, 
                  { color: mode === 'light' ? colors.textWhite : colors.text }
                ]}>Light</Text>
              </Pressable>
              
              <Pressable 
                style={[
                  styles.themeButton, 
                  mode === 'dark' && styles.themeButtonActive,
                  { backgroundColor: mode === 'dark' ? colors.primary : colors.inputBg }
                ]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMode('dark');
                }}
              >
                <Text style={styles.themeEmoji}>🌙</Text>
                <Text style={[
                  styles.themeLabel, 
                  { color: mode === 'dark' ? colors.textWhite : colors.text }
                ]}>Dark</Text>
              </Pressable>
              
              <Pressable 
                style={[
                  styles.themeButton, 
                  mode === 'system' && styles.themeButtonActive,
                  { backgroundColor: mode === 'system' ? colors.primary : colors.inputBg }
                ]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMode('system');
                }}
              >
                <Text style={styles.themeEmoji}>⚙️</Text>
                <Text style={[
                  styles.themeLabel, 
                  { color: mode === 'system' ? colors.textWhite : colors.text }
                ]}>Auto</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
        
        {/* Quick Links */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🔗 Quick Links</Text>
          
          <Pressable 
            style={[styles.linkCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            onPress={() => router.push('/(parent)/task-templates')}
          >
            <Text style={styles.linkIcon}>📋</Text>
            <View style={styles.linkInfo}>
              <Text style={[styles.linkTitle, { color: colors.text }]}>Task Templates</Text>
              <Text style={[styles.linkDesc, { color: colors.textLight }]}>Manage your saved task templates</Text>
            </View>
            <Text style={[styles.linkArrow, { color: colors.textLight }]}>→</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.linkCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            onPress={() => router.push('/(parent)/rewards')}
          >
            <Text style={styles.linkIcon}>🎁</Text>
            <View style={styles.linkInfo}>
              <Text style={[styles.linkTitle, { color: colors.text }]}>Rewards Shop</Text>
              <Text style={[styles.linkDesc, { color: colors.textLight }]}>Manage rewards and redemptions</Text>
            </View>
            <Text style={[styles.linkArrow, { color: colors.textLight }]}>→</Text>
          </Pressable>
        </Animated.View>
        
        {/* How it Works */}
        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <View style={[styles.infoCard, { backgroundColor: colors.accent }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>💡 How Profile PINs Work</Text>
            <Text style={[styles.infoText, { color: colors.text }]}>
              • App opens to a profile selection screen (like Netflix){'\n'}
              • Each profile can have its own PIN{'\n'}
              • Kids can only access their own profile{'\n'}
              • Parent PIN protects settings and management{'\n'}
              • Child PINs protect their stars from siblings{'\n'}
              • PINs are stored locally on this device
            </Text>
          </View>
        </Animated.View>
        
        {/* Account Section */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>👤 Account</Text>
          
          <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
            <View style={styles.accountRow}>
              <Text style={[styles.accountLabel, { color: colors.textLight }]}>Email</Text>
              <Text style={[styles.accountValue, { color: colors.text }]}>{user?.email}</Text>
            </View>
            
            <Pressable 
              style={[styles.actionButton, styles.dangerButton, styles.fullWidth]} 
              onPress={handleLogout}
            >
              <Text style={styles.dangerButtonText}>Sign Out</Text>
            </Pressable>
          </View>
        </Animated.View>
        
        {/* App Info */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <View style={styles.appInfo}>
            <Text style={[styles.appName, { color: colors.textLight }]}>Tiny Tasks</Text>
            <Text style={[styles.appVersion, { color: colors.textLight }]}>Version 1.0.0 (Beta)</Text>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* PIN Setup Modal */}
      <PinSetup
        visible={showPinSetup}
        onComplete={handlePinComplete}
        onCancel={() => {
          setShowPinSetup(false);
          setEditingChildId(null);
        }}
        isChanging={isChangingPin}
        verifyCurrentPin={isChangingPin ? getCurrentVerifyFn() : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 15,
    marginTop: 10,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  childEmoji: {
    fontSize: 35,
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusOn: {
    color: Colors.success,
  },
  statusOff: {
    color: Colors.error,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  dangerButton: {
    backgroundColor: Colors.error + '15',
    borderColor: Colors.error + '30',
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.error,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  fullWidth: {
    marginTop: 15,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  linkDesc: {
    fontSize: 13,
    color: Colors.textLight,
  },
  linkArrow: {
    fontSize: 20,
    color: Colors.textLight,
  },
  infoCard: {
    backgroundColor: Colors.accent + '40',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  accountLabel: {
    fontSize: 15,
    color: Colors.textLight,
  },
  accountValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
  },
  appVersion: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  themeButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  themeEmoji: {
    fontSize: 24,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});

