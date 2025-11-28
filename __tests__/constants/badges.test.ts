import { BADGES, getBadgeById, getEarnableBadges, Badge } from '../../constants/badges';

describe('Badges', () => {
  describe('BADGES constant', () => {
    it('should have at least 10 badges defined', () => {
      expect(BADGES.length).toBeGreaterThanOrEqual(10);
    });

    it('should have unique badge IDs', () => {
      const ids = BADGES.map(b => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid requirement types for all badges', () => {
      const validTypes = ['stars', 'streak', 'tasks', 'routines'];
      BADGES.forEach(badge => {
        expect(validTypes).toContain(badge.requirement.type);
      });
    });

    it('should have positive requirement values for all badges', () => {
      BADGES.forEach(badge => {
        expect(badge.requirement.value).toBeGreaterThan(0);
      });
    });

    it('should have all required fields for each badge', () => {
      BADGES.forEach(badge => {
        expect(badge).toHaveProperty('id');
        expect(badge).toHaveProperty('name');
        expect(badge).toHaveProperty('description');
        expect(badge).toHaveProperty('icon');
        expect(badge).toHaveProperty('color');
        expect(badge).toHaveProperty('requirement');
        expect(badge.requirement).toHaveProperty('type');
        expect(badge.requirement).toHaveProperty('value');
      });
    });
  });

  describe('getBadgeById', () => {
    it('should return the correct badge for a valid ID', () => {
      const badge = getBadgeById('first-star');
      expect(badge).toBeDefined();
      expect(badge?.name).toBe('First Star');
      expect(badge?.requirement.type).toBe('stars');
      expect(badge?.requirement.value).toBe(1);
    });

    it('should return undefined for invalid ID', () => {
      const badge = getBadgeById('non-existent-badge');
      expect(badge).toBeUndefined();
    });

    it('should return streak badges correctly', () => {
      const badge = getBadgeById('week-warrior');
      expect(badge).toBeDefined();
      expect(badge?.requirement.type).toBe('streak');
      expect(badge?.requirement.value).toBe(7);
    });

    it('should return task badges correctly', () => {
      const badge = getBadgeById('task-starter');
      expect(badge).toBeDefined();
      expect(badge?.requirement.type).toBe('tasks');
      expect(badge?.requirement.value).toBe(10);
    });

    it('should return routine badges correctly', () => {
      const badge = getBadgeById('routine-rookie');
      expect(badge).toBeDefined();
      expect(badge?.requirement.type).toBe('routines');
      expect(badge?.requirement.value).toBe(5);
    });
  });

  describe('getEarnableBadges', () => {
    const baseStats = {
      totalStars: 0,
      currentStreak: 0,
      totalTasks: 0,
      totalRoutines: 0,
    };

    it('should return first-star badge when user has 1+ stars', () => {
      const stats = { ...baseStats, totalStars: 1 };
      const earnable = getEarnableBadges(stats, []);
      const firstStar = earnable.find(b => b.id === 'first-star');
      expect(firstStar).toBeDefined();
    });

    it('should return multiple star badges when requirements are met', () => {
      const stats = { ...baseStats, totalStars: 50 };
      const earnable = getEarnableBadges(stats, []);
      
      const earnableIds = earnable.map(b => b.id);
      expect(earnableIds).toContain('first-star');
      expect(earnableIds).toContain('star-collector'); // 10 stars
      expect(earnableIds).toContain('super-star'); // 50 stars
      expect(earnableIds).not.toContain('mega-star'); // 100 stars - not met
    });

    it('should not return already earned badges', () => {
      const stats = { ...baseStats, totalStars: 100 };
      const alreadyEarned = ['first-star', 'star-collector', 'super-star'];
      const earnable = getEarnableBadges(stats, alreadyEarned);
      
      const earnableIds = earnable.map(b => b.id);
      expect(earnableIds).not.toContain('first-star');
      expect(earnableIds).not.toContain('star-collector');
      expect(earnableIds).not.toContain('super-star');
      expect(earnableIds).toContain('mega-star'); // 100 stars - newly earnable
    });

    it('should return streak badges when streak requirement is met', () => {
      const stats = { ...baseStats, currentStreak: 7 };
      const earnable = getEarnableBadges(stats, []);
      
      const earnableIds = earnable.map(b => b.id);
      expect(earnableIds).toContain('getting-started'); // 3 days
      expect(earnableIds).toContain('week-warrior'); // 7 days
      expect(earnableIds).not.toContain('two-week-champ'); // 14 days - not met
    });

    it('should return task badges when task requirement is met', () => {
      const stats = { ...baseStats, totalTasks: 50 };
      const earnable = getEarnableBadges(stats, []);
      
      const earnableIds = earnable.map(b => b.id);
      expect(earnableIds).toContain('task-starter'); // 10 tasks
      expect(earnableIds).toContain('task-hero'); // 50 tasks
      expect(earnableIds).not.toContain('task-legend'); // 200 tasks - not met
    });

    it('should return routine badges when routine requirement is met', () => {
      const stats = { ...baseStats, totalRoutines: 25 };
      const earnable = getEarnableBadges(stats, []);
      
      const earnableIds = earnable.map(b => b.id);
      expect(earnableIds).toContain('routine-rookie'); // 5 routines
      expect(earnableIds).toContain('routine-pro'); // 25 routines
      expect(earnableIds).not.toContain('routine-champion'); // 100 routines - not met
    });

    it('should return empty array when no new badges can be earned', () => {
      const stats = { ...baseStats };
      const earnable = getEarnableBadges(stats, []);
      expect(earnable).toEqual([]);
    });

    it('should return badges from multiple categories', () => {
      const stats = {
        totalStars: 10,
        currentStreak: 3,
        totalTasks: 10,
        totalRoutines: 5,
      };
      const earnable = getEarnableBadges(stats, []);
      
      const types = earnable.map(b => b.requirement.type);
      expect(types).toContain('stars');
      expect(types).toContain('streak');
      expect(types).toContain('tasks');
      expect(types).toContain('routines');
    });
  });

  describe('Badge progression', () => {
    it('star badges should have increasing requirements', () => {
      const starBadges = BADGES.filter(b => b.requirement.type === 'stars')
        .sort((a, b) => a.requirement.value - b.requirement.value);
      
      for (let i = 1; i < starBadges.length; i++) {
        expect(starBadges[i].requirement.value).toBeGreaterThan(starBadges[i - 1].requirement.value);
      }
    });

    it('streak badges should have increasing requirements', () => {
      const streakBadges = BADGES.filter(b => b.requirement.type === 'streak')
        .sort((a, b) => a.requirement.value - b.requirement.value);
      
      for (let i = 1; i < streakBadges.length; i++) {
        expect(streakBadges[i].requirement.value).toBeGreaterThan(streakBadges[i - 1].requirement.value);
      }
    });

    it('task badges should have increasing requirements', () => {
      const taskBadges = BADGES.filter(b => b.requirement.type === 'tasks')
        .sort((a, b) => a.requirement.value - b.requirement.value);
      
      for (let i = 1; i < taskBadges.length; i++) {
        expect(taskBadges[i].requirement.value).toBeGreaterThan(taskBadges[i - 1].requirement.value);
      }
    });
  });
});

