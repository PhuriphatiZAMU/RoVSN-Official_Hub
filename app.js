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
        slide.className = `carousel-item ${isActive} h-[400px] md:h-[450px] cursor-pointer`;
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

        // 4. Fetch Standings Data
        try {
            const standingsResponse = await fetch(`${API_BASE_URL}/standings/latest`);
            if (standingsResponse.ok) {
                const latestStandings = await standingsResponse.json();
                console.log('Standings data:', latestStandings);
                
                if (latestStandings?.standings) {
                    console.log('Rendering standings with teams:', latestStandings.standings.length);
                    renderStandings(latestStandings.standings);
                }
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

export function renderSchedule(schedule) {
    const container = document.getElementById('schedule-container');
    if (!container) return;
    
    container.innerHTML = '';
    schedule.forEach((round, roundIdx) => {
        container.innerHTML += `
            <div class="bg-white p-4 rounded-xl text-sm font-bold text-primary-custom border-l-4 border-primary-custom shadow-sm flex items-center justify-between mt-6 animate-fade-in">
                <span><i class="far fa-calendar-alt mr-2"></i> Match Day ${round.day} • ${round.type}</span>
                <span class="text-gray-400 text-xs font-normal bg-gray-50 px-2 py-1 rounded border">BO3 Format</span>
            </div>
        `;
        round.matches.forEach((match, matchIdx) => {
            // ตรวจสอบสถานะและสกอร์
            const isCompleted = match.status === 'completed';
            const team1Score = match.team1Score !== undefined ? match.team1Score : '-';
            const team2Score = match.team2Score !== undefined ? match.team2Score : '-';
            const scoreDisplay = isCompleted ? `${team1Score} - ${team2Score}` : 'VS';
            const scoreClass = isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-white';
            const statusBadge = isCompleted ? '<span class="text-xs text-green-600 font-semibold ml-2"><i class="fas fa-check-circle"></i> เสร็จสิ้น</span>' : '';
            
            // เช็คว่าทีมไหนชนะ
            const team1Win = isCompleted && team1Score > team2Score;
            const team2Win = isCompleted && team2Score > team1Score;
            const team1Class = team1Win ? 'border-green-400 bg-green-50' : 'border-blue-100';
            const team2Class = team2Win ? 'border-green-400 bg-green-50' : 'border-red-100';
            
            container.innerHTML += `
                <div class="bg-white rounded-xl p-5 flex flex-col md:flex-row items-center justify-between border border-gray-100 card-shadow hover:border-primary-custom/30 transition mt-2 animate-fade-in ${isCompleted ? 'opacity-75' : ''}" style="animation-delay: ${(roundIdx * 0.1) + (matchIdx * 0.05)}s">
                    <div class="flex items-center justify-center gap-4 w-full md:w-auto mb-4 md:mb-0 flex-grow">
                        <div class="flex items-center gap-4 w-2/5 justify-end">
                            <span class="font-bold text-lg text-gray-800 text-right md:truncate ${team1Win ? 'text-green-600' : ''}">${match.blue}</span>
                            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-sm border-2 ${team1Class} shadow-sm">${match.blue.substring(0,2)}</div>
                        </div>
                        <div class="px-4 py-1 rounded-full text-xs font-bold ${scoreClass}">${scoreDisplay}</div>
                        <div class="flex items-center gap-4 w-2/5">
                            <div class="w-12 h-12 bg-red-50 text-red-600 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-sm border-2 ${team2Class} shadow-sm">${match.red.substring(0,2)}</div>
                            <span class="font-bold text-lg text-gray-800 md:truncate ${team2Win ? 'text-green-600' : ''}">${match.red}</span>
                        </div>
                    </div>
                    ${statusBadge}
                </div>
            `;
        });
    });
}

export function renderTeams(potA, potB) {
    const container = document.getElementById('teams-container');
    if (!container) return;
    
    container.innerHTML = '';
    const allTeams = [...potA, ...potB].sort(); // Sort alphabetically for team page
    
    allTeams.forEach((team, idx) => {
        // Determine Pot for badge
        const isPotA = potA.includes(team);
        const badgeColor = isPotA ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
        const potName = isPotA ? 'POT A' : 'POT B';

        container.innerHTML += `
            <div class="bg-white border border-gray-200 p-6 rounded-xl flex flex-col items-center justify-center card-shadow hover:border-primary-custom transition cursor-pointer group animate-scale-up" style="animation-delay: ${idx * 0.05}s">
                <div class="w-20 h-20 bg-gray-50 rounded-full mb-4 group-hover:scale-110 transition duration-300 shadow-inner flex items-center justify-center border-2 border-gray-100">
                    <span class="text-2xl font-bold text-gray-400 group-hover:text-primary-custom transition">${team.substring(0,1)}</span>
                </div>
                <span class="font-bold text-center text-sm text-gray-700 group-hover:text-primary-custom transition mb-2">${team}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded ${badgeColor}">${potName}</span>
            </div>
        `;
    });
}

export function renderStandings(teams) {
    const container = document.getElementById('standings-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Sort teams by points (descending), then by diff
    const sortedTeams = [...teams].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.diff - a.diff;
    });
    
    sortedTeams.forEach((team, index) => {
        // Determine rank badge color
        let rankClass = 'text-gray-400';
        if (index === 0) rankClass = 'text-yellow-500'; // 1st place
        else if (index === 1) rankClass = 'text-gray-400'; // 2nd place
        else if (index === 2) rankClass = 'text-orange-400'; // 3rd place
        
        const teamInitials = team.team_name ? team.team_name.substring(0, 2).toUpperCase() : 'T';
        
        container.innerHTML += `
            <tr class="hover:bg-blue-50/50 transition group border-b border-gray-100">
                <td class="p-4 text-center font-bold text-lg ${rankClass}">${index + 1}</td>
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">${teamInitials}</div>
                        <span class="font-bold text-gray-700 group-hover:text-primary-custom transition">${team.team_name}</span>
                    </div>
                </td>
                <td class="p-4 text-center font-mono font-medium text-gray-600">${team.match_wl}</td>
                <td class="p-4 text-center font-mono text-gray-500">${team.game_wl}</td>
                <td class="p-4 text-center font-mono text-gray-400">${team.diff}</td>
                <td class="p-4 text-center font-bold text-xl text-gray-800">${team.points}</td>
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
