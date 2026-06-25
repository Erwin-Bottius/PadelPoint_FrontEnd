import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/auth';
import { Palette } from '@/constants/theme';

export default function Index() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(token ? '/(app)' : '/(auth)/login');
  }, [token, isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Palette.screenBg }}>
      <ActivityIndicator color={Palette.accent} />
    </View>
  );
}
