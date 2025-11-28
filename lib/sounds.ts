import { Audio } from 'expo-av';

// Sound effect types
type SoundType = 'taskComplete' | 'routineComplete' | 'starEarned' | 'badgeUnlocked' | 'tap';

// Pre-defined sound URLs (using public domain sounds)
const SOUND_URLS: Record<SoundType, string> = {
  taskComplete: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Success chime
  routineComplete: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Celebration
  starEarned: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // Coin/star sound
  badgeUnlocked: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Achievement
  tap: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Button tap
};

// Sound cache
const soundCache: Map<SoundType, Audio.Sound> = new Map();

// Initialize audio mode
let audioInitialized = false;

export const initializeAudio = async () => {
  if (audioInitialized) return;
  
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    audioInitialized = true;
  } catch (error) {
    console.warn('Failed to initialize audio:', error);
  }
};

// Load a sound
const loadSound = async (type: SoundType): Promise<Audio.Sound | null> => {
  // Check cache
  if (soundCache.has(type)) {
    return soundCache.get(type)!;
  }
  
  try {
    await initializeAudio();
    
    const { sound } = await Audio.Sound.createAsync(
      { uri: SOUND_URLS[type] },
      { shouldPlay: false }
    );
    
    soundCache.set(type, sound);
    return sound;
  } catch (error) {
    console.warn(`Failed to load sound ${type}:`, error);
    return null;
  }
};

// Play a sound
export const playSound = async (type: SoundType) => {
  try {
    const sound = await loadSound(type);
    if (sound) {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  } catch (error) {
    console.warn(`Failed to play sound ${type}:`, error);
  }
};

// Preload common sounds
export const preloadSounds = async () => {
  const soundsToPreload: SoundType[] = ['taskComplete', 'starEarned', 'tap'];
  await Promise.all(soundsToPreload.map(loadSound));
};

// Cleanup sounds
export const unloadSounds = async () => {
  for (const sound of soundCache.values()) {
    try {
      await sound.unloadAsync();
    } catch (error) {
      console.warn('Failed to unload sound:', error);
    }
  }
  soundCache.clear();
};

export default { playSound, preloadSounds, unloadSounds, initializeAudio };


