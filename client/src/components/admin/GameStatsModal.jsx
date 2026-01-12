import { useState, useEffect } from 'react';

export default function GameStatsModal({ isOpen, onClose, teamBlue, teamRed, gameNumber, initialData, onSave }) {
    if (!isOpen) return null;

    // Default structure: 5 players per team
    const createEmptyPlayers = () => Array(5).fill(null).map(() => ({
        name: '', k: 0, d: 0, a: 0, damage: 0, damageTaken: 0, gold: 0
    }));

    const [bluePlayers, setBluePlayers] = useState([]);
    const [redPlayers, setRedPlayers] = useState([]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setBluePlayers(initialData?.blue && initialData?.blue.length === 5 ? initialData.blue : createEmptyPlayers());
            setRedPlayers(initialData?.red && initialData?.red.length === 5 ? initialData.red : createEmptyPlayers());
        }
    }, [isOpen, initialData]);

    const handleChange = (team, index, field, value) => {
        if (team === 'blue') {
            const newPlayers = [...bluePlayers];
            newPlayers[index] = { ...newPlayers[index], [field]: value };
            setBluePlayers(newPlayers);
        } else {
            const newPlayers = [...redPlayers];
            newPlayers[index] = { ...newPlayers[index], [field]: value };
            setRedPlayers(newPlayers);
        }
    };

    const handleSave = () => {
        onSave({ blue: bluePlayers, red: redPlayers });
        onClose();
    };

    // Table Row Component
    const PlayerRow = ({ player, index, team }) => (
        <tr className="border-b hover:bg-gray-50">
            <td className="p-2">
                <input
                    type="text"
                    placeholder={`ผู้เล่น ${index + 1}`}
                    value={player.name}
                    onChange={(e) => handleChange(team, index, 'name', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-cyan-aura focus:outline-none"
                    autoFocus={index === 0 && team === 'blue'}
                />
            </td>
            <td className="p-2">
                <input type="number" min="0" className="w-16 px-1 py-1 border border-gray-300 rounded text-center focus:border-cyan-aura focus:outline-none"
                    value={player.k} onChange={(e) => handleChange(team, index, 'k', parseInt(e.target.value) || 0)} />
            </td>
            <td className="p-2">
                <input type="number" min="0" className="w-16 px-1 py-1 border border-gray-300 rounded text-center focus:border-cyan-aura focus:outline-none"
                    value={player.d} onChange={(e) => handleChange(team, index, 'd', parseInt(e.target.value) || 0)} />
            </td>
            <td className="p-2">
                <input type="number" min="0" className="w-16 px-1 py-1 border border-gray-300 rounded text-center focus:border-cyan-aura focus:outline-none"
                    value={player.a} onChange={(e) => handleChange(team, index, 'a', parseInt(e.target.value) || 0)} />
            </td>
            <td className="p-2">
                <input type="number" min="0" className="w-24 px-1 py-1 border border-gray-300 rounded text-center focus:border-cyan-aura focus:outline-none"
                    value={player.damage} onChange={(e) => handleChange(team, index, 'damage', parseInt(e.target.value) || 0)} />
            </td>
            <td className="p-2">
                <input type="number" min="0" className="w-24 px-1 py-1 border border-gray-300 rounded text-center focus:border-cyan-aura focus:outline-none"
                    value={player.damageTaken} onChange={(e) => handleChange(team, index, 'damageTaken', parseInt(e.target.value) || 0)} />
            </td>
        </tr>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-10">
            <div className="bg-white rounded-xl w-full max-w-7xl p-6 shadow-2xl m-4 animate-fade-in">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-2xl font-bold font-display text-uefa-dark flex items-center gap-3">
                        <i className="fas fa-chart-bar text-cyan-aura"></i>
                        บันทึกสถิติผู้เล่น <span className="text-gray-400 text-lg">|</span> เกมที่ {gameNumber}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <div className="grid xl:grid-cols-2 gap-8 mb-6">
                    {/* Blue Team */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <h4 className="font-bold text-xl text-blue-600 mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            {teamBlue}
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 border-b border-blue-200">
                                        <th className="p-2 text-left w-40">ชื่อผู้เล่น</th>
                                        <th className="p-2 text-center text-green-600">K</th>
                                        <th className="p-2 text-center text-red-500">D</th>
                                        <th className="p-2 text-center text-blue-500">A</th>
                                        <th className="p-2 text-center">Deal</th>
                                        <th className="p-2 text-center">Taken</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-100">
                                    {bluePlayers.map((p, i) => <PlayerRow key={i} player={p} index={i} team="blue" />)}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Red Team */}
                    <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                        <h4 className="font-bold text-xl text-red-600 mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                            {teamRed}
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 border-b border-red-200">
                                        <th className="p-2 text-left w-40">ชื่อผู้เล่น</th>
                                        <th className="p-2 text-center text-green-600">K</th>
                                        <th className="p-2 text-center text-red-500">D</th>
                                        <th className="p-2 text-center text-blue-500">A</th>
                                        <th className="p-2 text-center">Deal</th>
                                        <th className="p-2 text-center">Taken</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-red-100">
                                    {redPlayers.map((p, i) => <PlayerRow key={i} player={p} index={i} team="red" />)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-bold transition-colors"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-gradient-to-r from-cyan-aura to-blue-600 text-white rounded-lg font-bold shadow-lg hover:shadow-cyan-aura/50 transition-all"
                    >
                        <i className="fas fa-save mr-2"></i>
                        ยืนยันการบันทึก
                    </button>
                </div>
            </div>
        </div>
    );
}
