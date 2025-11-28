export interface AvatarItem {
  id: string;
  name: string;
  type: 'base' | 'hat' | 'accessory' | 'outfit' | 'background';
  emoji: string;
  cost: number;
  unlocked?: boolean;
}

export interface AvatarConfig {
  base: string;
  hat?: string;
  accessory?: string;
  outfit?: string;
  background: string;
}

// Base characters (free)
export const BASE_AVATARS: AvatarItem[] = [
  { id: 'bear', name: 'Bear', type: 'base', emoji: '🐻', cost: 0, unlocked: true },
  { id: 'bunny', name: 'Bunny', type: 'base', emoji: '🐰', cost: 0, unlocked: true },
  { id: 'cat', name: 'Cat', type: 'base', emoji: '🐱', cost: 0, unlocked: true },
  { id: 'dog', name: 'Dog', type: 'base', emoji: '🐶', cost: 0, unlocked: true },
  { id: 'panda', name: 'Panda', type: 'base', emoji: '🐼', cost: 20 },
  { id: 'fox', name: 'Fox', type: 'base', emoji: '🦊', cost: 30 },
  { id: 'lion', name: 'Lion', type: 'base', emoji: '🦁', cost: 50 },
  { id: 'unicorn', name: 'Unicorn', type: 'base', emoji: '🦄', cost: 100 },
  { id: 'dragon', name: 'Dragon', type: 'base', emoji: '🐲', cost: 200 },
];

// Hats
export const HATS: AvatarItem[] = [
  { id: 'crown', name: 'Crown', type: 'hat', emoji: '👑', cost: 25 },
  { id: 'party-hat', name: 'Party Hat', type: 'hat', emoji: '🎉', cost: 15 },
  { id: 'wizard-hat', name: 'Wizard Hat', type: 'hat', emoji: '🧙', cost: 40 },
  { id: 'cowboy-hat', name: 'Cowboy Hat', type: 'hat', emoji: '🤠', cost: 30 },
  { id: 'top-hat', name: 'Top Hat', type: 'hat', emoji: '🎩', cost: 35 },
  { id: 'cap', name: 'Baseball Cap', type: 'hat', emoji: '🧢', cost: 10 },
  { id: 'tiara', name: 'Tiara', type: 'hat', emoji: '👸', cost: 45 },
];

// Accessories
export const ACCESSORIES: AvatarItem[] = [
  { id: 'glasses', name: 'Cool Glasses', type: 'accessory', emoji: '😎', cost: 15 },
  { id: 'bow', name: 'Bow', type: 'accessory', emoji: '🎀', cost: 10 },
  { id: 'star-wand', name: 'Star Wand', type: 'accessory', emoji: '⭐', cost: 30 },
  { id: 'heart', name: 'Heart', type: 'accessory', emoji: '💖', cost: 20 },
  { id: 'flower', name: 'Flower', type: 'accessory', emoji: '🌸', cost: 15 },
  { id: 'balloon', name: 'Balloon', type: 'accessory', emoji: '🎈', cost: 12 },
  { id: 'sparkles', name: 'Sparkles', type: 'accessory', emoji: '✨', cost: 25 },
];

// Outfits
export const OUTFITS: AvatarItem[] = [
  { id: 'superhero', name: 'Superhero Cape', type: 'outfit', emoji: '🦸', cost: 50 },
  { id: 'princess', name: 'Princess Dress', type: 'outfit', emoji: '👗', cost: 45 },
  { id: 'astronaut', name: 'Space Suit', type: 'outfit', emoji: '👨‍🚀', cost: 60 },
  { id: 'pirate', name: 'Pirate', type: 'outfit', emoji: '🏴‍☠️', cost: 40 },
  { id: 'fairy', name: 'Fairy Wings', type: 'outfit', emoji: '🧚', cost: 55 },
  { id: 'ninja', name: 'Ninja', type: 'outfit', emoji: '🥷', cost: 45 },
];

// Backgrounds
export const BACKGROUNDS: AvatarItem[] = [
  { id: 'rainbow', name: 'Rainbow', type: 'background', emoji: '🌈', cost: 0, unlocked: true },
  { id: 'stars', name: 'Stars', type: 'background', emoji: '⭐', cost: 0, unlocked: true },
  { id: 'clouds', name: 'Clouds', type: 'background', emoji: '☁️', cost: 10 },
  { id: 'hearts', name: 'Hearts', type: 'background', emoji: '💕', cost: 15 },
  { id: 'space', name: 'Space', type: 'background', emoji: '🚀', cost: 30 },
  { id: 'ocean', name: 'Ocean', type: 'background', emoji: '🌊', cost: 25 },
  { id: 'forest', name: 'Forest', type: 'background', emoji: '🌲', cost: 20 },
  { id: 'candy', name: 'Candy Land', type: 'background', emoji: '🍭', cost: 35 },
];

export const ALL_ITEMS: AvatarItem[] = [
  ...BASE_AVATARS,
  ...HATS,
  ...ACCESSORIES,
  ...OUTFITS,
  ...BACKGROUNDS,
];

export const getItemById = (id: string): AvatarItem | undefined => {
  return ALL_ITEMS.find(item => item.id === id);
};

export const getItemsByType = (type: AvatarItem['type']): AvatarItem[] => {
  return ALL_ITEMS.filter(item => item.type === type);
};

export const DEFAULT_AVATAR: AvatarConfig = {
  base: 'bear',
  background: 'rainbow',
};

export default { BASE_AVATARS, HATS, ACCESSORIES, OUTFITS, BACKGROUNDS, ALL_ITEMS };


