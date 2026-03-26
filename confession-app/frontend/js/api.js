const BASE_URL = '/api';
const API_BASE = `${BASE_URL}/confessions`;

const getDeviceId = () => localStorage.getItem('deviceId');

const API = {
    async getFeed(category = '', page = 1) {
        try {
            const endpoint = category === 'trending' ? '/trending' : `?type=${category}&page=${page}&limit=10`;
            const res = await fetch(`${API_BASE}${endpoint}`, {
                headers: { 'x-device-id': getDeviceId() }
            });
            const data = await res.json();
            return data.data || [];
        } catch (e) {
            console.error('API Error:', e);
            return null;
        }
    },
    async getTrending() {
        try {
            const res = await fetch(`${API_BASE}/trending`, {
                headers: { 'x-device-id': getDeviceId() }
            });
            const data = await res.json();
            return data.data || [];
        } catch (e) {
            console.error('API Error:', e);
            return [];
        }
    },
    async searchPosts(query) {
        try {
            const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
                headers: { 'x-device-id': getDeviceId() }
            });
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
                headers: { 
                    'Content-Type': 'application/json',
                    'x-device-id': getDeviceId()
                },
                body: JSON.stringify({ postIds })
            });
            const data = await res.json();
            return data.data || [];
        } catch (e) {
            return [];
        }
    },
    async addPost(text, type, blurred, imageUrl = '') {
        const res = await fetch(`${API_BASE}/add`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-device-id': getDeviceId()
            },
            body: JSON.stringify({ text, type, blurred, imageUrl })
        });
        return res.json();
    },
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: { 'x-device-id': getDeviceId() },
            body: formData
        });
        return res.json();
    },
    async votePost(id, type, reactionValue = null) {
        const res = await fetch(`${API_BASE}/vote/${id}`, { 
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-device-id': getDeviceId()
            },
            body: JSON.stringify({ deviceId: getDeviceId(), type, reactionValue })
        });
        return res.json();
    },
    async addComment(id, text) {
        const res = await fetch(`${API_BASE}/${id}/comments`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-device-id': getDeviceId()
            },
            body: JSON.stringify({ text })
        });
        return res.json();
    },
    async voteComment(postId, commentId, isLike) {
        const res = await fetch(`${API_BASE}/${postId}/comments/${commentId}/vote`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-device-id': getDeviceId()
            },
            body: JSON.stringify({ isLike, deviceId: getDeviceId() })
        });
        return res.json();
    },
    async getSettings(deviceId) {
        try {
            const res = await fetch(`${BASE_URL}/settings/${deviceId}`, {
                headers: { 'x-device-id': getDeviceId() }
            });
            const data = await res.json();
            return data.data || { theme: 'system', revealEnabled: true };
        } catch(e) { return { theme: 'system', revealEnabled: true }; }
    },
    async updateSettings(deviceId, settings) {
        try {
            const res = await fetch(`${BASE_URL}/settings`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-device-id': getDeviceId()
                },
                body: JSON.stringify({ deviceId, ...settings })
            });
            const data = await res.json();
            return data.data;
        } catch(e) { return null; }
    }
};
