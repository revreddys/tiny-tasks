import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../../lib/stores/authStore';
import Colors from '../../constants/colors';

export default function ParentLayout() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  
  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/');
    }
  }, [isInitialized, user]);
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="add-child" options={{ presentation: 'modal' }} />
      <Stack.Screen name="edit-child/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="daily-tasks/[childId]" />
      <Stack.Screen name="task-templates" />
      <Stack.Screen name="rewards" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}


