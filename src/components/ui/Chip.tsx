import type { ReactNode } from 'react';

interface ChipProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}

/** A filter that is on or off. Never wraps or shrinks, so a row of chips can scroll sideways on a phone. */
export default function Chip({ selected, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 min-h-11 px-4 text-sm font-extrabold whitespace-nowrap pixel-box-sm pixel-press ${
        selected ? 'bg-primary text-on-fill' : 'bg-surface text-ink'
      }`}
    >
      {children}
    </button>
  );
}
