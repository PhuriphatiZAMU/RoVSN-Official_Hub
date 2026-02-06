'use client';

import { ReactNode, createContext, useContext, useState, useCallback, useEffect } from 'react';

// Language translations
const translations = {
    th: {
        nav: {
            home: 'หน้าแรก',
            fixtures: 'ตารางแข่ง',
            standings: 'ตารางคะแนน',
            stats: 'สถิติ',
            teams: 'ทีม',
            format: 'รูปแบบแข่ง',
        },
        common: {
            loading: 'กำลังโหลด...',
            error: 'เกิดข้อผิดพลาด',
            retry: 'ลองอีกครั้ง',
            noData: 'ไม่มีข้อมูล',
        },
        home: {
            heroTitle: 'การแข่งขัน RoV ที่ยิ่งใหญ่ที่สุดในรั้ว SN',
            heroSubtitle: 'ร่วมเป็นสักขีพยานแห่งตำนานบทใหม่',
            latestResults: 'ผลการแข่งขันล่าสุด',
            leagueTable: 'ตารางคะแนน',
            viewAll: 'ดูทั้งหมด',
            fullTable: 'ดูตารางเต็ม',
        },
        standings: {
            title: 'ตารางคะแนน',
            team: 'ทีม',
            played: 'แข่ง',
            won: 'ชนะ',
            lost: 'แพ้',
            gd: 'ได้เสีย',
            pts: 'แต้ม',
            qualifies: 'ผ่านเข้ารอบ Playoffs',
            leaguePhase: 'League Phase Rankings',
        },
        fixtures: {
            title: 'ตารางการแข่งขัน',
            subtitle: 'คู่แข่งขันและผลการแข่ง',
            day: 'วันที่',
            match: 'คู่ที่',
            filterDay: 'เลือกวันแข่ง',
            allDays: 'ทุกวัน',
            semiFinal: 'Semi Final',
            grandFinal: 'Grand Final',
        },
        clubs: {
            title: 'ทีมที่เข้าร่วม',
            subtitle: 'ทีมที่เข้าร่วมแข่งขัน',
            noTeams: 'ยังไม่มีทีม',
            noTeamsDesc: 'ยังไม่มีข้อมูลทีมในระบบ',
        },
        stats: {
            title: 'สถิติการแข่งขัน',
            subtitle: 'สถิติทั้งหมดของทัวร์นาเมนต์',
            overview: 'ภาพรวม',
            team: 'ทีม',
            player: 'ผู้เล่น',
            playerShort: 'ผู้เล่น',
            heroes: 'ฮีโร่',
            winRate: 'Win Rate',
            totalMatches: 'แมตช์ทั้งหมด',
            totalGames: 'เกมทั้งหมด',
            avgGameTime: 'เวลาเฉลี่ย/เกม',
            bloodiestGame: 'เกมที่ Kill เยอะสุด',
            topMVP: 'MVP มากที่สุด',
            topKiller: 'Kill มากที่สุด',
            bestTeamWR: 'ทีม Win Rate สูงสุด',
            mostPickedHero: 'ฮีโร่ยอดนิยม',
            bestHeroWR: 'ฮีโร่ Win Rate สูงสุด',
            longestGame: 'เกมที่ยาวนานที่สุด',
            games: 'เกม',
            wins: 'ชนะ',
            loss: 'แพ้',
            kills: 'Kills',
            deaths: 'Deaths',
            assists: 'Assists',
        },
        format: {
            title: 'ระบบการแข่งขัน',
            subtitle: 'รายละเอียดโครงสร้างทัวร์นาเมนต์และเกณฑ์การตัดสินฉบับทางการ',
        },
        admin: {
            dashboard: {
                title: 'แดชบอร์ด',
                subtitle: 'ภาพรวมของระบบจัดการทัวร์นาเมนต์',
                lastUpdate: 'อัปเดตล่าสุด',
                progress: 'ความคืบหน้าการแข่งขัน',
                completed: 'แข่งจบแล้ว',
                remaining: 'เหลือการแข่ง',
                total: 'ทั้งหมด',
                totalTeams: 'ทีมทั้งหมด',
                totalMatches: 'แมตช์ทั้งหมด',
                finishedMatches: 'แมตช์ที่จบแล้ว',
                matchDays: 'วันแข่งทั้งหมด',
                poolPlayers: 'ผู้เล่นในระบบ',
                totalHeroes: 'ฮีโร่ทั้งหมด',
                teamLogos: 'โลโก้ทีม',
                gameStats: 'สถิติเกม',
                quickActions: 'เมนูด่วน',
                draw: 'จับสลาก',
                drawDesc: 'สุ่มจับคู่สายการแข่งขัน',
                recordResult: 'บันทึกผล',
                recordResultDesc: 'บันทึกผลการแข่งขัน',
                managePlayers: 'ผู้เล่น',
                managePlayersDesc: 'จัดการข้อมูลผู้เล่น',
                manageHeroes: 'ฮีโร่',
                manageHeroesDesc: 'จัดการข้อมูลฮีโร่',
                manageLogos: 'โลโก้',
                manageLogosDesc: 'จัดการโลโก้ทีม',
                manageTeams: 'ทีม',
                manageTeamsDesc: 'จัดการข้อมูลทีม',
                manageSchedule: 'ตารางแข่ง',
                manageScheduleDesc: 'จัดการตารางแข่ง',
                manageStats: 'สถิติ',
                manageStatsDesc: 'จัดการสถิติผู้เล่น',
                recentResults: 'ผลการแข่งล่าสุด',
                viewAll: 'ดูทั้งหมด',
                topTeams: 'อันดับสูงสุด',
                publicPages: 'หน้าเว็บสาธารณะ',
                home: 'หน้าแรก',
                fixtures: 'ตารางแข่ง',
                standings: 'ตารางคะแนน',
                stats: 'สถิติ',
                clubs: 'ทีม',
                format: 'กติกา',
                noResults: 'ยังไม่มีผลการแข่งขัน',
                noStandings: 'ยังไม่มีตารางคะแนน',
            },
            // New Keys
            teamsPage: {
                title: 'จัดการทีม',
                saveSuccess: 'บันทึกข้อมูลทีมเรียบร้อย',
                uploadSuccess: 'อัปโหลดโลโก้เรียบร้อย',
                enterTeamName: 'กรุณากรอกชื่อทีม',
                saveError: 'บันทึกไม่สำเร็จ',
                search: 'ค้นหาทีม...',
            },
            schedulePage: {
                title: 'ตารางการแข่งขัน',
                matchDays: 'วันแข่งขัน',
                totalMatches: 'แมตช์ทั้งหมด',
                matches: 'แมตช์',
                refresh: 'รีเฟรช',
                selectDay: 'เลือกวันที่',
                completed: 'จบแล้ว',
                pending: 'รอแข่ง',
                notPlayed: 'ยังไม่ได้แข่ง',
                winner: 'ผู้ชนะ',
                noMatchesToday: 'ไม่มีการแข่งขันในวันนี้',
                noSchedule: 'ไม่พบตารางแข่ง',
                createScheduleHint: 'สร้างตารางแข่งเพื่อเริ่มต้น',
                goToDraw: 'ไปหน้าจับสลาก',
                matchDetails: 'รายละเอียดแมตช์',
            },
            playerStatsTitle: 'สถิติผู้เล่น',
            playerStatsSubtitle: 'สถิติผู้เล่นทั้งหมด {count} คน',
            searchPlayer: 'ค้นหาผู้เล่น...',
            allTeams: 'ทุกทีม',
            sortKda: 'เรียงตาม KDA',
            sortKills: 'เรียงตาม Kills',
            sortMvp: 'เรียงตาม MVP',
            sortWinRate: 'เรียงตาม Win Rate',
            gamesPlayed: 'แมตช์ที่เล่น',
            totalKills: 'Total Kills',
            totalAssists: 'Total Assists',
            totalMvps: 'Total MVPs',
            avgKda: 'Average KDA',
            drawPage: {
                title: 'จับสลากแบ่งสาย',
                manageTeams: 'จัดการทีม',
            },
            heroesPage: {
                title: 'จัดการฮีโร่',
                upload: 'อัปโหลดฮีโร่',
            },
            logosPage: {
                title: 'จัดการโลโก้ทีม',
                selectTeam: 'เลือกทีม',
                successUpdate: 'อัปเดตโลโก้เรียบร้อย',
                currentLogos: 'โลโก้ปัจจุบัน',
            },
            historyTitle: 'ประวัติการแก้ไขผล',
            historySubtitle: 'รายการแก้ไขทั้งหมด {count} รายการ',
            refresh: 'รีเฟรช',
            searchMatchId: 'ค้นหา Match ID',
            allActions: 'ทุกการกระทำ',
            actionCreate: 'สร้าง',
            actionUpdate: 'แก้ไข',
            actionDelete: 'ลบ',
            timeUser: 'เวลา / ผู้ทำรายการ',
            matchId: 'Match ID',
            actions: 'Action',
            details: 'รายละเอียด',
            inspect: 'ตรวจสอบ',
            newMatchRecorded: 'บันทึกการแข่งขันใหม่',
            matchDeleted: 'ลบข้อมูลการแข่งขัน',
            noHistory: 'ไม่พบประวัติ',
            historyEmptyState: 'ยังไม่มีประวัติการแก้ไขข้อมูล',
            statsCreated: 'สร้างข้อมูล',
            statsUpdated: 'แก้ไขข้อมูล',
            resultStatsChanged: 'มีการเปลี่ยนแปลงผลแข่ง',
            statsDeleted: 'ลบข้อมูล',
            changeDetails: 'รายละเอียดการเปลี่ยนแปลง',
            actionBy: 'โดย',
            time: 'เวลา',
            reason: 'เหตุผล',
            oldData: 'ข้อมูลเดิม',
            newData: 'ข้อมูลใหม่',
            none: 'ไม่มี',
            create: 'สร้าง',
            update: 'อัปเดต',
            delete: 'ลบ',
            sessionExpired: 'เซสชันหมดอายุ',
            pleaseLogin: 'กรุณาเข้าสู่ระบบใหม่',
            rosterTitle: 'รายชื่อผู้เล่น',
            importCsv: 'นำเข้า CSV',
            noData: 'ไม่พบข้อมูล',
            team: 'ทีม',
        },
    },
    en: {
        nav: {
            home: 'Home',
            fixtures: 'Fixtures',
            standings: 'Standings',
            stats: 'Stats',
            teams: 'Teams',
            format: 'Format',
        },
        common: {
            loading: 'Loading...',
            error: 'An error occurred',
            retry: 'Try again',
            noData: 'No data',
        },
        home: {
            heroTitle: 'The Greatest RoV Tournament in SN',
            heroSubtitle: 'Witness the new legend unfold',
            latestResults: 'Latest Matches',
            leagueTable: 'League Table',
            viewAll: 'View All',
            fullTable: 'Full Table',
        },
        standings: {
            title: 'League Standings',
            team: 'Team',
            played: 'P',
            won: 'W',
            lost: 'L',
            gd: 'GD',
            pts: 'Pts',
            qualifies: 'Qualifies for Playoffs',
            leaguePhase: 'League Phase Rankings',
        },
        fixtures: {
            title: 'Match Fixtures',
            subtitle: 'Team pairings and match results',
            day: 'Day',
            match: 'Match',
            filterDay: 'Filter by Day',
            allDays: 'All Days',
            semiFinal: 'Semi Final',
            grandFinal: 'Grand Final',
        },
        clubs: {
            title: 'Participating Teams',
            subtitle: 'Participating Teams',
            noTeams: 'No Teams',
            noTeamsDesc: 'No team data available',
        },
        stats: {
            title: 'Tournament Statistics',
            subtitle: 'Official Tournament Statistics',
            overview: 'Overview',
            team: 'Team',
            player: 'Player',
            playerShort: 'Player',
            heroes: 'Heroes',
            winRate: 'Win Rate',
            totalMatches: 'Total Matches',
            totalGames: 'Total Games',
            avgGameTime: 'Avg Game Time',
            bloodiestGame: 'Bloodiest Game',
            topMVP: 'Top MVP Player',
            topKiller: 'Top Killer',
            bestTeamWR: 'Best Win Rate Team',
            mostPickedHero: 'Most Picked Hero',
            bestHeroWR: 'Best Hero Win Rate',
            longestGame: 'Longest Game',
            games: 'games',
            wins: 'Wins',
            loss: 'Loss',
            kills: 'Kills',
            deaths: 'Deaths',
            assists: 'Assists',
        },
        format: {
            title: 'Tournament Format',
            subtitle: 'Official Tournament Structure and Rules',
        },
        admin: {
            dashboard: {
                title: 'Dashboard',
                subtitle: 'Tournament Management System Overview',
                lastUpdate: 'Last Updated',
                progress: 'Tournament Progress',
                completed: 'Completed',
                remaining: 'Remaining',
                total: 'Total',
                totalTeams: 'Total Teams',
                totalMatches: 'Total Matches',
                finishedMatches: 'Finished Matches',
                matchDays: 'Match Days',
                poolPlayers: 'Player Pool',
                totalHeroes: 'Total Heroes',
                teamLogos: 'Team Logos',
                gameStats: 'Game Stats',
                quickActions: 'Quick Actions',
                draw: 'Draw',
                drawDesc: 'Randomize Bracket',
                recordResult: 'Record Result',
                recordResultDesc: 'Record Match Result',
                managePlayers: 'Players',
                managePlayersDesc: 'Manage Players',
                manageHeroes: 'Heroes',
                manageHeroesDesc: 'Manage Heroes',
                manageLogos: 'Logos',
                manageLogosDesc: 'Manage Team Logos',
                manageTeams: 'Teams',
                manageTeamsDesc: 'Manage Teams',
                manageSchedule: 'Schedule',
                manageScheduleDesc: 'Manage Schedule',
                manageStats: 'Stats',
                manageStatsDesc: 'Manage Game Stats',
                recentResults: 'Recent Results',
                viewAll: 'View All',
                topTeams: 'Top Teams',
                publicPages: 'Public Pages',
                home: 'Home',
                fixtures: 'Fixtures',
                standings: 'Standings',
                stats: 'Stats',
                clubs: 'Teams',
                format: 'Format',
                noResults: 'No matches played yet',
                noStandings: 'No standings available',
            },
            // New Keys
            teamsPage: {
                title: 'Manage Teams',
                saveSuccess: 'Team saved successfully',
                uploadSuccess: 'Logo uploaded successfully',
                enterTeamName: 'Please enter team name',
                saveError: 'Save failed',
                search: 'Search teams...',
            },
            schedulePage: {
                title: 'Match Schedule',
                matchDays: 'Match Days',
                totalMatches: 'Total Matches',
                matches: 'Matches',
                refresh: 'Refresh',
                selectDay: 'Select Day',
                completed: 'Completed',
                pending: 'Pending',
                notPlayed: 'Not Played',
                winner: 'Winner',
                noMatchesToday: 'No matches scheduled for today',
                noSchedule: 'No Schedule Found',
                createScheduleHint: 'Create a schedule to get started',
                goToDraw: 'Go to Draw',
                matchDetails: 'Match Details',
            },
            playerStatsTitle: 'Player Statistics',
            playerStatsSubtitle: 'Total {count} players',
            searchPlayer: 'Search players...',
            allTeams: 'All Teams',
            sortKda: 'Sort by KDA',
            sortKills: 'Sort by Kills',
            sortMvp: 'Sort by MVP',
            sortWinRate: 'Sort by Win Rate',
            gamesPlayed: 'Games Played',
            totalKills: 'Total Kills',
            totalAssists: 'Total Assists',
            totalMvps: 'Total MVPs',
            avgKda: 'Average KDA',
            drawPage: {
                title: 'Tournament Draw',
                manageTeams: 'Manage Teams',
            },
            heroesPage: {
                title: 'Manage Heroes',
                upload: 'Upload Heroes',
            },
            logosPage: {
                title: 'Manage Team Logos',
                selectTeam: 'Select Team',
                successUpdate: 'Logo updated successfully',
                currentLogos: 'Current Logos',
            },
            historyTitle: 'Result History',
            historySubtitle: 'Total {count} records',
            refresh: 'Refresh',
            searchMatchId: 'Search Match ID',
            allActions: 'All Actions',
            actionCreate: 'Create',
            actionUpdate: 'Update',
            actionDelete: 'Delete',
            timeUser: 'Time / User',
            matchId: 'Match ID',
            actions: 'Action',
            details: 'Details',
            inspect: 'Inspect',
            newMatchRecorded: 'New Match Recorded',
            matchDeleted: 'Match Deleted',
            noHistory: 'No History',
            historyEmptyState: 'No history records found',
            statsCreated: 'Created',
            statsUpdated: 'Updated',
            resultStatsChanged: 'Result Changed',
            statsDeleted: 'Deleted',
            changeDetails: 'Change Details',
            actionBy: 'By',
            time: 'Time',
            reason: 'Reason',
            oldData: 'Old Data',
            newData: 'New Data',
            none: 'None',
            create: 'Create',
            update: 'Update',
            delete: 'Delete',
            sessionExpired: 'Session Expired',
            pleaseLogin: 'Please login again',
            rosterTitle: 'Roster',
            importCsv: 'Import CSV',
            noData: 'No Data',
            team: 'Team',
        },
    },
};

type Language = 'th' | 'en';
type Translations = typeof translations.th;

interface LanguageContextType {
    language: Language;
    t: Translations;
    changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('th');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Mark as mounted first
        setMounted(true);

        // Load saved language preference only on client
        const saved = localStorage.getItem('language') as Language;
        if (saved && (saved === 'th' || saved === 'en')) {
            setLanguage(saved);
        }
    }, []);

    const changeLanguage = useCallback((lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    }, []);

    const value: LanguageContextType = {
        language,
        t: translations[language],
        changeLanguage,
    };

    // Prevent hydration mismatch by rendering null until mounted
    // This ensures server and client render the same initial content
    if (!mounted) {
        return (
            <LanguageContext.Provider value={value}>
                {children}
            </LanguageContext.Provider>
        );
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export { translations };
export type { Language, Translations };
