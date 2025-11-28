import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '../../lib/stores/authStore';
import { useRewardStore } from '../../lib/stores/rewardStore';
import { useThemeStore } from '../../lib/stores/themeStore';
import { Reward, Redemption } from '../../lib/types';
import Colors from '../../constants/colors';

const REWARD_ICONS = ['🍕', '🍦', '📺', '🎮', '🎬', '🛝', '🎁', '🧸', '📚', '🎨', '🏊', '🚲', '🎂', '🍪', '🌟'];

export default function RewardsManagementScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    rewards, 
    redemptions,
    loadRewards, 
    loadRedemptions,
    addReward, 
    removeReward,
    updateRedemptionStatus,
    isLoading 
  } = useRewardStore();
  const { colors, isDark } = useThemeStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardCost, setNewRewardCost] = useState('');
  const [newRewardIcon, setNewRewardIcon] = useState('🎁');
  const [newRewardDesc, setNewRewardDesc] = useState('');
  const [activeTab, setActiveTab] = useState<'rewards' | 'requests'>('rewards');
  const [refreshing, setRefreshing] = useState(false);
  
  const loadData = async () => {
    if (user) {
      await loadRewards(user.uid);
      await loadRedemptions(user.uid);
    }
  };
  
  useEffect(() => {
    loadData();
  }, [user]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const handleAddReward = async () => {
    if (!newRewardName.trim()) {
      Alert.alert('Oops!', 'Please enter a reward name');
      return;
    }
    
    const cost = parseInt(newRewardCost);
    if (isNaN(cost) || cost <= 0) {
      Alert.alert('Oops!', 'Please enter a valid star cost');
      return;
    }
    
    if (!user) return;
    
    try {
      const rewardData: {
        name: string;
        icon: string;
        starCost: number;
        isActive: boolean;
        description?: string;
      } = {
        name: newRewardName.trim(),
        icon: newRewardIcon,
        starCost: cost,
        isActive: true,
      };
      
      // Only add description if not empty
      if (newRewardDesc.trim()) {
        rewardData.description = newRewardDesc.trim();
      }
      
      await addReward(user.uid, rewardData);
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };
  
  const resetForm = () => {
    setNewRewardName('');
    setNewRewardCost('');
    setNewRewardIcon('🎁');
    setNewRewardDesc('');
  };
  
  const handleDeleteReward = (reward: Reward) => {
    Alert.alert(
      'Delete Reward',
      `Are you sure you want to delete "${reward.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeReward(reward.id),
        },
      ]
    );
  };
  
  const handleRedemptionAction = (redemption: Redemption, action: 'approved' | 'completed' | 'rejected') => {
    const actionText = action === 'approved' ? 'approve' : action === 'completed' ? 'mark as given' : 'reject';
    const message = action === 'rejected' 
      ? `This will refund ${redemption.starCost} stars to ${redemption.childName}.`
      : `Mark "${redemption.rewardName}" as ${action}?`;
    
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Request`,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          style: action === 'rejected' ? 'destructive' : 'default',
          onPress: () => updateRedemptionStatus(
            redemption.id, 
            action, 
            action === 'rejected' ? redemption.childId : undefined
          ),
        },
      ]
    );
  };
  
  const pendingRedemptions = redemptions.filter(r => r.status === 'pending' || r.status === 'approved');
  const completedRedemptions = redemptions.filter(r => r.status === 'completed' || r.status === 'rejected');
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Rewards Shop</Text>
        <Pressable 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'rewards' && styles.tabActive]}
          onPress={() => setActiveTab('rewards')}
        >
          <Text style={[styles.tabText, activeTab === 'rewards' && styles.tabTextActive]}>
            🎁 Rewards ({rewards.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            📋 Requests {pendingRedemptions.length > 0 && `(${pendingRedemptions.length})`}
          </Text>
        </Pressable>
      </View>
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'rewards' ? (
          <>
            {rewards.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🎁</Text>
                <Text style={styles.emptyTitle}>No rewards yet</Text>
                <Text style={styles.emptyText}>
                  Add rewards your kids can redeem with their stars!
                </Text>
                <Pressable 
                  style={styles.emptyButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Text style={styles.emptyButtonText}>Add First Reward</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.rewardsList}>
                {rewards.map((reward, index) => (
                  <Animated.View
                    key={reward.id}
                    entering={FadeInUp.delay(index * 50).springify()}
                  >
                    <View style={styles.rewardCard}>
                      <Text style={styles.rewardIcon}>{reward.icon}</Text>
                      <View style={styles.rewardInfo}>
                        <Text style={styles.rewardName}>{reward.name}</Text>
                        {reward.description && (
                          <Text style={styles.rewardDesc}>{reward.description}</Text>
                        )}
                        <View style={styles.rewardCost}>
                          <Text style={styles.costText}>⭐ {reward.starCost} stars</Text>
                        </View>
                      </View>
                      <Pressable
                        style={styles.deleteButton}
                        onPress={() => handleDeleteReward(reward)}
                      >
                        <Text style={styles.deleteText}>🗑️</Text>
                      </Pressable>
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
            
            {/* Suggested Rewards */}
            <View style={styles.suggestionsCard}>
              <Text style={styles.suggestionsTitle}>💡 Reward Ideas</Text>
              <Text style={styles.suggestionsText}>
                • 30 mins TV time (50 ⭐){'\n'}
                • Ice cream treat (100 ⭐){'\n'}
                • Pizza night (200 ⭐){'\n'}
                • New toy (500 ⭐){'\n'}
                • Trip to the park (150 ⭐){'\n'}
                • Movie night (300 ⭐)
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* Pending Requests */}
            {pendingRedemptions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⏳ Pending Requests</Text>
                {pendingRedemptions.map((redemption, index) => (
                  <Animated.View
                    key={redemption.id}
                    entering={FadeInUp.delay(index * 50).springify()}
                  >
                    <View style={styles.redemptionCard}>
                      <View style={styles.redemptionHeader}>
                        <Text style={styles.redemptionIcon}>{redemption.rewardIcon}</Text>
                        <View style={styles.redemptionInfo}>
                          <Text style={styles.redemptionName}>{redemption.rewardName}</Text>
                          <Text style={styles.redemptionChild}>
                            {redemption.childName} • {redemption.starCost} ⭐
                          </Text>
                          <Text style={styles.redemptionStatus}>
                            Status: {redemption.status === 'pending' ? '🟡 Pending' : '🟢 Approved'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.redemptionActions}>
                        {redemption.status === 'pending' && (
                          <>
                            <Pressable
                              style={[styles.actionButton, styles.approveButton]}
                              onPress={() => handleRedemptionAction(redemption, 'approved')}
                            >
                              <Text style={styles.actionButtonText}>✓ Approve</Text>
                            </Pressable>
                            <Pressable
                              style={[styles.actionButton, styles.rejectButton]}
                              onPress={() => handleRedemptionAction(redemption, 'rejected')}
                            >
                              <Text style={styles.rejectButtonText}>✕ Reject</Text>
                            </Pressable>
                          </>
                        )}
                        {redemption.status === 'approved' && (
                          <Pressable
                            style={[styles.actionButton, styles.completeButton]}
                            onPress={() => handleRedemptionAction(redemption, 'completed')}
                          >
                            <Text style={styles.actionButtonText}>🎁 Mark as Given</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
            
            {/* Completed Requests */}
            {completedRedemptions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✅ History</Text>
                {completedRedemptions.slice(0, 10).map((redemption, index) => (
                  <View key={redemption.id} style={styles.historyItem}>
                    <Text style={styles.historyIcon}>{redemption.rewardIcon}</Text>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyName}>{redemption.rewardName}</Text>
                      <Text style={styles.historyChild}>
                        {redemption.childName} • {redemption.status === 'completed' ? '✅ Given' : '❌ Rejected'}
                      </Text>
                    </View>
                    <Text style={styles.historyCost}>{redemption.starCost} ⭐</Text>
                  </View>
                ))}
              </View>
            )}
            
            {redemptions.length === 0 && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>📋</Text>
                <Text style={styles.emptyTitle}>No requests yet</Text>
                <Text style={styles.emptyText}>
                  When kids redeem rewards, requests will appear here
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      
      {/* Add Reward Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>Add New Reward</Text>
              
              {/* Icon Selection */}
              <Text style={styles.modalLabel}>Select Icon</Text>
              <View style={styles.iconContainer}>
                {REWARD_ICONS.map((icon) => (
                  <Pressable
                    key={icon}
                    style={[
                      styles.iconOption,
                      newRewardIcon === icon && styles.iconSelected,
                    ]}
                    onPress={() => setNewRewardIcon(icon)}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </Pressable>
                ))}
              </View>
              
              {/* Name Input */}
              <Text style={styles.modalLabel}>Reward Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Ice Cream Treat"
                placeholderTextColor={Colors.textLight}
                value={newRewardName}
                onChangeText={setNewRewardName}
                maxLength={30}
              />
              
              {/* Cost Input */}
              <Text style={styles.modalLabel}>Star Cost</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 100"
                placeholderTextColor={Colors.textLight}
                value={newRewardCost}
                onChangeText={setNewRewardCost}
                keyboardType="number-pad"
                maxLength={5}
              />
              
              {/* Description Input */}
              <Text style={styles.modalLabel}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="e.g., One scoop of ice cream"
                placeholderTextColor={Colors.textLight}
                value={newRewardDesc}
                onChangeText={setNewRewardDesc}
                multiline
                maxLength={100}
              />
              
              {/* Preview */}
              <View style={styles.previewCard}>
                <Text style={styles.previewIcon}>{newRewardIcon}</Text>
                <Text style={styles.previewName}>{newRewardName || 'Reward Name'}</Text>
                <Text style={styles.previewCost}>⭐ {newRewardCost || '0'} stars</Text>
              </View>
              
              {/* Buttons */}
              <View style={styles.modalButtons}>
                <Pressable 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[styles.saveButton, isLoading && styles.buttonDisabled]}
                  onPress={handleAddReward}
                  disabled={isLoading}
                >
                  <Text style={styles.saveButtonText}>
                    {isLoading ? 'Adding...' : 'Add Reward'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  addText: {
    color: Colors.textWhite,
    fontWeight: '600',
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 15,
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
    backgroundColor: Colors.primary + '20',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
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
  rewardsList: {
    gap: 12,
    marginBottom: 20,
  },
  rewardCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  rewardIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  rewardDesc: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 6,
  },
  rewardCost: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.star,
  },
  deleteButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.error + '20',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 20,
  },
  suggestionsCard: {
    backgroundColor: Colors.accent + '30',
    borderRadius: 16,
    padding: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  suggestionsText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 24,
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
  redemptionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  redemptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  redemptionIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  redemptionInfo: {
    flex: 1,
  },
  redemptionName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  redemptionChild: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  redemptionStatus: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
  redemptionActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  completeButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    color: Colors.textWhite,
    fontWeight: '600',
    fontSize: 14,
  },
  rejectButtonText: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
  historyItem: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyIcon: {
    fontSize: 30,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  historyChild: {
    fontSize: 13,
    color: Colors.textLight,
  },
  historyCost: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.star,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  iconContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  iconText: {
    fontSize: 28,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputMultiline: {
    height: 70,
    textAlignVertical: 'top',
  },
  previewCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    borderStyle: 'dashed',
  },
  previewIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  previewCost: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.star,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 25,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.buttonDisabled,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textWhite,
  },
});

