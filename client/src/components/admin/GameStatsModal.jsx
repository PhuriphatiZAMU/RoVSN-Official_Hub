import { useState, useEffect, useRef } from 'react';

export default function GameStatsModal({ isOpen, onClose, teamBlue, teamRed, gameNumber, initialData, onSave, allPlayers = [], allHeroes = [] }) {
    // Filter Rosters for Autocomplete
    const blueRoster = allPlayers.filter(p => p.team === teamBlue);
    const redRoster = allPlayers.filter(p => p.team === teamRed);

    // Default structure: 5 players per team (includes hero and gold for GPM)
    const createEmptyPlayers = () => Array(5).fill(null).map(() => ({
        name: '', hero: '', k: 0, d: 0, a: 0, gold: 0
    }));

    const [bluePlayers, setBluePlayers] = useState(createEmptyPlayers());
    const [redPlayers, setRedPlayers] = useState(createEmptyPlayers());
    const [heroPickerOpen, setHeroPickerOpen] = useState({ open: false, team: null, index: null });
    const [heroSearch, setHeroSearch] = useState('');
    const heroSearchRef = useRef(null);

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

    const handleBlueChange = (index, field, value) => {
        setBluePlayers(prev => {
            const newPlayers = [...prev];
            newPlayers[index] = { ...newPlayers[index], [field]: value };
            return newPlayers;
        });
    };

    const handleRedChange = (index, field, value) => {
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
    const openHeroPicker = (team, index) => {
        setHeroPickerOpen({ open: true, team, index });
        setHeroSearch('');
    };

    // Select hero
    const selectHero = (heroName) => {
        if (heroPickerOpen.team === 'blue') {
            handleBlueChange(heroPickerOpen.index, 'hero', heroName);
        } else {
            handleRedChange(heroPickerOpen.index, 'hero', heroName);
        }
        setHeroPickerOpen({ open: false, team: null, index: null });
    };

    // Get hero image URL
    const getHeroImage = (heroName) => {
        const hero = allHeroes.find(h => h.name === heroName);
        return hero?.imageUrl || null;
    };

    // Filter heroes by search
    const filteredHeroes = allHeroes.filter(h =>
        h.name.toLowerCase().includes(heroSearch.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-10">
            <div className="bg-white rounded-xl w-full max-w-7xl p-6 shadow-2xl m-4 animate-fade-in">
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
                                        <th className="p-2 text-center w-12">Hero</th>
                                        <th className="p-2 text-left w-32">ชื่อผู้เล่น</th>
                                        <th className="p-2 text-center text-green-600">K</th>
                                        <th className="p-2 text-center text-red-500">D</th>
                                        <th className="p-2 text-center text-blue-500">A</th>
                                        <th className="p-2 text-center text-yellow-600">Gold</th>
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
                                            <td className="p-2">
                                                <input type="number" min="0" className="w-20 px-1 py-1 border border-gray-300 rounded text-center focus:border-cyan-aura focus:outline-none"
                                                    value={player.gold} onChange={(e) => handleBlueChange(i, 'gold', parseInt(e.target.value) || 0)} placeholder="0" />
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
                                        <th className="p-2 text-center text-yellow-600">Gold</th>
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
                                            <td className="p-2">
                                                <input type="number" min="0" className="w-20 px-1 py-1 border border-gray-300 rounded text-center focus:border-cyan-aura focus:outline-none"
                                                    value={player.gold} onChange={(e) => handleRedChange(i, 'gold', parseInt(e.target.value) || 0)} placeholder="0" />
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
                                                    e.target.src = 'https://via.placeholder.com/60?text=' + encodeURIComponent(hero.name);
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
