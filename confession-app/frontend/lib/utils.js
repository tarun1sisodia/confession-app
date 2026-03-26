export const CATEGORY_OPTIONS = [
  { label: "Recent", value: "" },
  { label: "Trending", value: "trending" },
  { label: "Deep", value: "deep" },
  { label: "Secret", value: "secret" },
  { label: "Funny", value: "funny" }
];

export const QUOTES = [
  "Some truths need a soft place to land.",
  "You can be honest here without becoming visible.",
  "Every anonymous story still deserves empathy.",
  "A quiet confession can start a loud healing."
];

export const TRENDING_TOPICS = [
  "heartbreak",
  "friendship",
  "college",
  "career",
  "family",
  "late-night thoughts"
];

export const EMOTION_REACTIONS = [
  { label: "Support", value: "relatable" },
  { label: "Laugh", value: "funny" },
  { label: "Feel it", value: "sad" }
];

export function classifyConfession(text) {
  const value = text.toLowerCase();

  if (/(laugh|funny|meme|lol)/.test(value)) {
    return "funny";
  }

  if (/(secret|hide|nobody knows|anonymous)/.test(value)) {
    return "secret";
  }

  return "deep";
}

export function shouldBlur(text) {
  return text.trim().length > 180;
}

export function getScore(post) {
  const likes = post.likes || 0;
  const dislikes = post.dislikes || 0;
  const comments = post.commentCount ?? post.comments?.length ?? 0;
  const reactions = Object.values(post.reactions || {}).reduce((sum, value) => sum + (value || 0), 0);
  const ageHours = Math.max(1, (Date.now() - new Date(post.createdAt || Date.now()).getTime()) / 36e5);
  const freshnessBoost = ageHours < 12 ? 12 - ageHours : 0;

  return likes * 1.8 + comments * 3 + reactions * 1.4 + freshnessBoost - dislikes * 1.5;
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value || 0);
}

export function getTopTags(posts) {
  const counts = new Map();

  posts.forEach((post) => {
    const matches = post.text?.toLowerCase().match(/#[a-z0-9-_]+/g) || [];
    matches.forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag, count]) => ({ tag, count }));
}

export function getPostSignal(post) {
  const reactions = post.reactions || {};
  const comments = post.commentCount ?? post.comments?.length ?? 0;
  const likes = post.likes || 0;
  const support = reactions.relatable || 0;
  const laughs = reactions.funny || 0;
  const empathy = reactions.sad || 0;

  if (comments >= 8) {
    return "Discussed";
  }

  if (support + likes >= 12) {
    return "Supported";
  }

  if (laughs >= 6) {
    return "Light";
  }

  if (empathy >= 5) {
    return "Heavy";
  }

  if (getScore(post) >= 18) {
    return "Rising";
  }

  return "Fresh";
}
