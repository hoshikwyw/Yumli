import { describe, expect, it } from 'vitest';
import { PALETTE, SPRITES, SPRITE_SIZE } from './sprites';

describe('sprites', () => {
  it.each(Object.entries(SPRITES))('%s is a 16x16 drawing in palette colours', (_name, rows) => {
    expect(rows).toHaveLength(SPRITE_SIZE);
    for (const row of rows) {
      expect(row).toHaveLength(SPRITE_SIZE);
      for (const pixel of row) {
        expect(pixel === '.' || pixel in PALETTE, `unknown pixel "${pixel}" in "${row}"`).toBe(true);
      }
    }
  });
});
