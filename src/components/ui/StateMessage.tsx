import type { ReactNode } from 'react';
import PixelArt from './pixel-art/PixelArt';
import type { SpriteName } from './pixel-art/sprites';

interface StateMessageProps {
  /** The pixel-art picture above the message. */
  icon?: SpriteName;
  title: string;
  text?: string;
  /** Usually one Button: the way out of this state. */
  action?: ReactNode;
  /** Announce to screen readers as soon as it appears: for errors. */
  alert?: boolean;
}

/** Centered message for "nothing here" and "could not load" moments. */
export default function StateMessage({ icon = 'egg', title, text, action, alert = false }: StateMessageProps) {
  return (
    <div role={alert ? 'alert' : undefined} className="text-center max-w-sm mx-auto py-10 sm:py-14">
      <PixelArt name={icon} className="w-16 h-16 mx-auto" />
      <p className="text-subheading text-ink mt-4">{title}</p>
      {text && <p className="text-base text-ink-soft mt-2">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
