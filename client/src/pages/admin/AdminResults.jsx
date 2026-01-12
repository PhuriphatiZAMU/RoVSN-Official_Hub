import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminResults() {
    const { schedule, results } = useData();
    const { token } = useAuth();

    const [selectedDay, setSelectedDay] = useState(1);
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

    const [showAdvanced, setShowAdvanced] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL || '';
    const dayData = schedule.find(r => r.day === selectedDay);
    const dayMatches = dayData?.matches || [];

    const handleMatchSelect = (match) => {
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
        ]);
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

        setGameDetails(newDetails);
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

            setMessage({ type: 'success', text: '✅ บันทึกผลการแข่งขันสำเร็จ!' });
            setFormData({ teamBlue: '', teamRed: '', scoreBlue: 0, scoreRed: 0 });

            // Reload page to refresh data
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

    // Calculate total games needed based on BO3
    const totalGamesNeeded = Math.max(formData.scoreBlue, formData.scoreRed) >= 2
        ? parseInt(formData.scoreBlue) + parseInt(formData.scoreRed)
        : 3;

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
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">เลือก Match Day</label>
                        <div className="flex flex-wrap gap-2">
                            {schedule.length === 0 ? (
                                <p className="text-gray-500 text-sm">
                                    <i className="fas fa-info-circle mr-1"></i>
                                    ยังไม่มีตารางแข่งขัน กรุณา<a href="/admin/draw" className="text-cyan-aura hover:underline">จับสลาก</a>ก่อน
                                </p>
                            ) : (
                                schedule.map(round => (
                                    <button
                                        key={round.day}
                                        onClick={() => { setSelectedDay(round.day); setFormData({ teamBlue: '', teamRed: '', scoreBlue: 0, scoreRed: 0 }); }}
                                        className={`px-4 py-2 rounded-lg font-bold transition-all ${round.day === selectedDay
                                            ? 'bg-cyan-aura text-uefa-dark'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Day {round.day}
                                    </button>
                                ))
                            )}
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
                                                <span className="bg-green-500 text-white px-3 py-1 rounded font-bold">
                                                    {result.scoreBlue} - {result.scoreRed}
                                                </span>
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
                                        max="2"
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
                                        max="2"
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
                                        รายละเอียดแต่ละเกม (Best of 3)
                                    </h4>

                                    {[0, 1, 2].map((index) => (
                                        <div key={index} className={`p-4 rounded-lg border ${gameDetails[index].winner ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="w-8 h-8 bg-cyan-aura text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                    {index + 1}
                                                </span>
                                                <span className="font-bold text-gray-700">เกมที่ {index + 1}</span>
                                                {index + 1 > totalGamesNeeded && (
                                                    <span className="text-xs text-gray-400">(ไม่จำเป็น)</span>
                                                )}
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

                                                {/* MVP Player */}
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">MVP (ชื่อผู้เล่น)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="ชื่อผู้เล่น MVP"
                                                        value={gameDetails[index].mvpPlayer}
                                                        onChange={(e) => updateGameDetail(index, 'mvpPlayer', e.target.value)}
                                                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {message && (
                                <div className={`mb-4 p-3 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
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
        </div>
    );
}
