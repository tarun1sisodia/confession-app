const BAD_WORDS = ['abuse', 'hate', 'spam', 'scam', 'idiot', 'stupid'];

export const containsBadWords = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word));
};
