/**
 * Draws Yumli's logo mark (a pixel-art fried egg) and writes every icon file
 * the site needs into public/. The drawing below is the single source: edit
 * it, run `npm run icons`, and the favicon, the phone icons and the logo in
 * the header all change together.
 *
 * No image library is needed: the art is a 16x16 grid, so each icon is that
 * grid scaled up by a whole number, written out as PNG by hand.
 */
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));

// ── The drawing ──
// One character per pixel. '.' is background; the letters are named below.
const ART = [
  '................',
  '................',
  '.....KKKKK......',
  '...KKWWWWWKK....',
  '..KWWWWWWWWWKK..',
  '.KWWWWYHYYWWWWK.',
  '.KWWWYYYYYYWWWK.',
  '.KWWWYKYYKYWWWK.',
  '.KWWWYYKKYYWWWK.',
  '.KWWWYYYYYOWWWK.',
  '..KWWWOOOOWWWK..',
  '..KWWWWWWWWWK...',
  '...KKWWWWWKK....',
  '.....KKKKK......',
  '................',
  '................',
];

const COLORS = {
  '.': '#FF7B7B', // background: brand coral
  S: '#E85D5D', // stepped shadow under the egg, like the site's pixel shadows
  K: '#2B2B3D', // ink outline
  W: '#FFFFFF', // egg white
  Y: '#FFC94D', // yolk
  H: '#FFF1B8', // yolk highlight
  O: '#F5A623', // yolk shade
};

const SIZE = ART.length;
if (ART.some((row) => row.length !== SIZE)) throw new Error('The drawing must be square');

/** The grid with the shadow added: every background pixel just below-right of the egg. */
const grid = ART.map((row, y) =>
  [...row].map((pixel, x) => {
    const upLeft = ART[y - 1]?.[x - 1];
    return pixel === '.' && upLeft && upLeft !== '.' ? 'S' : pixel;
  }));

/** Corner pixels left transparent, so the small icons read as a rounded tile. */
const isCorner = (x, y) => (x === 0 || x === SIZE - 1) && (y === 0 || y === SIZE - 1);

// ── SVG ──

function svg() {
  const rects = [];
  for (let y = 0; y < SIZE; y++) {
    // Join neighbouring pixels of one colour into a single rectangle per run.
    for (let x = 0; x < SIZE; ) {
      const pixel = grid[y][x];
      let end = x + 1;
      while (end < SIZE && grid[y][end] === pixel && !isCorner(end, y)) end++;
      if (!isCorner(x, y)) {
        rects.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${COLORS[pixel]}"/>`);
      }
      x = end;
    }
  }
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" shape-rendering="crispEdges">`,
    '<title>Yumli</title>',
    ...rects,
    '</svg>',
    '',
  ].join('\n');
}

// ── PNG ──

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes) {
  let c = 0xffffffff;
  for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/**
 * A square PNG of `size` pixels with the drawing at `scale`, centred.
 * `fullBleed` fills the whole square with the background colour (phone icons,
 * which the phone crops to its own shape); otherwise the corners are transparent.
 */
function png(size, scale, fullBleed) {
  const offset = Math.floor((size - SIZE * scale) / 2);
  const background = [...rgb(COLORS['.']), 255];
  // Each row starts with one filter byte (0 = none), then RGBA per pixel.
  const raw = Buffer.alloc(size * (1 + size * 4));

  for (let py = 0; py < size; py++) {
    const rowStart = py * (1 + size * 4);
    for (let px = 0; px < size; px++) {
      const x = Math.floor((px - offset) / scale);
      const y = Math.floor((py - offset) / scale);
      const inside = x >= 0 && y >= 0 && x < SIZE && y < SIZE;

      let color = background;
      if (inside && !fullBleed && isCorner(x, y)) color = [0, 0, 0, 0];
      else if (inside) color = [...rgb(COLORS[grid[y][x]]), 255];

      raw.set(color, rowStart + 1 + px * 4);
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8); // 8 bits per channel, RGBA

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── ICO: a small container holding several PNGs ──

function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.set([size, size, 0, 0], 0);
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

// ── Write everything ──

const files = {
  'favicon.svg': svg(),
  'favicon-16x16.png': png(16, 1, false),
  'favicon-32x32.png': png(32, 2, false),
  'favicon.ico': ico([16, 32, 48].map((size) => ({ size, data: png(size, size / SIZE, false) }))),
  // Phone icons keep the egg inside the middle of the square: iOS rounds the
  // corners and Android may crop to a circle, and neither should cut into it.
  'apple-touch-icon.png': png(180, 9, true),
  'android-chrome-192x192.png': png(192, 9, true),
  'android-chrome-512x512.png': png(512, 24, true),
};

for (const [name, data] of Object.entries(files)) {
  writeFileSync(publicDir + name, data);
  console.log(`public/${name}  ${data.length} bytes`);
}
