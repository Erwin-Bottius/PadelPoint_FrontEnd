import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import messagesService from '@/services/messages';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const router = useRouter();

  useEffect(() => {
    async function register() {
      try {
        if (!Device.isDevice) return;

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'PadelPoint',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF9811',
          });
        }

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;

        const { data: token } = await Notifications.getExpoPushTokenAsync();
        await messagesService.registerPushToken(token);
      } catch {}
    }

    register();

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const classId = response.notification.request.content.data?.classId as string | undefined;
      if (classId) router.push(`/chat/${classId}`);
    });

    return () => sub.remove();
  }, []);
}
