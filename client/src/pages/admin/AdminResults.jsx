import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { postResult } from '../../services/api';

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

    const dayData = schedule.find(r => r.day === selectedDay);
    const dayMatches = dayData?.matches || [];

    const handleMatchSelect = (match) => {
        setFormData({
            teamBlue: match.blue,
            teamRed: match.red,
            scoreBlue: 0,
            scoreRed: 0,
        });
        setMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await postResult({
                matchDay: selectedDay,
                ...formData,
                scoreBlue: parseInt(formData.scoreBlue),
                scoreRed: parseInt(formData.scoreRed),
            }, token);

            setMessage({ type: 'success', text: 'บันทึกผลการแข่งขันสำเร็จ!' });
            setFormData({ teamBlue: '', teamRed: '', scoreBlue: 0, scoreRed: 0 });

            // Reload page to refresh data
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            setMessage({ type: 'error', text: `เกิดข้อผิดพลาด: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const getMatchResult = (match) => {
        const matchKey = `${selectedDay}_${match.blue}_vs_${match.red}`.replace(/\s+/g, '');
        return results.find(r => r.matchId === matchKey);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-display font-bold text-uefa-dark uppercase">
                        <i className="fas fa-trophy mr-2 text-cyan-aura"></i>
                        จัดการผลการแข่งขัน
                    </h2>
                </div>

                <div className="p-6">
                    {/* Match Day Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">เลือก Match Day</label>
                        <div className="flex flex-wrap gap-2">
                            {schedule.map(round => (
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
                            ))}
                        </div>
                    </div>

                    {/* Matches List */}
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
                                            <span className="font-bold">{match.blue}</span>
                                            <span className="text-gray-400">vs</span>
                                            <span className="font-bold">{match.red}</span>
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

                    {/* Score Form */}
                    {formData.teamBlue && (
                        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6">
                            <h3 className="font-bold text-lg mb-4 text-center">
                                {formData.teamBlue} <span className="text-gray-400 mx-2">vs</span> {formData.teamRed}
                            </h3>

                            <div className="flex items-center justify-center gap-6 mb-6">
                                <div className="text-center">
                                    <label className="block text-sm text-gray-600 mb-2">{formData.teamBlue}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="3"
                                        value={formData.scoreBlue}
                                        onChange={(e) => setFormData({ ...formData, scoreBlue: e.target.value })}
                                        className="w-20 h-20 text-center text-3xl font-bold border-2 border-gray-300 rounded-xl focus:border-cyan-aura focus:outline-none"
                                    />
                                </div>
                                <div className="text-4xl text-gray-300 font-bold">-</div>
                                <div className="text-center">
                                    <label className="block text-sm text-gray-600 mb-2">{formData.teamRed}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="3"
                                        value={formData.scoreRed}
                                        onChange={(e) => setFormData({ ...formData, scoreRed: e.target.value })}
                                        className="w-20 h-20 text-center text-3xl font-bold border-2 border-gray-300 rounded-xl focus:border-cyan-aura focus:outline-none"
                                    />
                                </div>
                            </div>

                            {message && (
                                <div className={`mb-4 p-3 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                                    {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-cyan-aura text-uefa-dark font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
