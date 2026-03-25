export const MY_POSTS_KEY = "myConfessions";
export const DEVICE_ID_KEY = "deviceId";
export const BOOKMARKS_KEY = "bookmarkedConfessions";
export const UI_SETTINGS_KEY = "confesslyUiSettings";

export const DEFAULT_UI_SETTINGS = {
  presetId: "blue-mist",
  font: "default",
  textTone: "standard",
  textScale: 1,
  radius: 1
};

export function getDeviceId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const generated =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  window.localStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}

export function getMyPosts() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(MY_POSTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveMyPost(postId) {
  const existing = getMyPosts();
  const next = [...new Set([postId, ...existing])];
  window.localStorage.setItem(MY_POSTS_KEY, JSON.stringify(next));
}

export function getBookmarks() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(BOOKMARKS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleBookmark(postId) {
  const existing = getBookmarks();
  const next = existing.includes(postId)
    ? existing.filter((item) => item !== postId)
    : [postId, ...existing];

  window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
  return next;
}

export function getUiSettings() {
  if (typeof window === "undefined") {
    return DEFAULT_UI_SETTINGS;
  }

  try {
    return {
      ...DEFAULT_UI_SETTINGS,
      ...JSON.parse(window.localStorage.getItem(UI_SETTINGS_KEY) || "{}")
    };
  } catch {
    return DEFAULT_UI_SETTINGS;
  }
}

export function saveUiSettings(settings) {
  if (typeof window === "undefined") {
    return settings;
  }

  const next = { ...DEFAULT_UI_SETTINGS, ...settings };
  window.localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(next));
  return next;
}
