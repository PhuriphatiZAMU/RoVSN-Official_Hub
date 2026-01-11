// API Configuration
const API_BASE_URL = import.meta.env.PROD
    ? 'https://rov-sn-tournament-official.onrender.com'
    : '';

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

export default api;
