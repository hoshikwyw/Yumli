import { useId } from 'react';
import { FieldShell, fieldClasses } from './Input';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * A real <select>, styled to match the text fields. Phones open their own
 * full-screen picker for it, and keyboards and screen readers work without
 * any extra code: none of which a hand-built dropdown gets for free.
 */
export default function Select({
  label,
  hint,
  error,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled,
}: SelectProps) {
  const id = useId();
  const hasValue = options.some((o) => o.value === value);

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <select
          id={id}
          value={hasValue ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-note` : undefined}
          className={`${fieldClasses} pr-10 ${hasValue ? '' : 'text-ink-muted'}`}
        >
          {!hasValue && <option value="" disabled>{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-ink bg-surface">
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </FieldShell>
  );
}
