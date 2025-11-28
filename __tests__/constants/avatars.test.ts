import {
  BASE_AVATARS,
  HATS,
  ACCESSORIES,
  OUTFITS,
  BACKGROUNDS,
  ALL_ITEMS,
  getItemById,
  DEFAULT_AVATAR,
  AvatarItem,
  AvatarConfig,
} from '../../constants/avatars';

describe('Avatars', () => {
  describe('BASE_AVATARS', () => {
    it('should have at least 4 base avatars', () => {
      expect(BASE_AVATARS.length).toBeGreaterThanOrEqual(4);
    });

    it('should have at least 4 free base avatars', () => {
      const freeAvatars = BASE_AVATARS.filter(a => a.cost === 0);
      expect(freeAvatars.length).toBeGreaterThanOrEqual(4);
    });

    it('all base avatars should have type "base"', () => {
      BASE_AVATARS.forEach(avatar => {
        expect(avatar.type).toBe('base');
      });
    });

    it('should have unique IDs', () => {
      const ids = BASE_AVATARS.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('premium avatars should cost more than free ones', () => {
      const premiumAvatars = BASE_AVATARS.filter(a => a.cost > 0);
      premiumAvatars.forEach(avatar => {
        expect(avatar.cost).toBeGreaterThan(0);
      });
    });
  });

  describe('HATS', () => {
    it('should have at least 5 hats', () => {
      expect(HATS.length).toBeGreaterThanOrEqual(5);
    });

    it('all hats should have type "hat"', () => {
      HATS.forEach(hat => {
        expect(hat.type).toBe('hat');
      });
    });

    it('all hats should have a cost > 0', () => {
      HATS.forEach(hat => {
        expect(hat.cost).toBeGreaterThan(0);
      });
    });
  });

  describe('ACCESSORIES', () => {
    it('should have at least 5 accessories', () => {
      expect(ACCESSORIES.length).toBeGreaterThanOrEqual(5);
    });

    it('all accessories should have type "accessory"', () => {
      ACCESSORIES.forEach(item => {
        expect(item.type).toBe('accessory');
      });
    });
  });

  describe('OUTFITS', () => {
    it('should have at least 4 outfits', () => {
      expect(OUTFITS.length).toBeGreaterThanOrEqual(4);
    });

    it('all outfits should have type "outfit"', () => {
      OUTFITS.forEach(item => {
        expect(item.type).toBe('outfit');
      });
    });

    it('outfits should have reasonable costs', () => {
      OUTFITS.forEach(outfit => {
        expect(outfit.cost).toBeGreaterThanOrEqual(30);
        expect(outfit.cost).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('BACKGROUNDS', () => {
    it('should have at least 2 free backgrounds', () => {
      const freeBackgrounds = BACKGROUNDS.filter(b => b.cost === 0);
      expect(freeBackgrounds.length).toBeGreaterThanOrEqual(2);
    });

    it('all backgrounds should have type "background"', () => {
      BACKGROUNDS.forEach(item => {
        expect(item.type).toBe('background');
      });
    });
  });

  describe('ALL_ITEMS', () => {
    it('should contain all items from all categories', () => {
      const expectedLength = 
        BASE_AVATARS.length + 
        HATS.length + 
        ACCESSORIES.length + 
        OUTFITS.length + 
        BACKGROUNDS.length;
      expect(ALL_ITEMS.length).toBe(expectedLength);
    });

    it('should have unique IDs across all items', () => {
      const ids = ALL_ITEMS.map(item => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all items should have required fields', () => {
      ALL_ITEMS.forEach(item => {
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.type).toBeTruthy();
        expect(item.emoji).toBeTruthy();
        expect(typeof item.cost).toBe('number');
        expect(item.cost).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getItemById', () => {
    it('should return correct item for valid ID', () => {
      const bear = getItemById('bear');
      expect(bear).toBeDefined();
      expect(bear?.name).toBe('Bear');
      expect(bear?.type).toBe('base');
    });

    it('should return undefined for invalid ID', () => {
      const result = getItemById('non-existent-item');
      expect(result).toBeUndefined();
    });

    it('should find items from all categories', () => {
      expect(getItemById('crown')).toBeDefined(); // hat
      expect(getItemById('glasses')).toBeDefined(); // accessory
      expect(getItemById('superhero')).toBeDefined(); // outfit
      expect(getItemById('rainbow')).toBeDefined(); // background
    });
  });

  describe('DEFAULT_AVATAR', () => {
    it('should be a valid avatar config', () => {
      expect(DEFAULT_AVATAR).toHaveProperty('base');
      expect(DEFAULT_AVATAR).toHaveProperty('background');
    });

    it('should use a free base avatar as default', () => {
      const baseItem = getItemById(DEFAULT_AVATAR.base);
      expect(baseItem).toBeDefined();
      expect(baseItem?.cost).toBe(0);
    });

    it('should use a free background as default', () => {
      const bgItem = getItemById(DEFAULT_AVATAR.background);
      expect(bgItem).toBeDefined();
      expect(bgItem?.cost).toBe(0);
    });
  });

  describe('AvatarConfig structure', () => {
    it('should allow optional hat, accessory, and outfit', () => {
      const config: AvatarConfig = {
        base: 'bear',
        background: 'rainbow',
      };
      expect(config.hat).toBeUndefined();
      expect(config.accessory).toBeUndefined();
      expect(config.outfit).toBeUndefined();
    });

    it('should allow all fields to be set', () => {
      const config: AvatarConfig = {
        base: 'unicorn',
        hat: 'crown',
        accessory: 'sparkles',
        outfit: 'princess',
        background: 'hearts',
      };
      expect(config.base).toBe('unicorn');
      expect(config.hat).toBe('crown');
      expect(config.accessory).toBe('sparkles');
      expect(config.outfit).toBe('princess');
      expect(config.background).toBe('hearts');
    });
  });

  describe('Price progression', () => {
    it('base avatars should have increasing prices', () => {
      const sortedByPrice = [...BASE_AVATARS].sort((a, b) => a.cost - b.cost);
      // First few should be free
      expect(sortedByPrice[0].cost).toBe(0);
      // Later ones should cost more
      expect(sortedByPrice[sortedByPrice.length - 1].cost).toBeGreaterThan(50);
    });

    it('backgrounds should have reasonable price range', () => {
      const prices = BACKGROUNDS.map(b => b.cost);
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      expect(minPrice).toBe(0); // Some free
      expect(maxPrice).toBeLessThanOrEqual(50); // Not too expensive
    });
  });

  describe('Emoji validity', () => {
    it('all items should have non-empty emoji', () => {
      ALL_ITEMS.forEach(item => {
        expect(item.emoji.length).toBeGreaterThan(0);
      });
    });
  });
});

