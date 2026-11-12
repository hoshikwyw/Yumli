import type { ReactNode } from 'react';

interface StateMessageProps {
  emoji?: string;
  title: string;
  text?: string;
  /** Usually one Button: the way out of this state. */
  action?: ReactNode;
  /** Announce to screen readers as soon as it appears: for errors. */
  alert?: boolean;
}

/** Centered message for "nothing here" and "could not load" moments. */
export default function StateMessage({ emoji = '🍳', title, text, action, alert = false }: StateMessageProps) {
  return (
    <div role={alert ? 'alert' : undefined} className="text-center max-w-sm mx-auto py-10 sm:py-14">
      <div className="text-5xl" aria-hidden="true">{emoji}</div>
      <p className="text-subheading text-ink mt-4">{title}</p>
      {text && <p className="text-base text-ink-soft mt-2">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
