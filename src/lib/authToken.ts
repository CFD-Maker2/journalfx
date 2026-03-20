const TOKEN_KEY = 'token';

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
  // Remove legacy persistent token to prevent auto-login across browser restarts.
  localStorage.removeItem(TOKEN_KEY);
}

export function clearAuthToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}