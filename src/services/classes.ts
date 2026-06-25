import { client } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

export type Class = {
  id: string;
  title: string;
  description: string | null;
  teacherId: string;
  level: number; // 1–10
  maxPlayers: number;
  scheduledAt: string;
  durationMinutes: number;
  location: string;
  createdAt: string;
};

export type ClassWithEnrollment = Class & {
  enrolledCount: number;
  isEnrolled: boolean;
};

const classesService = {
  getAll: async (): Promise<ClassWithEnrollment[]> => {
    const { data } = await client.get<ApiResponse<ClassWithEnrollment[]>>('/classes');
    return data.data;
  },

  getById: async (id: string): Promise<ClassWithEnrollment> => {
    const { data } = await client.get<ApiResponse<ClassWithEnrollment>>(`/classes/${id}`);
    return data.data;
  },

  create: async (payload: {
    title: string;
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

  join: async (id: string): Promise<void> => {
    await client.post(`/classes/${id}/enroll`);
  },

  leave: async (id: string): Promise<void> => {
    await client.delete(`/classes/${id}/enroll`);
  },
};

export default classesService;
