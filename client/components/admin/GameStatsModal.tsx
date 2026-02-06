'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import Swal from 'sweetalert2';
import apiService from '@/lib/api-client';
import axios from 'axios';

interface Player {
    _id: string;
    name: string;
    inGameName?: string;
    team?: string;
}

interface Hero {
    _id: string;
    name: string;
    imageUrl?: string;
}

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

interface GameStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamBlue: string;
    teamRed: string;
    gameNumber: number;
    initialData?: GameStatsData;
    onSave: (data: GameStatsData) => void;
    allPlayers?: Player[];
    allHeroes?: Hero[];
}

interface HeroPickerState {
    open: boolean;
    team: 'blue' | 'red' | null;
    index: number | null;
}

export default function GameStatsModal({
    isOpen,
    onClose,
    teamBlue,
    teamRed,
    gameNumber,
    initialData,
    onSave,
    allPlayers = [],
    allHeroes = [],
}: GameStatsModalProps) {
    // Filter Rosters for Autocomplete
    const blueRoster = allPlayers.filter(p => p.team === teamBlue);
    const redRoster = allPlayers.filter(p => p.team === teamRed);

    // Default structure: 5 players per team (includes hero and gold for GPM)
    const createEmptyPlayers = (): PlayerStats[] => Array(5).fill(null).map(() => ({
        name: '', hero: '', k: 0, d: 0, a: 0, gold: 0
    }));

    const [bluePlayers, setBluePlayers] = useState<PlayerStats[]>(createEmptyPlayers());
    const [redPlayers, setRedPlayers] = useState<PlayerStats[]>(createEmptyPlayers());
    const [heroPickerOpen, setHeroPickerOpen] = useState<HeroPickerState>({ open: false, team: null, index: null });
    const [heroSearch, setHeroSearch] = useState<string>('');
    const heroSearchRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState<boolean>(false);

    // AI Stats Extraction Handler
    const handleAiUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            // Using axios directly here to handle FormData and response specifically for this endpoint
            // Assuming apiService base logic is used but we need specific endpoint
            const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

            const res = await axios.post(`${API_URL}/extract-rov-stats`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            const aiData = res.data;
            console.log('🤖 AI Extracted Data:', aiData);

            if (!Array.isArray(aiData) || aiData.length === 0) {
                throw new Error('AI could not find any player data.');
            }

            // --- Intelligent Mapping Logic ---

            // Helper to normalize strings
            const normalize = (str: string) => str ? str.toLowerCase().replace(/[^a-z0-9\u0E00-\u0E7F]/g, '') : '';

            // Helper to match hero name from DB
            const matchHero = (aiHeroName: string) => {
                if (!aiHeroName) return '';
                const normAi = normalize(aiHeroName);

                // 1. Exact Name Match
                const exact = allHeroes.find(h => normalize(h.name) === normAi);
                if (exact) return exact.name;

                // 2. Flexible Match (Partial string)
                const partial = allHeroes.find(h => {
                    const normDb = normalize(h.name);
                    return normDb.length > 2 && (normAi.includes(normDb) || normDb.includes(normAi));
                });
                if (partial) return partial.name;
                return '';
            };

            // Helper to find a player in a roster
            const findPlayerInRoster = (aiName: string, roster: Player[]) => {
                return roster.find(r => {
                    const nAi = normalize(aiName);
                    const nInGame = normalize(r.inGameName || '');
                    const nReal = normalize(r.name);
                    // Loose matching
                    return (nInGame && (nInGame === nAi || nInGame.includes(nAi) || nAi.includes(nInGame))) ||
                        (nReal && (nReal === nAi || nReal.includes(nAi) || nAi.includes(nReal)));
                });
            };

            // 1. Split AI Data into two groups (Top/Bottom or Left/Right)
            // Assuming 10 players, first 5 are Team A, next 5 are Team B
            let groupA = aiData.slice(0, 5);
            let groupB = aiData.slice(5, 10);

            // 2. Auto-Detect Side based on Roster Matching Score
            const calculateScore = (group: any[], roster: Player[]) => {
                return group.reduce((score, player) => {
                    return score + (findPlayerInRoster(player.name, roster) ? 1 : 0);
                }, 0);
            };

            const scoreA_Blue = calculateScore(groupA, blueRoster);
            const scoreA_Red = calculateScore(groupA, redRoster);
            const scoreB_Blue = calculateScore(groupB, blueRoster);
            const scoreB_Red = calculateScore(groupB, redRoster);

            console.log(`Team Matching Scores: A-Blue=${scoreA_Blue}, A-Red=${scoreA_Red}, B-Blue=${scoreB_Blue}, B-Red=${scoreB_Red}`);

            // Decision Logic:
            // If Group A matches Red better than Blue, OR Group B matches Blue better than Red -> SWAP
            // (Default: Group A = Blue, Group B = Red)
            let finalBlueGroup = groupA;
            let finalRedGroup = groupB;

            if (scoreA_Red > scoreA_Blue || scoreB_Blue > scoreB_Red) {
                console.log("🔄 Auto-swapping teams based on roster match!");
                finalBlueGroup = groupB;
                finalRedGroup = groupA;
            }

            // 3. Map Data to Form (Strict Mode)
            const mapStats = (aiGroup: any[], targetRoster: Player[]): PlayerStats[] => {
                const newSlots = createEmptyPlayers();

                aiGroup.forEach((aiPlayer, index) => {
                    if (index >= 5) return;

                    const rosterMatch = findPlayerInRoster(aiPlayer.name, targetRoster);

                    // IF Match Found -> Use Exact Name from Roster
                    // IF Not Found -> Empty String (User must select from dropdown)
                    const finalName = rosterMatch ? (rosterMatch.inGameName || rosterMatch.name) : '';

                    const finalHero = matchHero(aiPlayer.hero);

                    newSlots[index] = {
                        name: finalName,
                        hero: finalHero,
                        k: aiPlayer.k || 0,
                        d: aiPlayer.d || 0,
                        a: aiPlayer.a || 0,
                        gold: aiPlayer.gold || 0
                    };
                });
                return newSlots;
            };

            setBluePlayers(mapStats(finalBlueGroup, blueRoster));
            setRedPlayers(mapStats(finalRedGroup, redRoster));

            Swal.fire('สำเร็จ', `ดึงข้อมูลได้ ${aiData.length} รายการ`, 'success');

        } catch (error: any) {
            console.error('AI Error:', error);
            Swal.fire('Error', `เกิดข้อผิดพลาด: ${error.message || 'Unknown error'}`, 'error');
        } finally {
            setUploading(false);
            // Reset file input
            e.target.value = '';
        }
    };

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setBluePlayers(initialData?.blue && initialData?.blue.length === 5 ? [...initialData.blue] : createEmptyPlayers());
            setRedPlayers(initialData?.red && initialData?.red.length === 5 ? [...initialData.red] : createEmptyPlayers());
        }
    }, [isOpen, initialData]);

    // Focus search input when hero picker opens
    useEffect(() => {
        if (heroPickerOpen.open && heroSearchRef.current) {
            setTimeout(() => heroSearchRef.current?.focus(), 100);
        }
    }, [heroPickerOpen.open]);

    const handleBlueChange = (index: number, field: keyof PlayerStats, value: any) => {
        setBluePlayers(prev => {
            const newPlayers = [...prev];
            newPlayers[index] = { ...newPlayers[index], [field]: value };
            return newPlayers;
        });
    };

    const handleRedChange = (index: number, field: keyof PlayerStats, value: any) => {
        setRedPlayers(prev => {
            const newPlayers = [...prev];
            newPlayers[index] = { ...newPlayers[index], [field]: value };
            return newPlayers;
        });
    };

    const handleSave = () => {
        onSave({ blue: bluePlayers, red: redPlayers });
        onClose();
    };

    // Open hero picker
    const openHeroPicker = (team: 'blue' | 'red', index: number) => {
        setHeroPickerOpen({ open: true, team, index });
        setHeroSearch('');
    };

    // Select hero
    const selectHero = (heroName: string) => {
        if (heroPickerOpen.team === 'blue' && heroPickerOpen.index !== null) {
            handleBlueChange(heroPickerOpen.index, 'hero', heroName);
        } else if (heroPickerOpen.team === 'red' && heroPickerOpen.index !== null) {
            handleRedChange(heroPickerOpen.index, 'hero', heroName);
        }
        setHeroPickerOpen({ open: false, team: null, index: null });
    };

    // Get hero image URL
    const getHeroImage = (heroName: string): string | undefined => {
        const hero = allHeroes.find(h => h.name === heroName);
        return hero?.imageUrl;
    };

    // Filter heroes by search
    const filteredHeroes = allHeroes.filter(h =>
        h.name.toLowerCase().includes(heroSearch.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-10">
            <div className="bg-white rounded-xl w-full max-w-7xl p-6 shadow-2xl m-4 animate-fade-in relative">
                {/* Datalists for Autocomplete */}
                <datalist id="roster-blue">
                    {blueRoster.map(p => {
                        const val = p.inGameName || p.name;
                        const label = p.inGameName ? `(${p.name})` : '';
                        return <option key={p._id} value={val}>{label}</option>;
                    })}
                </datalist>
                <datalist id="roster-red">
                    {redRoster.map(p => {
                        const val = p.inGameName || p.name;
                        const label = p.inGameName ? `(${p.name})` : '';
                        return <option key={p._id} value={val}>{label}</option>;
                    })}
                </datalist>

                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-bold font-display text-uefa-dark flex items-center gap-3">
                            <i className="fas fa-chart-bar text-cyan-aura"></i>
                            บันทึกสถิติผู้เล่น <span className="text-gray-400 text-lg">|</span> เกมที่ {gameNumber}
                        </h3>

                        {/* AI Auto-fill Button */}
                        <div className="relative">
                            <input
                                type="file"
                                id="ai-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAiUpload}
                                disabled={uploading}
                            />
                            <label
                                htmlFor="ai-upload"
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all shadow-sm ${uploading
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-md hover:scale-105'
                                    }`}
                            >
                                {uploading ? (
                                    <><i className="fas fa-spinner fa-spin"></i> กำลังวิเคราะห์...</>
                                ) : (
                                    <><i className="fas fa-magic"></i> AI Auto-fill (จากรูป)</>
                                )}
                            </label>
                        </div>
                    </div>

                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <div className="grid xl:grid-cols-2 gap-8 mb-6">
                    {/* Blue Team */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
                        <h4 className="font-bold text-xl text-blue-600 mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            {teamBlue}
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 border-b border-blue-200">
                                        <th className="p-2 text-center w-12">Hero</th>
                                        <th className="p-2 text-left w-32">ชื่อผู้เล่น</th>
                                        <th className="p-2 text-center text-green-600">K</th>
                                        <th className="p-2 text-center text-red-500">D</th>
                                        <th className="p-2 text-center text-blue-500">A</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-100">
                                    {bluePlayers.map((player, i) => (
                                        <tr key={`blue-${i}`} className="border-b hover:bg-gray-50">
                                            <td className="p-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openHeroPicker('blue', i)}
                                                    className={`w-10 h-10 rounded-lg border-2 overflow-hidden transition-all hover:scale-105 ${player.hero ? 'border-cyan-aura' : 'border-gray-300 border-dashed bg-gray-100'}`}
                                                    title={player.hero || 'เลือกฮีโร่'}
                                                >
                                                    {player.hero && getHeroImage(player.hero) ? (
                                                        <img
                                                            src={getHeroImage(player.hero)}
                                                            alt={player.hero}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <i className="fas fa-plus text-gray-400 text-xs"></i>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    list="roster-blue"
                                                    placeholder={`ผู้เล่น ${i + 1}`}
                                                    value={player.name}
                                                    onChange={(e) => handleBlueChange(i, 'name', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-cyan-aura focus:outline-none"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input type="number" min="0" className="w-14 px-1 py-1 border border-gray-300 rounded text-center focus:border-cyan-aura focus:outline-none"
                                                    value={player.k} onChange={(e) => handleBlueChange(i, 'k', parseInt(e.target.value) || 0)} />
                                            </td>
                                            <td className="p-2">
                                                <input type="number" min="0" className="w-14 px-1 py-1 border border-gray-300 rounded text-center focus:border-cyan-aura focus:outline-none"
                                                    value={player.d} onChange={(e) => handleBlueChange(i, 'd', parseInt(e.target.value) || 0)} />
                                            </td>
                                            <td className="p-2">
                                                <input type="number" min="0" className="w-14 px-1 py-1 border border-gray-300 rounded text-center focus:border-cyan-aura focus:outline-none"
                                                    value={player.a} onChange={(e) => handleBlueChange(i, 'a', parseInt(e.target.value) || 0)} />
                                            </td>
                                        </tr>
                                    ))}
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
                                        <th className="p-2 text-center w-12">Hero</th>
                                        <th className="p-2 text-left w-32">ชื่อผู้เล่น</th>
                                        <th className="p-2 text-center text-green-600">K</th>
                                        <th className="p-2 text-center text-red-500">D</th>
                                        <th className="p-2 text-center text-blue-500">A</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-red-100">
                                    {redPlayers.map((player, i) => (
                                        <tr key={`red-${i}`} className="border-b hover:bg-gray-50">
                                            <td className="p-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openHeroPicker('red', i)}
                                                    className={`w-10 h-10 rounded-lg border-2 overflow-hidden transition-all hover:scale-105 ${player.hero ? 'border-cyan-aura' : 'border-gray-300 border-dashed bg-gray-100'}`}
                                                    title={player.hero || 'เลือกฮีโร่'}
                                                >
                                                    {player.hero && getHeroImage(player.hero) ? (
                                                        <img
                                                            src={getHeroImage(player.hero)}
                                                            alt={player.hero}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <i className="fas fa-plus text-gray-400 text-xs"></i>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    list="roster-red"
                                                    placeholder={`ผู้เล่น ${i + 1}`}
                                                    value={player.name}
                                                    onChange={(e) => handleRedChange(i, 'name', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-cyan-aura focus:outline-none"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input type="number" min="0" className="w-14 px-1 py-1 border border-gray-300 rounded text-center focus:border-cyan-aura focus:outline-none"
                                                    value={player.k} onChange={(e) => handleRedChange(i, 'k', parseInt(e.target.value) || 0)} />
                                            </td>
                                            <td className="p-2">
                                                <input type="number" min="0" className="w-14 px-1 py-1 border border-gray-300 rounded text-center focus:border-cyan-aura focus:outline-none"
                                                    value={player.d} onChange={(e) => handleRedChange(i, 'd', parseInt(e.target.value) || 0)} />
                                            </td>
                                            <td className="p-2">
                                                <input type="number" min="0" className="w-14 px-1 py-1 border border-gray-300 rounded text-center focus:border-cyan-aura focus:outline-none"
                                                    value={player.a} onChange={(e) => handleRedChange(i, 'a', parseInt(e.target.value) || 0)} />
                                            </td>
                                        </tr>
                                    ))}
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

            {/* Hero Picker Modal */}
            {heroPickerOpen.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setHeroPickerOpen({ open: false, team: null, index: null })}>
                    <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-2xl m-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-bold text-gray-800">
                                <i className="fas fa-mask mr-2 text-cyan-aura"></i>
                                เลือกฮีโร่
                            </h4>
                            <button
                                onClick={() => setHeroPickerOpen({ open: false, team: null, index: null })}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                ref={heroSearchRef}
                                type="text"
                                placeholder="ค้นหาฮีโร่..."
                                value={heroSearch}
                                onChange={(e) => setHeroSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                        </div>

                        {/* Hero Grid */}
                        <div className="overflow-y-auto flex-1">
                            {allHeroes.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <i className="fas fa-ghost text-4xl mb-2"></i>
                                    <p>ยังไม่มีฮีโร่ในระบบ</p>
                                    <p className="text-sm">ไปหน้า Admin → ฮีโร่ เพื่ออัปโหลด</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
                                    {/* Clear selection option */}
                                    <button
                                        onClick={() => selectHero('')}
                                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-red-400 hover:bg-red-50 transition"
                                        title="ไม่เลือกฮีโร่"
                                    >
                                        <i className="fas fa-times text-gray-400"></i>
                                    </button>
                                    {filteredHeroes.map(hero => (
                                        <button
                                            key={hero._id}
                                            onClick={() => selectHero(hero.name)}
                                            className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-cyan-aura hover:scale-105 transition-all"
                                            title={hero.name}
                                        >
                                            <img
                                                src={hero.imageUrl}
                                                alt={hero.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://via.placeholder.com/60?text=' + encodeURIComponent(hero.name);
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
