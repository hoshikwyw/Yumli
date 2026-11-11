/**
 * Server-only settings, read from Vercel's environment variables.
 *
 * None of these may carry a VITE_ prefix: Vite copies VITE_ variables into
 * the browser bundle, and every value here must stay on the server.
 */

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
};

export const env = {
  /** The shared Supabase project's URL and public anon key (Project Settings -> API). */
  get supabaseUrl() { return required('SUPABASE_URL'); },
  get supabaseAnonKey() { return required('SUPABASE_ANON_KEY'); },

  /** Yumli's own service account: may touch Yumli's tables and images only. */
  get serviceEmail() { return required('YUMLI_SERVICE_EMAIL'); },
  get servicePassword() { return required('YUMLI_SERVICE_PASSWORD'); },

  /** The admin dashboard's login, checked here rather than in the browser. */
  get adminUsername() { return required('ADMIN_USERNAME'); },
  get adminPassword() { return required('ADMIN_PASSWORD'); },

  /** Signs the admin session cookie. At least 32 random characters. */
  get sessionSecret() {
    const secret = required('ADMIN_SESSION_SECRET');
    if (secret.length < 32) throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters');
    return secret;
  },
};
