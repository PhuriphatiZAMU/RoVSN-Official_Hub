'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { apiService } from '@/lib/api-client';
import GameStatsModal from '@/components/admin/GameStatsModal';

// Types
interface PlayerStats {
    name: string;
    hero: string;
    k: number;
    d: number;
    a: number;
    gold: number;
}

interface GameStatsData {
    blue: PlayerStats[];
    red: PlayerStats[];
}

interface Match {
    blue: string;
    red: string;
    matchId?: string; // Generated on the fly usually
}

interface MatchResult {
    matchId: string;
    blueTeam: string;
    redTeam: string;
    scoreBlue: number;
    scoreRed: number;
    winner: string;
    matchDate: string;
    mvp: string;
    duration: string;
    isByeWin?: boolean;
}

export default function AdminResultsPage() {
    const { t } = useLanguage();
    const [schedule, setSchedule] = useState<{ day: number; matches: Match[] }[]>([]);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [matchId, setMatchId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Form Data
    const [formData, setFormData] = useState<Partial<MatchResult>>({
        scoreBlue: 0,
        scoreRed: 0,
        mvp: '',
        duration: '',
        isByeWin: false
    });

    // Game Stats Management
    // We can store an array of stats if BO3/BO5, but typical implementation here seems to be per-game or simplified.
    // Based on previous code, it seems to handle one set of stats per match entry or maybe per game?
    // The previous code had `gameStats` array.
    const [gameStats, setGameStats] = useState<GameStatsData[]>([]);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [editingGameIndex, setEditingGameIndex] = useState<number>(0);
    const [allPlayers, setAllPlayers] = useState<any[]>([]);
    const [allHeroes, setAllHeroes] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [scheduleData, playersData, heroesData] = await Promise.all([
                    apiService.getSchedule(),
                    apiService.getPlayers(),
                    apiService.getHeroes()
                ]);

                // Handle schedule structure
                const scheduleList = (scheduleData as any).schedule || scheduleData || [];
                setSchedule(scheduleList);
                setAllPlayers(playersData || []);
                setAllHeroes(heroesData || []);

                if (scheduleList.length > 0 && selectedDay === null) {
                    setSelectedDay(scheduleList[0]?.day || 1);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                Swal.fire({ icon: 'error', title: t.common.error });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const generateMatchId = (day: number, teamA: string, teamB: string) => {
        return `${day}_${teamA}_vs_${teamB}`.replace(/\s+/g, '');
    };

    const handleMatchSelect = async (match: Match, index: number) => {
        if (!selectedDay) return;
        const generatedId = generateMatchId(selectedDay, match.blue, match.red);

        setSelectedMatch(match);
        setMatchId(generatedId);
        setFormData({ scoreBlue: 0, scoreRed: 0, mvp: '', duration: '', isByeWin: false });
        setGameStats([]);

        // Try to load existing result details if they exist (to fill stats?)
        // Assuming we start fresh or load basic confirmation.
        // If we want to edit existing results, we'd query API here.
        // For now, let's assume we are entering new results or overwriting.
        try {
            // Check if result exists (Optional enhancement)
            const results = await apiService.getResults();
            const existing = results.find(r => r.matchId === generatedId);
            if (existing) {
                setFormData({
                    scoreBlue: existing.scoreBlue,
                    scoreRed: existing.scoreRed,
                    mvp: existing.mvp || '',
                    duration: (existing as any).duration || '',
                    isByeWin: existing.isByeWin || false
                });

                // If the API supported getting full game stats for a match, we would load them here.
                // const stats = await apiService.getMatchStats(generatedId);
                // if (stats) setGameStats(stats);
            }
        } catch (e) {
            console.log('No existing result found or error loading it.');
        }
    };

    const handleStatSave = (data: GameStatsData) => {
        setGameStats(prev => {
            const newStats = [...prev];
            newStats[editingGameIndex] = data;
            return newStats;
        });
        Swal.fire({
            icon: 'success',
            title: 'บันทึกสถิติเรียบร้อย',
            timer: 1500,
            showConfirmButton: false
        });
    };

    const openStatsModal = (gameIndex: number) => {
        setEditingGameIndex(gameIndex);
        setIsStatsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMatch || !selectedDay) return;

        const winner = formData.isByeWin
            ? formData.scoreBlue! > formData.scoreRed! ? selectedMatch.blue : selectedMatch.red
            : formData.scoreBlue! > formData.scoreRed! ? selectedMatch.blue :
                formData.scoreRed! > formData.scoreBlue! ? selectedMatch.red : 'Draw';

        const resultData = {
            matchId,
            blueTeam: selectedMatch.blue,
            redTeam: selectedMatch.red,
            scoreBlue: formData.scoreBlue,
            scoreRed: formData.scoreRed,
            winner,
            matchDate: new Date().toISOString(),
            mvp: formData.mvp,
            duration: formData.duration,
            isByeWin: formData.isByeWin
        };

        try {
            Swal.fire({
                title: 'Updating...',
                didOpen: () => Swal.showLoading()
            });

            // 1. Create/Update Result
            await apiService.createResult(resultData);

            // 2. Save Game Stats
            if (gameStats.length > 0) {
                // Flatten stats or send as is? 
                // The API expect `saveGameStats(stats: unknown[])`.
                // We need to format it as the backend expects.
                // Assuming backend expects array of objects with matchId, gameNumber, stats.
                const formattedStats = gameStats.map((game, idx) => ({
                    matchId,
                    gameNumber: idx + 1,
                    blueTeam: selectedMatch.blue,
                    redTeam: selectedMatch.red,
                    stats: {
                        blue: game.blue,
                        red: game.red
                    }
                }));

                await apiService.saveGameStats(formattedStats);
            }

            Swal.fire({
                icon: 'success',
                title: 'บันทึกผลการแข่งขันสำเร็จ',
                timer: 2000
            });

            // Reload schedule/results?
            // setMatchId('');
            // setSelectedMatch(null);

        } catch (error: any) {
            console.error('Save Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error.response?.data?.error || error.message
            });
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const currentMatches = schedule.find(d => d.day === selectedDay)?.matches || [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold text-uefa-dark">
                <i className="fas fa-trophy mr-3 text-cyan-aura"></i>
                บันทึกผลการแข่งขัน
            </h1>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Schedule Selection */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">เลือกวันแข่งขัน</label>
                        <div className="flex flex-wrap gap-2">
                            {schedule.map(d => (
                                <button
                                    key={d.day}
                                    onClick={() => {
                                        setSelectedDay(d.day);
                                        setSelectedMatch(null);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedDay === d.day
                                        ? 'bg-cyan-aura text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Day {d.day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <h3 className="font-bold text-gray-700 mb-3">เลือกคู่แข่งขัน</h3>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {currentMatches.map((match, idx) => {
                                const mId = selectedDay ? generateMatchId(selectedDay, match.blue, match.red) : '';
                                const isSelected = mId === matchId;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleMatchSelect(match, idx)}
                                        className={`w-full p-3 rounded-lg border transition-all text-left group ${isSelected
                                            ? 'border-cyan-aura bg-cyan-50 ring-1 ring-cyan-aura'
                                            : 'border-gray-100 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between text-sm">
                                            <span className={`font-bold ${isSelected ? 'text-cyan-700' : 'text-gray-700'}`}>
                                                {match.blue}
                                            </span>
                                            <span className="text-xs text-gray-400">vs</span>
                                            <span className={`font-bold ${isSelected ? 'text-red-700' : 'text-gray-700'}`}>
                                                {match.red}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                            {currentMatches.length === 0 && (
                                <p className="text-center text-gray-400 py-4">ไม่มีแมตช์ในวันนี้</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Result Entry */}
                <div className="lg:col-span-2">
                    {selectedMatch ? (
                        <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
                            <div className="border-b pb-4 mb-6">
                                <h2 className="text-xl font-bold flex items-center justify-center gap-4 text-uefa-dark">
                                    <span className="text-blue-600">{selectedMatch.blue}</span>
                                    <span className="text-gray-400 text-sm">VS</span>
                                    <span className="text-red-600">{selectedMatch.red}</span>
                                </h2>
                                <p className="text-center text-xs text-gray-400 mt-1">ID: {matchId}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Score Input */}
                                <div className="grid grid-cols-2 gap-8 justify-center">
                                    <div className="text-center">
                                        <label className="block text-sm font-bold text-blue-600 mb-2">Score {selectedMatch.blue}</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.scoreBlue}
                                            onChange={(e) => setFormData({ ...formData, scoreBlue: parseInt(e.target.value) || 0 })}
                                            className="w-24 h-16 text-3xl font-bold text-center border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <label className="block text-sm font-bold text-red-600 mb-2">Score {selectedMatch.red}</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.scoreRed}
                                            onChange={(e) => setFormData({ ...formData, scoreRed: parseInt(e.target.value) || 0 })}
                                            className="w-24 h-16 text-3xl font-bold text-center border-2 border-red-100 rounded-xl focus:border-red-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="flex flex-wrap gap-4 items-center justify-center bg-gray-50 p-4 rounded-lg">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isByeWin}
                                            onChange={(e) => setFormData({ ...formData, isByeWin: e.target.checked })}
                                            className="w-5 h-5 text-cyan-aura rounded focus:ring-cyan-aura"
                                        />
                                        <span className="font-bold text-gray-700">ชนะบาย (No Show)</span>
                                    </label>
                                </div>

                                {/* Details */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">MVP Player</label>
                                        <input
                                            type="text"
                                            value={formData.mvp}
                                            onChange={(e) => setFormData({ ...formData, mvp: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                                            placeholder="ระบุชื่อ MVP..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">Game Duration</label>
                                        <input
                                            type="text"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                                            placeholder="เช่น 15:30"
                                        />
                                    </div>
                                </div>

                                {/* Game Stats Buttons */}
                                {!formData.isByeWin && (
                                    <div className="border-t pt-4">
                                        <h3 className="font-bold text-gray-700 mb-3">บันทึกสถิติรายเกม (Game Stats)</h3>
                                        <div className="flex gap-3 overflow-x-auto pb-2">
                                            {[...Array(Math.max((formData.scoreBlue || 0) + (formData.scoreRed || 0), 1))].map((_, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => openStatsModal(i)}
                                                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold transition-all ${gameStats[i]
                                                        ? 'bg-green-50 border-green-500 text-green-700'
                                                        : 'bg-white border-dashed border-gray-300 text-gray-400 hover:border-cyan-aura hover:text-cyan-aura'
                                                        }`}
                                                >
                                                    <i className={`fas ${gameStats[i] ? 'fa-check' : 'fa-plus'}`}></i>
                                                    Game {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Submit Actions */}
                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMatch(null)}
                                        className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-gradient-to-r from-cyan-aura to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-aura/50 hover:scale-[1.02] transition-all"
                                    >
                                        บันทึกผลการแข่งขัน
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 p-12 text-gray-400">
                            <i className="fas fa-hand-pointer text-4xl mb-4 animate-bounce"></i>
                            <p>เลือกคู่แข่งขันจากรายการด้านซ้าย</p>
                            <p className="text-sm">เพื่อเริ่มบันทึกผลคะแนนและสถิติ</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedMatch && (
                <GameStatsModal
                    isOpen={isStatsModalOpen}
                    onClose={() => setIsStatsModalOpen(false)}
                    teamBlue={selectedMatch.blue}
                    teamRed={selectedMatch.red}
                    gameNumber={editingGameIndex + 1}
                    initialData={gameStats[editingGameIndex]}
                    onSave={handleStatSave}
                    allPlayers={allPlayers}
                    allHeroes={allHeroes}
                />
            )}
        </div>
    );
}
