import { PALETTE, SPRITES, SPRITE_SIZE, type SpriteName } from './sprites';

interface PixelArtProps {
  name: SpriteName;
  /** Sets the size, e.g. "w-12 h-12". Multiples of 16px (w-4, w-8, w-12, w-16) keep every pixel square. */
  className?: string;
  /** Say what the picture shows when it carries meaning on its own. Leave out for decoration. */
  label?: string;
}

type Run = { x: number; y: number; width: number; fill: string };

/** A sprite as rectangles: neighbouring pixels of one colour become a single rectangle. */
function toRuns(rows: readonly string[]): Run[] {
  const runs: Run[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; ) {
      const pixel = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === pixel) end++;
      if (pixel !== '.') runs.push({ x, y, width: end - x, fill: PALETTE[pixel as keyof typeof PALETTE] });
      x = end;
    }
  });
  return runs;
}

/* Each drawing is turned into rectangles once, the first time it is shown. */
const cache = new Map<SpriteName, Run[]>();
const runsFor = (name: SpriteName) => {
  let runs = cache.get(name);
  if (!runs) {
    runs = toRuns(SPRITES[name]);
    cache.set(name, runs);
  }
  return runs;
};

/** One of Yumli's pixel-art pictures (see sprites.ts), drawn as crisp SVG at any size. */
export default function PixelArt({ name, className = 'w-8 h-8', label }: PixelArtProps) {
  return (
    <svg
      viewBox={`0 0 ${SPRITE_SIZE} ${SPRITE_SIZE}`}
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`shrink-0 ${className}`}
    >
      {runsFor(name).map((run) => (
        <rect key={`${run.x}-${run.y}`} x={run.x} y={run.y} width={run.width} height={1} fill={run.fill} />
      ))}
    </svg>
  );
}
