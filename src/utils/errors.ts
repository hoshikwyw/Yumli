/** The message of a caught value, or `fallback` when it is not an Error (a caught value can be anything). */
export const errorMessage = (error: unknown, fallback = 'Something went wrong') =>
  error instanceof Error && error.message ? error.message : fallback;
