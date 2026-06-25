import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { useAuth } from '@/context/auth';

export default function AppLayout() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.replace('/(auth)/login');
  }, [token]);

  if (!token) return null;

  return <AppTabs />;
}
