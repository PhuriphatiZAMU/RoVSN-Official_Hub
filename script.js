// --- CONFIG & DATA ---
// แก้ไขบรรทัดนี้: ใส่ URL ที่ได้จาก Render ของคุณลงไปตรงส่วน Production
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://rov-sn-tournament-official.onrender.com'; // <-- ใส่ URL ของคุณที่นี่ (ไม่ต้องมี / ปิดท้าย)

// Global State
let globalSchedule = [];
let globalResults = [];

// --- MAIN INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    
    // --- 1. Init Carousel (For Home Page) ---
    initCarousel();

    // --- 2. Fetch Schedule & Results Parallelly ---
    try {
        const [scheduleRes, resultsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/schedules`).catch(() => null),
            fetch(`${API_BASE_URL}/api/results`).catch(() => null)
        ]);

        let scheduleData = scheduleRes && scheduleRes.ok ? await scheduleRes.json() : null;
        globalResults = resultsRes && resultsRes.ok ? await resultsRes.json() : [];

        // Fallback Logic
        if (!scheduleData) {
            const saved = localStorage.getItem('rov_tournaments');
            if(saved) {
                 try { scheduleData = JSON.parse(saved); if(Array.isArray(scheduleData)) scheduleData=scheduleData[scheduleData.length-1]; } catch(e){}
            }
        }

        if(scheduleData) {
            globalSchedule = scheduleData.schedule;
            
            // --- Page Routing Logic ---
            
            // 1. Fixtures Page
            if (document.getElementById('matchesContainer')) {
                renderMatches(globalSchedule, globalResults, 1);
            }
            // 2. Standings Page
            if (document.getElementById('tableBodyLeague')) {
                const allTeams = [...scheduleData.potA, ...scheduleData.potB];
                renderTable(allTeams, globalResults, 'tableBodyLeague');
            }
            // 3. Teams Page
            if (document.getElementById('teamsGridPage')) {
                renderTeams([...scheduleData.potA, ...scheduleData.potB]);
            }
            // 4. Home Page (Mini Widgets)
            if (document.getElementById('home-matches-container')) {
                renderHomeFixtures(globalSchedule, globalResults);
                renderHomeStandings([...scheduleData.potA, ...scheduleData.potB], globalResults);
            }
            
            // Stats Pages
            if (document.getElementById('stats-season-container')) {
                fetchAndRenderSeasonStats();
            }
            if (document.getElementById('stats-team-table')) {
                fetchAndRenderTeamStats();
            }
            if (document.getElementById('stats-player-list')) {
                fetchAndRenderPlayerStats();
            }
        }

    } catch (e) { console.error("Init Error:", e); }
});


// --- CAROUSEL FUNCTIONALITY ---
function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!track || !prevBtn || !nextBtn) return; 

    let currentIndex = 0;
    const slides = track.children;
    const totalSlides = slides.length;

    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    setInterval(nextSlide, 5000);
}


// --- HOME PAGE WIDGETS ---

function renderHomeFixtures(schedule, results) {
    const container = document.getElementById('home-matches-container');
    if(!container) return;

    // Find the current or next active day (mock logic: default to day 1)
    const dayData = schedule.find(r => r.day === 1); 
    container.innerHTML = '';

    if (dayData) {
        // Show only first 4 matches
        dayData.matches.slice(0, 4).forEach(m => {
            const matchKey = `${dayData.day}_${m.blue}_vs_${m.red}`.replace(/\s+/g, '');
            const result = results.find(r => r.matchId === matchKey);
            
            let scoreDisplay = `<span class="tw-text-xs tw-text-gray-400 tw-font-bold">VS</span>`;
            let borderClass = "";
            
            if (result) {
                scoreDisplay = `<span class="tw-font-bold tw-text-uefa-dark">${result.scoreBlue} - ${result.scoreRed}</span>`;
                borderClass = "tw-border-l-4 tw-border-l-cyan-aura";
            }

            container.innerHTML += `
                <div class="tw-bg-white tw-border tw-border-gray-100 tw-p-3 tw-flex tw-items-center tw-justify-between tw-shadow-sm hover:tw-shadow-md tw-transition ${borderClass}">
                    <div class="tw-flex-1 tw-text-right tw-font-bold tw-text-sm tw-text-gray-700">${m.blue}</div>
                    <div class="tw-px-4 tw-flex tw-items-center tw-justify-center tw-bg-gray-50 tw-rounded tw-mx-3 tw-h-8 tw-min-w-[60px]">
                        ${scoreDisplay}
                    </div>
                    <div class="tw-flex-1 tw-text-left tw-font-bold tw-text-sm tw-text-gray-700">${m.red}</div>
                </div>
            `;
        });
    }
}

function renderHomeStandings(teams, results) {
    const tbody = document.getElementById('home-standings-body');
    if(!tbody) return;

    // Reuse calculation logic
    const stats = teams.map(teamName => {
        let p = 0, w = 0, l = 0, gd = 0, pts = 0;
        results.forEach(r => {
            if (r.teamBlue === teamName) { p++; if(r.scoreBlue > r.scoreRed) { w++; pts += 3; } else { l++; } gd += (r.scoreBlue - r.scoreRed); } 
            else if (r.teamRed === teamName) { p++; if(r.scoreRed > r.scoreBlue) { w++; pts += 3; } else { l++; } gd += (r.scoreRed - r.scoreBlue); }
        });
        return { name: teamName, p, w, l, gd, pts };
    });

    stats.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return a.name.localeCompare(b.name);
    });

    tbody.innerHTML = '';
    // Show Top 5
    stats.slice(0, 5).forEach((d, i) => {
        const rankClass = i < 4 ? 'tw-bg-cyan-aura tw-text-uefa-dark' : 'tw-bg-gray-200 tw-text-gray-500';
        tbody.innerHTML += `
            <tr class="tw-border-b tw-border-gray-50 hover:tw-bg-echo-white tw-transition">
                <td class="tw-p-3 tw-text-center">
                    <div class="tw-w-6 tw-h-6 ${rankClass} tw-rounded-full tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-xs tw-mx-auto">${i+1}</div>
                </td>
                <td class="tw-p-3 tw-font-bold tw-text-uefa-dark tw-text-sm">${d.name}</td>
                <td class="tw-p-3 tw-text-center tw-text-sm">${d.p}</td>
                <td class="tw-p-3 tw-text-center tw-text-sm tw-font-mono">${d.gd > 0 ? '+'+d.gd : d.gd}</td>
                <td class="tw-p-3 tw-text-center tw-font-bold tw-text-black">${d.pts}</td>
            </tr>
        `;
    });
}


// --- FULL PAGE RENDERING (Same as before) ---

function renderMatches(schedule, results, activeDay) {
    const container = document.getElementById('matchesContainer');
    const filters = document.getElementById('matchDayFilters');
    if(!container || !filters) return;

    filters.innerHTML = '';
    schedule.forEach(round => {
        const btn = document.createElement('button');
        const isActive = round.day === activeDay;
        btn.className = `tw-whitespace-nowrap tw-px-4 tw-py-2 tw-text-sm tw-font-bold tw-uppercase tw-tracking-wider tw-transition-colors ${isActive ? 'tw-bg-cyan-aura tw-text-uefa-dark' : 'tw-bg-white tw-text-gray-500 tw-border tw-border-gray-200 hover:tw-bg-gray-100'}`;
        btn.textContent = `Matchday ${round.day}`;
        btn.onclick = () => renderMatches(schedule, results, round.day);
        filters.appendChild(btn);
    });

    container.innerHTML = '';
    const dayData = schedule.find(r => r.day === activeDay);
    
    if(dayData) {
        dayData.matches.forEach(m => {
            const matchKey = `${activeDay}_${m.blue}_vs_${m.red}`.replace(/\s+/g, '');
            const result = results.find(r => r.matchId === matchKey);
            const el = document.createElement('div');
            el.className = "tw-bg-white tw-border tw-border-gray-200 tw-p-4 tw-flex tw-items-center tw-justify-between hover:tw-border-cyan-aura tw-transition tw-shadow-sm tw-relative tw-overflow-hidden";
            
            let centerContent, blueClass, redClass;
            
            if (result) {
                blueClass = result.scoreBlue > result.scoreRed ? "tw-text-cyan-aura tw-font-bold" : "tw-text-gray-500";
                redClass = result.scoreRed > result.scoreBlue ? "tw-text-cyan-aura tw-font-bold" : "tw-text-gray-500";
                centerContent = `<div class="tw-bg-uefa-dark tw-text-white tw-px-4 tw-py-1 tw-rounded tw-text-xl tw-font-bold tw-flex tw-items-center tw-gap-2"><span>${result.scoreBlue}</span><span class="tw-text-gray-400 tw-text-sm">-</span><span>${result.scoreRed}</span></div><div class="tw-text-xs tw-text-gray-400 tw-mt-1">FT</div>`;
                el.classList.add("tw-border-l-4", "tw-border-l-cyan-aura");
            } else {
                blueClass = "tw-text-uefa-dark";
                redClass = "tw-text-uefa-dark";
                centerContent = `<div class="tw-text-xs tw-text-gray-400 tw-font-bold tw-mb-1">20:00</div><div class="tw-bg-gray-200 tw-text-gray-600 tw-px-3 tw-py-1 tw-rounded tw-text-sm tw-font-bold">VS</div>`;
            }

            el.innerHTML = `<div class="tw-flex-1 tw-text-right tw-font-display tw-font-bold md:tw-text-lg ${blueClass}">${m.blue}</div><div class="tw-px-6 tw-flex tw-flex-col tw-items-center tw-min-w-[100px]">${centerContent}</div><div class="tw-flex-1 tw-text-left tw-font-display tw-font-bold md:tw-text-lg ${redClass}">${m.red}</div>`;
            container.appendChild(el);
        });
    }
}

function renderTable(teams, results, id) {
    const tbody = document.getElementById(id);
    if(!tbody) return;

    const stats = teams.map(teamName => {
        let p = 0, w = 0, l = 0, gd = 0, pts = 0;
        results.forEach(r => {
            if (r.teamBlue === teamName) { p++; if(r.scoreBlue > r.scoreRed) { w++; pts += 3; } else { l++; } gd += (r.scoreBlue - r.scoreRed); } 
            else if (r.teamRed === teamName) { p++; if(r.scoreRed > r.scoreBlue) { w++; pts += 3; } else { l++; } gd += (r.scoreRed - r.scoreBlue); }
        });
        return { name: teamName, p, w, l, gd, pts };
    });

    stats.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return a.name.localeCompare(b.name);
    });

    tbody.innerHTML = '';
    stats.forEach((d, i) => {
        const rank = i + 1;
        const rowClass = rank <= 4 ? 'tw-bg-green-50' : '';
        const rankClass = rank <= 4 ? 'tw-bg-cyan-aura tw-text-uefa-dark' : 'tw-bg-gray-200 tw-text-gray-500';
        const borderClass = rank === 4 ? 'tw-border-b-4 tw-border-cyan-aura' : 'tw-border-b tw-border-gray-100'; 
        tbody.innerHTML += `<tr class="${rowClass} ${borderClass}"><td class="tw-p-3 tw-text-center"><div class="tw-w-8 tw-h-8 ${rankClass} tw-rounded-full tw-flex tw-items-center tw-justify-center tw-font-bold tw-mx-auto">${rank}</div></td><td class="tw-p-3 tw-font-bold tw-text-uefa-dark tw-flex tw-items-center"><div class="tw-w-8 tw-h-8 tw-bg-gray-100 tw-rounded-full tw-mr-3 tw-flex tw-items-center tw-justify-center"><i class="fas fa-shield-alt tw-text-gray-400"></i></div> ${d.name}</td><td class="tw-p-3 tw-text-center">${d.p}</td><td class="tw-p-3 tw-text-center tw-text-green-600 tw-font-bold">${d.w}</td><td class="tw-p-3 tw-text-center tw-text-red-500">${d.l}</td><td class="tw-p-3 tw-text-center tw-font-mono">${d.gd > 0 ? '+' + d.gd : d.gd}</td><td class="tw-p-3 tw-text-center tw-font-bold tw-text-black tw-text-lg">${d.pts}</td></tr>`;
    });
}

function renderTeams(teams) {
    const grid = document.getElementById('teamsGridPage');
    if(!grid) return;
    grid.innerHTML = '';
    teams.forEach(t => {
        grid.innerHTML += `<div class="tw-bg-white tw-p-6 tw-border tw-border-gray-200 tw-flex tw-flex-col tw-items-center hover:tw-shadow-lg hover:tw-border-cyan-aura tw-transition tw-cursor-pointer tw-group"><div class="tw-w-20 tw-h-20 tw-bg-gray-100 tw-rounded-full tw-mb-4 tw-flex tw-items-center tw-justify-center group-hover:tw-bg-echo-white"><i class="fas fa-shield-alt tw-text-3xl tw-text-gray-300 group-hover:tw-text-cyan-aura"></i></div><span class="tw-font-bold tw-text-uefa-dark tw-text-center tw-uppercase tw-font-display">${t}</span></div>`;
    });
}


// --- STATS RENDERING FUNCTIONS ---

async function fetchAndRenderSeasonStats() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/season-stats`);
        const data = res.ok ? await res.json() : { totalKills: 0, avgGameDuration: 0 };
        
        const container = document.getElementById('stats-season-container');
        if(!container) return;

        const minutes = Math.floor(data.avgGameDuration / 60);
        const seconds = Math.round(data.avgGameDuration % 60);
        const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        container.innerHTML = `
            <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
                <div class="tw-bg-white tw-p-6 tw-rounded tw-shadow tw-border-t-4 tw-border-cyan-aura">
                    <p class="tw-text-gray-500 tw-uppercase tw-text-xs tw-font-bold tw-mb-2">Total Kills</p>
                    <div class="tw-text-5xl tw-font-display tw-font-bold tw-text-uefa-dark">${data.totalKills.toLocaleString()}</div>
                </div>
                <div class="tw-bg-white tw-p-6 tw-rounded tw-shadow tw-border-t-4 tw-border-cyan-aura">
                    <p class="tw-text-gray-500 tw-uppercase tw-text-xs tw-font-bold tw-mb-2">Avg Game Time</p>
                    <div class="tw-text-5xl tw-font-display tw-font-bold tw-text-uefa-dark">${timeStr}</div>
                </div>
                <div class="tw-bg-white tw-p-6 tw-rounded tw-shadow tw-border-t-4 tw-border-cyan-aura">
                    <p class="tw-text-gray-500 tw-uppercase tw-text-xs tw-font-bold tw-mb-2">Dark Slayers (Est)</p>
                    <div class="tw-text-5xl tw-font-display tw-font-bold tw-text-uefa-dark">${data.totalDarkSlayers || 0}</div>
                </div>
            </div>
        `;
    } catch(e) { console.error("Season Stats Error:", e); }
}

async function fetchAndRenderTeamStats() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/team-stats`);
        const data = res.ok ? await res.json() : [];
        const tbody = document.getElementById('stats-team-table-body');
        if(!tbody) return;

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="tw-p-8 tw-text-center tw-text-gray-400">No team data available yet. Matches must be completed first.</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        data.forEach(t => {
            tbody.innerHTML += `
                <tr class="tw-hover:bg-echo-white tw-transition">
                    <td class="tw-p-4 tw-font-bold tw-text-uefa-dark tw-flex tw-items-center">
                        <div class="tw-w-8 tw-h-8 tw-bg-gray-100 tw-rounded-full tw-mr-3 tw-flex tw-items-center tw-justify-center"><i class="fas fa-shield-alt tw-text-gray-400"></i></div>
                        ${t.teamName}
                    </td>
                    <td class="tw-p-4 tw-text-center">${t.realGamesPlayed || 0}</td>
                    <td class="tw-p-4 tw-text-center tw-text-green-600 tw-font-bold">${t.realWins || 0}</td>
                    <td class="tw-p-4 tw-text-center">${t.totalKills}</td>
                    <td class="tw-p-4 tw-text-center">${t.totalDeaths}</td>
                    <td class="tw-p-4 tw-text-center">${t.totalAssists}</td>
                    <td class="tw-p-4 tw-text-center tw-font-mono">${Math.round(t.totalGold / (t.realGamesPlayed || 1)).toLocaleString()}</td>
                </tr>
            `;
        });
    } catch(e) { 
        console.error("Team Stats Error:", e); 
        const tbody = document.getElementById('stats-team-table-body');
        if(tbody) tbody.innerHTML = `<tr><td colspan="7" class="tw-p-8 tw-text-center tw-text-red-400">Failed to load data.</td></tr>`;
    }
}

async function fetchAndRenderPlayerStats() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/player-stats`);
        const data = res.ok ? await res.json() : [];
        const container = document.getElementById('stats-player-list');
        if(!container) return;

        container.innerHTML = '';
        data.slice(0, 10).forEach((p, idx) => {
            container.innerHTML += `
                <div class="tw-bg-white tw-p-4 tw-flex tw-items-center tw-justify-between tw-shadow-sm ${idx < 3 ? 'tw-border-l-4 tw-border-cyan-aura' : ''} tw-mb-3">
                    <div class="tw-flex tw-items-center tw-space-x-4">
                        <div class="tw-w-10 tw-h-10 tw-bg-gray-200 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-font-display tw-font-bold tw-text-gray-500">${idx + 1}</div>
                        <div>
                            <div class="tw-font-bold tw-text-lg">${p.playerName}</div>
                            <div class="tw-text-sm tw-text-gray-500">${p.teamName}</div>
                        </div>
                    </div>
                    <div class="tw-text-right">
                        <div class="tw-text-2xl tw-font-display tw-font-bold tw-text-uefa-dark">${p.kda.toFixed(2)}</div>
                        <div class="tw-text-xs tw-font-bold tw-text-gray-400 tw-uppercase">KDA Ratio</div>
                    </div>
                </div>
            `;
        });
    } catch(e) { console.error("Player Stats Error:", e); }
}