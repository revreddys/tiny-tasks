# 🦄 Tiny Tasks - Kids Routine Tracker

A fun and engaging mobile app to help children (4+ years old) build healthy daily routines through gamification!

![React Native](https://img.shields.io/badge/React_Native-0.81-blue)
![Expo](https://img.shields.io/badge/Expo-54-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

## ✨ Features

### For Kids
- 🎯 **Task Completion** - Tap to complete tasks with satisfying animations
- ⭐ **Star Rewards** - Earn stars for every completed task
- 🔥 **Streak System** - Build daily streaks to stay motivated
- 🏆 **Badges & Achievements** - Unlock badges for milestones
- 🐻 **Avatar Customization** - Customize your character with unlockable items
- 🎉 **Celebrations** - Confetti and celebrations when completing routines

### For Parents
- 👶 **Multi-child Support** - Manage multiple children's profiles
- 📋 **Custom Routines** - Create morning, bedtime, and custom routines
- ✅ **Pre-built Templates** - Quick-start with template routines
- 📊 **Progress Tracking** - View stats and achievements

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your phone (for testing)
- Firebase project (for authentication and data storage)

### Installation

1. **Clone and install dependencies:**
```bash
cd TaskApp
npm install
```

2. **Configure Firebase:**

Create a Firebase project at [firebase.google.com](https://firebase.google.com) and enable:
- Authentication (Email/Password)
- Cloud Firestore

3. **Set up environment variables:**

Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Set up Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Children belong to parents
    match /children/{childId} {
      allow read, write: if request.auth != null && 
        resource.data.parentId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Routines belong to parents
    match /routines/{routineId} {
      allow read, write: if request.auth != null && 
        resource.data.parentId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Progress data
    match /progress/{progressId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. **Start the development server:**
```bash
npm start
```

6. **Run on your device:**
- Scan the QR code with Expo Go (Android) or Camera app (iOS)

## 📱 App Structure

```
TaskApp/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Login/signup screens
│   ├── (parent)/          # Parent management screens
│   └── (child)/           # Child-facing screens
├── components/            # Reusable components
│   ├── Avatar.tsx         # Avatar display component
│   ├── TaskCard.tsx       # Task item with animations
│   ├── CelebrationModal.tsx # Victory celebrations
│   └── StreakCounter.tsx  # Streak display
├── constants/             # App constants
│   ├── colors.ts          # Color palette
│   ├── badges.ts          # Badge definitions
│   ├── avatars.ts         # Avatar items
│   └── tasks.ts           # Task templates
├── lib/                   # Business logic
│   ├── firebase.ts        # Firebase configuration
│   ├── sounds.ts          # Sound effects
│   ├── types.ts           # TypeScript types
│   └── stores/            # Zustand state stores
└── assets/               # Images, fonts, sounds
```

## 🎨 Design Philosophy

- **Large Touch Targets** - Minimum 60pt buttons for small fingers
- **Bright Colors** - Cheerful, engaging color palette
- **Icon-Based UI** - Minimal text, emoji-based interface
- **Satisfying Feedback** - Animations, sounds, and haptics
- **Simple Navigation** - Easy to understand flow

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Backend**: Firebase (Auth + Firestore)
- **Animations**: React Native Reanimated
- **Sound**: expo-av
- **Haptics**: expo-haptics

## 📦 Key Dependencies

```json
{
  "expo": "~54.0.25",
  "expo-router": "~6.0.15",
  "firebase": "^12.6.0",
  "zustand": "^5.0.8",
  "react-native-reanimated": "~4.1.1",
  "lottie-react-native": "~7.3.1",
  "expo-haptics": "~15.0.7",
  "expo-av": "~16.0.7"
}
```

## 🎮 How to Use

### Parent Mode
1. Create an account
2. Add your children's profiles
3. Create or use template routines
4. Hand the device to your child

### Child Mode
1. Select your profile
2. Tap on a routine to start
3. Complete tasks by tapping them
4. Earn stars and build streaks!
5. Customize your avatar with earned stars

## 🏆 Gamification Elements

| Feature | Description |
|---------|-------------|
| ⭐ Stars | 1-3 stars per task based on difficulty |
| 🔥 Streaks | Consecutive days completing all routines |
| 🏅 Badges | 15+ badges for various achievements |
| 🐻 Avatar | 9 characters + 25+ customization items |

## 📝 License

MIT License - feel free to use this for your family!

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

---

Made with ❤️ for parents and kids everywhere


