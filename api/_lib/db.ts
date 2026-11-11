import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * A Supabase client signed in as Yumli's service account.
 *
 * The browser never talks to Supabase: the anon key alone gets "permission
 * denied" on the `yumli` schema. This account is the only way in, and the
 * database lets it touch Yumli's tables and images and nothing else in the
 * shared project.
 *
 * One client per warm function instance. Its session is reused until it is
 * about to expire, then the account signs in again; concurrent requests
 * share one sign-in rather than each starting their own.
 */

const REFRESH_MARGIN_S = 60;

const createDb = () => createClient(env.supabaseUrl, env.supabaseAnonKey, {
  db: { schema: 'yumli' },
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
type Db = ReturnType<typeof createDb>;

let client: Db | null = null;
let expiresAt = 0;
let signingIn: Promise<Db> | null = null;

const signIn = async (): Promise<Db> => {
  const next = client ?? createDb();

  const { data, error } = await next.auth.signInWithPassword({
    email: env.serviceEmail,
    password: env.servicePassword,
  });
  if (error || !data.session) throw new Error(`Service account sign-in failed: ${error?.message ?? 'no session'}`);

  client = next;
  expiresAt = data.session.expires_at ?? 0;
  return next;
};

export const db = async (): Promise<Db> => {
  const now = Math.floor(Date.now() / 1000);
  if (client && expiresAt - now > REFRESH_MARGIN_S) return client;

  signingIn ??= signIn().finally(() => { signingIn = null; });
  return signingIn;
};

export const IMAGE_BUCKET = 'recipe-images';

/** Where the bucket's files are served from, for recognising our own image links. */
export const publicImagePrefix = () =>
  `${env.supabaseUrl}/storage/v1/object/public/${IMAGE_BUCKET}/`;
