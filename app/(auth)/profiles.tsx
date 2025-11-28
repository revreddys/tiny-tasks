import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../lib/stores/authStore';
import { useChildStore } from '../../lib/stores/childStore';
import { usePasscodeStore } from '../../lib/stores/passcodeStore';
import { useThemeStore } from '../../lib/stores/themeStore';
import { Child } from '../../lib/types';
import PinEntry from '../../components/PinEntry';

const { width } = Dimensions.get('window');

const AVATAR_EMOJIS: Record<string, string> = {
  'bear': '🐻', 'bunny': '🐰', 'cat': '🐱', 'dog': '🐶',
  'panda': '🐼', 'fox': '🦊', 'lion': '🦁', 'unicorn': '🦄', 'dragon': '🐲',
};

export default function ProfilesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { children, loadChildren, selectChild } = useChildStore();
  const { loadPasscodes, hasPasscode, verifyPasscode, verifyParentPasscode, getParentPasscode } = usePasscodeStore();
  const { colors, isDark } = useThemeStore();
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<{ type: 'parent' | 'child'; child?: Child } | null>(null);
  
  useEffect(() => {
    if (user) {
      loadChildren(user.uid).catch(err => {
        console.log('Error loading children:', err.message);
      });
      loadPasscodes().catch(err => {
        console.log('Error loading passcodes:', err.message);
      });
    }
  }, [user]);
  
  const handleSelectParent = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (getParentPasscode()) {
      setSelectedProfile({ type: 'parent' });
      setShowPinModal(true);
    } else {
      router.replace('/(parent)/dashboard');
    }
  };
  
  const handleSelectChild = async (child: Child) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (hasPasscode(child.id)) {
      setSelectedProfile({ type: 'child', child });
      setShowPinModal(true);
    } else {
      selectChild(child);
      router.replace('/(child)/home');
    }
  };
  
  const handlePinSuccess = () => {
    setShowPinModal(false);
    
    if (selectedProfile?.type === 'parent') {
      router.replace('/(parent)/dashboard');
    } else if (selectedProfile?.type === 'child' && selectedProfile.child) {
      selectChild(selectedProfile.child);
      router.replace('/(child)/home');
    }
    
    setSelectedProfile(null);
  };
  
  const handlePinCancel = () => {
    setShowPinModal(false);
    setSelectedProfile(null);
  };
  
  const verifyPin = async (pin: string): Promise<boolean> => {
    if (selectedProfile?.type === 'parent') {
      return await verifyParentPasscode(pin);
    } else if (selectedProfile?.type === 'child' && selectedProfile.child) {
      return await verifyPasscode(selectedProfile.child.id, pin);
    }
    return false;
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? [colors.gradientStart, colors.gradientEnd] : [colors.primary, colors.gradientEnd]}
        style={styles.gradient}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.springify()}
          style={styles.header}
        >
          <Text style={styles.appIcon}>✨</Text>
          <Text style={styles.title}>Who's Using the App?</Text>
          <Text style={styles.subtitle}>Select your profile to continue</Text>
        </Animated.View>
        
        {/* Profiles Grid */}
        <ScrollView 
          style={styles.profilesScroll}
          contentContainerStyle={styles.profilesContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Parent Profile */}
          <Animated.View entering={FadeInUp.delay(100).springify()}>
            <Pressable
              style={[styles.profileCard, { backgroundColor: colors.cardBg }]}
              onPress={handleSelectParent}
            >
              <View style={[styles.profileAvatar, { backgroundColor: colors.primary + '30' }]}>
                <Text style={styles.profileEmoji}>👨‍👩‍👧</Text>
              </View>
              <Text style={[styles.profileName, { color: colors.text }]}>Parent</Text>
              {getParentPasscode() && (
                <View style={styles.lockBadge}>
                  <Text style={styles.lockIcon}>🔒</Text>
                </View>
              )}
            </Pressable>
          </Animated.View>
          
          {/* Children Profiles */}
          {children.map((child, index) => (
            <Animated.View 
              key={child.id}
              entering={FadeInUp.delay(200 + index * 100).springify()}
            >
              <Pressable
                style={[styles.profileCard, { backgroundColor: colors.cardBg }]}
                onPress={() => handleSelectChild(child)}
              >
                <View style={[styles.profileAvatar, { backgroundColor: getChildColor(index) }]}>
                  <Text style={styles.profileEmoji}>
                    {AVATAR_EMOJIS[child.avatar.base] || '🐻'}
                  </Text>
                </View>
                <Text style={[styles.profileName, { color: colors.text }]}>{child.name}</Text>
                <View style={[styles.starsDisplay, { backgroundColor: colors.star + '20' }]}>
                  <Text style={[styles.starsText, { color: colors.star }]}>⭐ {child.totalStars}</Text>
                </View>
                {hasPasscode(child.id) && (
                  <View style={styles.lockBadge}>
                    <Text style={styles.lockIcon}>🔒</Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          ))}
          
          {/* Add profile hint */}
          {children.length === 0 && (
            <Animated.View 
              entering={FadeInUp.delay(300).springify()}
              style={styles.hintCard}
            >
              <Text style={styles.hintEmoji}>👶</Text>
              <Text style={styles.hintText}>
                No children yet!{'\n'}Go to Parent profile to add kids.
              </Text>
            </Animated.View>
          )}
        </ScrollView>
        
        {/* Footer */}
        <Animated.View 
          entering={FadeInUp.delay(500).springify()}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            {getParentPasscode() || children.some(c => hasPasscode(c.id))
              ? '🔒 Profiles with locks require PIN'
              : '💡 Set PINs in Parent Settings to protect profiles'}
          </Text>
        </Animated.View>
      </LinearGradient>
      
      {/* PIN Entry Modal */}
      <PinEntry
        visible={showPinModal}
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
        verifyPin={verifyPin}
        title={selectedProfile?.type === 'parent' 
          ? 'Parent PIN' 
          : `${selectedProfile?.child?.name}'s PIN`}
        subtitle="Enter your 4-digit PIN"
      />
    </View>
  );
}

const getChildColor = (index: number) => {
  const childColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  return childColors[index % childColors.length] + '40';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 30,
  },
  appIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  profilesScroll: {
    flex: 1,
  },
  profilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 20,
  },
  profileCard: {
    width: (width - 60) / 2,
    borderRadius: 24,
    paddingVertical: 25,
    paddingHorizontal: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileEmoji: {
    fontSize: 45,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  starsDisplay: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  starsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 4,
  },
  lockIcon: {
    fontSize: 16,
  },
  hintCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  hintEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  hintText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
});
