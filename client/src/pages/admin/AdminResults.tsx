import { useState, useEffect, useMemo, FormEvent, MouseEvent } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import GameStatsModal from '../../components/admin/GameStatsModal';
import { apiService } from '../../services/api';
import Swal from 'sweetalert2';

// Type definitions
interface GameDetail {
    gameNumber: number;
    winner: string;
    durationMin: number;
    durationSec: number;
    mvpPlayer: string;
    mvpTeam: string;
}

interface PlayerStat {
    name: string;
    hero: string;
    k: number;
    d: number;
    a: number;
    gold: number;
}

interface GameStats {
    blue: PlayerStat[];
    red: PlayerStat[];
}

interface Match {
    blue: string;
    red: string;
    date?: string;
}

interface Player {
    _id: string;
    name: string;
    inGameName?: string;
    team?: string;
}

interface Hero {
    _id: string;
    name: string;
    iconUrl?: string;
}

const STAGE_MAPPING: Record<number, string> = {
    90: 'Semi-Finals',
    99: 'Grand Final'
};

export default function AdminResults() {
    const { schedule, results, teams, standings, refreshData } = useData();
    const { token } = useAuth() as { token: string | null };
    const { t, language } = useLanguage();

    // Initialize selectedDay from localStorage if available, otherwise default to 1
    const [selectedDay, setSelectedDay] = useState<number>(() => {
        const savedDay = localStorage.getItem('admin_selected_day');
        return savedDay ? parseInt(savedDay) : 1;
    });

    const handleDayChange = (day: number): void => {
        setSelectedDay(day);
        localStorage.setItem('admin_selected_day', String(day));
        setFormData({ teamBlue: '', teamRed: '', scoreBlue: 0, scoreRed: 0 });
    };

    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        teamBlue: '',
        teamRed: '',
        scoreBlue: 0,
        scoreRed: 0,
    });

    // Game Details for Statistics
    const [gameDetails, setGameDetails] = useState<GameDetail[]>([
        { gameNumber: 1, winner: '', durationMin: 15, durationSec: 0, mvpPlayer: '', mvpTeam: '' },
        { gameNumber: 2, winner: '', durationMin: 15, durationSec: 0, mvpPlayer: '', mvpTeam: '' },
        { gameNumber: 3, winner: '', durationMin: 15, durationSec: 0, mvpPlayer: '', mvpTeam: '' },
    ]);

    // Player Stats State
    const [gamesStats, setGamesStats] = useState<Record<number, GameStats>>({});
    const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);
    const [editingGameIndex, setEditingGameIndex] = useState<number | null>(null);

    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    // Win by Bye (ชนะบาย) - ทีมชนะโดยไม่ต้องแข่ง
    const [isByeWin, setIsByeWin] = useState<boolean>(false);
    const [byeWinner, setByeWinner] = useState<string>('');

    const envUrl = import.meta.env.VITE_API_URL || '';
    const API_BASE_URL = envUrl ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`) : '/api';
    const dayData = schedule.find(r => Number(r.day) === selectedDay);
    const dayMatches = dayData?.matches || [];
    const isBO5 = selectedDay >= 90;

    // Player Pool Data for Auto-complete
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [allHeroes, setAllHeroes] = useState<Hero[]>([]);

    useEffect(() => {
        const fetchPlayersPool = async () => {
            try {
                const data = await apiService.getPlayers();
                setAllPlayers(data);
            } catch (err) {
                console.error("Failed to load player pool:", err);
            }

            try {
                const heroData = await apiService.getHeroes();
                setAllHeroes(heroData);
            } catch (err) {
                console.error("Failed to load heroes:", err);
            }
        };
        if (token) fetchPlayersPool();
    }, [API_BASE_URL, token]);

    // Toast Mixin
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    // Helper Format Date
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handleDeleteResult = async (match: Match, e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        const matchKey = `${selectedDay}_${match.blue}_vs_${match.red}`.replace(/\s+/g, '');

        const result = await Swal.fire({
            title: t.admin.resultsPage.confirmDelete,
            text: t.admin.resultsPage.deleteConfirmText.replace('{match}', `${match.blue} vs ${match.red}`),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t.admin.resultsPage.delete,
            cancelButtonText: t.admin.cancel
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                await apiService.deleteResult(matchKey);
                Toast.fire({ icon: 'success', title: t.admin.resultsPage.deleteSuccess });
                refreshData();
            } catch (err: any) {
                Swal.fire('Error', `${t.admin.resultsPage.deleteError}: ${err.message}`, 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleGenerateClick = async (type: string) => {
        if (type === 'semi') {
            if (standings.length < 4) {
                Swal.fire(t.admin.resultsPage.warning, `Could not create: Found ${standings.length} teams (Needs 4)`, 'warning');
                return;
            }
            const top4 = standings.slice(0, 4);
            const details = top4.map((t, i) => `${i + 1}. ${t.name} (${t.pts} pts)`).join('<br>');

            const { value: dateStr } = await Swal.fire({
                title: t.admin.resultsPage.createSemiTitle,
                html: `${t.admin.resultsPage.createSemiTitle}. Top 4:<br/><div class="text-left bg-gray-50 p-3 rounded my-2 text-sm">${details}</div><br/>${t.admin.resultsPage.selectDate}:`,
                input: 'date',
                showCancelButton: true,
                confirmButtonText: t.admin.resultsPage.createSchedule,
                cancelButtonText: t.admin.cancel,
                inputValidator: (value) => {
                    if (!value) return t.admin.resultsPage.selectDate;
                }
            });

            if (dateStr) {
                executeGenerationAction(type, dateStr);
            }

        } else if (type === 'final') {
            const semiMatches = schedule.find(s => Number(s.day) === 90)?.matches;
            if (!semiMatches) {
                Swal.fire(t.admin.resultsPage.warning, t.admin.resultsPage.semiNotFound, 'warning');
                return;
            }

            const getWinner = (blue: string, red: string) => {
                const matchKey = `90_${blue}_vs_${red}`.replace(/\s+/g, '');
                const res = results.find(r => r.matchId === matchKey);
                return res ? res.winner : null;
            };
            const winner1 = getWinner(semiMatches[0].blue, semiMatches[0].red);
            const winner2 = getWinner(semiMatches[1].blue, semiMatches[1].red);

            if (!winner1 || !winner2) {
                Swal.fire(t.admin.resultsPage.warning, t.admin.resultsPage.semiNotComplete, 'warning');
                return;
            }

            const { value: dateStr } = await Swal.fire({
                title: t.admin.resultsPage.createFinalTitle,
                html: `Finals: <b>${winner1} vs ${winner2}</b><br/>${t.admin.resultsPage.selectDate}:`,
                input: 'date',
                showCancelButton: true,
                confirmButtonText: t.admin.resultsPage.createSchedule,
                cancelButtonText: t.admin.cancel,
                inputValidator: (value) => {
                    if (!value) return t.admin.resultsPage.selectDate;
                }
            });

            if (dateStr) {
                executeGenerationAction(type, dateStr);
            }
        }
    };

    // Helper: Check Completion
    const isRegularSeasonComplete = useMemo(() => {
        // Check Days 1-9
        for (let d = 1; d <= 9; d++) {
            const daySch = schedule.find(s => Number(s.day) === d);
            if (!daySch || !daySch.matches) continue;
            const allMatchesDone = daySch.matches.every(m => {
                const matchKey = `${d}_${m.blue}_vs_${m.red}`.replace(/\s+/g, '');
                return results.some(r => r.matchId === matchKey);
            });
            if (!allMatchesDone) return false;
        }
        return true;
    }, [schedule, results]);

    const isSemiFinalsComplete = useMemo(() => {
        const semiSch = schedule.find(s => Number(s.day) === 90);
        if (!semiSch || !semiSch.matches) return false;
        return semiSch.matches.every(m => {
            const matchKey = `90_${m.blue}_vs_${m.red}`.replace(/\s+/g, '');
            const res = results.find(r => r.matchId === matchKey);
            return !!res && !!res.winner;
        });
    }, [schedule, results]);

    const executeGenerationAction = async (type: string, dateStr: string) => {
        const formattedDate = dateStr ? formatDate(dateStr) : '';

        let newSchedule = null;
        let successMsg = '';
        let targetDay = '';

        if (type === 'semi') {
            const top4 = standings.slice(0, 4);
            const semiMatches = [
                { blue: top4[0].name, red: top4[1].name, date: formattedDate },
                { blue: top4[2].name, red: top4[3].name, date: formattedDate }
            ];
            newSchedule = {
                teams: teams,
                schedule: [
                    ...schedule.filter(s => Number(s.day) !== 90),
                    { day: 90, date: formattedDate || 'Semi-Finals', matches: semiMatches }
                ]
            };
            successMsg = 'สร้างตาราง Semi-Finals เรียบร้อย!';
            targetDay = '90';

        } else if (type === 'final') {
            const semiSch = schedule.find(s => Number(s.day) === 90);
            if (!semiSch || !semiSch.matches) return;
            const semiMatches = semiSch.matches;

            const getWinner = (blue: string, red: string) => results.find(r => r.matchId === `90_${blue}_vs_${red}`.replace(/\s+/g, ''))?.winner;
            const getLoser = (blue: string, red: string) => results.find(r => r.matchId === `90_${blue}_vs_${red}`.replace(/\s+/g, ''))?.loser;

            const winner1 = getWinner(semiMatches[0].blue, semiMatches[0].red) as string;
            const winner2 = getWinner(semiMatches[1].blue, semiMatches[1].red) as string;
            const loser1 = getLoser(semiMatches[0].blue, semiMatches[0].red) as string;
            const loser2 = getLoser(semiMatches[1].blue, semiMatches[1].red) as string;

            const finalMatches = [
                { blue: loser1, red: loser2, date: formattedDate ? `${formattedDate} (3rd)` : '3rd Place' },
                { blue: winner1, red: winner2, date: formattedDate ? `${formattedDate} (Final)` : 'Grand Final' }
            ];
            newSchedule = {
                teams: teams,
                schedule: [
                    ...schedule.filter(s => Number(s.day) !== 99),
                    { day: 99, date: formattedDate || 'Finals', matches: finalMatches }
                ]
            };
            successMsg = 'สร้างตาราง Finals เรียบร้อย!';
            targetDay = '99';
        }

        if (newSchedule) {
            try {
                setLoading(true);
                // Reset old results for this round to prevent data corruption
                if (targetDay) {
                    try {
                        await apiService.resetResults(targetDay);
                    } catch (e: any) {
                        console.warn(`Warning: Could not clear old results: ${e.message}`);
                    }
                }

                await apiService.createSchedule(newSchedule);
                Swal.fire(t.admin.resultsPage.success, type === 'semi' ? t.admin.resultsPage.semiSuccess : t.admin.resultsPage.finalSuccess, 'success');
                localStorage.setItem('admin_selected_day', String(targetDay));
                setTimeout(() => refreshData(), 1500);
            } catch (err: any) {
                Swal.fire('Error', `Failed: ${err.message}`, 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleMatchSelect = async (match: Match) => {
        // Recalculate isBO5 based on CURRENT selectedDay
        const checkBO5 = selectedDay >= 90;
        const maxGames = checkBO5 ? 5 : 3;

        // Check if result already exists for this match
        // Check if result already exists for this match
        const sanitizedBlue = match.blue.trim();
        const sanitizedRed = match.red.trim();
        const matchKey = `${selectedDay}_${sanitizedBlue}_vs_${sanitizedRed}`.replace(/\s+/g, '');

        console.log('🔍 [DEBUG SELECT] Searching for matchKey:', matchKey);
        console.log('🔍 [DEBUG SELECT] Available results count:', results.length);

        // Debug finding logic
        // Debug finding logic
        let existingResult = results.find(r => r.matchId === matchKey);

        if (!existingResult) {
            console.warn('⚠️ [DEBUG SELECT] Match NOT found in results!');
            console.log('🔍 [DEBUG SELECT] First 5 Available matchIds:', results.slice(0, 5).map(r => r.matchId));

            // Try lenient search (ignore spaces completely)
            const looseResult = results.find(r => r.teamBlue.trim() === sanitizedBlue && r.teamRed.trim() === sanitizedRed && r.matchDay == selectedDay);
            if (looseResult) {
                console.log('🎉 [DEBUG SELECT] Found via name matching instead of ID!', looseResult);
                existingResult = looseResult; // Use this result!
            }
        }

        if (existingResult) {
            console.log('✅ [DEBUG SELECT] existingResult found:', existingResult);
            console.log('🔍 [DEBUG SELECT] gameDetails from DB:', existingResult.gameDetails);

            // Load existing scores
            setFormData({
                teamBlue: match.blue,
                teamRed: match.red,
                scoreBlue: existingResult.scoreBlue || 0,
                scoreRed: existingResult.scoreRed || 0,
            });

            // Load existing game details
            const existingGameDetails = existingResult.gameDetails || [];
            console.log('🔍 [DEBUG] existingGameDetails array:', existingGameDetails);

            const newGameDetails = Array.from({ length: maxGames }, (_, i) => {
                const game = existingGameDetails.find(g => g.gameNumber === i + 1);
                console.log(`🔍 [DEBUG] Game ${i + 1} found:`, game);
                if (game) {
                    const totalSec = game.duration || 0;
                    return {
                        gameNumber: i + 1,
                        winner: game.winner || '',
                        durationMin: Math.floor(totalSec / 60),
                        durationSec: totalSec % 60,
                        mvpPlayer: game.mvpPlayer || '',
                        mvpTeam: game.mvpTeam || game.winner || '',
                    };
                }
                return { gameNumber: i + 1, winner: '', durationMin: 15, durationSec: 0, mvpPlayer: '', mvpTeam: '' };
            });
            console.log('🔍 [DEBUG] newGameDetails to set:', newGameDetails);
            setGameDetails(newGameDetails);

            // Load existing player stats from API
            try {
                // Use the ACTUAL matchId from the database result, not the one we just generated
                // This handles cases where we found the result via loose search (name mismatch)
                const targetMatchId = existingResult.matchId;
                const statsData = await apiService.getMatchStats(targetMatchId);
                console.log('🔍 [DEBUG] Stats data from API:', statsData);

                if (statsData) {
                    // Convert flat stats array to gamesStats format: { 0: { blue: [], red: [] }, ... }
                    const loadedGamesStats: Record<number, GameStats> = {};

                    statsData.forEach((stat: any) => {
                        const gameIndex = stat.gameNumber - 1;
                        if (!loadedGamesStats[gameIndex]) {
                            loadedGamesStats[gameIndex] = { blue: [], red: [] };
                        }
                        const side = stat.teamName === match.blue ? 'blue' : 'red';
                        loadedGamesStats[gameIndex][side].push({
                            name: stat.playerName,
                            hero: stat.heroName || '',
                            k: stat.kills || 0,
                            d: stat.deaths || 0,
                            a: stat.assists || 0,
                            gold: stat.gold || 0,
                        });
                    });
                    console.log('🔍 [DEBUG] Converted gamesStats:', loadedGamesStats);
                    setGamesStats(loadedGamesStats);
                } else {
                    console.log('🔍 [DEBUG] Stats API returned non-OK status');
                    setGamesStats({});
                }
            } catch (err) {
                console.error('🔍 [DEBUG] Failed to load match stats:', err);
                setGamesStats({});
            }

            // Load bye win flag
            if (existingResult.isByeWin) {
                setIsByeWin(true);
                setByeWinner(existingResult.winner === match.blue ? 'blue' : 'red');
            } else {
                setIsByeWin(false);
                setByeWinner('');
            }

            setShowAdvanced(!existingResult.isByeWin); // Hide advanced if bye win
            Toast.fire({ icon: 'info', title: existingResult.isByeWin ? 'โหมดแก้ไข: ผลชนะบาย' : 'โหมดแก้ไข: ผลการแข่งขัน' });
        } else {
            // No existing result - create fresh form
            setFormData({
                teamBlue: match.blue,
                teamRed: match.red,
                scoreBlue: 0,
                scoreRed: 0,
            });

            setGameDetails(
                Array.from({ length: maxGames }, (_, i) => ({
                    gameNumber: i + 1,
                    winner: '',
                    durationMin: 15,
                    durationSec: 0,
                    mvpPlayer: '',
                    mvpTeam: ''
                }))
            );
            setGamesStats({});
            setIsByeWin(false);
            setByeWinner('');
        }
    };

    const updateGameDetail = (index: number, field: keyof GameDetail, value: any) => {
        const newDetails = [...gameDetails];
        newDetails[index] = { ...newDetails[index], [field]: value };

        // Auto calculate scores from game winners
        if (field === 'winner') {
            let blueWins = 0;
            let redWins = 0;
            newDetails.forEach(g => {
                if (g.winner === formData.teamBlue) blueWins++;
                if (g.winner === formData.teamRed) redWins++;
            });
            setFormData(prev => ({ ...prev, scoreBlue: blueWins, scoreRed: redWins }));
        }

        // Auto set MVP Team if MVP Player is filled (optional logic, can act as helper)
        setGameDetails(newDetails);
    };

    const openStatsModal = (index: number) => {
        setEditingGameIndex(index);
        setIsStatsModalOpen(true);
    };

    const handleStatsSave = (stats: GameStats) => {
        if (editingGameIndex !== null) {
            setGamesStats(prev => ({
                ...prev,
                [editingGameIndex]: stats
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Handle Win by Bye (ชนะบาย)
            if (isByeWin) {
                // Validate bye winner is selected
                if (!byeWinner) {
                    Swal.fire('แจ้งเตือน', 'กรุณาเลือกทีมที่ชนะบาย', 'warning');
                    setLoading(false);
                    return;
                }

                const winnerTeam = byeWinner === 'blue' ? formData.teamBlue : formData.teamRed;

                console.log('🔍 [DEBUG BYE] Saving bye win for:', winnerTeam);

                await apiService.createResult({
                    matchDay: selectedDay,
                    teamBlue: formData.teamBlue,
                    teamRed: formData.teamRed,
                    scoreBlue: 0,
                    scoreRed: 0,
                    gameDetails: [],
                    isByeWin: true,
                    winner: winnerTeam,
                    loser: byeWinner === 'blue' ? formData.teamRed : formData.teamBlue,
                });

                setLoading(false);
                Toast.fire({ icon: 'success', title: `${t.admin.resultsPage.winByBye}: ${winnerTeam}` });

                // Refresh data
                setTimeout(() => refreshData(), 1500);
                return;
            }

            // Normal match result
            const scoreBlue = typeof formData.scoreBlue === 'string' ? parseInt(formData.scoreBlue) : formData.scoreBlue;
            const scoreRed = typeof formData.scoreRed === 'string' ? parseInt(formData.scoreRed) : formData.scoreRed;

            // Prepare game details (filter only played games)
            // Duration is now stored as total seconds: (min * 60) + sec
            const playedGames = gameDetails.filter(g => g.winner !== '').map(g => ({
                gameNumber: g.gameNumber,
                winner: g.winner,
                loser: g.winner === formData.teamBlue ? formData.teamRed : formData.teamBlue,
                duration: (g.durationMin || 0) * 60 + (g.durationSec || 0),
                mvpPlayer: g.mvpPlayer,
                mvpTeam: g.mvpTeam || g.winner,
            }));

            // 1. Save Match Result
            // Sanitize team names
            const cleanTeamBlue = formData.teamBlue.trim();
            const cleanTeamRed = formData.teamRed.trim();

            await apiService.createResult({
                matchDay: selectedDay,
                teamBlue: cleanTeamBlue,
                teamRed: cleanTeamRed,
                scoreBlue,
                scoreRed,
                gameDetails: playedGames,
                isByeWin: false,
            });

            // 2. Save Player Stats (if any)
            const matchId = `${selectedDay}_${cleanTeamBlue}_vs_${cleanTeamRed}`.replace(/\s+/g, '');
            const allStats: Array<{
                matchId: string;
                gameNumber: number;
                teamName: string;
                playerName: string;
                heroName: string;
                kills: number;
                deaths: number;
                assists: number;
                gold: number;
                mvp: boolean;
                gameDuration: number;
                win: boolean;
            }> = [];

            console.log('🔍 [DEBUG SAVE] gamesStats object:', gamesStats);
            console.log('🔍 [DEBUG SAVE] gamesStats keys:', Object.keys(gamesStats));

            Object.keys(gamesStats).forEach(gameIndexStr => {
                const gameIndex = parseInt(gameIndexStr);
                const gameStat = (gamesStats as any)[gameIndex]; // Cast to any for dynamic indexing
                const gameNum = gameIndex + 1;
                console.log(`🔍 [DEBUG SAVE] Game ${gameNum} stats:`, gameStat);

                if (gameStat?.blue) {
                    gameStat.blue.forEach((p: any) => { // Cast p to any
                        if (p.name) allStats.push({
                            matchId,
                            gameNumber: gameNum,
                            teamName: cleanTeamBlue,
                            playerName: p.name,
                            heroName: p.hero || '',
                            kills: p.k, deaths: p.d, assists: p.a,
                            gold: p.gold || 0,
                            mvp: gameDetails[gameIndex]?.mvpPlayer === p.name,
                            gameDuration: (gameDetails[gameIndex]?.durationMin || 0) * 60 + (gameDetails[gameIndex]?.durationSec || 0),
                            win: gameDetails[gameIndex]?.winner === formData.teamBlue
                        });
                    });
                }
                if (gameStat?.red) {
                    gameStat.red.forEach((p: any) => { // Cast p to any
                        if (p.name) allStats.push({
                            matchId,
                            gameNumber: gameNum,
                            teamName: cleanTeamRed,
                            playerName: p.name,
                            heroName: p.hero || '',
                            kills: p.k, deaths: p.d, assists: p.a,
                            gold: p.gold || 0,
                            mvp: gameDetails[gameIndex]?.mvpPlayer === p.name,
                            gameDuration: (gameDetails[gameIndex]?.durationMin || 0) * 60 + (gameDetails[gameIndex]?.durationSec || 0),
                            win: gameDetails[gameIndex]?.winner === formData.teamRed
                        });
                    });
                }
            });

            console.log('🔍 [DEBUG SAVE] allStats to save:', allStats.length, 'records');
            console.log('🔍 [DEBUG SAVE] allStats content:', allStats);

            if (allStats.length > 0) {
                const statsResult = await apiService.saveGameStats(allStats);
                console.log('🔍 [DEBUG SAVE] Stats save response:', statsResult);
            } else {
                console.log('🔍 [DEBUG SAVE] No player stats to save (gamesStats is empty)');
            }

            Toast.fire({ icon: 'success', title: t.admin.resultsPage.saveSuccess });
            setFormData({ teamBlue: '', teamRed: '', scoreBlue: 0, scoreRed: 0 });
            setGameDetails([
                { gameNumber: 1, winner: '', durationMin: 15, durationSec: 0, mvpPlayer: '', mvpTeam: '' },
                { gameNumber: 2, winner: '', durationMin: 15, durationSec: 0, mvpPlayer: '', mvpTeam: '' },
                { gameNumber: 3, winner: '', durationMin: 15, durationSec: 0, mvpPlayer: '', mvpTeam: '' },
            ]);
            setGamesStats({});

            // Reload page
            localStorage.setItem('admin_selected_day', String(selectedDay));
            setTimeout(() => refreshData(), 1500);
        } catch (error: any) {
            Swal.fire('Error', `${t.admin.resultsPage.saveError}: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const getMatchResult = (match: Match) => {
        const matchKey = `${selectedDay}_${match.blue}_vs_${match.red}`.replace(/\s+/g, '');
        return results.find(r => r.matchId === matchKey);
    };

    // Calculate total games needed based on BO3 or BO5
    const winningScore = isBO5 ? 3 : 2;
    const totalGamesNeeded = Math.max(formData.scoreBlue, formData.scoreRed) >= winningScore
        ? parseInt(formData.scoreBlue as any) + parseInt(formData.scoreRed as any)
        : (isBO5 ? 5 : 3);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-display font-bold text-uefa-dark uppercase">
                        <i className="fas fa-trophy mr-2 text-cyan-aura"></i>
                        {t.admin.resultsPage.title}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{t.admin.resultsPage.subtitle}</p>
                </div>

                <div className="p-6">
                    {/* Match Day Selector */}

                    {/* Match Day Selector & Generators */}
                    <div className="mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t.admin.resultsPage.selectMatchDay}</label>
                            <div className="flex flex-wrap gap-2">
                                {schedule.length === 0 ? (
                                    <p className="text-gray-500 text-sm">
                                        <i className="fas fa-info-circle mr-1"></i>
                                        {t.admin.resultsPage.noSchedule}
                                    </p>
                                ) : (
                                    schedule.map(round => (
                                        <button
                                            key={round.day}
                                            onClick={() => handleDayChange(round.day)}
                                            className={`px-4 py-2 rounded-lg font-bold transition-all text-sm ${round.day === selectedDay
                                                ? 'bg-cyan-aura text-uefa-dark'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {STAGE_MAPPING[round.day] || `Day ${round.day}`}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => handleGenerateClick('semi')}
                                disabled={!isRegularSeasonComplete}
                                className={`px-3 py-2 border rounded-lg text-sm font-bold flex items-center transition-colors ${isRegularSeasonComplete
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    }`}
                                title={!isRegularSeasonComplete ? t.admin.resultsPage.prereqRegular : ""}
                            >
                                <i className="fas fa-random mr-1"></i> {t.admin.resultsPage.createSemi}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleGenerateClick('final')}
                                disabled={!isSemiFinalsComplete}
                                className={`px-3 py-2 border rounded-lg text-sm font-bold flex items-center transition-colors ${isSemiFinalsComplete
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    }`}
                                title={!isSemiFinalsComplete ? t.admin.resultsPage.prereqSemi : ""}
                            >
                                <i className="fas fa-trophy mr-1"></i> {t.admin.resultsPage.createFinal}
                            </button>
                        </div>
                    </div>

                    {/* Matches List */}
                    {dayMatches.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t.admin.resultsPage.selectMatch}</label>
                            <div className="grid gap-3">
                                {dayMatches.map((match, i) => {
                                    const result = getMatchResult(match);
                                    const isSelected = formData.teamBlue === match.blue && formData.teamRed === match.red;

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleMatchSelect(match)}
                                            className={`p-4 border-2 rounded-lg transition-all flex items-center justify-between ${isSelected
                                                ? 'border-cyan-aura bg-cyan-aura/10'
                                                : result
                                                    ? 'border-green-200 bg-green-50'
                                                    : 'border-gray-200 hover:border-cyan-aura/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-blue-600">{match.blue}</span>
                                                <span className="text-gray-400">vs</span>
                                                <span className="font-bold text-red-600">{match.red}</span>
                                            </div>
                                            {result ? (() => {
                                                // Detect BYE: either isByeWin flag OR score 0-0 with a winner
                                                const isBye = result.isByeWin || (result.scoreBlue === 0 && result.scoreRed === 0 && result.winner);
                                                return (
                                                    <div className="flex items-center gap-3">
                                                        {isBye ? (
                                                            <span className="bg-yellow-500 text-white px-3 py-1 rounded font-bold">
                                                                BYE → {result.winner}
                                                            </span>
                                                        ) : (
                                                            <span className="bg-green-500 text-white px-3 py-1 rounded font-bold">
                                                                {result.scoreBlue} - {result.scoreRed}
                                                            </span>
                                                        )}
                                                        <div
                                                            className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                                            title={t.admin.resultsPage.delete}
                                                            onClick={(e) => handleDeleteResult(match, e)}
                                                        >
                                                            <i className="fas fa-trash-alt text-sm"></i>
                                                        </div>
                                                    </div>
                                                );
                                            })() : (
                                                <span className="text-gray-400 text-sm">{t.admin.none}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Score Form */}
                    {formData.teamBlue && (
                        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6">
                            <h3 className="font-bold text-lg mb-4 text-center">
                                <span className="text-blue-600">{formData.teamBlue}</span>
                                <span className="text-gray-400 mx-2">vs</span>
                                <span className="text-red-600">{formData.teamRed}</span>
                            </h3>

                            {/* Win by Bye Toggle */}
                            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <label className="flex items-center justify-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isByeWin}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setIsByeWin(e.target.checked);
                                            if (!e.target.checked) setByeWinner('');
                                        }}
                                        className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400"
                                    />
                                    <span className="font-bold text-yellow-700">
                                        <i className="fas fa-flag-checkered mr-2"></i>
                                        {t.admin.resultsPage.winByBye}
                                    </span>
                                </label>
                                <p className="text-xs text-yellow-600 text-center mt-2">
                                    {t.admin.resultsPage.winByByeDesc}
                                </p>

                                {/* Bye Winner Selection */}
                                {isByeWin && (
                                    <div className="mt-4 flex justify-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setByeWinner('blue')}
                                            className={`px-6 py-3 rounded-lg font-bold transition-all ${byeWinner === 'blue'
                                                ? 'bg-blue-500 text-white shadow-lg scale-105'
                                                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                }`}
                                        >
                                            <i className="fas fa-trophy mr-2"></i>
                                            {formData.teamBlue}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setByeWinner('red')}
                                            className={`px-6 py-3 rounded-lg font-bold transition-all ${byeWinner === 'red'
                                                ? 'bg-red-500 text-white shadow-lg scale-105'
                                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                }`}
                                        >
                                            <i className="fas fa-trophy mr-2"></i>
                                            {formData.teamRed}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Quick Score Input - Hidden when Bye Win */}
                            {!isByeWin && (
                                <div className="flex items-center justify-center gap-6 mb-6">
                                    <div className="text-center">
                                        <label className="block text-sm text-gray-600 mb-2">{formData.teamBlue}</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={isBO5 ? 3 : 2}
                                            value={formData.scoreBlue}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, scoreBlue: parseInt(e.target.value) })}
                                            className="w-20 h-20 text-center text-3xl font-bold border-2 border-blue-300 bg-blue-50 rounded-xl focus:border-cyan-aura focus:outline-none"
                                        />
                                    </div>
                                    <div className="text-4xl text-gray-300 font-bold">-</div>
                                    <div className="text-center">
                                        <label className="block text-sm text-gray-600 mb-2">{formData.teamRed}</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={isBO5 ? 3 : 2}
                                            value={formData.scoreRed}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, scoreRed: parseInt(e.target.value) })}
                                            className="w-20 h-20 text-center text-3xl font-bold border-2 border-red-300 bg-red-50 rounded-xl focus:border-cyan-aura focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Advanced Details Toggle - Hidden when Bye Win */}
                            {!isByeWin && (
                                <div className="mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-cyan-aura transition-colors py-2"
                                    >
                                        <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'}`}></i>
                                        {showAdvanced ? t.admin.resultsPage.hideDetails : t.admin.resultsPage.showDetails}
                                    </button>
                                </div>
                            )}

                            {/* Game Details - Hidden when Bye Win */}
                            {!isByeWin && showAdvanced && (
                                <div className="space-y-4 mb-6 p-4 bg-white rounded-lg border border-gray-200">

                                    <h4 className="font-bold text-gray-700">
                                        <i className="fas fa-gamepad mr-2 text-cyan-aura"></i>
                                        {t.admin.resultsPage.gameDetailsTitle} ({isBO5 ? 'Best of 5' : 'Best of 3'})
                                    </h4>

                                    {/* Render BO3 (3 games) or BO5 (5 games) */}
                                    {Array(isBO5 ? 5 : 3).fill(0).map((_, i) => i).map((index) => {
                                        const scoreBlueNum = typeof formData.scoreBlue === 'string' ? parseInt(formData.scoreBlue) : formData.scoreBlue;
                                        const scoreRedNum = typeof formData.scoreRed === 'string' ? parseInt(formData.scoreRed) : formData.scoreRed;
                                        const totalGamesNeeded = (scoreBlueNum || 0) + (scoreRedNum || 0);

                                        const winnerName = gameDetails[index]?.winner;
                                        // Filter MVP candidates based on winner (or both teams if unknown, but better unknown)
                                        const winnerRoster = winnerName ? allPlayers.filter(p => p.team === winnerName) : [];

                                        return (
                                            <div key={index} className={`p-4 rounded-lg border ${gameDetails[index]?.winner ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 h-8 bg-cyan-aura text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                            {index + 1}
                                                        </span>
                                                        <span className="font-bold text-gray-700">{t.admin.resultsPage.game} {index + 1}</span>
                                                        {index + 1 > totalGamesNeeded && (
                                                            <span className="text-xs text-gray-400">{t.admin.resultsPage.notNeeded}</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => openStatsModal(index)}
                                                        className={`text-sm px-3 py-1 rounded border transition-colors ${gamesStats[index as keyof typeof gamesStats] // Cast index to keyof typeof gamesStats
                                                            ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                                            : 'bg-white text-gray-500 border-gray-300 hover:text-cyan-aura hover:border-cyan-aura'}`}
                                                    >
                                                        <i className={`fas ${gamesStats[index as keyof typeof gamesStats] ? 'fa-check-circle' : 'fa-chart-bar'} mr-1`}></i>
                                                        {gamesStats[index as keyof typeof gamesStats] ? t.admin.resultsPage.statsSaved : t.admin.resultsPage.saveStats}
                                                    </button>
                                                </div>

                                                <div className="grid md:grid-cols-3 gap-3">
                                                    {/* Winner Selection */}
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">{t.admin.resultsPage.winner}</label>
                                                        <select
                                                            value={gameDetails[index].winner}
                                                            onChange={(e) => updateGameDetail(index, 'winner', e.target.value)}
                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none"
                                                        >
                                                            <option value="">{t.admin.resultsPage.chooseWinner}</option>
                                                            <option value={formData.teamBlue}>{formData.teamBlue}</option>
                                                            <option value={formData.teamRed}>{formData.teamRed}</option>
                                                        </select>
                                                    </div>

                                                    {/* Duration - Minutes and Seconds */}
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">{t.admin.resultsPage.duration}</label>
                                                        <div className="flex gap-2 items-center">
                                                            <div className="flex-1">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="60"
                                                                    value={gameDetails[index].durationMin}
                                                                    onChange={(e) => updateGameDetail(index, 'durationMin', e.target.value)}
                                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none text-center"
                                                                    placeholder={t.admin.resultsPage.minutes}
                                                                />
                                                                <span className="text-xs text-gray-400 text-center block">{t.admin.resultsPage.minutes}</span>
                                                            </div>
                                                            <span className="text-gray-400 font-bold">:</span>
                                                            <div className="flex-1">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="59"
                                                                    value={gameDetails[index].durationSec}
                                                                    onChange={(e) => updateGameDetail(index, 'durationSec', Math.min(59, parseInt(e.target.value) || 0))}
                                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none text-center"
                                                                    placeholder={t.admin.resultsPage.seconds}
                                                                />
                                                                <span className="text-xs text-gray-400 text-center block">{t.admin.resultsPage.seconds}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* MVP Player Select */}
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">{t.admin.resultsPage.mvp}</label>
                                                        {winnerName && winnerRoster.length > 0 ? (
                                                            <select
                                                                value={gameDetails[index].mvpPlayer}
                                                                onChange={(e) => updateGameDetail(index, 'mvpPlayer', e.target.value)}
                                                                className="w-full p-2 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none"
                                                            >
                                                                <option value="">{t.admin.resultsPage.chooseMVP.replace('{team}', winnerName)}</option>
                                                                {winnerRoster.map(p => {
                                                                    const val = p.inGameName || p.name;
                                                                    const label = p.inGameName ? `${p.inGameName} (${p.name})` : p.name;
                                                                    return (
                                                                        <option key={p._id} value={val}>{label}</option>
                                                                    );
                                                                })}
                                                                <option value="Manual">{t.admin.resultsPage.typeManual}</option>
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                placeholder={t.admin.resultsPage.selectWinnerFirst}
                                                                disabled={!winnerName}
                                                                value={gameDetails[index].mvpPlayer}
                                                                onChange={(e) => updateGameDetail(index, 'mvpPlayer', e.target.value)}
                                                                className="w-full p-2 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none disabled:bg-gray-100"
                                                            />
                                                        )}
                                                        {gameDetails[index].mvpPlayer === 'Manual' && (
                                                            <input
                                                                type="text"
                                                                placeholder={t.admin.resultsPage.typeInGameName}
                                                                value=""
                                                                onChange={(e) => updateGameDetail(index, 'mvpPlayer', e.target.value)}
                                                                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none"
                                                                autoFocus
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Message is now handled by Toast */}

                            <button
                                type="submit"
                                disabled={loading || (!isByeWin && Number(formData.scoreBlue) === 0 && Number(formData.scoreRed) === 0) || (isByeWin && !byeWinner)}
                                className="w-full bg-gradient-to-r from-cyan-aura to-blue-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-circle-notch fa-spin"></i>
                                        {t.admin.resultsPage.saving}
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save"></i>
                                        {t.admin.resultsPage.saveResult}
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Player Stats Modal */}
            {
                editingGameIndex !== null && (
                    <GameStatsModal
                        isOpen={isStatsModalOpen}
                        token={token}
                        onClose={() => setIsStatsModalOpen(false)}
                        teamBlue={formData.teamBlue}
                        teamRed={formData.teamRed}
                        gameNumber={editingGameIndex + 1}
                        initialData={gamesStats[editingGameIndex]}
                        onSave={handleStatsSave}
                        allPlayers={allPlayers}
                        allHeroes={allHeroes}
                    />
                )
            }
        </div >
    );
}
