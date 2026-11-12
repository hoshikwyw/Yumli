import { useState } from 'react';
import { PixelArt } from '@/components/ui';

interface RecipeImageProps {
  src: string | undefined;
  /** Leave empty when the recipe title is right next to the image: it would only be read twice. */
  alt?: string;
  className?: string;
  /** Load straight away: for the one main image at the top of a page. Everything else loads as it scrolls in. */
  eager?: boolean;
}

/**
 * A recipe photo that fills its parent. The parent must be `relative` and sets the size (usually an
 * aspect ratio), so the page does not jump when the photo arrives. A missing
 * or broken photo shows a friendly placeholder instead of a broken-image icon.
 */
export default function RecipeImage({ src, alt = '', className = '', eager = false }: RecipeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={`absolute inset-0 w-full h-full flex items-center justify-center bg-surface-alt ${className}`}
      >
        <PixelArt name="plate" className="w-1/3 max-w-16 h-auto aspect-square" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailedSrc(src)}
      className={`absolute inset-0 w-full h-full object-cover bg-surface-alt ${className}`}
    />
  );
}
