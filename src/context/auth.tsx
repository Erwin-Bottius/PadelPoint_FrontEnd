import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { client } from '@/lib/api';
import { tokenStore } from '@/lib/token';

const TOKEN_KEY = 'padelpoint_jwt';

export type UserRole = 'player' | 'teacher';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  level: number | null;
  location: string | null;
  club: string | null;
  profilePicture: string | null;
  createdAt: string;
};

type SignUpData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  role: UserRole;
  level: number;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY)
      .then((stored) => {
        if (stored) {
          tokenStore.set(stored);
          setToken(stored);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function signIn(email: string, password: string) {
    const { data } = await client.post<{ data: { token: string } }>('/auth/login', { email, password });
    const jwt = data.data.token;
    tokenStore.set(jwt);
    await SecureStore.setItemAsync(TOKEN_KEY, jwt);
    setToken(jwt);
  }

  async function signUp(body: SignUpData) {
    const { data } = await client.post<{ data: { token: string } }>('/auth/signup', body);
    const jwt = data.data.token;
    tokenStore.set(jwt);
    await SecureStore.setItemAsync(TOKEN_KEY, jwt);
    setToken(jwt);
  }

  async function signOut() {
    try {
      await client.post('/account/logout');
    } catch {}
    tokenStore.set(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
