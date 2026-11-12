import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

interface FieldProps {
  label?: string;
  /** Short help shown under the field. */
  hint?: string;
  /** Error message shown under the field; also marks the field invalid for screen readers. */
  error?: string;
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldProps;
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps;

/**
 * Shared look for text fields. The text is 16px on purpose: anything smaller
 * makes iPhones zoom the whole page when the field is focused.
 */
export const fieldClasses =
  'block w-full min-h-12 px-3.5 py-2.5 text-base font-body text-ink bg-surface ' +
  'border-2 border-line shadow-[2px_2px_0_var(--color-shadow)] rounded-none appearance-none ' +
  'transition-[border-color,box-shadow] duration-100 ' +
  'focus:outline-none focus:border-primary focus:shadow-[3px_3px_0_var(--color-primary)] ' +
  'aria-[invalid=true]:border-primary-ink disabled:opacity-60';

export const labelClasses = 'block mb-1.5 text-sm font-extrabold tracking-wide text-ink';

interface FieldShellProps extends FieldProps {
  id: string;
  children: ReactNode;
}

/** Label above, hint or error below, wired to the control for screen readers. */
export function FieldShell({ id, label, hint, error, children }: FieldShellProps) {
  return (
    <div>
      {label && <label htmlFor={id} className={labelClasses}>{label}</label>}
      {children}
      {error ? (
        <p id={`${id}-note`} role="alert" className="mt-1.5 text-sm font-semibold text-primary-ink">{error}</p>
      ) : hint ? (
        <p id={`${id}-note`} className="mt-1.5 text-sm text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ label, hint, error, className = '', id, ...props }: InputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error}>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${fieldId}-note` : undefined}
        className={`${fieldClasses} ${className}`}
        {...props}
      />
    </FieldShell>
  );
}

export function Textarea({ label, hint, error, className = '', id, ...props }: TextareaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error}>
      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${fieldId}-note` : undefined}
        className={`${fieldClasses} min-h-36 resize-y ${className}`}
        {...props}
      />
    </FieldShell>
  );
}
