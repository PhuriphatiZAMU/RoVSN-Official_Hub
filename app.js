import { kvData, newsData } from './data.js';

// Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api'
    : 'https://rov-sn-tournament-api.vercel.app/api';

const statusEl = document.getElementById('connectionStatus');
const mobileStatusEl = document.getElementById('mobileConnectionStatus');

// --- Connection Helper ---
function setConnectionStatus(state) {
    if (state === 'connected') {
        if (statusEl) statusEl.innerHTML = `<div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> <span class="text-green-500">Live Data (MongoDB)</span>`;
        if (mobileStatusEl) mobileStatusEl.innerHTML = `<span class="text-green-500">Online</span>`;
    } else if (state === 'error') {
        if (statusEl) statusEl.innerHTML = `<div class="w-2 h-2 rounded-full bg-red-500"></div> <span class="text-red-500">Server Offline</span>`;
        if (mobileStatusEl) mobileStatusEl.innerHTML = `<span class="text-red-500">Offline</span>`;
    } else {
        if (statusEl) statusEl.innerHTML = `<div class="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div> Connecting...`;
        if (mobileStatusEl) mobileStatusEl.innerHTML = `Connecting...`;
    }
}

// --- Key Visual Carousel Injection (Bootstrap 5) ---
export function initKVCarousel() {
    const container = document.getElementById('kv-carousel-inner');
    if (!container) return;
    
    let slidesHtml = '';
    kvData.forEach((kv, index) => {
        const isActive = index === 0 ? 'active' : '';
        slidesHtml += `
            <div class="carousel-item ${isActive} h-100">
                <img src="${kv.image}" class="d-block w-100 h-100 object-cover" alt="KV ${kv.year}">
                <div class="absolute inset-0 d-flex flex-column justify-content-center align-items-center text-white p-4 text-center kv-overlay">
                    <span class="text-primary-custom text-6xl font-heading font-bold mb-2">${kv.year}</span>
                    <h2 class="text-3xl md:text-5xl font-bold tracking-wide uppercase drop-shadow-lg">${kv.theme}</h2>
                    <div class="mt-4 w-16 h-1 bg-primary-custom rounded-full"></div>
                </div>
            </div>`;
    });
    container.innerHTML = slidesHtml;
}

// --- News Carousel Injection ---
export function renderNewsCarousel() {
    const inner = document.getElementById('news-carousel-inner');
    const indicators = document.getElementById('news-indicators');
    
    if (!inner || !indicators) return;
    
    inner.innerHTML = '';
    indicators.innerHTML = '';

    newsData.forEach((news, index) => {
        const isActive = index === 0 ? 'active' : '';
        
        // Indicators
        indicators.innerHTML += `<button type="button" data-bs-target="#newsCarousel" data-bs-slide-to="${index}" class="${isActive}" aria-label="Slide ${index + 1}"></button>`;

        // Slides
        const slide = document.createElement('div');
        slide.className = `carousel-item ${isActive} aspect-video cursor-pointer`;
        slide.onclick = () => openNews(news.id);
        
        slide.innerHTML = `
            <img src="${news.image}" class="d-block w-100 h-100 object-cover" alt="${news.title}" onerror="this.src='https://placehold.co/800x600?text=News+Image'">
            <div class="carousel-caption d-none d-md-block text-start p-4 bg-gradient-to-t from-black/90 to-transparent bottom-0 start-0 end-0 w-100">
                <span class="bg-primary-custom text-white text-xs font-bold px-3 py-1 rounded shadow mb-2 d-inline-block uppercase">${news.category}</span>
                <h3 class="text-3xl font-heading font-bold text-white mb-2">${news.title}</h3>
                <p class="text-gray-300 text-sm">คลิกเพื่ออ่านเพิ่มเติม...</p>
            </div>
        `;
        inner.appendChild(slide);
    });
}

// Open News Detail
export function openNews(id) {
    const news = newsData.find(n => n.id === id);
    if (!news) return;
    sessionStorage.setItem('selectedNews', JSON.stringify(news));
    window.location.href = `news-detail.html?id=${id}`;
}

// --- MAIN FETCH FUNCTION (MongoDB Version) ---
export async function fetchTournamentData() {
    setConnectionStatus('connecting');
    
    try {
        // 1. Check Server Health first
        try {
            await fetch(`${API_BASE_URL}/health`);
            setConnectionStatus('connected');
        } catch (e) {
            throw new Error("Server unreachable");
        }

        // 2. Fetch Schedule Data
        const scheduleResponse = await fetch(`${API_BASE_URL}/schedules`);
        if (!scheduleResponse.ok) throw new Error("Failed to fetch schedules");
        
        const schedules = await scheduleResponse.json();

        // 3. Fetch Results Data
        let resultsData = null;
        try {
            const resultsResponse = await fetch(`${API_BASE_URL}/schedule-results/latest`);
            if (resultsResponse.ok) {
                resultsData = await resultsResponse.json();
            }
        } catch (e) {
            console.log('No results data yet');
        }

        if (schedules.length === 0) {
            renderNoData();
        } else {
            // Get the latest schedule
            const latestSchedule = schedules[0];

            // Merge results into schedule
            if (resultsData?.results && latestSchedule?.schedule) {
                latestSchedule.schedule.forEach((round, dayIndex) => {
                    const dayResults = resultsData.results[dayIndex];
                    if (dayResults?.matches) {
                        round.matches.forEach((match, matchIndex) => {
                            const result = dayResults.matches[matchIndex];
                            if (result && result.team1Score !== undefined) {
                                match.team1Score = result.team1Score;
                                match.team2Score = result.team2Score;
                                match.status = 'completed';
                            }
                        });
                    }
                });
            }

            // Render Data if components exist on the current page
            if (latestSchedule?.schedule?.length) {
                renderUpNext(latestSchedule.schedule);
                renderSchedule(latestSchedule.schedule);
            } else {
                renderNoData();
            }

            if (latestSchedule?.potA && latestSchedule?.potB) {
                renderTeams(latestSchedule.potA, latestSchedule.potB);
            }
        }

        // 4. Fetch Table (Standings) Data
        try {
            console.log('Fetching table from:', `${API_BASE_URL}/table/latest`);
            const standingsResponse = await fetch(`${API_BASE_URL}/table/latest`);
            console.log('Table response status:', standingsResponse.status);
            
            if (standingsResponse.ok) {
                const latestStandings = await standingsResponse.json();
                console.log('Standings data:', latestStandings);
                
                const teams = Array.isArray(latestStandings?.standings)
                    ? latestStandings.standings
                    : Array.isArray(latestStandings)
                        ? latestStandings
                        : null;

                if (teams && teams.length) {
                    console.log('Rendering standings with teams:', teams.length);
                    renderStandings(teams);
                } else {
                    console.warn('No teams data found in response');
                }
            } else {
                console.error('Table API returned error:', standingsResponse.status);
            }
        } catch (standingsError) {
            console.error('Standings fetch error:', standingsError);
        }

    } catch (error) {
        console.error("Error fetching data:", error);
        setConnectionStatus('error');
        const scheduleContainer = document.getElementById('schedule-container');
        if (scheduleContainer) {
            scheduleContainer.innerHTML = 
                `<div class="flex flex-col items-center justify-center py-12 text-gray-400">
                    <i class="fas fa-server text-4xl mb-3 text-red-300"></i>
                    <p>ไม่สามารถเชื่อมต่อกับ Database Server ได้</p>
                    <p class="text-xs text-gray-500 mt-2">กรุณาตรวจสอบว่าได้รัน 'node server.js' แล้วหรือยัง</p>
                </div>`;
        }
    }
}

// --- Render Functions ---

export function renderUpNext(schedule) {
    const container = document.getElementById('up-next-container');
    if (!container) return;
    
    container.innerHTML = '';
    if (!schedule || schedule.length === 0) return;
    
    // Find the first available match
    const firstDay = schedule[0];
    const matchesToShow = firstDay.matches.slice(0, 3);
    
    let cardsHtml = '';
    matchesToShow.forEach((match, idx) => {
        cardsHtml += `
            <div class="bg-gray-50 p-3 rounded-xl border border-gray-200 hover:border-primary-custom transition cursor-pointer group animate-fade-in" style="animation-delay: ${idx * 0.1}s">
                <div class="flex justify-between items-center text-xs text-gray-500 mb-2 font-semibold">
                    <span>Day ${firstDay.day}, Match ${idx + 1}</span>
                    <span class="bg-gray-200 px-2 py-0.5 rounded text-[10px] text-gray-600">BO3</span>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 w-5/12">
                        <div class="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[10px] font-bold text-blue-600">${match.blue.substring(0,2)}</div>
                        <span class="font-bold text-sm text-gray-700 truncate group-hover:text-primary-custom transition">${match.blue}</span>
                    </div>
                    <span class="text-gray-400 text-xs font-bold bg-white border px-2 py-1 rounded-full">VS</span>
                    <div class="flex items-center gap-2 w-5/12 flex-row-reverse text-right">
                        <div class="w-8 h-8 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-[10px] font-bold text-red-600">${match.red.substring(0,2)}</div>
                        <span class="font-bold text-sm text-gray-700 truncate group-hover:text-primary-custom transition">${match.red}</span>
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML = cardsHtml;
}

// Global variable to track selected matchday
let currentSelectedDay = 1;

export function renderSchedule(schedule) {
    const navContainer = document.getElementById('matchday-nav');
    const matchContainer = document.getElementById('schedule-container');
    if (!navContainer || !matchContainer) return;
    
    // 1. Create Matchday Navigation (horizontal tab bar)
    navContainer.innerHTML = '';
    schedule.forEach((round, index) => {
        const dayNum = round.day;
        const isActive = dayNum === currentSelectedDay;
        
        // UEFA-style button (Dark blue when Active, light gray when Inactive)
        const btnClass = isActive 
            ? 'bg-[#0B1120] text-white shadow-lg scale-105' 
            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200';

        const btn = document.createElement('button');
        btn.className = `${btnClass} px-6 py-2 rounded-full font-heading font-bold transition-all duration-300 whitespace-nowrap text-sm flex flex-col items-center justify-center min-w-[100px]`;
        btn.innerHTML = `
            <span class="text-[10px] uppercase tracking-wider opacity-70">Matchday</span>
            <span class="text-lg leading-none">${dayNum}</span>
        `;
        
        btn.onclick = () => {
            currentSelectedDay = dayNum;
            renderSchedule(schedule);
        };
        navContainer.appendChild(btn);
    });

    // 2. Find data for selected day
    const selectedRound = schedule.find(r => r.day === currentSelectedDay);
    
    // 3. Render Match List (UEFA-style - Clean List View)
    matchContainer.innerHTML = '';
    
    // Header showing round type
    matchContainer.innerHTML += `
        <div class="flex items-center justify-between mb-4 px-2 animate-fade-in">
            <h3 class="font-bold text-xl text-gray-800">${selectedRound.type}</h3>
            <span class="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Bo3 Format</span>
        </div>
    `;

    selectedRound.matches.forEach((match, idx) => {
        const isCompleted = match.status === 'completed';
        const team1Score = match.team1Score !== undefined ? match.team1Score : '-';
        const team2Score = match.team2Score !== undefined ? match.team2Score : '-';
        
        // Check winner logic to add color
        const team1Win = isCompleted && team1Score > team2Score;
        const team2Win = isCompleted && team2Score > team1Score;

        // UEFA-style layout: long row, clear logos, score in center
        matchContainer.innerHTML += `
            <div class="group bg-white rounded-lg border border-gray-200 p-4 hover:border-primary-custom hover:shadow-lg transition-all duration-300 animate-fade-in" style="animation-delay: ${idx * 0.05}s">
                <div class="flex items-center justify-between">
                    
                    <div class="flex items-center gap-4 w-1/3">
                        <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-50 border p-1 flex items-center justify-center shadow-sm">
                            <span class="font-bold text-gray-400 text-xs">${match.blue.substring(0,2)}</span>
                        </div>
                        <span class="font-bold text-gray-800 text-xs sm:text-sm md:text-base ${team1Win ? 'text-green-600' : ''}">${match.blue}</span>
                    </div>

                    <div class="flex flex-col items-center justify-center w-1/3">
                        <div class="flex items-center gap-3 text-2xl font-heading font-bold text-gray-800">
                            <span class="${team1Win ? 'text-gray-900' : 'text-gray-400'}">${team1Score}</span>
                            <span class="text-xs text-gray-300 bg-gray-100 px-2 rounded-full">-</span>
                            <span class="${team2Win ? 'text-gray-900' : 'text-gray-400'}">${team2Score}</span>
                        </div>
                        ${isCompleted 
                            ? '<span class="text-[10px] text-green-600 font-medium mt-1">Full Time</span>' 
                            : '<span class="text-[10px] text-primary-custom font-medium mt-1 border border-primary-custom/30 px-2 rounded-full">VS</span>'}
                    </div>

                    <div class="flex items-center gap-4 w-1/3 justify-end">
                        <span class="font-bold text-gray-800 text-xs sm:text-sm md:text-base text-right ${team2Win ? 'text-green-600' : ''}">${match.red}</span>
                        <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-50 border p-1 flex items-center justify-center shadow-sm">
                            <span class="font-bold text-gray-400 text-xs">${match.red.substring(0,2)}</span>
                        </div>
                    </div>

                </div>
            </div>
        `;
    });
}

export function renderTeams(potA, potB) {
    const container = document.getElementById('teams-container');
    if (!container) return;
    
    container.innerHTML = '';
    const allTeams = [...potA, ...potB].sort(); 
    
    allTeams.forEach((team, idx) => {
        // Use first 2 letters for abbreviation
        const shortName = team.substring(0, 2).toUpperCase();
        
        // Determine if team is in Pot A for badge display
        const isPotA = potA.includes(team);
        const potBadge = isPotA 
            ? '<span class="absolute top-3 right-3 bg-[#0B1120] text-white text-[10px] font-bold px-2 py-0.5 rounded">POT A</span>' 
            : '<span class="absolute top-3 right-3 bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">POT B</span>';

        // UEFA-style Club Card layout
        container.innerHTML += `
            <div class="group relative bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-scale-up mb-2" style="animation-delay: ${idx * 0.05}s">
                
                <div class="h-24 bg-gradient-to-r from-[#0B1120] to-[#15C8FF] relative overflow-hidden">
                    <div class="absolute inset-0 bg-black/10"></div>
                    <div class="absolute -bottom-6 -right-6 text-9xl text-white opacity-10 font-heading font-bold select-none leading-none">
                        ${shortName}
                    </div>
                </div>

                <div class="absolute top-12 left-1/2 transform -translate-x-1/2">
                    <div class="w-20 h-20 bg-white rounded-full p-1 shadow-lg group-hover:scale-110 transition duration-300">
                        <div class="w-full h-full bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                            <span class="text-2xl font-heading font-bold text-gray-400 group-hover:text-primary-custom transition">${shortName}</span>
                        </div>
                    </div>
                </div>

                <div class="pt-12 pb-6 px-4 text-center mt-2">
                    <h3 class="font-bold text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl mb-1 group-hover:text-primary-custom transition">${team}</h3>
                    <p class="text-xs text-gray-400 mb-4">RoV SN Tournament 2026</p>
                </div>
                
                ${potBadge}
            </div>
        `;
    });
}

export function renderStandings(teams) {
    const container = document.getElementById('standings-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // เรียงลำดับข้อมูล: คะแนน > ผลต่างเกม > แมตช์ที่ชนะ
    const processedTeams = teams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points; // คะแนน
        if (b.gameDiff !== a.gameDiff) return b.gameDiff - a.gameDiff; // ผลต่างเกม
        if (b.matchWins !== a.matchWins) return b.matchWins - a.matchWins; // จำนวนแมตช์ที่ชนะ
        return 0;
    });
    
    // สร้างตาราง
    processedTeams.forEach((team, index) => {
        const rank = index + 1;
        const isQualified = rank <= 4; // Top 4 เข้ารอบ
        
        // กำหนดสีพื้นหลังและขอบสำหรับทีมที่เข้ารอบ
        const rowClass = isQualified 
            ? 'bg-blue-50/30 hover:bg-blue-50 border-l-4 border-l-primary-custom' 
            : 'hover:bg-gray-50 border-l-4 border-l-transparent';
            
        const rankClass = isQualified ? 'text-[#0B1120] font-bold' : 'text-gray-500';
        
        // Generate Form from actual data (W = win, L = loss)
        // If team has form array from DB, use it; otherwise generate from matchWins/matchLosses
        let formDots = [];
        if (team.form && Array.isArray(team.form) && team.form.length > 0) {
            // Use form data from database (array of 'W' or 'L')
            formDots = team.form.slice(-5).map(result => {
                if (result === 'W') return '<span class="w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">W</span>';
                if (result === 'L') return '<span class="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">L</span>';
                return '<span class="w-5 h-5 rounded-full bg-gray-300 text-gray-500 text-[10px] font-bold flex items-center justify-center">-</span>';
            });
        } else {
            // Generate form from matchWins/matchLosses (most recent matches approximation)
            const wins = team.matchWins || 0;
            const losses = team.matchLosses || 0;
            const totalMatches = wins + losses;
            
            // Create form array: fill wins first, then losses, up to 5 slots
            for (let i = 0; i < Math.min(wins, 5); i++) {
                formDots.push('<span class="w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">W</span>');
            }
            for (let i = 0; i < Math.min(losses, 5 - formDots.length); i++) {
                formDots.push('<span class="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">L</span>');
            }
            // Fill remaining slots with empty dots
            while (formDots.length < 5) {
                formDots.push('<span class="w-5 h-5 rounded-full bg-gray-200 text-gray-400 text-[10px] flex items-center justify-center">-</span>');
            }
        }
        
        const formHtml = `
            <div class="flex justify-center gap-1">
                ${formDots.join('')}
            </div>
        `;

        container.innerHTML += `
            <tr class="${rowClass} transition-colors duration-200 group">
                <td class="p-4 text-center ${rankClass}">${rank}</td>
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                            <span class="text-[10px] font-bold text-gray-400">
                                ${team.teamName ? team.teamName.substring(0,2).toUpperCase() : 'T'}
                            </span>
                        </div>
                        <span class="font-bold text-gray-800 group-hover:text-primary-custom transition">${team.teamName}</span>
                    </div>
                </td>
                <td class="p-4 text-center text-gray-600">${team.matchesPlayed || 0}</td>
                <td class="p-4 text-center text-gray-800 font-semibold">${team.matchWins || 0}</td>
                <td class="p-4 text-center text-gray-500">${team.matchLosses || 0}</td>
                <td class="p-4 text-center font-mono text-xs text-gray-500">
                    <span class="text-gray-800">${team.gameWins || 0}</span> : <span>${team.gameLosses || 0}</span>
                </td>
                <td class="p-4 text-center font-bold ${team.gameDiff > 0 ? 'text-green-600' : (team.gameDiff < 0 ? 'text-red-500' : 'text-gray-400')}">
                    ${team.gameDiff > 0 ? '+' : ''}${team.gameDiff || 0}
                </td>
                <td class="p-4 text-center font-bold text-lg text-[#0B1120] bg-gray-50/50 group-hover:bg-white transition rounded-lg">
                    ${team.points || 0}
                </td>
                <td class="p-4 text-center hidden md:table-cell">
                    ${formHtml}
                </td>
            </tr>
        `;
    });
}

export function renderNoData() {
    const msg = `<div class="text-center py-10 text-gray-400 italic">
        <i class="fas fa-inbox text-4xl mb-3 opacity-50"></i><br>
        ยังไม่มีข้อมูลการแข่งขันใน Database
    </div>`;
    
    const scheduleContainer = document.getElementById('schedule-container');
    if (scheduleContainer) scheduleContainer.innerHTML = msg;
    
    const upNextContainer = document.getElementById('up-next-container');
    if (upNextContainer) upNextContainer.innerHTML = `<div class="text-center py-4 text-gray-400 text-xs">Waiting for Draw...</div>`;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initKVCarousel();
    renderNewsCarousel();
    fetchTournamentData();
});

// Make global functions
window.openNews = openNews;
