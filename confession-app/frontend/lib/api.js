import { getDeviceId } from "@/lib/storage";

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "/api"
).replace(/\/$/, "");

async function request(path, options = {}) {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const deviceId = typeof window !== "undefined" ? getDeviceId() : "";
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(deviceId ? { "x-device-id": deviceId } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_ROOT}${path}`, {
    headers,
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export async function getFeed({ category = "", page = 1, limit = 10 }) {
  const endpoint =
    category === "trending"
      ? `/confessions/trending`
      : `/confessions?type=${encodeURIComponent(category)}&page=${page}&limit=${limit}`;

  const data = await request(endpoint, { cache: "no-store" });
  return data.data || [];
}

export async function searchPosts(query) {
  if (!query?.trim()) {
    return [];
  }

  const data = await request(`/confessions/search?q=${encodeURIComponent(query)}`, {
    cache: "no-store"
  });
  return data.data || [];
}

export async function getActivity(postIds) {
  const data = await request("/confessions/activity", {
    method: "POST",
    body: JSON.stringify({ postIds })
  });
  return data.data || [];
}

export async function getMyPostsFeed({ page = 1, limit = 20 } = {}) {
  const data = await request(`/confessions/my-posts?page=${page}&limit=${limit}`, {
    cache: "no-store"
  });
  return data.data || [];
}

export async function addPost(payload) {
  const data = await request("/confessions/add", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function uploadPostImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const data = await request("/confessions/upload", {
    method: "POST",
    body: formData
  });
  return data.data?.imageUrl || "";
}

export async function reactToPost(postId, type) {
  const data = await request(`/confessions/react/${postId}`, {
    method: "POST",
    body: JSON.stringify({ type })
  });
  return data.data;
}

export async function reportPost(postId, reason = "OTHER") {
  const data = await request(`/confessions/report/${postId}`, {
    method: "POST",
    body: JSON.stringify({ reason })
  });
  return data.data;
}

export async function getComments(postId, page = 1, limit = 20) {
  const data = await request(`/confessions/${postId}/comments?page=${page}&limit=${limit}`, {
    cache: "no-store"
  });
  return data.data || [];
}

export async function votePost(postId, voteType) {
  const data = await request(`/confessions/${voteType}/${postId}`, {
    method: "POST"
  });
  return data.data;
}

export async function addComment(postId, text) {
  const data = await request(`/confessions/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text })
  });
  return data.data;
}

export async function voteComment(postId, commentId, isLike) {
  const data = await request(`/confessions/${postId}/comments/${commentId}/vote`, {
    method: "POST",
    body: JSON.stringify({ isLike })
  });
  return data.data;
}

export async function getSettings() {
  const data = await request("/settings", { cache: "no-store" });
  return data.data || { theme: "system", revealEnabled: true };
}

export async function updateSettings(settings) {
  const data = await request("/settings", {
    method: "POST",
    body: JSON.stringify(settings)
  });
  return data.data;
}
