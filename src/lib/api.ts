const TOKEN_KEY = 'complipay_auth_token';
let inMemoryToken: string | null = null;
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

function canUseStorage() {
  return typeof window !== 'undefined';
}

function resolveApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
}

function readSessionToken(): string | null {
  if (!canUseStorage()) return null;
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeSessionToken(token: string | null) {
  if (!canUseStorage()) return;
  try {
    if (token) {
      window.sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      window.sessionStorage.removeItem(TOKEN_KEY);
    }
    // Remove legacy persistence if it exists.
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage errors and fall back to in-memory token.
  }
}

export function getStoredToken(): string | null {
  if (inMemoryToken) return inMemoryToken;

  const sessionToken = readSessionToken();
  if (sessionToken) {
    inMemoryToken = sessionToken;
    return sessionToken;
  }

  if (!canUseStorage()) return null;
  try {
    const legacyToken = window.localStorage.getItem(TOKEN_KEY);
    if (!legacyToken) return null;
    inMemoryToken = legacyToken;
    writeSessionToken(legacyToken);
    return legacyToken;
  } catch {
    return null;
  }
}

export function setStoredToken(token: string) {
  inMemoryToken = token;
  writeSessionToken(token);
}

export function clearStoredToken() {
  inMemoryToken = null;
  writeSessionToken(null);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = true
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (requireAuth) {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Not authenticated.');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(resolveApiUrl(path), {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const details = data?.details ? ` ${data.details}` : '';
    throw new Error(data?.error ? `${data.error}${details}` : `Request failed (${response.status})`);
  }

  return data as T;
}
