import { useEffect } from 'react';
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
import Animated, { 
  FadeInUp, 
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useChildStore } from '../../lib/stores/childStore';
import { useThemeStore } from '../../lib/stores/themeStore';
import { BADGES, Badge } from '../../constants/badges';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');
const BADGE_SIZE = (width - 80) / 3;

export default function BadgesScreen() {
  const router = useRouter();
  const { selectedChild } = useChildStore();
  const { colors, isDark } = useThemeStore();
  
  const earnedBadgeIds = selectedChild?.badges || [];
  
  // Separate earned and locked badges
  const earnedBadges = BADGES.filter(badge => earnedBadgeIds.includes(badge.id));
  const lockedBadges = BADGES.filter(badge => !earnedBadgeIds.includes(badge.id));
  
  // Calculate progress for each locked badge
  const getBadgeProgress = (badge: Badge): { current: number; required: number; percentage: number } => {
    if (!selectedChild) return { current: 0, required: badge.requirement.value, percentage: 0 };
    
    let current = 0;
    switch (badge.requirement.type) {
      case 'stars':
        current = selectedChild.totalStars;
        break;
      case 'streak':
        current = selectedChild.currentStreak;
        break;
      case 'tasks':
        current = selectedChild.totalTasksCompleted;
        break;
      case 'routines':
        current = selectedChild.totalRoutinesCompleted;
        break;
    }
    
    const percentage = Math.min(100, (current / badge.requirement.value) * 100);
    return { current, required: badge.requirement.value, percentage };
  };
  
  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? [colors.cardBg, colors.background] : [colors.secondary, colors.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>🏆 My Badges</Text>
          <View style={styles.placeholder} />
        </View>
        
        <Text style={styles.subtitle}>
          {earnedBadges.length} of {BADGES.length} earned
        </Text>
      </LinearGradient>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Earned Badges Section */}
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>✨ Earned Badges</Text>
          
          {earnedBadges.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.cardBg }]}>
              <Text style={styles.emptyEmoji}>🎯</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No badges yet!</Text>
              <Text style={[styles.emptyText, { color: colors.textLight }]}>
                Complete tasks to earn your first badge!
              </Text>
            </View>
          ) : (
            <View style={styles.badgeGrid}>
              {earnedBadges.map((badge, index) => (
                <Animated.View 
                  key={badge.id}
                  entering={FadeInUp.delay(150 + index * 50).springify()}
                >
                  <EarnedBadgeCard badge={badge} colors={colors} />
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
        
        {/* Locked Badges Section */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🔒 Badges to Earn</Text>
          
          <View style={styles.lockedBadgesList}>
            {lockedBadges.map((badge, index) => {
              const progress = getBadgeProgress(badge);
              return (
                <Animated.View 
                  key={badge.id}
                  entering={FadeInUp.delay(350 + index * 30).springify()}
                >
                  <LockedBadgeCard badge={badge} progress={progress} colors={colors} />
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Earned Badge Card Component
function EarnedBadgeCard({ badge, colors }: { badge: Badge; colors: any }) {
  const shine = useSharedValue(0);
  
  useEffect(() => {
    shine.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);
  
  const shineStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + shine.value * 0.3,
  }));
  
  return (
    <View style={[styles.earnedBadge, { borderColor: badge.color, backgroundColor: colors.cardBg }]}>
      <Animated.View style={[styles.badgeShine, shineStyle]} />
      <Text style={styles.badgeIcon}>{badge.icon}</Text>
      <Text style={[styles.badgeName, { color: colors.text }]}>{badge.name}</Text>
      <Text style={[styles.badgeDesc, { color: colors.textLight }]}>{badge.description}</Text>
    </View>
  );
}

// Locked Badge Card Component
function LockedBadgeCard({ badge, progress, colors }: { badge: Badge; progress: { current: number; required: number; percentage: number }; colors: any }) {
  const getRequirementLabel = (type: string): string => {
    switch (type) {
      case 'stars': return 'stars';
      case 'streak': return 'day streak';
      case 'tasks': return 'tasks';
      case 'routines': return 'routines';
      default: return '';
    }
  };
  
  const isClose = progress.percentage >= 75;
  
  return (
    <View style={[styles.lockedBadge, { backgroundColor: colors.cardBg }, isClose && styles.lockedBadgeClose]}>
      <View style={styles.lockedBadgeLeft}>
        <View style={[styles.lockedIconContainer, { backgroundColor: colors.inputBg }]}>
          <Text style={styles.lockedIcon}>{badge.icon}</Text>
          <View style={styles.lockOverlay}>
            <Text style={styles.lockEmoji}>🔒</Text>
          </View>
        </View>
        
        <View style={styles.lockedInfo}>
          <Text style={[styles.lockedName, { color: colors.text }]}>{badge.name}</Text>
          <Text style={[styles.lockedDesc, { color: colors.textLight }]}>{badge.description}</Text>
        </View>
      </View>
      
      <View style={styles.progressSection}>
        <View style={[styles.progressBar, { backgroundColor: colors.inputBg }]}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress.percentage}%`, backgroundColor: badge.color }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textLight }]}>
          {progress.current}/{progress.required} {getRequirementLabel(badge.requirement.type)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  placeholder: {
    width: 60,
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.textWhite,
    fontSize: 16,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 15,
    marginTop: 10,
  },
  emptyCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 15,
    marginBottom: 20,
  },
  earnedBadge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE + 30,
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  badgeShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFD700',
    borderRadius: 20,
  },
  badgeIcon: {
    fontSize: 40,
    marginBottom: 5,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 9,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 2,
  },
  lockedBadgesList: {
    gap: 12,
  },
  lockedBadge: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'column',
    gap: 12,
    opacity: 0.8,
  },
  lockedBadgeClose: {
    opacity: 1,
    borderWidth: 2,
    borderColor: Colors.star,
    borderStyle: 'dashed',
  },
  lockedBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lockedIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lockedIcon: {
    fontSize: 28,
    opacity: 0.4,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -5,
    right: -5,
  },
  lockEmoji: {
    fontSize: 16,
  },
  lockedInfo: {
    flex: 1,
  },
  lockedName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  lockedDesc: {
    fontSize: 12,
    color: Colors.textLight,
  },
  progressSection: {
    gap: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.inputBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'right',
  },
});

