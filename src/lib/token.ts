let _token: string | null = null;
let _onUnauthorized: (() => void) | null = null;

export const tokenStore = {
  get: (): string | null => _token,
  set: (token: string | null): void => { _token = token; },
  setOnUnauthorized: (cb: () => void): void => { _onUnauthorized = cb; },
  triggerUnauthorized: (): void => { _onUnauthorized?.(); },
};
