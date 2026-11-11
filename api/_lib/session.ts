import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { env } from './env.js';
import { HttpError } from './http.js';

/**
 * The admin session: a signed cookie, checked on every write.
 *
 * The cookie holds only an expiry time and an HMAC signature over it, so it
 * cannot be forged without ADMIN_SESSION_SECRET. HttpOnly keeps it away from
 * page scripts; SameSite=Strict keeps other sites from sending it.
 */

const COOKIE = 'yumli_admin';
const MAX_AGE_S = 7 * 24 * 60 * 60;

const sign = (payload: string) =>
  createHmac('sha256', env.sessionSecret).update(payload).digest('base64url');

/** Compare secrets in constant time. Hashing first makes the lengths equal. */
const sameSecret = (a: string, b: string) =>
  timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());

export const credentialsMatch = (username: string, password: string) =>
  // Both are always compared, so timing never reveals which one was wrong.
  [sameSecret(username, env.adminUsername), sameSecret(password, env.adminPassword)].every(Boolean);

const cookieAttributes = (maxAge: number) =>
  `Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

export const sessionCookie = () => {
  const payload = String(Math.floor(Date.now() / 1000) + MAX_AGE_S);
  return `${COOKIE}=${payload}.${sign(payload)}; ${cookieAttributes(MAX_AGE_S)}`;
};

export const clearedCookie = () => `${COOKIE}=; ${cookieAttributes(0)}`;

export const isAdmin = (request: Request): boolean => {
  const cookie = request.headers.get('cookie') ?? '';
  const value = cookie.split(/;\s*/).find((part) => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!value) return false;

  const [payload, signature] = value.split('.');
  if (!payload || !signature) return false;

  const expected = sign(payload);
  if (signature.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;

  return Number(payload) > Date.now() / 1000;
};

export const requireAdmin = (request: Request) => {
  if (!isAdmin(request)) throw new HttpError(401, 'Please log in again');
};
