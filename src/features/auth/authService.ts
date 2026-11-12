/**
 * Admin login, checked by the server (`api/auth.ts`). The session lives in an
 * HttpOnly cookie the page cannot read, so the only way to know whether we
 * are logged in is to ask.
 */

const authRequest = async (method: string, body?: unknown) => {
  const res = await fetch('/api/auth', {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, loggedIn: data?.loggedIn === true, error: data?.error as string | undefined };
};

export const checkSession = async () => (await authRequest('GET')).loggedIn;

/** Resolves to an error message, or null when the login worked. */
export const login = async (username: string, password: string): Promise<string | null> => {
  const result = await authRequest('POST', { username, password });
  return result.ok ? null : result.error ?? 'Could not log in';
};

export const logout = async () => {
  await authRequest('DELETE');
};
