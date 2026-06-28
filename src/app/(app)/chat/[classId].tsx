import { useLocalSearchParams } from 'expo-router';

import { ChatScreen } from '@/features/common/screens/ChatScreen';

export default function ChatRoute() {
  const { classId, className } = useLocalSearchParams<{ classId: string; className?: string }>();
  return <ChatScreen classId={classId} className={className} />;
}
