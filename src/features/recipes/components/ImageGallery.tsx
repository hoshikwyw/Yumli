import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui';
import RecipeImage from './RecipeImage';

interface ImageGalleryProps {
  images: string[];
  /** Recipe title: describes the main photo to screen readers. */
  title: string;
}

/** One large photo, with a row of thumbnails to switch between when there are several. */
export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const current = Math.min(active, images.length - 1);

  return (
    <div>
      <Card variant="default">
        <div className="relative aspect-[4/3]">
          <RecipeImage src={images[current]} alt={title} eager />
        </div>
      </Card>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2.5 overflow-x-auto scrollbar-none p-1 -m-1">
          {images.map((url, i) => (
            <li key={url} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={t('recipeDetail.photo', { number: i + 1, total: images.length })}
                aria-current={i === current ? 'true' : undefined}
                className={`relative block w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-md border-[3px] transition-opacity ${
                  i === current ? 'border-primary' : 'border-line-soft opacity-70 hover:opacity-100'
                }`}
              >
                <RecipeImage src={url} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
