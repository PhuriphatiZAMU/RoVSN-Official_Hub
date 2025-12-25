// src/services/api.js
import axios from 'axios';
import { SCHEDULE_DATA } from '../data/mockData'; // For fetchUpcomingMatches fallback

// The vite.config.js proxy will handle redirecting /api requests to http://localhost:3001
const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches the full schedule from the API (from `schedules` collection).
 * @returns {Promise<Object>} A promise that resolves to an object with days as keys and matches as values.
 */
export const fetchSchedules = async () => {
  try {
    const response = await apiClient.get('/schedules');
    // The backend returns an array of matches, we need to group them by day
    const groupedByDay = response.data.reduce((acc, match) => {
      const day = match.day || 'N/A';
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(match);
      return acc;
    }, {});
    return groupedByDay;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

/**
 * Fetches all fixtures from the API (from `fixtures` collection).
 * @returns {Promise<Array>} A promise that resolves to an array of all fixtures.
 */
export const fetchFixtures = async () => {
    try {
      const response = await apiClient.get('/fixtures');
      return response.data;
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      throw error;
    }
  };

/**
 * Fetches the latest standings from the API.
 * @returns {Promise<Array>} A promise that resolves to an array of standings data.
 */
export const fetchStandings = async () => {
  try {
    const response = await apiClient.get('/table/latest');
    return response.data;
  } catch (error) {
    console.error('Error fetching standings:', error);
    throw error;
  }
};

/**
 * Fetches the player statistics from the API.
 * @returns {Promise<Array>} A promise that resolves to an array of player data.
 */
export const fetchPlayers = async () => {
  try {
    const response = await apiClient.get('/player-stats/totals');
    return response.data;
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

/**
 * Fetches upcoming matches.
 * Note: The user mentioned the endpoint might be /fixtures, but if it's missing,
 * we will simulate it by filtering the mock data.
 * @returns {Promise<Array>} A promise that resolves to an array of upcoming matches.
 */
export const fetchUpcomingMatches = async () => {
    try {
        // First, try to hit a real endpoint if it exists
        const response = await apiClient.get('/fixtures');
        return response.data.filter(match => match.status === 'upcoming');
    } catch (error) {
        console.warn('Could not fetch /fixtures, falling back to mock data for upcoming matches.');
        // Fallback logic if the /fixtures endpoint doesn't exist
        const allMatches = Object.values(SCHEDULE_DATA).flat();
        const upcoming = allMatches.filter(match => match.status === 'upcoming');
        return Promise.resolve(upcoming.slice(0, 2)); // Return first 2 upcoming
    }
};

/**
 * Updates the score for a specific match.
 * @param {number} matchDay - The day of the match.
 * @param {number} matchNo - The number of the match within the day.
 * @param {number} score1 - The score for team 1.
 * @param {number} score2 - The score for team 2.
 * @returns {Promise<Object>} A promise that resolves to the response data from the API.
 */
export const updateMatchScore = async (matchDay, matchNo, score1, score2) => {
    try {
        const response = await apiClient.patch(`/fixtures/${matchDay}/${matchNo}`, {
            score1: parseInt(score1, 10),
            score2: parseInt(score2, 10),
            status: 'จบการแข่งขัน' // 'completed' in Thai, as per server.js
        });
        return response.data;
    } catch (error) {
        console.error('Error updating match score:', error);
        throw error;
    }
};

/**
 * Resets a match score to an upcoming state.
 * @param {number} matchDay - The day of the match.
 * @param {number} matchNo - The number of the match within the day.
 * @returns {Promise<Object>} A promise that resolves to the response data from the API.
 */
export const resetMatch = async (matchDay, matchNo) => {
    try {
        const response = await apiClient.patch(`/fixtures/${matchDay}/${matchNo}`, {
            score1: null,
            score2: null,
            status: 'ยังไม่แข่งขัน' // 'upcoming' in Thai, as per server.js
        });
        return response.data;
    } catch (error) {
        console.error('Error resetting match:', error);
        throw error;
    }
};

/**
 * Fetches AI predictions for a given day.
 * @param {number} day - The match day to get predictions for.
 * @returns {Promise<Object>} A promise that resolves to the prediction data.
 */
export const fetchPredictions = async (day) => {
    try {
        const response = await apiClient.get(`/predictions?day=${day}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching predictions for day ${day}:`, error);
        throw error;
    }
};


export default apiClient;