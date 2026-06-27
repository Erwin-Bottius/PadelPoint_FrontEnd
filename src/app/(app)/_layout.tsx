import { useQueryClient } from '@tanstack/react-query';
import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { TabBar } from '@/components/ui/tab-bar';
import { useAuth } from '@/context/auth';

export default function AppLayout() {
  const { token } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      queryClient.clear();
      router.replace('/(auth)/login');
    }
  }, [token]);

  if (!token) return null;

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="messages" />
    </Tabs>
  );
}
