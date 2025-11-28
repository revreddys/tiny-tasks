import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '../../lib/stores/authStore';
import { useChildStore } from '../../lib/stores/childStore';
import { useThemeStore } from '../../lib/stores/themeStore';
import { BASE_AVATARS } from '../../constants/avatars';
import Colors from '../../constants/colors';

export default function AddChildScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addChild, isLoading } = useChildStore();
  const { colors, isDark } = useThemeStore();
  
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('bear');
  
  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Oops!', 'Please enter a name for your child');
      return;
    }
    
    if (!user) return;
    
    try {
      const child = await addChild(user.uid, name.trim());
      // Update avatar if different from default
      if (selectedAvatar !== 'bear') {
        const { updateChild } = useChildStore.getState();
        await updateChild(child.id, {
          avatar: { base: selectedAvatar, background: 'rainbow' },
        });
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add child');
    }
  };
  
  const freeAvatars = BASE_AVATARS.filter(a => a.cost === 0);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={[styles.closeButton, { backgroundColor: colors.background }]}>
          <Text style={[styles.closeText, { color: colors.textLight }]}>✕</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Add Child</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Animated.View entering={FadeInUp.springify()}>
          {/* Preview */}
          <View style={styles.previewContainer}>
            <View style={styles.avatarPreview}>
              <Text style={styles.avatarPreviewText}>
                {freeAvatars.find(a => a.id === selectedAvatar)?.emoji || '🐻'}
              </Text>
            </View>
            <Text style={styles.previewName}>{name || 'Child Name'}</Text>
          </View>
          
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Child's Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              placeholderTextColor={Colors.textLight}
              value={name}
              onChangeText={setName}
              maxLength={20}
              autoFocus
            />
          </View>
          
          {/* Avatar Selection */}
          <View style={styles.avatarSection}>
            <Text style={styles.label}>Choose Avatar</Text>
            <View style={styles.avatarGrid}>
              {freeAvatars.map((avatar) => (
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
            <Text style={styles.avatarHint}>
              🔒 More avatars can be unlocked with stars!
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Add Button */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.addButton, isLoading && styles.buttonDisabled]}
          onPress={handleAdd}
          disabled={isLoading}
        >
          <Text style={styles.addButtonText}>
            {isLoading ? 'Adding...' : 'Add Child'}
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
    marginBottom: 20,
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
  avatarHint: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 15,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addButton: {
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
  addButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textWhite,
  },
});


