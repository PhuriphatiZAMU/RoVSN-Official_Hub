'use client';

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
} from '@/types';

// Use local proxy for client-side requests to avoid CORS and auth issues
const API_URL = '/api/proxy';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // withCredentials: true, // Not needed for Token-based auth
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const apiService = {
    // --- Teams & Clubs ---
    getTeams: async (): Promise<Team[]> => {
        const response = await api.get<{ teamName: string, logoUrl: string }[]>('/team-logos');
        return response.data.map(item => ({
            _id: item.teamName,
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
    createSchedule: async (data: unknown): Promise<ScheduleItem> => {
        const response = await api.post<ScheduleItem>('/schedules', data);
        return response.data;
    },

    createTeamLogo: async (data: unknown): Promise<unknown> => {
        const response = await api.post('/team-logos', data);
        return response.data;
    },

    deleteResult: async (matchId: string): Promise<unknown> => {
        const response = await api.delete(`/results/${encodeURIComponent(matchId)}`);
        return response.data;
    },

    resetResults: async (day: string | number): Promise<unknown> => {
        const response = await api.delete(`/results/reset/${day}`);
        return response.data;
    },

    deleteTeamLogo: async (teamName: string): Promise<unknown> => {
        const response = await api.delete(`/team-logos/${encodeURIComponent(teamName)}`);
        return response.data;
    },

    saveGameStats: async (stats: unknown[]): Promise<unknown> => {
        const response = await api.post('/stats', stats);
        return response.data;
    },

    getMatchStats: async (matchId: string): Promise<unknown> => {
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
};

export default apiService;
