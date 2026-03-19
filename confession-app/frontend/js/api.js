const BASE_URL = 'http://localhost:5000/api';
const API_BASE = `${BASE_URL}/confessions`;

const API = {
    async getFeed(type = '') {
        try {
            const res = await fetch(`${API_BASE}${type ? (type === 'trending' ? '/trending' : `?type=${type}`) : ''}`);
            const data = await res.json();
            return data.data || [];
        } catch (e) {
            console.error('API Error:', e);
            return [];
        }
    },
    async getTrending() {
        try {
            const res = await fetch(`${API_BASE}/trending`);
            const data = await res.json();
            return data.data || [];
        } catch (e) {
            console.error('API Error:', e);
            return [];
        }
    },
    async searchPosts(query) {
        try {
            const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            return data.data || [];
        } catch (e) {
            return [];
        }
    },
    async getActivity(postIds) {
        try {
            const res = await fetch(`${API_BASE}/activity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postIds })
            });
            const data = await res.json();
            return data.data || [];
        } catch (e) {
            return [];
        }
    },
    async addPost(text, type, blurred) {
        const res = await fetch(`${API_BASE}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, type, blurred })
        });
        return res.json();
    },
    async likePost(id) {
        return fetch(`${API_BASE}/like/${id}`, { method: 'POST' });
    },
    async dislikePost(id) {
        return fetch(`${API_BASE}/dislike/${id}`, { method: 'POST' });
    },
    async addComment(id, text) {
        const res = await fetch(`${API_BASE}/${id}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        return res.json();
    },
    async voteComment(postId, commentId, isLike) {
        return fetch(`${API_BASE}/${postId}/comments/${commentId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isLike })
        });
    },
    async getSettings(deviceId) {
        try {
            const res = await fetch(`${BASE_URL}/settings/${deviceId}`);
            const data = await res.json();
            return data.data || { theme: 'system', revealEnabled: true };
        } catch(e) { return { theme: 'system', revealEnabled: true }; }
    },
    async updateSettings(deviceId, settings) {
        try {
            const res = await fetch(`${BASE_URL}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId, ...settings })
            });
            const data = await res.json();
            return data.data;
        } catch(e) { return null; }
    }
};
