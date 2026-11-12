/** The 11-character video id from a YouTube link (watch, youtu.be, embed or shorts), or from a bare id. */
export function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match) return match[1];
  }
  return null;
}

/** Embed address on YouTube's no-cookie domain: nothing is stored on the visitor's device until they press play. */
export const youTubeEmbedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`;
