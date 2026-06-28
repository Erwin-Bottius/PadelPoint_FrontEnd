import { client } from '@/lib/api';
import type { Class } from './classes';

export type Chat = Class & { unreadCount: number };

export type Message = {
  id: string;
  content: string;
  type?: 'user_left';
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
};

export type SocketMessage = Message & { classId: string };

export type MessagePage = {
  data: Message[];
  meta: { currentPage: number; lastPage: number; total: number };
};

const messagesService = {
  getChats: async (): Promise<Chat[]> => {
    const { data } = await client.get<{ data: Chat[] }>('/account/chats');
    return data.data;
  },

  getMessages: async (classId: string, page = 1): Promise<MessagePage> => {
    const { data } = await client.get<MessagePage>(`/classes/${classId}/messages`, {
      params: { page, limit: 50 },
    });
    return data;
  },

  registerPushToken: async (token: string): Promise<void> => {
    await client.post('/account/push-token', { token });
  },
};

export default messagesService;
