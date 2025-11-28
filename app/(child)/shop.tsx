import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../lib/stores/authStore';
import { useChildStore } from '../../lib/stores/childStore';
import { useRewardStore } from '../../lib/stores/rewardStore';
import { useThemeStore } from '../../lib/stores/themeStore';
import { Reward } from '../../lib/types';
import Colors from '../../constants/colors';
import CelebrationModal from '../../components/CelebrationModal';

const { width } = Dimensions.get('window');

export default function ShopScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { selectedChild, celebration, setCelebration } = useChildStore();
  const { 
    rewards, 
    childRedemptions,
    loadRewards, 
    loadChildRedemptions,
    redeemReward,
    isLoading,
  } = useRewardStore();
  const { colors, isDark } = useThemeStore();
  
  const [activeTab, setActiveTab] = useState<'shop' | 'history'>('shop');
  
  useEffect(() => {
    if (user) {
      loadRewards(user.uid);
    }
    if (selectedChild) {
      loadChildRedemptions(selectedChild.id);
    }
  }, [user, selectedChild]);
  
  if (!selectedChild) return null;
  
  const canAfford = (cost: number) => selectedChild.totalStars >= cost;
  
  const handleRedeem = async (reward: Reward) => {
    if (!canAfford(reward.starCost)) {
      Alert.alert(
        'Not Enough Stars! ⭐',
        `You need ${reward.starCost - selectedChild.totalStars} more stars to get this reward.`
      );
      return;
    }
    
    Alert.alert(
      `Get ${reward.name}?`,
      `This will cost ${reward.starCost} stars. You have ${selectedChild.totalStars} stars.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Redeem! 🎁',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            try {
              const redemption = await redeemReward(
                selectedChild.id,
                selectedChild.name,
                reward
              );
              
              if (redemption) {
                // Update local stars count in the store
                const { updateChild, selectChild } = useChildStore.getState();
                const updatedChild = {
                  ...selectedChild,
                  totalStars: selectedChild.totalStars - reward.starCost,
                };
                await updateChild(selectedChild.id, {
                  totalStars: updatedChild.totalStars,
                });
                // Also update selected child immediately in UI
                selectChild(updatedChild);
                
                // Show celebration
                setCelebration({
                  type: 'redemption',
                  title: 'Reward Requested!',
                  subtitle: 'Ask your parent to approve it!',
                  reward: {
                    name: reward.name,
                    icon: reward.icon,
                  },
                });
              } else {
                Alert.alert('Oops!', "Not enough stars or something went wrong.");
              }
            } catch (error) {
              Alert.alert('Oops!', 'Something went wrong. Please try again.');
            }
          },
        },
      ]
    );
  };
  
  const activeRewards = rewards.filter(r => r.isActive);
  const pendingRedemptions = childRedemptions.filter(r => r.status === 'pending' || r.status === 'approved');
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? [colors.cardBg, colors.background] : ['#9B59B6', '#8E44AD']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        </View>
        
        <Animated.View 
          entering={FadeInDown.springify()}
          style={styles.headerContent}
        >
          <Text style={styles.headerEmoji}>🏪</Text>
          <Text style={styles.headerTitle}>Rewards Shop</Text>
          
          {/* Stars Balance */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceIcon}>⭐</Text>
            <Text style={styles.balanceAmount}>{selectedChild.totalStars}</Text>
            <Text style={styles.balanceLabel}>stars to spend</Text>
          </View>
        </Animated.View>
      </LinearGradient>
      
      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.cardBg }]}>
        <Pressable
          style={[styles.tab, activeTab === 'shop' && styles.tabActive, activeTab === 'shop' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('shop')}
        >
          <Text style={[styles.tabText, { color: colors.textLight }, activeTab === 'shop' && styles.tabTextActive]}>
            🛒 Shop
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'history' && styles.tabActive, activeTab === 'history' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, { color: colors.textLight }, activeTab === 'history' && styles.tabTextActive]}>
            📜 My Rewards {pendingRedemptions.length > 0 && `(${pendingRedemptions.length})`}
          </Text>
        </Pressable>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === 'shop' ? (
          <>
            {activeRewards.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.cardBg }]}>
                <Text style={styles.emptyEmoji}>🏪</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Shop is empty!</Text>
                <Text style={styles.emptyText}>
                  Ask your parent to add some rewards
                </Text>
              </View>
            ) : (
              <View style={styles.rewardsGrid}>
                {activeRewards.map((reward, index) => {
                  const affordable = canAfford(reward.starCost);
                  return (
                    <Animated.View
                      key={reward.id}
                      entering={FadeInUp.delay(index * 100).springify()}
                    >
                      <Pressable
                        style={[
                          styles.rewardCard,
                          !affordable && styles.rewardCardLocked,
                        ]}
                        onPress={() => handleRedeem(reward)}
                      >
                        <View style={styles.rewardIconContainer}>
                          <Text style={styles.rewardIcon}>{reward.icon}</Text>
                        </View>
                        <Text style={styles.rewardName} numberOfLines={2}>
                          {reward.name}
                        </Text>
                        {reward.description && (
                          <Text style={styles.rewardDesc} numberOfLines={2}>
                            {reward.description}
                          </Text>
                        )}
                        <View style={[
                          styles.costBadge,
                          affordable ? styles.costAffordable : styles.costNotAffordable,
                        ]}>
                          <Text style={[
                            styles.costText,
                            affordable ? styles.costTextAffordable : styles.costTextNotAffordable,
                          ]}>
                            ⭐ {reward.starCost}
                          </Text>
                        </View>
                        
                        {!affordable && (
                          <View style={styles.lockedOverlay}>
                            <Text style={styles.lockedText}>
                              Need {reward.starCost - selectedChild.totalStars} more ⭐
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            )}
            
            {/* Motivation */}
            <Animated.View 
              entering={FadeInUp.delay(400).springify()}
              style={styles.motivationCard}
            >
              <Text style={styles.motivationEmoji}>💪</Text>
              <Text style={styles.motivationText}>
                Complete more tasks to earn stars and unlock rewards!
              </Text>
            </Animated.View>
          </>
        ) : (
          <>
            {/* Pending Rewards */}
            {pendingRedemptions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⏳ Waiting for Parent</Text>
                {pendingRedemptions.map((redemption, index) => (
                  <Animated.View
                    key={redemption.id}
                    entering={FadeInUp.delay(index * 50).springify()}
                  >
                    <View style={styles.historyCard}>
                      <Text style={styles.historyIcon}>{redemption.rewardIcon}</Text>
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyName}>{redemption.rewardName}</Text>
                        <Text style={styles.historyStatus}>
                          {redemption.status === 'pending' 
                            ? '🟡 Waiting for approval' 
                            : '🟢 Approved - coming soon!'}
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
            
            {/* Completed Rewards */}
            {childRedemptions.filter(r => r.status === 'completed').length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎁 Received Rewards</Text>
                {childRedemptions
                  .filter(r => r.status === 'completed')
                  .map((redemption, index) => (
                    <View key={redemption.id} style={styles.completedCard}>
                      <Text style={styles.completedIcon}>{redemption.rewardIcon}</Text>
                      <View style={styles.completedInfo}>
                        <Text style={styles.completedName}>{redemption.rewardName}</Text>
                        <Text style={styles.completedDate}>
                          ✅ Got it! ({redemption.starCost} ⭐)
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            )}
            
            {childRedemptions.length === 0 && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>📜</Text>
                <Text style={styles.emptyTitle}>No rewards yet</Text>
                <Text style={styles.emptyText}>
                  Redeem rewards from the shop to see them here!
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      
      {/* Celebration Modal */}
      <CelebrationModal 
        celebration={celebration}
        onClose={() => setCelebration(null)}
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
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  backText: {
    color: Colors.textWhite,
    fontWeight: '600',
    fontSize: 14,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textWhite,
    marginBottom: 15,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    gap: 8,
  },
  balanceIcon: {
    fontSize: 24,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.textWhite,
    opacity: 0.9,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#9B59B6' + '20',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textLight,
  },
  tabTextActive: {
    color: '#9B59B6',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  emptyCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  rewardCard: {
    width: (width - 55) / 2,
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  rewardCardLocked: {
    opacity: 0.7,
  },
  rewardIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#9B59B6' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardIcon: {
    fontSize: 40,
  },
  rewardName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
    minHeight: 40,
  },
  rewardDesc: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 10,
    minHeight: 30,
  },
  costBadge: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  costAffordable: {
    backgroundColor: Colors.success + '20',
  },
  costNotAffordable: {
    backgroundColor: Colors.error + '20',
  },
  costText: {
    fontSize: 14,
    fontWeight: '700',
  },
  costTextAffordable: {
    color: Colors.success,
  },
  costTextNotAffordable: {
    color: Colors.error,
  },
  lockedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
  },
  lockedText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textWhite,
    textAlign: 'center',
  },
  motivationCard: {
    backgroundColor: Colors.accent + '40',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  motivationEmoji: {
    fontSize: 35,
  },
  motivationText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 22,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 15,
  },
  historyCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  historyIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  historyStatus: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
  completedCard: {
    backgroundColor: Colors.success + '15',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedIcon: {
    fontSize: 35,
    marginRight: 12,
  },
  completedInfo: {
    flex: 1,
  },
  completedName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  completedDate: {
    fontSize: 12,
    color: Colors.success,
    marginTop: 2,
  },
});

