import { useState } from 'react';
import { Button, Card, fieldClasses } from '@/components/ui';
import { CloseIcon } from '@/components/ui/icons';

interface ListEditorProps {
  title: string;
  tone: 'pastel-pink' | 'pastel-mint';
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: (index: number) => string;
  addLabel: string;
  /** Shown under the title when the list may not be saved as it is. */
  error?: string;
  /** Use a taller text box per item: for steps, which are sentences. */
  multiline?: boolean;
}

/** A numbered list of text rows that can be added to and removed from: ingredients and steps. */
export default function ListEditor({ title, tone, items, onChange, placeholder, addLabel, error, multiline = false }: ListEditorProps) {
  /** Row to put the cursor in when it appears: the one just added. */
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  const update = (index: number, value: string) => onChange(items.map((item, i) => (i === index ? value : item)));

  const add = () => {
    setFocusIndex(items.length);
    onChange([...items, '']);
  };

  const remove = (index: number) => {
    setFocusIndex(null);
    const next = items.filter((_, i) => i !== index);
    onChange(next.length ? next : ['']);
  };

  return (
    <Card variant={tone} className="p-4 sm:p-6">
      <h2 className="text-subheading text-ink">{title}</h2>
      {error && <p role="alert" className="mt-1 text-sm font-semibold text-primary-ink">{error}</p>}
      <div className="h-3" />
      <ol className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span aria-hidden="true" className="shrink-0 w-7 pt-3 text-right text-base font-extrabold text-ink-soft">
              {i + 1}.
            </span>
            {multiline ? (
              <textarea
                value={item}
                rows={2}
                autoFocus={focusIndex === i}
                aria-label={`${title} ${i + 1}`}
                placeholder={placeholder(i)}
                onChange={(e) => update(i, e.target.value)}
                className={`${fieldClasses} flex-1 resize-y`}
              />
            ) : (
              <input
                value={item}
                autoFocus={focusIndex === i}
                aria-label={`${title} ${i + 1}`}
                placeholder={placeholder(i)}
                enterKeyHint="next"
                onChange={(e) => update(i, e.target.value)}
                // Enter moves on to a new row instead of submitting the whole form by accident.
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                className={`${fieldClasses} flex-1`}
              />
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove ${title.toLowerCase()} ${i + 1}`}
              className="shrink-0 flex items-center justify-center w-11 h-12 text-ink-soft hover:text-primary-ink"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </li>
        ))}
      </ol>
      <Button variant="outline" size="sm" onClick={add} className="mt-3">{addLabel}</Button>
    </Card>
  );
}
