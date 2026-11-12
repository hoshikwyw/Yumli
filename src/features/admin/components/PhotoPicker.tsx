import { useRef, type ChangeEvent } from 'react';
import { CloseIcon } from '@/components/ui/icons';
import RecipeImage from '@/features/recipes/components/RecipeImage';

interface PhotoPickerProps {
  /** Photo addresses in display order: the first one is the cover. */
  images: string[];
  max: number;
  uploading: boolean;
  error?: string;
  /** Called with the chosen files, already cut down to the number of free slots. */
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  onMakeCover: (index: number) => void;
}

/** The recipe's photos as square tiles, with an "Add photo" tile while there is room. */
export default function PhotoPicker({ images, max, uploading, error, onAdd, onRemove, onMakeCover }: PhotoPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, max - images.length);
    // Clear the input so choosing the same file again still fires a change.
    e.target.value = '';
    if (files.length > 0) onAdd(files);
  };

  return (
    <>
      <ul className="grid grid-cols-3 gap-2 sm:gap-3">
        {images.map((url, i) => (
          <li key={url} className={`relative aspect-square overflow-hidden border-[3px] ${i === 0 ? 'border-primary' : 'border-line-soft'}`}>
            <RecipeImage src={url} alt={`Photo ${i + 1}`} />
            {/* Always visible: a hover-only button cannot be found on a touch screen */}
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute top-0 right-0 flex items-center justify-center w-11 h-11"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2B2B3D]/85 text-white">
                <CloseIcon className="w-4 h-4" strokeWidth={3} />
              </span>
            </button>
            {i === 0 ? (
              <span className="absolute bottom-1 left-1 bg-primary text-on-fill text-[0.8125rem] font-extrabold px-2 py-0.5">
                Cover
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onMakeCover(i)}
                className="absolute bottom-0 inset-x-0 min-h-9 bg-surface/95 text-ink text-[0.8125rem] font-extrabold"
              >
                Make cover
              </button>
            )}
          </li>
        ))}

        {images.length < max && (
          <li className="aspect-square">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`w-full h-full flex flex-col items-center justify-center gap-1 border-2 border-dashed bg-surface-alt text-sm font-bold text-ink-soft hover:border-primary disabled:cursor-wait ${
                error ? 'border-primary-ink' : 'border-line'
              }`}
            >
              <span className="text-2xl leading-none" aria-hidden="true">{uploading ? '⏳' : '📷'}</span>
              {uploading ? 'Uploading…' : 'Add photo'}
            </button>
          </li>
        )}
      </ul>

      {error && <p role="alert" className="mt-2 text-sm font-semibold text-primary-ink">{error}</p>}

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
    </>
  );
}
