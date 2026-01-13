// API Configuration
// ถ้ามี VITE_API_URL ให้ใช้ค่านั้น ถ้าไม่มี (dev) ให้ใช้ proxy
const envUrl = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = envUrl ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`) : '/api';

// API Helper
const api = {
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`API GET ${endpoint} error:`, error);
            throw error;
        }
    },

    async post(endpoint, data, token = null) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`API POST ${endpoint} error:`, error);
            throw error;
        }
    },

    async delete(endpoint, token = null) {
        try {
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers,
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`API DELETE ${endpoint} error:`, error);
            throw error;
        }
    }
};

// API Endpoints
export const fetchSchedules = () => api.get('/api/schedules');
export const fetchResults = () => api.get('/api/results');
export const fetchTeamLogos = () => api.get('/api/team-logos');
export const fetchSeasonStats = () => api.get('/api/season-stats');
export const fetchTeamStats = () => api.get('/api/team-stats');
export const fetchPlayerStats = () => api.get('/api/player-stats');

// Auth
export const login = (username, password) =>
    api.post('/api/auth/login', { username, password });

// Protected endpoints
export const postResult = (data, token) =>
    api.post('/api/results', data, token);
export const postSchedule = (data, token) =>
    api.post('/api/schedules', data, token);
export const postTeamLogo = (data, token) =>
    api.post('/api/team-logos', data, token);

export const resetResults = (day, token) =>
    api.delete(`/api/results/reset/${day}`, token);

export const deleteMatchResult = (matchId, token) =>
    api.delete(`/api/results/${encodeURIComponent(matchId)}`, token);

export default api;
