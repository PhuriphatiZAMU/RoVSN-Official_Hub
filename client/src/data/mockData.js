// src/data/mockData.js

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/table", label: "Table" },
  { href: "/players", label: "Players" },
  { href: "/predictions", label: "วิเคราะห์ผล" }, // New link
  { href: "/teams", label: "Teams" },
];

export const keyVisuals = [
  { src: "/Key-Visual-img/RoV-SN-TOURNAMENT-2026.png", alt: "RoV SN Tournament 2026" },
  { src: "/Key-Visual-img/RoV-SN-TOURNAMENT-2025.png", alt: "RoV SN Tournament 2025" },
  { src: "/Key-Visual-img/RoV-SN-TOURNAMENT-2024.png", alt: "RoV SN Tournament 2024" },
];

export const upcomingMatches = [
  {
    "team1": "Buriram United",
    "team2": "Talon",
    "time": "18:00",
    "day": "Day 1"
  },
  {
    "team1": "Bacon Time",
    "team2": "Valencia CF Esports",
    "time": "19:30",
    "day": "Day 1"
  }
];

export const newsArticles = [
    {
        "id": 1,
        "title": "RoV Pro League 2023 Summer: The new era of Thai esports.",
        "date": "2023-08-15",
        "image": "https://via.placeholder.com/400x250",
        "link": "#"
    },
    {
        "id": 2,
        "title": "Bacon Time crowns as the champion of RPL 2023 Summer.",
        "date": "2023-04-02",
        "image": "https://via.placeholder.com/400x250",
        "link": "#"
    },
    {
        "id": 3,
        "title": "Summary of the first week of the tournament.",
        "date": "2023-08-22",
        "image": "https://via.placeholder.com/400x250",
        "link": "#"
    },
    {
        "id": 4,
        "title": "Interview with the rising star, Erez from Buriram United.",
        "date": "2023-09-01",
        "image": "https://via.placeholder.com/400x250",
        "link": "#"
    }
];

export const SCHEDULE_DATA = {
    "Day 1": [
        { time: '18:00', team1: 'Buriram United', score1: 3, team2: 'Talon', score2: 2, status: 'completed', winner: 'Buriram United' },
        { time: '19:30', team1: 'Bacon Time', score1: 3, team2: 'Valencia CF Esports', score2: 0, status: 'completed', winner: 'Bacon Time' },
    ],
    "Day 2": [
        { time: '18:00', team1: 'PSG Esports', score1: 1, team2: 'eArena', score2: 3, status: 'completed', winner: 'eArena' },
        { time: '19:30', team1: 'KFC x Talon', score1: null, team2: 'B Esports x Goldcity', score2: null, status: 'upcoming' },
    ],
    "Day 3": [
        { time: '18:00', team1: 'Buriram United', score1: null, team2: 'Bacon Time', score2: null, status: 'upcoming' },
        { time: '19:30', team1: 'Valencia CF Esports', score1: null, team2: 'PSG Esports', score2: null, status: 'upcoming' },
    ]
};

export const STANDINGS_DATA = [
    { rank: 1, team: 'Bacon Time', played: 8, w: 7, l: 1, gameDiff: '+15', points: 7, form: ['W', 'W', 'W', 'L', 'W'] },
    { rank: 2, team: 'Buriram United', played: 8, w: 7, l: 1, gameDiff: '+12', points: 7, form: ['W', 'L', 'W', 'W', 'W'] },
    { rank: 3, team: 'Talon', played: 8, w: 6, l: 2, gameDiff: '+8', points: 6, form: ['L', 'W', 'W', 'W', 'L'] },
    { rank: 4, team: 'Valencia CF Esports', played: 8, w: 5, l: 3, gameDiff: '+4', points: 5, form: ['W', 'W', 'L', 'W', 'L'] },
    { rank: 5, team: 'eArena', played: 8, w: 4, l: 4, gameDiff: '-2', points: 4, form: ['L', 'L', 'W', 'L', 'W'] },
    { rank: 6, team: 'PSG Esports', played: 8, w: 3, l: 5, gameDiff: '-5', points: 3, form: ['L', 'W', 'L', 'L', 'L'] },
    { rank: 7, team: 'B Esports x Goldcity', played: 8, w: 2, l: 6, gameDiff: '-10', points: 2, form: ['W', 'L', 'L', 'L', 'W'] },
    { rank: 8, team: 'KFC x Talon', played: 8, w: 1, l: 7, gameDiff: '-12', points: 1, form: ['L', 'L', 'L', 'W', 'L'] },
];

export const PLAYERS_DATA = [
    { id: 1, rank: 1, name: 'Moowan', team: 'Bacon Time', role: 'Abyssal Dragon', games: 20, kills: 105, deaths: 30, assists: 150, kda: 8.5, mvp: 5, goldPerMin: 780, damageDealt: 55000, damageTaken: 25000 },
    { id: 2, rank: 2, name: 'Erez', team: 'Buriram United', role: 'Abyssal Dragon', games: 22, kills: 110, deaths: 35, assists: 140, kda: 7.1, mvp: 6, goldPerMin: 790, damageDealt: 58000, damageTaken: 23000 },
    { id: 3, rank: 3, name: 'Happy', team: 'Talon', role: 'Mid Lane', games: 21, kills: 90, deaths: 25, assists: 180, kda: 10.8, mvp: 4, goldPerMin: 750, damageDealt: 62000, damageTaken: 20000 },
    { id: 4, rank: 4, name: 'AlmondP', team: 'Bacon Time', role: 'Jungle', games: 20, kills: 95, deaths: 40, assists: 160, kda: 6.4, mvp: 3, goldPerMin: 810, damageDealt: 51000, damageTaken: 30000 },
    { id: 5, rank: 5, name: 'Getsrch', team: 'Bacon Time', role: 'Support', games: 20, kills: 20, deaths: 45, assists: 250, kda: 6.0, mvp: 2, goldPerMin: 650, damageDealt: 15000, damageTaken: 45000 },
    { id: 6, rank: 6, name: 'Nunu', team: 'Buriram United', role: 'Mid Lane', games: 22, kills: 85, deaths: 30, assists: 170, kda: 8.5, mvp: 3, goldPerMin: 760, damageDealt: 60000, damageTaken: 22000 },
    { id: 7, rank: 7, name: 'IPodPro', team: 'Talon', role: 'Support', games: 21, kills: 25, deaths: 50, assists: 280, kda: 6.1, mvp: 1, goldPerMin: 640, damageDealt: 18000, damageTaken: 48000 },
    { id: 8, rank: 8, name: 'Deboom', team: 'Valencia CF Esports', role: 'Jungle', games: 19, kills: 80, deaths: 55, assists: 130, kda: 3.8, mvp: 2, goldPerMin: 790, damageDealt: 49000, damageTaken: 32000 },
    { id: 9, rank: 9, name: 'TaoX', team: 'Bacon Time', role: 'Dark Slayer', games: 20, kills: 70, deaths: 42, assists: 140, kda: 5.0, mvp: 1, goldPerMin: 720, damageDealt: 45000, damageTaken: 38000 },
    { id: 10, rank: 10, name: 'Difoxn', team: 'eArena', role: 'Abyssal Dragon', games: 18, kills: 75, deaths: 48, assists: 110, kda: 3.8, mvp: 2, goldPerMin: 730, damageDealt: 52000, damageTaken: 28000 },
    { id: 11, rank: 11, name: 'isilindilz', team: 'Buriram United', role: 'Support', games: 22, kills: 15, deaths: 55, assists: 290, kda: 5.5, mvp: 0, goldPerMin: 660, damageDealt: 16000, damageTaken: 50000 },
    { id: 12, rank: 12, name: 'NT', team: 'Talon', role: 'Dark Slayer', games: 21, kills: 65, deaths: 50, assists: 150, kda: 4.3, mvp: 1, goldPerMin: 710, damageDealt: 43000, damageTaken: 40000 },
    { id: 13, rank: 13, name: 'Pichu', team: 'Valencia CF Esports', role: 'Mid Lane', games: 19, kills: 70, deaths: 45, assists: 140, kda: 4.7, mvp: 1, goldPerMin: 740, damageDealt: 59000, damageTaken: 24000 },
    { id: 14, rank: 14, name: 'Overfly', team: 'Buriram United', role: 'Dark Slayer', games: 22, kills: 72, deaths: 48, assists: 160, kda: 4.8, mvp: 2, goldPerMin: 730, damageDealt: 46000, damageTaken: 42000 },
];

// NOTE: I'm assuming the Key-Visual-img folder will be moved into the `client/public` directory.
// The paths should work if the 'Key-Visual-img' folder from the root is moved to 'client/public/Key-Visual-img'.
// Also, I'm using placeholder images for news articles.