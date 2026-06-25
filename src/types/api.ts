export type ApiResponse<T> = {
  data: T;
};

export type AuthTokenResponse = ApiResponse<{ token: string }>;
