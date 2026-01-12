import { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminDraw() {
    const { teams } = useData();
    const { token } = useAuth();

    const [isDrawing, setIsDrawing] = useState(false);
    const [drawComplete, setDrawComplete] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [matchDays, setMatchDays] = useState([]);
    const [displayedMatches, setDisplayedMatches] = useState([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const audioRef = useRef(null);

    // Round Robin Algorithm สำหรับ 10 ทีม
    const generateRoundRobin = (teamList) => {
        const n = teamList.length;
        const rounds = [];
        const teams = [...teamList];

        // ถ้าจำนวนคี่ให้เพิ่ม BYE
        if (n % 2 !== 0) {
            teams.push('BYE');
        }

        const numRounds = teams.length - 1;
        const halfSize = teams.length / 2;

        const teamIndexes = teams.map((_, i) => i).slice(1);

        for (let round = 0; round < numRounds; round++) {
            const roundMatches = [];
            const newIndexes = [0].concat(teamIndexes);

            for (let i = 0; i < halfSize; i++) {
                const home = teams[newIndexes[i]];
                const away = teams[newIndexes[newIndexes.length - 1 - i]];

                if (home !== 'BYE' && away !== 'BYE') {
                    roundMatches.push({
                        blue: home,
                        red: away,
                        time: '18:00'
                    });
                }
            }

            rounds.push({
                day: round + 1,
                date: getMatchDate(round + 1),
                matches: roundMatches
            });

            // Rotate
            teamIndexes.push(teamIndexes.shift());
        }

        return rounds;
    };

    // สร้างวันที่สำหรับแต่ละ Match Day
    const getMatchDate = (day) => {
        const startDate = new Date('2026-02-01');
        startDate.setDate(startDate.getDate() + (day - 1) * 7);
        return startDate.toISOString().split('T')[0];
    };

    // เริ่มจับสลาก
    const startDraw = () => {
        if (teams.length < 10) {
            setMessage({ type: 'error', text: 'ต้องมีทีมอย่างน้อย 10 ทีมถึงจะจับสลากได้' });
            return;
        }

        setIsDrawing(true);
        setDrawComplete(false);
        setCurrentStep(0);
        setDisplayedMatches([]);
        setMessage(null);

        // Shuffle teams
        const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
        const rounds = generateRoundRobin(shuffledTeams);
        setMatchDays(rounds);

        // Animate แสดงทีละคู่
        let step = 0;
        const allMatches = rounds.flatMap((r, dayIndex) =>
            r.matches.map(m => ({ ...m, day: dayIndex + 1 }))
        );

        const interval = setInterval(() => {
            if (step < allMatches.length) {
                setDisplayedMatches(prev => [...prev, allMatches[step]]);
                setCurrentStep(step + 1);
                step++;
            } else {
                clearInterval(interval);
                setIsDrawing(false);
                setDrawComplete(true);
            }
        }, 300);
    };

    // บันทึกลง Database
    const saveToFixtures = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || '';

            // ลบ schedule เก่า และเพิ่มใหม่
            for (const round of matchDays) {
                const response = await fetch(`${API_BASE_URL}/api/schedules`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(round)
                });

                if (!response.ok) {
                    throw new Error(`Failed to save Match Day ${round.day}`);
                }
            }

            setMessage({ type: 'success', text: '✅ บันทึกตารางแข่งขันเรียบร้อยแล้ว!' });
        } catch (error) {
            setMessage({ type: 'error', text: `❌ ${error.message}` });
        } finally {
            setSaving(false);
        }
    };

    // Reset
    const resetDraw = () => {
        setIsDrawing(false);
        setDrawComplete(false);
        setCurrentStep(0);
        setMatchDays([]);
        setDisplayedMatches([]);
        setMessage(null);
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm mb-8">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-display font-bold text-uefa-dark uppercase flex items-center gap-3">
                        <span className="w-12 h-12 bg-gradient-to-br from-cyan-aura to-blue-600 rounded-full flex items-center justify-center text-white">
                            <i className="fas fa-random"></i>
                        </span>
                        จับสลาก League Phase
                    </h2>
                    <p className="text-gray-500 mt-2">Round Robin - 10 ทีม พบกันหมด - 10 Match Days</p>
                </div>

                <div className="p-6">
                    {/* Teams Preview */}
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-700 mb-3">ทีมที่เข้าร่วม ({teams.length} ทีม)</h3>
                        <div className="flex flex-wrap gap-2">
                            {teams.map((team, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700"
                                >
                                    {team}
                                </span>
                            ))}
                        </div>
                        {teams.length < 10 && (
                            <p className="text-red-500 text-sm mt-2">
                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                ต้องมีทีมอย่างน้อย 10 ทีม (ปัจจุบันมี {teams.length} ทีม)
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        {!isDrawing && !drawComplete && (
                            <button
                                onClick={startDraw}
                                disabled={teams.length < 10}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-aura to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fas fa-dice"></i>
                                เริ่มจับสลาก
                            </button>
                        )}

                        {drawComplete && (
                            <>
                                <button
                                    onClick={saveToFixtures}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
                                >
                                    {saving ? (
                                        <><i className="fas fa-circle-notch fa-spin"></i> กำลังบันทึก...</>
                                    ) : (
                                        <><i className="fas fa-save"></i> บันทึกตารางแข่งขัน</>
                                    )}
                                </button>
                                <button
                                    onClick={resetDraw}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
                                >
                                    <i className="fas fa-redo"></i>
                                    จับสลากใหม่
                                </button>
                            </>
                        )}
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`mt-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>

            {/* Drawing Animation */}
            {(isDrawing || drawComplete) && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-xl font-display font-bold text-uefa-dark uppercase">
                            <i className="fas fa-list-ol mr-2 text-cyan-aura"></i>
                            ผลการจับสลาก
                        </h3>
                        {isDrawing && (
                            <span className="px-4 py-2 bg-cyan-aura/10 text-cyan-600 rounded-full text-sm font-bold animate-pulse">
                                <i className="fas fa-circle-notch fa-spin mr-2"></i>
                                กำลังจับสลาก... ({currentStep}/{matchDays.reduce((acc, d) => acc + d.matches.length, 0)})
                            </span>
                        )}
                        {drawComplete && (
                            <span className="px-4 py-2 bg-green-100 text-green-600 rounded-full text-sm font-bold">
                                <i className="fas fa-check mr-2"></i>
                                จับสลากเสร็จสิ้น
                            </span>
                        )}
                    </div>

                    <div className="p-6">
                        {/* Match Days Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {matchDays.map((round) => (
                                <div
                                    key={round.day}
                                    className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-display font-bold text-lg text-uefa-dark">
                                            Match Day {round.day}
                                        </h4>
                                        <span className="text-sm text-gray-500">
                                            <i className="fas fa-calendar mr-1"></i>
                                            {round.date}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {round.matches.map((match, idx) => {
                                            const isRevealed = displayedMatches.some(
                                                m => m.day === round.day && m.blue === match.blue && m.red === match.red
                                            );

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-500 ${isRevealed
                                                            ? 'bg-white shadow-md border-l-4 border-cyan-aura transform scale-100 opacity-100'
                                                            : 'bg-gray-200 opacity-30 scale-95'
                                                        }`}
                                                >
                                                    <span className={`font-bold ${isRevealed ? 'text-blue-600' : 'text-gray-400'}`}>
                                                        {isRevealed ? match.blue : '???'}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded text-sm font-bold ${isRevealed ? 'bg-cyan-aura text-white' : 'bg-gray-300 text-gray-500'
                                                        }`}>
                                                        VS
                                                    </span>
                                                    <span className={`font-bold ${isRevealed ? 'text-red-600' : 'text-gray-400'}`}>
                                                        {isRevealed ? match.red : '???'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
