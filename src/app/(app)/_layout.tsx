import { useQueryClient } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/context/auth';
import { SocketProvider } from '@/context/socket';
import { usePushNotifications } from '@/hooks/usePushNotifications';

function AppStack() {
  const { token } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  usePushNotifications();

  useEffect(() => {
    if (!token) {
      queryClient.clear();
      router.replace('/(auth)/login');
    }
  }, [token]);

  if (!token) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat/[classId]" />
    </Stack>
  );
}

export default function AppLayout() {
  return (
    <SocketProvider>
      <AppStack />
    </SocketProvider>
  );
}
