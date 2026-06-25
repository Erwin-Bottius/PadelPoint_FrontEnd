import axios, { type AxiosError } from 'axios';
import Constants from 'expo-constants';

import { tokenStore } from './token';

function resolveBaseUrl(): string {
  // Prod : variable d'environnement explicite
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  // Dev : on extrait l'IP du serveur Expo pour atteindre le backend sur la même machine
  // (localhost ne fonctionne pas sur Android ni sur un vrai appareil)
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host ?? 'localhost'}:3333/api/v1`;
}

type ErrorBody = {
  message?: string;
  errors?: { message: string; field: string }[];
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: ErrorBody['errors'],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const client = axios.create({
  baseURL: resolveBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

client.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorBody>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    return Promise.reject(
      new ApiError(status, body?.message ?? 'Une erreur est survenue.', body?.errors),
    );
  },
);
