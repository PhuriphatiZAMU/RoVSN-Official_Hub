// --- CONFIG & DATA ---
// URL ของ Backend API (บน Render)
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://rov-sn-tournament-official.onrender.com';

// Global State (ตัวแปรเก็บข้อมูลกลาง)
let globalSchedule = [];
let globalResults = [];
let globalTeamLogos = {}; // เก็บ URL โลโก้ { "TeamName": "URL" }

// --- MAIN INIT (เริ่มทำงานเมื่อโหลดหน้าเว็บ) ---
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. เริ่มต้นการทำงานของ Slider หน้า Home
    initCarousel();

    // 2. ดึงข้อมูลจาก API (ตารางแข่ง, ผลแข่ง, โลโก้) พร้อมกัน
    try {
        console.log("🔄 Connecting to API:", API_BASE_URL);

        const [scheduleRes, resultsRes, logosRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/schedules`).catch(err => null),
            fetch(`${API_BASE_URL}/api/results`).catch(err => null),
            fetch(`${API_BASE_URL}/api/team-logos`).catch(err => null)
        ]);

        // 2.1 จัดการข้อมูล Logo ก่อน
        if (logosRes && logosRes.ok) {
            const logosData = await logosRes.json();
            // แปลง Array เป็น Object เพื่อให้ค้นหาเร็วๆ
            logosData.forEach(item => {
                globalTeamLogos[item.teamName] = item.logoUrl;
            });
            console.log("✅ Team Logos Loaded:", Object.keys(globalTeamLogos).length);
        }

        // 2.2 จัดการข้อมูลตารางแข่ง
        let scheduleData = null;
        if (scheduleRes && scheduleRes.ok) {
            scheduleData = await scheduleRes.json();
            console.log("✅ Schedule Loaded");
        } else {
            console.warn("⚠️ Schedule API Unreachable");
        }

        // 2.3 จัดการผลการแข่งขัน
        globalResults = (resultsRes && resultsRes.ok) ? await resultsRes.json() : [];

        // 3. เริ่มวาดหน้าเว็บตามข้อมูลที่มี
        if(scheduleData) {
            globalSchedule = scheduleData.schedule;
            
            // --- Logic แยกตามหน้า (Page Routing) ---
            
            // หน้า: Fixtures (fixtures-results.html)
            if (document.getElementById('matchesContainer')) {
                renderMatches(globalSchedule, globalResults, 1);
            }
            
            // หน้า: Standings (standings.html)
            if (document.getElementById('tableBodyLeague')) {
                const allTeams = [...scheduleData.potA, ...scheduleData.potB];
                renderTable(allTeams, globalResults, 'tableBodyLeague');
            }
            
            // หน้า: Clubs (team.html)
            if (document.getElementById('teamsGridPage')) {
                renderTeams([...scheduleData.potA, ...scheduleData.potB]);
            }
            
            // หน้า: Home (index.html) - ส่วนย่อ
            if (document.getElementById('home-matches-container')) {
                renderHomeFixtures(globalSchedule, globalResults);
                renderHomeStandings([...scheduleData.potA, ...scheduleData.potB], globalResults);
            }
            
            // หน้า: Stats (statistics.html, team-stats.html, players.html)
            if (document.getElementById('stats-season-container')) {
                fetchAndRenderSeasonStats();
            }
            if (document.getElementById('stats-team-table')) {
                fetchAndRenderTeamStats();
            }
            if (document.getElementById('stats-player-list')) {
                fetchAndRenderPlayerStats();
            }
        } else {
            // กรณีโหลดข้อมูลไม่สำเร็จ ให้แสดง Error
            const errHtml = `
                <div class="tw-text-center tw-py-12 tw-text-gray-500">
                    <i class="fas fa-exclamation-circle tw-text-3xl tw-text-red-400 tw-mb-3"></i>
                    <p>ไม่สามารถโหลดข้อมูลการแข่งขันได้</p>
                    <p class="tw-text-xs">Server อาจกำลังตื่นตัว กรุณารีเฟรชใหม่อีกครั้ง</p>
                </div>`;
            
            if (document.getElementById('matchesContainer')) document.getElementById('matchesContainer').innerHTML = errHtml;
            if (document.getElementById('home-matches-container')) document.getElementById('home-matches-container').innerHTML = errHtml;
        }

    } catch (e) { console.error("Init Error:", e); }
});


// --- HELPER: Get Logo HTML ---
// ฟังก์ชันสร้าง HTML รูปโลโก้ (ถ้าไม่มี URL จะใช้ไอคอนโล่)
function getTeamLogoHtml(teamName, sizeClass = "tw-w-8 tw-h-8") {
    const url = globalTeamLogos[teamName];
    if (url) {
        // ใช้ onerror เพื่อกันรูปลิงก์เสีย
        return `<img src="${url}" alt="${teamName}" class="${sizeClass} tw-object-contain tw-mr-2" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'${sizeClass} tw-bg-gray-100 tw-rounded-full tw-mr-2 tw-flex tw-items-center tw-justify-center\\'><i class=\\'fas fa-shield-alt tw-text-gray-400\\'></i></div>';">`;
    }
    // Default Icon
    return `<div class="${sizeClass} tw-bg-gray-100 tw-rounded-full tw-mr-2 tw-flex tw-items-center tw-justify-center"><i class="fas fa-shield-alt tw-text-gray-400"></i></div>`;
}


// --- CAROUSEL FUNCTIONALITY (หน้า Home) ---
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
    
    // เลื่อนอัตโนมัติทุก 5 วินาที
    setInterval(nextSlide, 5000);
}


// --- HOME PAGE WIDGETS ---

// แสดงตารางแข่งแบบย่อ (4 คู่แรกของวัน)
function renderHomeFixtures(schedule, results) {
    const container = document.getElementById('home-matches-container');
    if(!container) return;

    // หา Match Day ปัจจุบัน (สมมติว่าเป็นวันที่ 1)
    const dayData = schedule.find(r => r.day === 1); 
    container.innerHTML = '';

    if (dayData) {
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
                    <div class="tw-flex-1 tw-flex tw-items-center tw-justify-end tw-font-bold tw-text-sm tw-text-gray-700">
                        <span class="tw-mr-2">${m.blue}</span>
                        ${getTeamLogoHtml(m.blue, "tw-w-6 tw-h-6")} 
                    </div>
                    <div class="tw-px-3 tw-flex tw-items-center tw-justify-center tw-bg-gray-50 tw-rounded tw-mx-2 tw-h-8 tw-min-w-[60px]">
                        ${scoreDisplay}
                    </div>
                    <div class="tw-flex-1 tw-flex tw-items-center tw-justify-start tw-font-bold tw-text-sm tw-text-gray-700">
                        ${getTeamLogoHtml(m.red, "tw-w-6 tw-h-6")}
                        <span class="tw-ml-2">${m.red}</span>
                    </div>
                </div>
            `;
        });
    }
}

// แสดงตารางคะแนนแบบย่อ (Top 5)
function renderHomeStandings(teams, results) {
    const tbody = document.getElementById('home-standings-body');
    if(!tbody) return;

    // คำนวณคะแนน
    const stats = teams.map(teamName => {
        let p = 0, w = 0, l = 0, gd = 0, pts = 0;
        results.forEach(r => {
            if (r.teamBlue === teamName) { 
                p++; 
                if(r.scoreBlue > r.scoreRed) { w++; pts += 3; } else { l++; } 
                gd += (r.scoreBlue - r.scoreRed); 
            } else if (r.teamRed === teamName) { 
                p++; 
                if(r.scoreRed > r.scoreBlue) { w++; pts += 3; } else { l++; } 
                gd += (r.scoreRed - r.scoreBlue); 
            }
        });
        return { name: teamName, p, w, l, gd, pts };
    });

    // เรียงลำดับ (Points > GD > Name)
    stats.sort((a, b) => { 
        if (b.pts !== a.pts) return b.pts - a.pts; 
        if (b.gd !== a.gd) return b.gd - a.gd; 
        return a.name.localeCompare(b.name); 
    });

    tbody.innerHTML = '';
    // แสดงแค่ 5 อันดับแรก
    stats.slice(0, 5).forEach((d, i) => {
        const rankClass = i < 4 ? 'tw-bg-cyan-aura tw-text-uefa-dark' : 'tw-bg-gray-200 tw-text-gray-500';
        tbody.innerHTML += `
            <tr class="tw-border-b tw-border-gray-50 hover:tw-bg-echo-white tw-transition">
                <td class="tw-p-3 tw-text-center"><div class="tw-w-6 tw-h-6 ${rankClass} tw-rounded-full tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-xs tw-mx-auto">${i+1}</div></td>
                <td class="tw-p-3 tw-font-bold tw-text-uefa-dark tw-text-sm tw-flex tw-items-center">
                    ${getTeamLogoHtml(d.name, "tw-w-6 tw-h-6")} ${d.name}
                </td>
                <td class="tw-p-3 tw-text-center tw-text-sm">${d.p}</td>
                <td class="tw-p-3 tw-text-center tw-text-sm tw-font-mono">${d.gd > 0 ? '+'+d.gd : d.gd}</td>
                <td class="tw-p-3 tw-text-center tw-font-bold tw-text-black">${d.pts}</td>
            </tr>
        `;
    });
}


// --- FULL PAGE RENDERING (หน้าเต็ม) ---

// หน้า Fixtures
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
            el.className = "tw-bg-white tw-border tw-border-gray-200 tw-p-4 tw-flex tw-items-center tw-justify-between hover:tw-border-cyan-aura tw-transition tw-shadow-sm tw-relative tw-overflow-hidden tw-mb-3";
            
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

            el.innerHTML = `
                 <div class="tw-flex-1 tw-flex tw-items-center tw-justify-end md:tw-text-lg ${blueClass}">
                    <span class="tw-mr-3 tw-font-display">${m.blue}</span>
                    ${getTeamLogoHtml(m.blue, "tw-w-10 tw-h-10")}
                 </div>
                 <div class="tw-px-6 tw-flex tw-flex-col tw-items-center tw-min-w-[100px]">${centerContent}</div>
                 <div class="tw-flex-1 tw-flex tw-items-center tw-justify-start md:tw-text-lg ${redClass}">
                    ${getTeamLogoHtml(m.red, "tw-w-10 tw-h-10")}
                    <span class="tw-ml-3 tw-font-display">${m.red}</span>
                 </div>
            `;
            container.appendChild(el);
        });
    } else {
        container.innerHTML = `<div class="tw-text-center tw-py-8 tw-text-gray-500">No matches scheduled for this day.</div>`;
    }
}

// หน้า Standings
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
        
        tbody.innerHTML += `
            <tr class="${rowClass} ${borderClass}">
                <td class="tw-p-3 tw-text-center"><div class="tw-w-8 tw-h-8 ${rankClass} tw-rounded-full tw-flex tw-items-center tw-justify-center tw-font-bold tw-mx-auto">${rank}</div></td>
                <td class="tw-p-3 tw-font-bold tw-text-uefa-dark tw-flex tw-items-center">
                     ${getTeamLogoHtml(d.name, "tw-w-8 tw-h-8")} ${d.name}
                </td>
                <td class="tw-p-3 tw-text-center">${d.p}</td>
                <td class="tw-p-3 tw-text-center tw-text-green-600 tw-font-bold">${d.w}</td>
                <td class="tw-p-3 tw-text-center tw-text-red-500">${d.l}</td>
                <td class="tw-p-3 tw-text-center tw-font-mono">${d.gd > 0 ? '+' + d.gd : d.gd}</td>
                <td class="tw-p-3 tw-text-center tw-font-bold tw-text-black tw-text-lg">${d.pts}</td>
            </tr>
        `;
    });
}

// หน้า Clubs
function renderTeams(teams) {
    const grid = document.getElementById('teamsGridPage');
    if(!grid) return;
    grid.innerHTML = '';
    teams.forEach(t => {
        grid.innerHTML += `
            <div class="tw-bg-white tw-p-6 tw-border tw-border-gray-200 tw-flex tw-flex-col tw-items-center hover:tw-shadow-lg hover:tw-border-cyan-aura tw-transition tw-cursor-pointer tw-group">
                <div class="tw-w-24 tw-h-24 tw-mb-4 tw-flex tw-items-center tw-justify-center group-hover:tw-scale-110 tw-transition-transform">
                    ${getTeamLogoHtml(t, "tw-w-full tw-h-full")}
                </div>
                <span class="tw-font-bold tw-text-uefa-dark tw-text-center tw-uppercase tw-font-display">${t}</span>
            </div>
        `;
    });
}


// --- STATS RENDERING FUNCTIONS ---

// หน้า Statistics (Season Stats)
async function fetchAndRenderSeasonStats() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/season-stats`);
        const data = res.ok ? await res.json() : { totalKills: 0, totalDeaths: 0, avgGameDuration: 0 };
        
        const container = document.getElementById('stats-season-container');
        if(!container) return;

        const duration = data.avgGameDuration || 0;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.round(duration % 60);
        const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        container.innerHTML = `
            <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
                <div class="tw-bg-white tw-p-6 tw-rounded tw-shadow tw-border-t-4 tw-border-cyan-aura">
                    <p class="tw-text-gray-500 tw-uppercase tw-text-xs tw-font-bold tw-mb-2">Total Kills</p>
                    <div class="tw-text-5xl tw-font-display tw-font-bold tw-text-uefa-dark">${(data.totalKills || 0).toLocaleString()}</div>
                </div>
                <div class="tw-bg-white tw-p-6 tw-rounded tw-shadow tw-border-t-4 tw-border-cyan-aura">
                    <p class="tw-text-gray-500 tw-uppercase tw-text-xs tw-font-bold tw-mb-2">Total Deaths</p>
                    <div class="tw-text-5xl tw-font-display tw-font-bold tw-text-uefa-dark">${(data.totalDeaths || 0).toLocaleString()}</div>
                </div>
                <div class="tw-bg-white tw-p-6 tw-rounded tw-shadow tw-border-t-4 tw-border-cyan-aura">
                    <p class="tw-text-gray-500 tw-uppercase tw-text-xs tw-font-bold tw-mb-2">Avg Game Time</p>
                    <div class="tw-text-5xl tw-font-display tw-font-bold tw-text-uefa-dark">${timeStr}</div>
                </div>
            </div>
        `;
    } catch(e) { console.error("Season Stats Error:", e); }
}

// หน้า Team Stats
async function fetchAndRenderTeamStats() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/team-stats`);
        const data = res.ok ? await res.json() : [];
        const tbody = document.getElementById('stats-team-table-body');
        if(!tbody) return;

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="tw-p-8 tw-text-center tw-text-gray-400">ยังไม่มีข้อมูลสถิติทีม</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        data.forEach(t => {
            const kdaRatio = t.totalDeaths === 0 ? (t.totalKills + t.totalAssists) : ((t.totalKills + t.totalAssists) / t.totalDeaths);
            const winRate = t.realGamesPlayed > 0 ? ((t.realWins / t.realGamesPlayed) * 100).toFixed(1) : 0;

            tbody.innerHTML += `
                <tr class="tw-hover:bg-echo-white tw-transition">
                    <td class="tw-p-4 tw-font-bold tw-text-uefa-dark tw-flex tw-items-center">
                        ${getTeamLogoHtml(t.teamName, "tw-w-8 tw-h-8")}
                        ${t.teamName}
                    </td>
                    <td class="tw-p-4 tw-text-center">${t.realGamesPlayed || 0}</td>
                    <td class="tw-p-4 tw-text-center tw-text-green-600 tw-font-bold">${t.realWins || 0}</td>
                    <td class="tw-p-4 tw-text-center tw-text-sm">${winRate}%</td>
                    <td class="tw-p-4 tw-text-center tw-text-sm">${t.totalKills} / ${t.totalDeaths} / ${t.totalAssists}</td>
                    <td class="tw-p-4 tw-text-center tw-font-bold">${kdaRatio.toFixed(2)}</td>
                    <td class="tw-p-4 tw-text-center tw-font-mono">${Math.round(t.totalGold / (t.realGamesPlayed || 1)).toLocaleString()}</td>
                </tr>
            `;
        });
    } catch(e) { console.error("Team Stats Error:", e); }
}

// หน้า Player Stats
async function fetchAndRenderPlayerStats() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/player-stats`);
        const data = res.ok ? await res.json() : [];
        const container = document.getElementById('stats-player-list');
        if(!container) return;

        container.innerHTML = '';
        if (data.length === 0) {
            container.innerHTML = `<div class="tw-text-center tw-text-gray-400">ยังไม่มีข้อมูลสถิติผู้เล่น</div>`;
            return;
        }

        data.slice(0, 10).forEach((p, idx) => {
            container.innerHTML += `
                <div class="tw-bg-white tw-p-4 tw-flex tw-items-center tw-justify-between tw-shadow-sm ${idx < 3 ? 'tw-border-l-4 tw-border-cyan-aura' : ''} tw-mb-3">
                    <div class="tw-flex tw-items-center tw-space-x-4">
                        <div class="tw-w-10 tw-h-10 tw-bg-gray-200 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-font-display tw-font-bold tw-text-gray-500">${idx + 1}</div>
                        <div>
                            <div class="tw-font-bold tw-text-lg">${p.playerName}</div>
                            <div class="tw-text-sm tw-text-gray-500 tw-flex tw-items-center">
                                ${getTeamLogoHtml(p.teamName, "tw-w-4 tw-h-4")} ${p.teamName}
                            </div>
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