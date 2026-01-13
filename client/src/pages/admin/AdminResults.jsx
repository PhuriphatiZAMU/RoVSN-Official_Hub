import { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import GameStatsModal from '../../components/admin/GameStatsModal';
import { postSchedule, resetResults, deleteMatchResult } from '../../services/api';

const STAGE_MAPPING = {
    90: 'Semi-Finals',
    99: 'Grand Final'
};

export default function AdminResults() {
    const { schedule, results, teams } = useData();
    const { token } = useAuth();

    // Initialize selectedDay from localStorage if available, otherwise default to 1
    const [selectedDay, setSelectedDay] = useState(() => {
        const savedDay = localStorage.getItem('admin_selected_day');
        // Check for magic numbers (90/99) or normal days
        return savedDay ? parseInt(savedDay) : 1;
    });

    const handleDayChange = (day) => {
        setSelectedDay(day);
        localStorage.setItem('admin_selected_day', day);
        setFormData({ teamBlue: '', teamRed: '', scoreBlue: 0, scoreRed: 0 });
    };
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({
        teamBlue: '',
        teamRed: '',
        scoreBlue: 0,
        scoreRed: 0,
    });

    // Game Details for Statistics
    const [gameDetails, setGameDetails] = useState([
        { gameNumber: 1, winner: '', duration: 15, mvpPlayer: '', mvpTeam: '' },
        { gameNumber: 2, winner: '', duration: 15, mvpPlayer: '', mvpTeam: '' },
        { gameNumber: 3, winner: '', duration: 15, mvpPlayer: '', mvpTeam: '' },
    ]);

    // Player Stats State
    const [gamesStats, setGamesStats] = useState({}); // { 0: { blue: [], red: [] }, ... }
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [editingGameIndex, setEditingGameIndex] = useState(null);

    const [showAdvanced, setShowAdvanced] = useState(false);

    const envUrl = import.meta.env.VITE_API_URL || '';
    const API_BASE_URL = envUrl ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`) : '/api';
    const dayData = schedule.find(r => parseInt(r.day) === parseInt(selectedDay));
    const dayMatches = dayData?.matches || [];
    const isBO5 = parseInt(selectedDay) >= 90;
    const { standings } = useData();

    // Custom Confirm Modal State
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, title: '', details: '', dateInput: false });
    const [generatedDate, setGeneratedDate] = useState('');

    // --- NEW: Player Pool Data for Auto-complete ---
    const [allPlayers, setAllPlayers] = useState([]);

    useEffect(() => {
        const fetchPlayersPool = async () => {
            try {
                // Fetch players (no auth specific check needed for GET usually, but added if protected)
                const res = await fetch(`${API_BASE_URL}/api/players`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAllPlayers(data);
                }
            } catch (err) {
                console.error("Failed to load player pool:", err);
            }
        };
        if (token) fetchPlayersPool();
    }, [API_BASE_URL, token]);

    const handleDeleteResult = (match, e) => {
        e.stopPropagation();
        const matchKey = `${selectedDay}_${match.blue}_vs_${match.red}`.replace(/\s+/g, '');

        setConfirmModal({
            isOpen: true,
            type: 'delete',
            title: 'ยืนยันการลบผลการแข่งขัน',
            details: `คุณต้องการลบผลการแข่งขันคู่:\n${match.blue} vs ${match.red}\nใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
            data: matchKey
        });
    };

    // 1. Prepare & Open Modal
    const handleGenerateClick = (type) => {
        setGeneratedDate(''); // Reset date
        if (type === 'semi') {
            if (standings.length < 4) {
                alert(`ไม่สามารถสร้างได้: พบเพียง ${standings.length} ทีม (ต้องการอย่างน้อย 4 ทีม)`);
                return;
            }
            const top4 = standings.slice(0, 4);
            const details = top4.map((t, i) => `${i + 1}. ${t.name} (${t.pts} แต้ม)`).join('\n');
            setConfirmModal({
                isOpen: true,
                type: 'semi',
                title: 'สร้างการแข่งขันรอบ Semi-Finals',
                details: `ระบบจะจับคู่ 4 ทีมที่มีคะแนนสูงสุดดังนี้:\n\n${details}\n\nกรุณาเลือกวันที่แข่งขันด้านล่าง`,
                dateInput: true
            });
        } else if (type === 'final') {
            const semiMatches = schedule.find(s => parseInt(s.day) === 90)?.matches;
            if (!semiMatches) {
                alert('ไม่พบตารางแข่งรอบ Semi-Finals');
                return;
            }
            // Check results logic...
            const getWinner = (blue, red) => {
                const matchKey = `90_${blue}_vs_${red}`.replace(/\s+/g, '');
                const res = results.find(r => r.matchId === matchKey);
                return res ? res.winner : null;
            };
            const getLoser = (blue, red) => {
                const matchKey = `90_${blue}_vs_${red}`.replace(/\s+/g, '');
                const res = results.find(r => r.matchId === matchKey);
                return res ? res.loser : null;
            };
            const winner1 = getWinner(semiMatches[0].blue, semiMatches[0].red);
            const winner2 = getWinner(semiMatches[1].blue, semiMatches[1].red);
            const loser1 = getLoser(semiMatches[0].blue, semiMatches[0].red);
            const loser2 = getLoser(semiMatches[1].blue, semiMatches[1].red);

            if (!winner1 || !winner2) {
                alert('ผลการแข่งขันรอบ Semi-Finals ยังไม่ครบ');
                return;
            }
            setConfirmModal({
                isOpen: true,
                type: 'final',
                title: 'สร้างการแข่งขันรอบ Finals',
                details: `คู่ชิงชนะเลิศ: ${winner1} vs ${winner2}\nคู่ชิงที่ 3: ${loser1} vs ${loser2}`,
                dateInput: true
            });
        }
    };

    // Helper: Check Completion
    const isRegularSeasonComplete = useMemo(() => {
        // Check Days 1-9
        for (let d = 1; d <= 9; d++) {
            const daySch = schedule.find(s => parseInt(s.day) === d);
            if (!daySch || !daySch.matches) continue; // If no schedule for this day, skip or strict? Let's say skip if not defined.

            // Check if all matches in this day have results
            const allMatchesDone = daySch.matches.every(m => {
                const matchKey = `${d}_${m.blue}_vs_${m.red}`.replace(/\s+/g, '');
                return results.some(r => r.matchId === matchKey);
            });

            if (!allMatchesDone) return false;
        }
        return true;
    }, [schedule, results]);

    const isSemiFinalsComplete = useMemo(() => {
        const semiSch = schedule.find(s => parseInt(s.day) === 90);
        if (!semiSch || !semiSch.matches) return false;

        return semiSch.matches.every(m => {
            const matchKey = `90_${m.blue}_vs_${m.red}`.replace(/\s+/g, '');
            const res = results.find(r => r.matchId === matchKey);
            return !!res && !!res.winner; // Must have winner
        });
    }, [schedule, results]);



    // Helper Format Date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // 2. Execute Action
    const executeGeneration = async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));

        // CASE: DELETE RESULT
        if (confirmModal.type === 'delete') {
            try {
                setLoading(true);
                await deleteMatchResult(confirmModal.data, token);
                alert('ลบผลการแข่งขันเรียบร้อย');
                window.location.reload();
            } catch (err) {
                alert(`ลบไม่สำเร็จ: ${err.message}`);
            } finally {
                setLoading(false);
            }
            return;
        }

        const formattedDate = generatedDate ? formatDate(generatedDate) : '';

        let newSchedule = null;
        let successMsg = '';
        let targetDay = '';

        if (confirmModal.type === 'semi') {
            const top4 = standings.slice(0, 4);
            const semiMatches = [
                { blue: top4[0].name, red: top4[1].name, date: formattedDate },
                { blue: top4[2].name, red: top4[3].name, date: formattedDate }
            ];
            newSchedule = {
                teams: teams,
                schedule: [
                    ...schedule.filter(s => parseInt(s.day) !== 90),
                    { day: 90, date: formattedDate || 'Semi-Finals', matches: semiMatches }
                ]
            };
            successMsg = 'สร้างตาราง Semi-Finals เรียบร้อย!';
            targetDay = '90';

        } else if (confirmModal.type === 'final') {
            // Logic repeated slightly but safer to re-calc or just grab from context again? 
            // Ideally we should have stored calculated matches in state, but re-calc is cheap here.
            const semiMatches = schedule.find(s => parseInt(s.day) === 90)?.matches;
            const getWinner = (blue, red) => results.find(r => r.matchId === `90_${blue}_vs_${red}`.replace(/\s+/g, ''))?.winner;
            const getLoser = (blue, red) => results.find(r => r.matchId === `90_${blue}_vs_${red}`.replace(/\s+/g, ''))?.loser;

            const winner1 = getWinner(semiMatches[0].blue, semiMatches[0].red);
            const winner2 = getWinner(semiMatches[1].blue, semiMatches[1].red);
            const loser1 = getLoser(semiMatches[0].blue, semiMatches[0].red);
            const loser2 = getLoser(semiMatches[1].blue, semiMatches[1].red);

            const finalMatches = [
                { blue: loser1, red: loser2, date: formattedDate ? `${formattedDate} (3rd)` : '3rd Place' },
                { blue: winner1, red: winner2, date: formattedDate ? `${formattedDate} (Final)` : 'Grand Final' }
            ];
            newSchedule = {
                teams: teams,
                schedule: [
                    ...schedule.filter(s => parseInt(s.day) !== 99),
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
                        await resetResults(targetDay, token);
                        console.log(`Results for day ${targetDay} cleared.`);
                    } catch (e) {
                        console.warn(`Warning: Could not clear old results: ${e.message}`);
                    }
                }

                await postSchedule(newSchedule, token);
                alert(`${successMsg} ระบบจะรีเฟรชหน้าจอใน 2 วินาที...`);
                localStorage.setItem('admin_selected_day', targetDay);
                setTimeout(() => window.location.reload(), 2000);
            } catch (err) {
                alert(`Failed: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleMatchSelect = (match) => {
        // Recalculate isBO5 based on CURRENT selectedDay
        // Note: 'isBO5' variable from outer scope might be stale if selectedDay changed recently?
        // Better to check explicitly against selectedDay state
        const checkBO5 = parseInt(selectedDay) >= 90;

        setFormData({
            teamBlue: match.blue,
            teamRed: match.red,
            scoreBlue: 0,
            scoreRed: 0,
        });

        setGameDetails([
            { gameNumber: 1, winner: '', duration: 15, mvpPlayer: '', mvpTeam: '' },
            { gameNumber: 2, winner: '', duration: 15, mvpPlayer: '', mvpTeam: '' },
            { gameNumber: 3, winner: '', duration: 15, mvpPlayer: '', mvpTeam: '' },
            { gameNumber: 4, winner: '', duration: 15, mvpPlayer: '', mvpTeam: '' },
            { gameNumber: 5, winner: '', duration: 15, mvpPlayer: '', mvpTeam: '' },
        ].slice(0, checkBO5 ? 5 : 3));

        setGamesStats({});
        setMessage(null);
    };

    const updateGameDetail = (index, field, value) => {
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

    const openStatsModal = (index) => {
        setEditingGameIndex(index);
        setIsStatsModalOpen(true);
    };

    const handleStatsSave = (stats) => {
        setGamesStats(prev => ({
            ...prev,
            [editingGameIndex]: stats
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const scoreBlue = parseInt(formData.scoreBlue);
            const scoreRed = parseInt(formData.scoreRed);

            // Prepare game details (filter only played games)
            const playedGames = gameDetails.filter(g => g.winner !== '').map(g => ({
                gameNumber: g.gameNumber,
                winner: g.winner,
                loser: g.winner === formData.teamBlue ? formData.teamRed : formData.teamBlue,
                duration: parseInt(g.duration) || 15,
                mvpPlayer: g.mvpPlayer,
                mvpTeam: g.mvpTeam || g.winner,
            }));

            // 1. Save Match Result
            const response = await fetch(`${API_BASE_URL}/api/results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    matchDay: selectedDay,
                    teamBlue: formData.teamBlue,
                    teamRed: formData.teamRed,
                    scoreBlue,
                    scoreRed,
                    gameDetails: playedGames,
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save result');
            }

            // 2. Save Player Stats (if any)
            const matchId = `${selectedDay}_${formData.teamBlue}_vs_${formData.teamRed}`.replace(/\s+/g, '');
            const allStats = [];

            Object.keys(gamesStats).forEach(gameIndex => {
                const gameStat = gamesStats[gameIndex]; // { blue: [], red: [] }
                const gameNum = parseInt(gameIndex) + 1;

                if (gameStat.blue) {
                    gameStat.blue.forEach(p => {
                        if (p.name) allStats.push({
                            matchId,
                            gameNumber: gameNum,
                            teamName: formData.teamBlue,
                            playerName: p.name,
                            kills: p.k, deaths: p.d, assists: p.a,
                            damage: p.damage, damageTaken: p.damageTaken,
                            gold: p.gold || 0,
                            mvp: gameDetails[gameIndex]?.mvpPlayer === p.name, // Auto check MVP based on name match
                            gameDuration: parseInt(gameDetails[gameIndex]?.duration) || 15,
                            win: gameDetails[gameIndex]?.winner === formData.teamBlue
                        });
                    });
                }
                if (gameStat.red) {
                    gameStat.red.forEach(p => {
                        if (p.name) allStats.push({
                            matchId,
                            gameNumber: gameNum,
                            teamName: formData.teamRed,
                            playerName: p.name,
                            kills: p.k, deaths: p.d, assists: p.a,
                            damage: p.damage, damageTaken: p.damageTaken,
                            gold: p.gold || 0,
                            mvp: gameDetails[gameIndex]?.mvpPlayer === p.name,
                            gameDuration: parseInt(gameDetails[gameIndex]?.duration) || 15,
                            win: gameDetails[gameIndex]?.winner === formData.teamRed
                        });
                    });
                }
            });

            if (allStats.length > 0) {
                await fetch(`${API_BASE_URL}/api/stats`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(allStats)
                });
            }

            setMessage({ type: 'success', text: '✅ บันทึกผลการแข่งขันและสถิติสำเร็จ!' });
            setFormData({ teamBlue: '', teamRed: '', scoreBlue: 0, scoreRed: 0 });
            setGameDetails([
                { gameNumber: 1, winner: '', duration: 15, mvpPlayer: '', mvpTeam: '' },
                { gameNumber: 2, winner: '', duration: 15, mvpPlayer: '', mvpTeam: '' },
                { gameNumber: 3, winner: '', duration: 15, mvpPlayer: '', mvpTeam: '' },
            ]);
            setGamesStats({});

            // Reload page
            localStorage.setItem('admin_selected_day', selectedDay);
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            setMessage({ type: 'error', text: `❌ ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const getMatchResult = (match) => {
        const matchKey = `${selectedDay}_${match.blue}_vs_${match.red}`.replace(/\s+/g, '');
        return results.find(r => r.matchId === matchKey);
    };

    // Calculate total games needed based on BO3 or BO5
    const winningScore = isBO5 ? 3 : 2;
    const totalGamesNeeded = Math.max(formData.scoreBlue, formData.scoreRed) >= winningScore
        ? parseInt(formData.scoreBlue) + parseInt(formData.scoreRed)
        : (isBO5 ? 5 : 3);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-display font-bold text-uefa-dark uppercase">
                        <i className="fas fa-trophy mr-2 text-cyan-aura"></i>
                        จัดการผลการแข่งขัน
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">บันทึกผลและรายละเอียดเกมสำหรับ Statistics</p>
                </div>

                <div className="p-6">
                    {/* Match Day Selector */}

                    {/* Match Day Selector & Generators */}
                    <div className="mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">เลือก Match Day / รอบการแข่งขัน</label>
                            <div className="flex flex-wrap gap-2">
                                {schedule.length === 0 ? (
                                    <p className="text-gray-500 text-sm">
                                        <i className="fas fa-info-circle mr-1"></i>
                                        ยังไม่มีตารางแข่งขัน
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
                                title={!isRegularSeasonComplete ? "ต้องบันทึกผลการแข่งขันรอบเก็บคะแนน (Day 1-9) ให้ครบถ้วนก่อน" : ""}
                            >
                                <i className="fas fa-random mr-1"></i> สร้าง Semi-Finals
                            </button>
                            <button
                                type="button"
                                onClick={() => handleGenerateClick('final')}
                                disabled={!isSemiFinalsComplete}
                                className={`px-3 py-2 border rounded-lg text-sm font-bold flex items-center transition-colors ${isSemiFinalsComplete
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    }`}
                                title={!isSemiFinalsComplete ? "ต้องบันทึกผลการแข่งขันรอบ Semi-Finals ให้ครบถ้วนก่อน" : ""}
                            >
                                <i className="fas fa-trophy mr-1"></i> สร้าง Grand Final
                            </button>
                        </div>
                    </div>

                    {/* Matches List */}
                    {dayMatches.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">เลือกแมตช์</label>
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
                                            {result ? (
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-green-500 text-white px-3 py-1 rounded font-bold">
                                                        {result.scoreBlue} - {result.scoreRed}
                                                    </span>
                                                    <div
                                                        onClick={(e) => handleDeleteResult(match, e)}
                                                        className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                                        title="ลบผลการแข่งขัน"
                                                    >
                                                        <i className="fas fa-trash-alt text-sm"></i>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">ยังไม่มีผล</span>
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

                            {/* Quick Score Input */}
                            <div className="flex items-center justify-center gap-6 mb-6">
                                <div className="text-center">
                                    <label className="block text-sm text-gray-600 mb-2">{formData.teamBlue}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={isBO5 ? 3 : 2}
                                        value={formData.scoreBlue}
                                        onChange={(e) => setFormData({ ...formData, scoreBlue: e.target.value })}
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
                                        onChange={(e) => setFormData({ ...formData, scoreRed: e.target.value })}
                                        className="w-20 h-20 text-center text-3xl font-bold border-2 border-red-300 bg-red-50 rounded-xl focus:border-cyan-aura focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Advanced Details Toggle */}
                            <div className="mb-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-cyan-aura transition-colors py-2"
                                >
                                    <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'}`}></i>
                                    {showAdvanced ? 'ซ่อนรายละเอียดเกม' : 'แสดงรายละเอียดเกม (สำหรับ Statistics)'}
                                </button>
                            </div>

                            {/* Game Details */}
                            {showAdvanced && (
                                <div className="space-y-4 mb-6 p-4 bg-white rounded-lg border border-gray-200">

                                    <h4 className="font-bold text-gray-700">
                                        <i className="fas fa-gamepad mr-2 text-cyan-aura"></i>
                                        รายละเอียดแต่ละเกม ({isBO5 ? 'Best of 5' : 'Best of 3'})
                                    </h4>

                                    {/* Render BO3 (3 games) or BO5 (5 games) */}
                                    {Array(isBO5 ? 5 : 3).fill(0).map((_, i) => i).map((index) => {
                                        const winnerName = gameDetails[index].winner;
                                        // Filter MVP candidates based on winner (or both teams if unknown, but better unknown)
                                        const winnerRoster = winnerName ? allPlayers.filter(p => p.team === winnerName) : [];

                                        return (
                                            <div key={index} className={`p-4 rounded-lg border ${gameDetails[index].winner ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 h-8 bg-cyan-aura text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                            {index + 1}
                                                        </span>
                                                        <span className="font-bold text-gray-700">เกมที่ {index + 1}</span>
                                                        {index + 1 > totalGamesNeeded && (
                                                            <span className="text-xs text-gray-400">(ไม่จำเป็น)</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => openStatsModal(index)}
                                                        className={`text-sm px-3 py-1 rounded border transition-colors ${gamesStats[index]
                                                            ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                                            : 'bg-white text-gray-500 border-gray-300 hover:text-cyan-aura hover:border-cyan-aura'}`}
                                                    >
                                                        <i className={`fas ${gamesStats[index] ? 'fa-check-circle' : 'fa-chart-bar'} mr-1`}></i>
                                                        {gamesStats[index] ? 'บันทึกสถิติแล้ว' : 'บันทึกสถิติผู้เล่น'}
                                                    </button>
                                                </div>

                                                <div className="grid md:grid-cols-3 gap-3">
                                                    {/* Winner Selection */}
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">ผู้ชนะ</label>
                                                        <select
                                                            value={gameDetails[index].winner}
                                                            onChange={(e) => updateGameDetail(index, 'winner', e.target.value)}
                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none"
                                                        >
                                                            <option value="">-- เลือก --</option>
                                                            <option value={formData.teamBlue}>{formData.teamBlue}</option>
                                                            <option value={formData.teamRed}>{formData.teamRed}</option>
                                                        </select>
                                                    </div>

                                                    {/* Duration */}
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">ระยะเวลา (นาที)</label>
                                                        <input
                                                            type="number"
                                                            min="5"
                                                            max="60"
                                                            value={gameDetails[index].duration}
                                                            onChange={(e) => updateGameDetail(index, 'duration', e.target.value)}
                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none"
                                                        />
                                                    </div>

                                                    {/* MVP Player Select */}
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">MVP (ชื่อในเกม)</label>
                                                        {winnerName && winnerRoster.length > 0 ? (
                                                            <select
                                                                value={gameDetails[index].mvpPlayer}
                                                                onChange={(e) => updateGameDetail(index, 'mvpPlayer', e.target.value)}
                                                                className="w-full p-2 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none"
                                                            >
                                                                <option value="">-- เลือก MVP ({winnerName}) --</option>
                                                                {winnerRoster.map(p => {
                                                                    const val = p.inGameName || p.name;
                                                                    const label = p.inGameName ? `${p.inGameName} (${p.name})` : p.name;
                                                                    return (
                                                                        <option key={p._id} value={val}>{label}</option>
                                                                    );
                                                                })}
                                                                <option value="Manual">-- พิมพ์เอง --</option>
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                placeholder="เลือกทีมชนะก่อน..."
                                                                disabled={!winnerName}
                                                                value={gameDetails[index].mvpPlayer}
                                                                onChange={(e) => updateGameDetail(index, 'mvpPlayer', e.target.value)}
                                                                className="w-full p-2 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none disabled:bg-gray-100"
                                                            />
                                                        )}
                                                        {gameDetails[index].mvpPlayer === 'Manual' && (
                                                            <input
                                                                type="text"
                                                                placeholder="พิมพ์ชื่อในเกม..."
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

                            {message && (
                                <div className={`mb-4 p-3 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                // Logic for enabling submit button: must implement more complex check for BO5 if needed, but for now simple check is ok
                                disabled={loading || (parseInt(formData.scoreBlue) === 0 && parseInt(formData.scoreRed) === 0)}
                                className="w-full bg-gradient-to-r from-cyan-aura to-blue-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-circle-notch fa-spin"></i>
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save"></i>
                                        บันทึกผลการแข่งขัน
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Player Stats Modal */}
            <GameStatsModal
                isOpen={isStatsModalOpen}
                onClose={() => setIsStatsModalOpen(false)}
                teamBlue={formData.teamBlue}
                teamRed={formData.teamRed}
                gameNumber={editingGameIndex + 1}
                initialData={gamesStats[editingGameIndex]}
                onSave={handleStatsSave}
                allPlayers={allPlayers}
            />



            {/* Custom Confirm Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-aura to-blue-600 p-4">
                            <h3 className="text-white font-bold text-lg">
                                <i className="fas fa-question-circle mr-2"></i>
                                {confirmModal.title}
                            </h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">{confirmModal.details}</p>

                            {confirmModal.dateInput && (
                                <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <i className="fas fa-calendar-alt mr-2 text-cyan-aura"></i>
                                        เลือกวันที่แข่งขัน
                                    </label>
                                    <input
                                        type="date"
                                        value={generatedDate}
                                        onChange={(e) => setGeneratedDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">วันที่นี้จะถูกแสดงในตารางแข่งขัน</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={executeGeneration}
                                disabled={confirmModal.dateInput && !generatedDate}
                                className="px-4 py-2 bg-cyan-aura text-uefa-dark font-bold rounded-lg shadow hover:shadow-cyan-aura/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ยืนยัน / ดำเนินการ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
