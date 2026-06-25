import { client } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

export type Message = {
  id: string;
  classId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
};

const messagesService = {
  getByClass: async (classId: string): Promise<Message[]> => {
    const { data } = await client.get<ApiResponse<Message[]>>(`/classes/${classId}/messages`);
    return data.data;
  },

  send: async (classId: string, content: string): Promise<Message> => {
    const { data } = await client.post<ApiResponse<Message>>(`/classes/${classId}/messages`, { content });
    return data.data;
  },
};

export default messagesService;
