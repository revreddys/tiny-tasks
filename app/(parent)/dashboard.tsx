import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '../../lib/stores/authStore';
import { useChildStore } from '../../lib/stores/childStore';
import { useThemeStore } from '../../lib/stores/themeStore';
import Colors from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 15;
const CARD_WIDTH = (SCREEN_WIDTH - 40 - CARD_GAP) / 2; // 2 cards per row with padding

export default function ParentDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { children, loadChildren, selectChild } = useChildStore();
  const { colors, isDark } = useThemeStore();
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);
  
  const loadData = async () => {
    if (!user) return;
    await loadChildren(user.uid);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const handleSelectChild = (child: typeof children[0]) => {
    selectChild(child);
    router.push('/(child)/home');
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? [colors.cardBg, colors.background] : [colors.primary, colors.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>Hello, Parent! 👋</Text>
              <View style={styles.betaBadge}>
                <Text style={styles.betaText}>BETA</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>Manage your family's tasks</Text>
          </View>
          <View style={styles.headerButtons}>
            <Pressable onPress={() => router.replace('/(auth)/profiles')} style={styles.profileButton}>
              <Text style={styles.profileIcon}>👤</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(parent)/settings')} style={styles.settingsButton}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Children Section */}
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>👶 Children</Text>
            <Pressable 
              style={[styles.addButton, { backgroundColor: colors.secondary }]}
              onPress={() => router.push('/(parent)/add-child')}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          </View>
          
          {children.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.cardBg }]}>
              <Text style={styles.emptyEmoji}>👶</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No children yet</Text>
              <Text style={[styles.emptyText, { color: colors.textLight }]}>Add your first child to get started!</Text>
              <Pressable 
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(parent)/add-child')}
              >
                <Text style={styles.emptyButtonText}>Add Child</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.childrenGrid}>
              {children.map((child, index) => (
                <Animated.View 
                  key={child.id}
                  entering={FadeInUp.delay(150 + index * 50).springify()}
                >
                  <Pressable
                    style={[styles.childCard, { backgroundColor: colors.cardBg }]}
                    onPress={() => handleSelectChild(child)}
                    onLongPress={() => router.push(`/(parent)/edit-child/${child.id}`)}
                  >
                    <View style={[styles.childAvatar, { backgroundColor: colors.avatarBg }]}>
                      <Text style={styles.childAvatarText}>
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
                    </View>
                    <Text style={[styles.childName, { color: colors.text }]}>{child.name}</Text>
                    <View style={styles.childStats}>
                      <Text style={[styles.statItem, { color: colors.textLight }]}>⭐ {child.totalStars}</Text>
                      <Text style={[styles.statItem, { color: colors.textLight }]}>🔥 {child.currentStreak}</Text>
                    </View>
                    <View style={styles.childButtons}>
                      <Pressable 
                        style={[styles.setTasksButton, { backgroundColor: colors.primary }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          router.push(`/(parent)/daily-tasks/${child.id}`);
                        }}
                      >
                        <Text style={styles.setTasksButtonText}>📝 Tasks</Text>
                      </Pressable>
                      <Pressable 
                        style={[styles.playButton, { backgroundColor: colors.success }]}
                        onPress={() => handleSelectChild(child)}
                      >
                        <Text style={styles.playButtonText}>▶ Play</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
        
        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 15 }]}>⚡ Quick Actions</Text>
          
          <View style={styles.quickActionsGrid}>
            <Pressable 
              style={[styles.quickActionCard, { backgroundColor: colors.cardBg }]}
              onPress={() => router.push('/(parent)/task-templates')}
            >
              <Text style={styles.quickActionIcon}>📋</Text>
              <Text style={[styles.quickActionTitle, { color: colors.text }]}>Task Templates</Text>
              <Text style={[styles.quickActionDesc, { color: colors.textLight }]}>Save common tasks</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.quickActionCard, { backgroundColor: colors.cardBg }]}
              onPress={() => router.push('/(parent)/rewards')}
            >
              <Text style={styles.quickActionIcon}>🎁</Text>
              <Text style={[styles.quickActionTitle, { color: colors.text }]}>Rewards Shop</Text>
              <Text style={[styles.quickActionDesc, { color: colors.textLight }]}>Manage rewards</Text>
            </Pressable>
          </View>
        </Animated.View>
        
        {/* Tips Card */}
        <Animated.View 
          entering={FadeInUp.delay(400).springify()}
          style={[styles.tipsCard, { backgroundColor: isDark ? colors.cardBg : colors.accent }]}
        >
          <Text style={[styles.tipsTitle, { color: colors.text }]}>💡 How it works</Text>
          <Text style={[styles.tipsText, { color: colors.text }]}>
            1. Tap "📝 Tasks" to set daily tasks for each child{'\n'}
            2. Choose tasks and assign stars (1-5){'\n'}
            3. Let kids tap to complete and earn stars!{'\n'}
            4. Stars can be spent in the Rewards Shop
          </Text>
        </Animated.View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  betaBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  betaText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textWhite,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  profileButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  settingsButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
  },
  addButtonText: {
    color: Colors.textWhite,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: Colors.textWhite,
    fontWeight: '600',
    fontSize: 15,
  },
  childrenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 25,
  },
  childCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 18,
    width: CARD_WIDTH,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  childAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.avatarBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  childAvatarText: {
    fontSize: 40,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  childStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  childButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  setTasksButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  setTasksButtonText: {
    color: Colors.textWhite,
    fontWeight: '600',
    fontSize: 11,
  },
  playButton: {
    backgroundColor: Colors.success,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  playButtonText: {
    color: Colors.textWhite,
    fontWeight: '600',
    fontSize: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  quickActionDesc: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  tipsCard: {
    backgroundColor: Colors.accent,
    borderRadius: 20,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  bottomPadding: {
    height: 30,
  },
});
