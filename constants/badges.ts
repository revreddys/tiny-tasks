export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: {
    type: 'stars' | 'streak' | 'tasks' | 'routines';
    value: number;
  };
}

export const BADGES: Badge[] = [
  // Star-based badges
  {
    id: 'first-star',
    name: 'First Star',
    description: 'Earned your first star!',
    icon: '⭐',
    color: '#FFD700',
    requirement: { type: 'stars', value: 1 },
  },
  {
    id: 'star-collector',
    name: 'Star Collector',
    description: 'Collected 10 stars!',
    icon: '🌟',
    color: '#FFD700',
    requirement: { type: 'stars', value: 10 },
  },
  {
    id: 'super-star',
    name: 'Super Star',
    description: 'Collected 50 stars!',
    icon: '💫',
    color: '#FFD700',
    requirement: { type: 'stars', value: 50 },
  },
  {
    id: 'mega-star',
    name: 'Mega Star',
    description: 'Collected 100 stars!',
    icon: '✨',
    color: '#FFD700',
    requirement: { type: 'stars', value: 100 },
  },
  {
    id: 'star-master',
    name: 'Star Master',
    description: 'Collected 500 stars!',
    icon: '🏆',
    color: '#FFD700',
    requirement: { type: 'stars', value: 500 },
  },
  
  // Streak-based badges
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: '3 days in a row!',
    icon: '🔥',
    color: '#FF6347',
    requirement: { type: 'streak', value: 3 },
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: '7 days in a row!',
    icon: '🔥',
    color: '#FF4500',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'two-week-champ',
    name: 'Two Week Champ',
    description: '14 days in a row!',
    icon: '💪',
    color: '#FF4500',
    requirement: { type: 'streak', value: 14 },
  },
  {
    id: 'monthly-master',
    name: 'Monthly Master',
    description: '30 days in a row!',
    icon: '👑',
    color: '#9B59B6',
    requirement: { type: 'streak', value: 30 },
  },
  
  // Task-based badges
  {
    id: 'task-starter',
    name: 'Task Starter',
    description: 'Completed 10 tasks!',
    icon: '✅',
    color: '#6DD5B7',
    requirement: { type: 'tasks', value: 10 },
  },
  {
    id: 'task-hero',
    name: 'Task Hero',
    description: 'Completed 50 tasks!',
    icon: '🦸',
    color: '#4ECDC4',
    requirement: { type: 'tasks', value: 50 },
  },
  {
    id: 'task-legend',
    name: 'Task Legend',
    description: 'Completed 200 tasks!',
    icon: '🌈',
    color: '#9B59B6',
    requirement: { type: 'tasks', value: 200 },
  },
  
  // Routine-based badges
  {
    id: 'routine-rookie',
    name: 'Routine Rookie',
    description: 'Finished 5 full routines!',
    icon: '📋',
    color: '#87CEEB',
    requirement: { type: 'routines', value: 5 },
  },
  {
    id: 'routine-pro',
    name: 'Routine Pro',
    description: 'Finished 25 full routines!',
    icon: '🎯',
    color: '#98D8C8',
    requirement: { type: 'routines', value: 25 },
  },
  {
    id: 'routine-champion',
    name: 'Routine Champion',
    description: 'Finished 100 full routines!',
    icon: '🏅',
    color: '#FFB347',
    requirement: { type: 'routines', value: 100 },
  },
];

export const getBadgeById = (id: string): Badge | undefined => {
  return BADGES.find(badge => badge.id === id);
};

export const getEarnableBadges = (stats: {
  totalStars: number;
  currentStreak: number;
  totalTasks: number;
  totalRoutines: number;
}, earnedBadgeIds: string[]): Badge[] => {
  return BADGES.filter(badge => {
    if (earnedBadgeIds.includes(badge.id)) return false;
    
    switch (badge.requirement.type) {
      case 'stars':
        return stats.totalStars >= badge.requirement.value;
      case 'streak':
        return stats.currentStreak >= badge.requirement.value;
      case 'tasks':
        return stats.totalTasks >= badge.requirement.value;
      case 'routines':
        return stats.totalRoutines >= badge.requirement.value;
      default:
        return false;
    }
  });
};

export default BADGES;


