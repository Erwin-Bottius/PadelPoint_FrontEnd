import { client } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/context/auth';

const playersService = {
  getProfile: async (): Promise<User> => {
    const { data } = await client.get<ApiResponse<User>>('/account/profile');
    return data.data;
  },

  updateProfile: async (payload: Partial<Pick<User, 'firstName' | 'lastName' | 'level' | 'location' | 'club'>>): Promise<User> => {
    const { data } = await client.put<ApiResponse<User>>('/account/profile', payload);
    return data.data;
  },
};

export default playersService;
