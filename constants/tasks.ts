export interface TaskTemplate {
  id: string;
  name: string;
  icon: string;
  stars: number;
  category: 'hygiene' | 'meals' | 'chores' | 'learning' | 'health' | 'sleep';
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  // Hygiene tasks
  { id: 'brush-teeth-morning', name: 'Brush Teeth', icon: '🪥', stars: 1, category: 'hygiene' },
  { id: 'brush-teeth-night', name: 'Brush Teeth', icon: '🪥', stars: 1, category: 'hygiene' },
  { id: 'wash-face', name: 'Wash Face', icon: '🧼', stars: 1, category: 'hygiene' },
  { id: 'shower', name: 'Take a Shower', icon: '🚿', stars: 2, category: 'hygiene' },
  { id: 'bath', name: 'Take a Bath', icon: '🛁', stars: 2, category: 'hygiene' },
  { id: 'wash-hands', name: 'Wash Hands', icon: '🧴', stars: 1, category: 'hygiene' },
  { id: 'comb-hair', name: 'Comb Hair', icon: '💇', stars: 1, category: 'hygiene' },
  
  // Getting ready
  { id: 'get-dressed', name: 'Get Dressed', icon: '👕', stars: 1, category: 'chores' },
  { id: 'put-on-shoes', name: 'Put on Shoes', icon: '👟', stars: 1, category: 'chores' },
  { id: 'pack-bag', name: 'Pack School Bag', icon: '🎒', stars: 2, category: 'chores' },
  
  // Meals
  { id: 'eat-breakfast', name: 'Eat Breakfast', icon: '🥣', stars: 2, category: 'meals' },
  { id: 'eat-lunch', name: 'Eat Lunch', icon: '🍽️', stars: 2, category: 'meals' },
  { id: 'eat-dinner', name: 'Eat Dinner', icon: '🍝', stars: 2, category: 'meals' },
  { id: 'eat-snack', name: 'Healthy Snack', icon: '🍎', stars: 1, category: 'meals' },
  { id: 'drink-water', name: 'Drink Water', icon: '💧', stars: 1, category: 'meals' },
  
  // Chores
  { id: 'make-bed', name: 'Make Bed', icon: '🛏️', stars: 2, category: 'chores' },
  { id: 'tidy-room', name: 'Tidy Room', icon: '🧹', stars: 3, category: 'chores' },
  { id: 'put-toys-away', name: 'Put Toys Away', icon: '🧸', stars: 2, category: 'chores' },
  { id: 'set-table', name: 'Set Table', icon: '🍴', stars: 2, category: 'chores' },
  { id: 'help-clean', name: 'Help Clean', icon: '🧽', stars: 2, category: 'chores' },
  
  // Learning
  { id: 'homework', name: 'Do Homework', icon: '📚', stars: 3, category: 'learning' },
  { id: 'read-book', name: 'Read a Book', icon: '📖', stars: 2, category: 'learning' },
  { id: 'practice-writing', name: 'Practice Writing', icon: '✏️', stars: 2, category: 'learning' },
  { id: 'learn-numbers', name: 'Practice Numbers', icon: '🔢', stars: 2, category: 'learning' },
  { id: 'arts-crafts', name: 'Arts & Crafts', icon: '🎨', stars: 2, category: 'learning' },
  
  // Health & Exercise
  { id: 'exercise', name: 'Exercise', icon: '🏃', stars: 3, category: 'health' },
  { id: 'play-outside', name: 'Play Outside', icon: '⚽', stars: 2, category: 'health' },
  { id: 'take-vitamins', name: 'Take Vitamins', icon: '💊', stars: 1, category: 'health' },
  
  // Sleep
  { id: 'put-on-pajamas', name: 'Put on Pajamas', icon: '🩷', stars: 1, category: 'sleep' },
  { id: 'story-time', name: 'Story Time', icon: '📕', stars: 1, category: 'sleep' },
  { id: 'go-to-bed', name: 'Go to Bed', icon: '😴', stars: 2, category: 'sleep' },
];

export interface RoutineTemplate {
  id: string;
  name: string;
  icon: string;
  color: string;
  taskIds: string[];
}

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: 'morning',
    name: 'Morning Routine',
    icon: '🌅',
    color: '#87CEEB',
    taskIds: [
      'brush-teeth-morning',
      'wash-face',
      'get-dressed',
      'comb-hair',
      'eat-breakfast',
      'pack-bag',
    ],
  },
  {
    id: 'after-school',
    name: 'After School',
    icon: '🏫',
    color: '#98D8C8',
    taskIds: [
      'wash-hands',
      'eat-snack',
      'homework',
      'put-toys-away',
    ],
  },
  {
    id: 'evening',
    name: 'Evening Routine',
    icon: '🌆',
    color: '#DDA0DD',
    taskIds: [
      'eat-dinner',
      'help-clean',
      'read-book',
    ],
  },
  {
    id: 'bedtime',
    name: 'Bedtime Routine',
    icon: '🌙',
    color: '#778899',
    taskIds: [
      'bath',
      'brush-teeth-night',
      'put-on-pajamas',
      'story-time',
      'go-to-bed',
    ],
  },
];

export const getTaskById = (id: string): TaskTemplate | undefined => {
  return TASK_TEMPLATES.find(task => task.id === id);
};

export const getTasksByCategory = (category: TaskTemplate['category']): TaskTemplate[] => {
  return TASK_TEMPLATES.filter(task => task.category === category);
};

export default { TASK_TEMPLATES, ROUTINE_TEMPLATES };


