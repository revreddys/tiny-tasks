import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useChildStore } from '../../lib/stores/childStore';
import Colors from '../../constants/colors';

export default function ChildLayout() {
  const router = useRouter();
  const { selectedChild } = useChildStore();
  
  useEffect(() => {
    if (!selectedChild) {
      router.replace('/(parent)/dashboard');
    }
  }, [selectedChild]);
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="avatar" options={{ presentation: 'modal' }} />
      <Stack.Screen name="shop" />
      <Stack.Screen name="badges" />
    </Stack>
  );
}


