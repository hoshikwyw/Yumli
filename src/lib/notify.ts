/**
 * Notifications ("toasts"): the short message that pops up to confirm an
 * action or offer an Undo. Everything in the app calls `notify`, never the
 * library directly, so the library (Ding, still a 0.0.x release) can be
 * upgraded or swapped by touching this file and components/ui/Toaster.tsx only.
 *
 *   notify.success('Recipe saved');
 *   notify.error('Could not delete', { description: 'Try again in a moment' });
 *   notify.info('Removed', { action: { label: 'Undo', onClick: restore } });
 *
 * Good to know about Ding:
 * - one toast is on screen at a time; a new one replaces it in place
 * - errors, loading toasts and toasts with a button stay until dismissed,
 *   unless a `duration` (in milliseconds) is given
 */
export { toast as notify } from '@yusufceng1z/ding-react';

/** How long a toast with an Undo button stays up: long enough to react, short enough not to nag. */
export const UNDO_DURATION_MS = 6000;
