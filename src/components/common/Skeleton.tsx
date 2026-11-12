interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

/** Grey placeholder shown while content loads. Hidden from screen readers: the parent announces loading. */
export default function Skeleton({
  width = '100%',
  height = '20px',
  className = '',
  variant = 'rect',
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      style={{ width, height }}
      className={`bg-line-soft animate-pulse-pixel ${variant === 'circle' ? 'rounded-full' : 'rounded-md'} ${className}`}
    />
  );
}

export function RecipeCardSkeleton() {
  return (
    <div aria-hidden="true" className="bg-surface border-2 border-line-soft rounded-[14px] overflow-hidden">
      <Skeleton height="auto" className="!rounded-none aspect-[4/3]" />
      <div className="p-3 sm:p-4 space-y-3">
        <Skeleton height="18px" width="75%" />
        <Skeleton height="14px" width="100%" />
        <div className="flex justify-between items-center pt-1">
          <Skeleton height="14px" width="64px" />
          <Skeleton height="28px" width="84px" className="!rounded-full" />
        </div>
      </div>
    </div>
  );
}
