import { client } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

export type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  level: number | null;
  location: string | null;
  club: string | null;
  profilePicture: string | null;
  createdAt: string;
};

export type ClassPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  level: number;
  joinedAt: string;
  email: string;
};

export type Class = {
  id: string;
  name: string;
  scheduledAt: string;
  duration: number;
  location: string;
  levelMin: number | null;
  levelMax: number | null;
  club: string;
  maxPlayers: number;
  isPublished: boolean;
  isCancelled: boolean;
  teacherId: string;
  teacher: Teacher;
  players: ClassPlayer[];
  createdAt: string;
};

const classesService = {
  getAll: async (params?: { startDate?: string; endDate?: string }): Promise<Class[]> => {
    const { data } = await client.get<ApiResponse<Class[]>>('/classes', { params });
    return data.data;
  },

  getById: async (id: string): Promise<Class> => {
    const { data } = await client.get<ApiResponse<Class>>(`/classes/${id}`);
    return data.data;
  },

  create: async (payload: {
    name: string;
    description?: string;
    level: number;
    maxPlayers: number;
    scheduledAt: string;
    durationMinutes: number;
    location: string;
  }): Promise<Class> => {
    const { data } = await client.post<ApiResponse<Class>>('/classes', payload);
    return data.data;
  },

  join: async (id: string): Promise<Class> => {
    const { data } = await client.post<ApiResponse<Class>>(`/classes/${id}/join`);
    return data.data;
  },

  leave: async (id: string): Promise<Class> => {
    const { data } = await client.delete<ApiResponse<Class>>(`/classes/${id}/join`);
    return data.data;
  },
};

export default classesService;
