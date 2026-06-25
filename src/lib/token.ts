let _token: string | null = null;

export const tokenStore = {
  get: (): string | null => _token,
  set: (token: string | null): void => { _token = token; },
};
