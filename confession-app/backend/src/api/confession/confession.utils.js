const BAD_WORDS = ['abuse', 'hate', 'spam', 'scam', 'idiot', 'stupid'];

const normalizeForScan = (text) =>
  String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');

export const containsBadWords = (text) => {
  const normalized = normalizeForScan(text);
  if (!normalized) return false;

  return BAD_WORDS.some((word) => {
    const matcher = new RegExp(`\\b${word}\\b`, 'i');
    return matcher.test(normalized);
  });
};
