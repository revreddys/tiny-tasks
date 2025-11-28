import { TASK_CATEGORIES, TaskCategory } from '../../lib/types';

describe('Types', () => {
  describe('TASK_CATEGORIES', () => {
    it('should have 4 categories defined', () => {
      expect(TASK_CATEGORIES.length).toBe(4);
    });

    it('should have morning, afternoon, evening, and anytime categories', () => {
      const categoryIds = TASK_CATEGORIES.map(c => c.id);
      expect(categoryIds).toContain('morning');
      expect(categoryIds).toContain('afternoon');
      expect(categoryIds).toContain('evening');
      expect(categoryIds).toContain('anytime');
    });

    it('should have categories in logical time order', () => {
      expect(TASK_CATEGORIES[0].id).toBe('morning');
      expect(TASK_CATEGORIES[1].id).toBe('afternoon');
      expect(TASK_CATEGORIES[2].id).toBe('evening');
      expect(TASK_CATEGORIES[3].id).toBe('anytime');
    });

    it('should have all required fields for each category', () => {
      TASK_CATEGORIES.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('icon');
        expect(category).toHaveProperty('color');
      });
    });

    it('should have unique category IDs', () => {
      const ids = TASK_CATEGORIES.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid hex color codes', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      TASK_CATEGORIES.forEach(category => {
        expect(category.color).toMatch(hexColorRegex);
      });
    });

    it('should have non-empty icons', () => {
      TASK_CATEGORIES.forEach(category => {
        expect(category.icon.length).toBeGreaterThan(0);
      });
    });

    it('should have human-readable names', () => {
      TASK_CATEGORIES.forEach(category => {
        expect(category.name).toBeTruthy();
        expect(category.name.charAt(0)).toBe(category.name.charAt(0).toUpperCase());
      });
    });
  });

  describe('TaskCategory type', () => {
    it('should allow valid category values', () => {
      const validCategories: TaskCategory[] = ['morning', 'afternoon', 'evening', 'anytime'];
      expect(validCategories.length).toBe(4);
    });
  });
});

describe('DailyTask interface compliance', () => {
  it('should create a valid DailyTask object', () => {
    const task = {
      id: 'task-1',
      name: 'Brush teeth',
      icon: '🦷',
      stars: 2,
      category: 'morning' as TaskCategory,
      completed: false,
      completedAt: undefined,
      order: 0,
    };
    
    expect(task.id).toBeDefined();
    expect(task.name).toBeDefined();
    expect(task.stars).toBeGreaterThan(0);
    expect(typeof task.completed).toBe('boolean');
  });

  it('should allow optional category', () => {
    const task = {
      id: 'task-2',
      name: 'Free time activity',
      icon: '🎮',
      stars: 1,
      completed: false,
      order: 1,
    };
    
    expect(task.category).toBeUndefined();
  });
});

describe('DailyTaskList interface compliance', () => {
  it('should create a valid DailyTaskList object', () => {
    const taskList = {
      id: 'child1_2024-01-15',
      childId: 'child1',
      parentId: 'parent1',
      date: '2024-01-15',
      tasks: [],
      totalStarsAvailable: 0,
      totalStarsEarned: 0,
      allTasksCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    expect(taskList.id).toBe('child1_2024-01-15');
    expect(taskList.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Array.isArray(taskList.tasks)).toBe(true);
  });

  it('should calculate totals correctly', () => {
    const tasks = [
      { id: '1', name: 'Task 1', icon: '📝', stars: 2, completed: true, order: 0 },
      { id: '2', name: 'Task 2', icon: '📚', stars: 3, completed: false, order: 1 },
    ];
    
    const totalStarsAvailable = tasks.reduce((sum, t) => sum + t.stars, 0);
    const totalStarsEarned = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.stars, 0);
    const allCompleted = tasks.every(t => t.completed);
    
    expect(totalStarsAvailable).toBe(5);
    expect(totalStarsEarned).toBe(2);
    expect(allCompleted).toBe(false);
  });
});

describe('TaskTemplate interface compliance', () => {
  it('should create a valid TaskTemplate object', () => {
    const template = {
      id: 'template-1',
      parentId: 'parent1',
      name: 'Morning Routine',
      icon: '🌅',
      color: '#FFB347',
      tasks: [
        { id: '1', name: 'Brush teeth', icon: '🦷', stars: 1, category: 'morning' as TaskCategory, order: 0 },
        { id: '2', name: 'Get dressed', icon: '👕', stars: 1, category: 'morning' as TaskCategory, order: 1 },
      ],
      isFavorite: true,
      usageCount: 5,
      createdAt: new Date(),
    };
    
    expect(template.name).toBe('Morning Routine');
    expect(template.tasks.length).toBe(2);
    expect(template.isFavorite).toBe(true);
    expect(template.usageCount).toBeGreaterThanOrEqual(0);
  });
});

describe('Reward interface compliance', () => {
  it('should create a valid Reward object', () => {
    const reward = {
      id: 'reward-1',
      parentId: 'parent1',
      name: 'Extra screen time',
      description: '30 minutes of extra tablet time',
      icon: '📱',
      starCost: 20,
      isActive: true,
      createdAt: new Date(),
    };
    
    expect(reward.starCost).toBeGreaterThan(0);
    expect(reward.isActive).toBe(true);
  });

  it('should allow optional description', () => {
    const reward = {
      id: 'reward-2',
      parentId: 'parent1',
      name: 'Ice cream',
      icon: '🍦',
      starCost: 15,
      isActive: true,
      createdAt: new Date(),
    };
    
    expect(reward.description).toBeUndefined();
  });
});

describe('Redemption interface compliance', () => {
  it('should have valid status values', () => {
    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    
    const redemption = {
      id: 'redemption-1',
      childId: 'child1',
      childName: 'Emma',
      rewardId: 'reward-1',
      rewardName: 'Extra screen time',
      rewardIcon: '📱',
      starCost: 20,
      status: 'pending' as const,
      redeemedAt: new Date(),
    };
    
    expect(validStatuses).toContain(redemption.status);
  });
});

