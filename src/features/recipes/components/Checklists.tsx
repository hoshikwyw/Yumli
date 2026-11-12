import { CheckIcon } from '@/components/ui/icons';

/*
 * Both lists are made of real checkboxes, hidden visually and drawn with CSS
 * (`peer-checked:`). That gives ticking-off with no state to manage, and it
 * works with a keyboard and a screen reader for free. Ticks last until the
 * page is left: they are a cooking aid, not saved data.
 */

const focusRing =
  'peer-focus-visible:outline-[3px] peer-focus-visible:outline-focus peer-focus-visible:outline-offset-2';

/** Ingredients as a tick-off list: tap one when it is on the counter. */
export function IngredientChecklist({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>
          <label className="flex items-start gap-3 py-2 cursor-pointer">
            <input type="checkbox" className="peer sr-only" />
            <span
              aria-hidden="true"
              className={`mt-0.5 shrink-0 flex items-center justify-center w-6 h-6 bg-surface border-2 border-line text-transparent peer-checked:bg-primary peer-checked:text-on-fill ${focusRing}`}
            >
              <CheckIcon className="w-4 h-4" strokeWidth={3.5} />
            </span>
            <span className="text-base sm:text-lg leading-relaxed text-ink peer-checked:line-through peer-checked:text-ink-muted">
              {item}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}

/** Numbered steps in large type, readable from a counter-top distance. Tap one to mark it done. */
export function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-1">
      {steps.map((step, i) => (
        <li key={i}>
          <label className="flex items-start gap-3 sm:gap-4 py-2 cursor-pointer">
            <input type="checkbox" className="peer sr-only" />
            <span
              aria-hidden="true"
              className={`shrink-0 flex items-center justify-center w-9 h-9 bg-accent text-on-fill text-base font-extrabold pixel-box-sm peer-checked:bg-surface-alt peer-checked:text-ink-muted peer-checked:shadow-none ${focusRing}`}
            >
              {i + 1}
            </span>
            <span className="pt-1 text-base sm:text-lg leading-relaxed text-ink peer-checked:text-ink-muted peer-checked:line-through">
              {step}
            </span>
          </label>
        </li>
      ))}
    </ol>
  );
}
