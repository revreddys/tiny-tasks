import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useChildStore } from '../../../lib/stores/childStore';
import { useThemeStore } from '../../../lib/stores/themeStore';
import { BASE_AVATARS } from '../../../constants/avatars';
import Colors from '../../../constants/colors';

export default function EditChildScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { children, updateChild, removeChild, isLoading } = useChildStore();
  const { colors, isDark } = useThemeStore();
  
  const child = children.find(c => c.id === id);
  
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('bear');
  
  useEffect(() => {
    if (child) {
      setName(child.name);
      setSelectedAvatar(child.avatar.base);
    }
  }, [child]);
  
  if (!child) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={[styles.closeButton, { backgroundColor: colors.background }]}>
            <Text style={[styles.closeText, { color: colors.textLight }]}>✕</Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Child Not Found</Text>
          <View style={styles.placeholder} />
        </View>
      </View>
    );
  }
  
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Oops!', 'Please enter a name');
      return;
    }
    
    try {
      await updateChild(child.id, {
        name: name.trim(),
        avatar: { ...child.avatar, base: selectedAvatar },
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update');
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Child Profile?',
      `Are you sure you want to delete ${child.name}'s profile? This will remove all their progress and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeChild(child.id);
            router.back();
          },
        },
      ]
    );
  };
  
  const unlockedAvatars = BASE_AVATARS.filter(
    a => a.unlocked || child.unlockedItems.includes(a.id)
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={[styles.closeButton, { backgroundColor: colors.background }]}>
          <Text style={[styles.closeText, { color: colors.textLight }]}>✕</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Animated.View entering={FadeInUp.springify()}>
          {/* Preview */}
          <View style={styles.previewContainer}>
            <View style={styles.avatarPreview}>
              <Text style={styles.avatarPreviewText}>
                {unlockedAvatars.find(a => a.id === selectedAvatar)?.emoji || '🐻'}
              </Text>
            </View>
            <Text style={styles.previewName}>{name || 'Child Name'}</Text>
            
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>⭐ {child.totalStars}</Text>
                <Text style={styles.statLabel}>Stars</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>🔥 {child.currentStreak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>🏆 {child.badges.length}</Text>
                <Text style={styles.statLabel}>Badges</Text>
              </View>
            </View>
          </View>
          
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              placeholderTextColor={Colors.textLight}
              value={name}
              onChangeText={setName}
              maxLength={20}
            />
          </View>
          
          {/* Avatar Selection */}
          <View style={styles.avatarSection}>
            <Text style={styles.label}>Avatar</Text>
            <View style={styles.avatarGrid}>
              {unlockedAvatars.map((avatar) => (
                <Pressable
                  key={avatar.id}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === avatar.id && styles.avatarSelected,
                  ]}
                  onPress={() => setSelectedAvatar(avatar.id)}
                >
                  <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                  <Text style={styles.avatarName}>{avatar.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          
          {/* Delete Button */}
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>🗑️ Delete Profile</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
      
      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: colors.cardBg, borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.saveButton, { backgroundColor: colors.primary }, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Text>
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
    paddingBottom: 20,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.avatarBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  avatarPreviewText: {
    fontSize: 70,
  },
  previewName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 30,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 18,
    fontSize: 18,
    color: Colors.text,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  avatarSection: {
    marginBottom: 30,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarOption: {
    width: 80,
    height: 90,
    borderRadius: 16,
    backgroundColor: Colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.avatarBg,
  },
  avatarEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  avatarName: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: Colors.error + '15',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.error + '30',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
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
  buttonDisabled: {
    backgroundColor: Colors.buttonDisabled,
    shadowOpacity: 0,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textWhite,
  },
});


