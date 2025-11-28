import { useState, useEffect } from 'react';
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
import Animated, { 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useChildStore } from '../../lib/stores/childStore';
import { useThemeStore } from '../../lib/stores/themeStore';
import { 
  BASE_AVATARS, 
  HATS, 
  ACCESSORIES, 
  OUTFITS, 
  BACKGROUNDS,
  AvatarItem,
  AvatarConfig,
} from '../../constants/avatars';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

type TabType = 'base' | 'hat' | 'accessory' | 'outfit' | 'background';

export default function AvatarScreen() {
  const router = useRouter();
  const { selectedChild, updateAvatar, purchaseItem } = useChildStore();
  const { colors, isDark } = useThemeStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('base');
  const [tempAvatar, setTempAvatar] = useState<AvatarConfig | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  // Animation
  const avatarBounce = useSharedValue(0);
  
  useEffect(() => {
    if (selectedChild) {
      setTempAvatar(selectedChild.avatar);
    }
    
    avatarBounce.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 600 }),
        withTiming(0, { duration: 600 })
      ),
      -1,
      true
    );
  }, [selectedChild]);
  
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: avatarBounce.value }],
  }));
  
  if (!selectedChild || !tempAvatar) return null;
  
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'base', label: 'Character', icon: '🐻' },
    { id: 'hat', label: 'Hats', icon: '👑' },
    { id: 'accessory', label: 'Items', icon: '✨' },
    { id: 'outfit', label: 'Outfits', icon: '👗' },
    { id: 'background', label: 'Backgrounds', icon: '🌈' },
  ];
  
  const getItemsForTab = (): AvatarItem[] => {
    switch (activeTab) {
      case 'base': return BASE_AVATARS;
      case 'hat': return HATS;
      case 'accessory': return ACCESSORIES;
      case 'outfit': return OUTFITS;
      case 'background': return BACKGROUNDS;
      default: return [];
    }
  };
  
  const isItemUnlocked = (item: AvatarItem) => {
    return item.unlocked || selectedChild.unlockedItems.includes(item.id);
  };
  
  const isItemEquipped = (item: AvatarItem) => {
    switch (item.type) {
      case 'base': return tempAvatar.base === item.id;
      case 'hat': return tempAvatar.hat === item.id;
      case 'accessory': return tempAvatar.accessory === item.id;
      case 'outfit': return tempAvatar.outfit === item.id;
      case 'background': return tempAvatar.background === item.id;
      default: return false;
    }
  };
  
  const handleSelectItem = async (item: AvatarItem) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!isItemUnlocked(item)) {
      // Try to purchase
      if (selectedChild.totalStars < item.cost) {
        Alert.alert(
          'Not Enough Stars! ⭐',
          `You need ${item.cost - selectedChild.totalStars} more stars to unlock ${item.name}.`
        );
        return;
      }
      
      Alert.alert(
        `Unlock ${item.name}?`,
        `This will cost ${item.cost} stars. You have ${selectedChild.totalStars} stars.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unlock! ⭐',
            onPress: async () => {
              setIsPurchasing(true);
              const success = await purchaseItem(item.id, item.cost);
              setIsPurchasing(false);
              
              if (success) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                // Equip the item
                equipItem(item);
              }
            },
          },
        ]
      );
      return;
    }
    
    // Equip the item
    equipItem(item);
  };
  
  const equipItem = (item: AvatarItem) => {
    const newAvatar = { ...tempAvatar };
    
    switch (item.type) {
      case 'base':
        newAvatar.base = item.id;
        break;
      case 'hat':
        newAvatar.hat = newAvatar.hat === item.id ? undefined : item.id;
        break;
      case 'accessory':
        newAvatar.accessory = newAvatar.accessory === item.id ? undefined : item.id;
        break;
      case 'outfit':
        newAvatar.outfit = newAvatar.outfit === item.id ? undefined : item.id;
        break;
      case 'background':
        newAvatar.background = item.id;
        break;
    }
    
    setTempAvatar(newAvatar);
  };
  
  const handleSave = async () => {
    await updateAvatar(tempAvatar);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };
  
  const getAvatarEmoji = (baseId: string) => {
    const avatarMap: Record<string, string> = {
      'bear': '🐻', 'bunny': '🐰', 'cat': '🐱', 'dog': '🐶',
      'panda': '🐼', 'fox': '🦊', 'lion': '🦁', 'unicorn': '🦄', 'dragon': '🐲',
    };
    return avatarMap[baseId] || '🐻';
  };
  
  const getBackgroundStyle = () => {
    const bgColors: Record<string, string[]> = {
      'rainbow': ['#FF6B9D', '#FFE66D', '#4ECDC4'],
      'stars': ['#2C3E50', '#3498DB'],
      'clouds': ['#87CEEB', '#E0F7FA'],
      'hearts': ['#FFB6C1', '#FFC0CB'],
      'space': ['#0C0C2C', '#1A1A40'],
      'ocean': ['#006994', '#40E0D0'],
      'forest': ['#228B22', '#90EE90'],
      'candy': ['#FF69B4', '#FFB6C1'],
    };
    return bgColors[tempAvatar.background] || bgColors['rainbow'];
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBg }]}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={[styles.closeText, { color: colors.textLight }]}>✕</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Customize Avatar</Text>
        <View style={styles.starsDisplay}>
          <Text style={styles.starsIcon}>⭐</Text>
          <Text style={styles.starsCount}>{selectedChild.totalStars}</Text>
        </View>
      </View>
      
      {/* Avatar Preview */}
      <View style={[styles.previewContainer, { backgroundColor: getBackgroundStyle()[0] }]}>
        <Animated.View style={[styles.avatarPreview, avatarStyle]}>
          {tempAvatar.hat && (
            <Text style={styles.hatPreview}>
              {HATS.find(h => h.id === tempAvatar.hat)?.emoji}
            </Text>
          )}
          <Text style={styles.avatarEmoji}>{getAvatarEmoji(tempAvatar.base)}</Text>
          {tempAvatar.accessory && (
            <Text style={styles.accessoryPreview}>
              {ACCESSORIES.find(a => a.id === tempAvatar.accessory)?.emoji}
            </Text>
          )}
          {tempAvatar.outfit && (
            <Text style={styles.outfitPreview}>
              {OUTFITS.find(o => o.id === tempAvatar.outfit)?.emoji}
            </Text>
          )}
        </Animated.View>
        <Text style={styles.childName}>{selectedChild.name}</Text>
      </View>
      
      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <Pressable
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      
      {/* Items Grid */}
      <ScrollView 
        style={styles.itemsContainer}
        contentContainerStyle={styles.itemsContent}
      >
        <View style={styles.itemsGrid}>
          {getItemsForTab().map((item, index) => {
            const unlocked = isItemUnlocked(item);
            const equipped = isItemEquipped(item);
            
            return (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay(index * 50).springify()}
              >
                <Pressable
                  style={[
                    styles.itemCard,
                    equipped && styles.itemCardEquipped,
                    !unlocked && styles.itemCardLocked,
                  ]}
                  onPress={() => handleSelectItem(item)}
                  disabled={isPurchasing}
                >
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                  
                  {!unlocked ? (
                    <View style={styles.costBadge}>
                      <Text style={styles.costText}>⭐{item.cost}</Text>
                    </View>
                  ) : equipped ? (
                    <View style={styles.equippedBadge}>
                      <Text style={styles.equippedText}>✓</Text>
                    </View>
                  ) : null}
                  
                  {!unlocked && (
                    <View style={styles.lockOverlay}>
                      <Text style={styles.lockIcon}>🔒</Text>
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
      
      {/* Save Button */}
      <View style={styles.footer}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: Colors.cardBg,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    color: Colors.textLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  starsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.star + '20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    gap: 5,
  },
  starsIcon: {
    fontSize: 16,
  },
  starsCount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.star,
  },
  previewContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  avatarPreview: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: Colors.textWhite,
    marginBottom: 15,
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 70,
  },
  hatPreview: {
    position: 'absolute',
    top: -30,
    fontSize: 40,
  },
  accessoryPreview: {
    position: 'absolute',
    right: -15,
    top: 10,
    fontSize: 30,
  },
  outfitPreview: {
    position: 'absolute',
    bottom: -10,
    fontSize: 30,
  },
  childName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textWhite,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tabsContainer: {
    maxHeight: 70,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabsContent: {
    paddingHorizontal: 15,
    gap: 10,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.primary + '20',
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  itemsContainer: {
    flex: 1,
  },
  itemsContent: {
    padding: 15,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemCard: {
    width: (width - 54) / 3,
    aspectRatio: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  itemCardEquipped: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  itemCardLocked: {
    opacity: 0.8,
  },
  itemEmoji: {
    fontSize: 36,
    marginBottom: 5,
  },
  itemName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  costBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.star,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  costText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  equippedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.success,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equippedText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  lockIcon: {
    fontSize: 16,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textWhite,
  },
});


