import axios from 'axios';
import {
    Team,
    Player,
    MatchResult,
    Standing,
    ScheduleItem,
    PlayerStat,
    TeamStat,
    SeasonStats,
    Hero,
    PlayerHeroStat
} from '../types';

const envUrl = import.meta.env.VITE_API_URL;
const API_URL = envUrl
    ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`)
    : 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const apiService = {
    // --- Teams & Clubs ---
    getTeams: async (): Promise<Team[]> => {
        // Map /team-logos to Team interface
        const response = await api.get<{ teamName: string, logoUrl: string }[]>('/team-logos');
        return response.data.map(item => ({
            _id: item.teamName, // Use name as ID for now
            name: item.teamName,
            logo: item.logoUrl,
            logoShort: item.logoUrl
        }));
    },

    getTeamStats: async (): Promise<TeamStat[]> => {
        const response = await api.get<TeamStat[]>('/team-stats');
        return response.data;
    },

    // --- Players ---
    getPlayers: async (): Promise<Player[]> => {
        const response = await api.get<Player[]>('/players');
        return response.data;
    },

    getPlayerStats: async (): Promise<PlayerStat[]> => {
        const response = await api.get<PlayerStat[]>('/player-stats');
        return response.data;
    },

    getPlayerHeroStats: async (): Promise<PlayerHeroStat[]> => {
        const response = await api.get<PlayerHeroStat[]>('/player-hero-stats');
        return response.data;
    },

    // --- Matches & Results ---
    getResults: async (): Promise<MatchResult[]> => {
        const response = await api.get<MatchResult[]>('/results');
        return response.data;
    },

    createResult: async (resultData: Partial<MatchResult>): Promise<MatchResult> => {
        const response = await api.post<MatchResult>('/results', resultData);
        return response.data;
    },

    // --- Schedule ---
    // Backend returns a single Schedule object which contains the array
    getSchedule: async (): Promise<ScheduleItem> => {
        const response = await api.get<ScheduleItem>('/schedules');
        return response.data;
    },

    // --- Standings ---
    getStandings: async (): Promise<Standing[]> => {
        const response = await api.get<Standing[]>('/standings');
        return response.data;
    },

    // --- Stats ---
    getSeasonStats: async (): Promise<SeasonStats> => {
        const response = await api.get<SeasonStats>('/season-stats');
        return response.data;
    },

    getHeroes: async (): Promise<Hero[]> => {
        const response = await api.get<Hero[]>('/heroes');
        return response.data;
    },

    // --- Admin / Writes ---
    createSchedule: async (data: any): Promise<ScheduleItem> => {
        const response = await api.post<ScheduleItem>('/schedules', data);
        return response.data;
    },

    createTeamLogo: async (data: any): Promise<any> => {
        const response = await api.post('/team-logos', data);
        return response.data;
    },

    deleteResult: async (matchId: string): Promise<any> => {
        const response = await api.delete(`/results/${encodeURIComponent(matchId)}`);
        return response.data;
    },

    resetResults: async (day: string | number): Promise<any> => {
        const response = await api.delete(`/results/reset/${day}`);
        return response.data;
    },

    deleteTeamLogo: async (teamName: string): Promise<any> => {
        const response = await api.delete(`/team-logos/${encodeURIComponent(teamName)}`);
        return response.data;
    },

    saveGameStats: async (stats: any[]): Promise<any> => {
        const response = await api.post('/stats', stats);
        return response.data;
    },

    getMatchStats: async (matchId: string): Promise<any> => {
        const response = await api.get(`/stats/match?matchId=${encodeURIComponent(matchId)}`);
        return response.data;
    },

    // --- Uploads ---
    uploadImage: async (formData: FormData): Promise<{ url: string }> => {
        const response = await api.post<{ url: string }>('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // --- Auth ---
    login: async (username: string, password: string): Promise<any> => {
        const response = await api.post('/auth/login', { username, password });
        return response.data;
    },

    verify: async (): Promise<any> => {
        const response = await api.get('/auth/verify');
        return response.data;
    }
};

// Interceptor สำหรับใส่ Token (ถ้ามี AuthContext)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiService;
