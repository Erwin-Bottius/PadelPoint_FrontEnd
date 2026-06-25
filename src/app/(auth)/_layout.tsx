import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';

import { useAuth } from '@/context/auth';

export default function AuthLayout() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) router.replace('/(app)');
  }, [token]);

  if (token) return null;

  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
