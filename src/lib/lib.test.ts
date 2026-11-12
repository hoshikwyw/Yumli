import { describe, expect, it } from 'vitest';
import { errorMessage } from './errors';
import { getYouTubeId } from './youtube';

describe('getYouTubeId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/watch?feature=share&v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?t=10', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['  dQw4w9WgXcQ  ', 'dQw4w9WgXcQ'],
  ])('finds the id in %s', (url, id) => {
    expect(getYouTubeId(url)).toBe(id);
  });

  it.each(['', 'https://example.com/watch?v=dQw4w9WgXcQ', 'not a link'])('rejects %s', (url) => {
    expect(getYouTubeId(url)).toBeNull();
  });
});

describe('errorMessage', () => {
  it('uses the message of an Error', () => {
    expect(errorMessage(new Error('Boom'))).toBe('Boom');
  });

  it('falls back for anything else', () => {
    expect(errorMessage('Boom', 'Fallback')).toBe('Fallback');
    expect(errorMessage(new Error(''), 'Fallback')).toBe('Fallback');
    expect(errorMessage(null)).toBe('Something went wrong');
  });
});
