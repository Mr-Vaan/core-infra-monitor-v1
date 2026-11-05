import { getStoredUser } from '../data/mockAuth';

/**
 * Returns authorization headers containing current user's Bearer token
 */
export function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const user = getStoredUser();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  };

  if (user && user.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }

  return headers;
}

/**
 * Authenticated Fetch wrapper that automatically adds Authorization header
 * and dispatches an event if token expires or is rejected (HTTP 401).
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const user = getStoredUser();
  const headers = new Headers(init?.headers || {});

  if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (user?.token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${user.token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers
  });

  // Detect session invalidation / expiration
  if (response.status === 401) {
    const urlStr = typeof input === 'string' ? input : input.toString();
    if (!urlStr.includes('/api/auth/login')) {
      window.dispatchEvent(new CustomEvent('infra-auth-unauthorized', {
        detail: { url: urlStr }
      }));
    }
  }

  return response;
}
