import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useConfirmModal } from '../../components/common/ConfirmModal';
import TeamLogo from '../../components/common/TeamLogo';

export default function AdminDraw() {
    const envUrl = import.meta.env.VITE_API_URL || '';
    const API_BASE_URL = envUrl ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`) : '/api';
    const { token } = useAuth();
    const { t } = useLanguage();
    const { showConfirm } = useConfirmModal();

    // Teams Management
    const [teams, setTeams] = useState([]);

    // Auto-fetch teams from roster on mount
    useEffect(() => {
        const fetchRosterTeams = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/players`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const players = await res.json();
                    const rosterTeams = [...new Set(players.map(p => p.team).filter(t => t))].sort();
                    if (rosterTeams.length > 0) {
                        setTeams(rosterTeams);
                    }
                }
            } catch (err) {
                console.error("Failed to auto-load teams:", err);
            }
        };
        fetchRosterTeams();
    }, [API_BASE_URL, token]);

    const [newTeamName, setNewTeamName] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingName, setEditingName] = useState('');

    // Draw State
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawComplete, setDrawComplete] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [matchDays, setMatchDays] = useState([]);
    const [displayedMatches, setDisplayedMatches] = useState([]);
    const [saving, setSaving] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [message, setMessage] = useState(null);

    // Schema: Logo Logic
    const [logoModalOpen, setLogoModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [logoUploadMode, setLogoUploadMode] = useState('file'); // 'file' | 'url'
    const [logoFile, setLogoFile] = useState(null);
    const [logoUrlInput, setLogoUrlInput] = useState('');
    const [logoPreview, setLogoPreview] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const openLogoModal = (teamName) => {
        setSelectedTeam(teamName);
        setLogoModalOpen(true);
        setLogoUploadMode('file');
        setLogoFile(null);
        setLogoUrlInput('');
        setLogoPreview('');
    };

    const handleLogoFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const saveLogo = async () => {
        if (!selectedTeam) return;
        setUploadingLogo(true);
        try {
            let finalUrl = logoUrlInput;

            // 1. Upload File if mode is file
            if (logoUploadMode === 'file' && logoFile) {
                const formData = new FormData();
                formData.append('logo', logoFile);

                const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (!uploadRes.ok) throw new Error('Upload failed');
                const result = await uploadRes.json();
                finalUrl = result.url;
            }

            // 2. Save Team Logo URL
            if (finalUrl) {
                const res = await fetch(`${API_BASE_URL}/team-logos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ teamName: selectedTeam, logoUrl: finalUrl })
                });

                if (!res.ok) throw new Error('Failed to save logo');

                setMessage({ type: 'success', text: t.admin.teamsPage.saveSuccess });
                setLogoModalOpen(false);
                setTimeout(() => window.location.reload(), 800);
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึกโลโก้' });
        } finally {
            setUploadingLogo(false);
        }
    };

    // ===== TEAM MANAGEMENT =====

    // เพิ่มทีมใหม่
    const addTeam = () => {
        const name = newTeamName.trim();
        if (!name) {
            setMessage({ type: 'error', text: t.admin.drawPage.errorEmpty });
            return;
        }
        if (teams.includes(name)) {
            setMessage({ type: 'error', text: t.admin.drawPage.errorDuplicate });
            return;
        }
        setTeams([...teams, name]);
        setNewTeamName('');
        setMessage({ type: 'success', text: t.admin.drawPage.successAdd.replace('{team}', name) });
    };

    // ลบทีม
    const deleteTeam = (index) => {
        const teamName = teams[index];
        showConfirm({
            title: t.admin.drawPage.confirmDeleteTeam,
            message: t.admin.drawPage.confirmDeleteTeamText.replace('{team}', teamName),
            type: 'danger',
            confirmText: t.admin.drawPage.confirmDelete,
            cancelText: t.admin.cancel,
            onConfirm: () => {
                setTeams(prevTeams => prevTeams.filter((_, i) => i !== index));
                setMessage({ type: 'success', text: t.admin.drawPage.successDelete.replace('{team}', teamName) });
            }
        });
    };

    // เริ่มแก้ไขชื่อทีม
    const startEditing = (index) => {
        setEditingIndex(index);
        setEditingName(teams[index]);
    };

    // บันทึกการแก้ไข
    const saveEdit = () => {
        const name = editingName.trim();
        if (!name) {
            setMessage({ type: 'error', text: t.admin.drawPage.errorEmpty });
            return;
        }
        if (teams.some((t, i) => t === name && i !== editingIndex)) {
            setMessage({ type: 'error', text: t.admin.drawPage.errorDuplicate });
            return;
        }
        const oldName = teams[editingIndex];
        const newTeams = [...teams];
        newTeams[editingIndex] = name;
        setTeams(newTeams);
        setEditingIndex(null);
        setEditingName('');
        setMessage({ type: 'success', text: t.admin.teamsPage.saveSuccess });
    };

    // ยกเลิกการแก้ไข
    const cancelEdit = () => {
        setEditingIndex(null);
        setEditingName('');
    };

    // Date Settings
    const [customMatchDates, setCustomMatchDates] = useState({});

    // คำนวณจำนวนรอบ (Match Days)
    const calculateTotalRounds = (teamCount) => {
        if (teamCount < 2) return 0;
        // สูตร Round Robin: ถ้า N คู่ = N-1 รอบ, ถ้า N คี่ = N รอบ
        const isEven = teamCount % 2 === 0;
        return isEven ? teamCount - 1 : teamCount;
    };

    const totalRounds = calculateTotalRounds(teams.length);



    const handleDateChange = (day, value) => {
        setCustomMatchDates(prev => ({
            ...prev,
            [day]: value
        }));
    };

    // ===== ROUND ROBIN ALGORITHM =====

    const generateRoundRobin = (teamList) => {
        const n = teamList.length;
        const rounds = [];
        const teamsCopy = [...teamList];

        if (n % 2 !== 0) {
            teamsCopy.push('BYE');
        }

        const numRounds = teamsCopy.length - 1;
        const halfSize = teamsCopy.length / 2;

        const teamIndexes = teamsCopy.map((_, i) => i).slice(1);

        // ใช้ Custom Dates หรือ fallback
        const getRoundDate = (roundNum) => {
            if (customMatchDates[roundNum]) {
                return customMatchDates[roundNum];
            }
            return ''; // Default empty if not set
        };

        for (let round = 0; round < numRounds; round++) {
            const roundMatches = [];
            const newIndexes = [0].concat(teamIndexes);

            for (let i = 0; i < halfSize; i++) {
                const home = teamsCopy[newIndexes[i]];
                const away = teamsCopy[newIndexes[newIndexes.length - 1 - i]];

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
                date: getRoundDate(round + 1),
                matches: roundMatches
            });

            teamIndexes.push(teamIndexes.shift());
        }

        return rounds;
    };

    // ===== DRAW ACTIONS =====

    const startDraw = () => {
        if (teams.length < 2) {
            setMessage({ type: 'error', text: t.admin.drawPage.errorMinTeams });
            return;
        }

        setIsDrawing(true);
        setDrawComplete(false);
        setCurrentStep(0);
        setDisplayedMatches([]);
        setMessage(null);

        const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
        const rounds = generateRoundRobin(shuffledTeams);
        setMatchDays(rounds);

        let step = 0;
        const allMatches = rounds.flatMap((r, dayIndex) =>
            r.matches.map(m => ({ ...m, day: dayIndex + 1 }))
        );

        // Add first match immediately
        if (allMatches.length > 0) {
            setDisplayedMatches([allMatches[0]]);
            setCurrentStep(1);
            step = 1;
        }

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
        }, 250);
    };

    // บันทึก Fixtures
    const saveToFixtures = async () => {
        setSaving(true);
        setMessage(null);

        try {
            // Send all data as a single document
            const payload = {
                schedule: matchDays,
                teams: teams
            };

            const response = await fetch(`${API_BASE_URL}/schedules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to save fixtures');
            }

            setMessage({ type: 'success', text: `✅ ${t.admin.drawPage.successSave}` });

            // Reload page to refresh data in all components
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            setMessage({ type: 'error', text: `❌ ${error.message}` });
        } finally {
            setSaving(false);
        }
    };

    // ล้าง Fixtures ทั้งหมด
    const clearAllFixtures = () => {
        showConfirm({
            title: t.admin.drawPage.confirmClear,
            message: t.admin.drawPage.confirmClearText,
            type: 'danger',
            confirmText: t.admin.drawPage.confirmClearBtn,
            cancelText: t.admin.cancel,
            onConfirm: async () => {
                setClearing(true);
                setMessage(null);

                try {
                    const response = await fetch(`${API_BASE_URL}/schedules/clear`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to clear data');
                    }

                    const data = await response.json();
                    setMessage({
                        type: 'success',
                        text: `🗑️ ${t.admin.drawPage.successClear} (Schedules: ${data.deleted?.schedules || 0}, Results: ${data.deleted?.results || 0})`
                    });

                    // Reload page after 1.5 seconds to refresh all data
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } catch (error) {
                    setMessage({ type: 'error', text: `❌ ${error.message}` });
                    setClearing(false);
                }
            }
        });
    };

    // Reset การจับสลาก
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
                        {t.admin.drawPage.title}
                    </h2>
                    <p className="text-gray-500 mt-2">{t.admin.drawPage.subtitle}</p>
                </div>

                <div className="p-6">
                    {/* Teams Management */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-700 text-lg">
                                <i className="fas fa-users mr-2 text-cyan-aura"></i>
                                {t.admin.drawPage.manageTeams} ({teams.length} {t.admin.clubs})
                            </h3>
                        </div>

                        {/* Add Team Input */}
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTeam()}
                                placeholder={t.admin.drawPage.addTeamPlaceholder}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-aura"
                            />
                            <button
                                onClick={addTeam}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <i className="fas fa-plus mr-1"></i>
                                {t.admin.drawPage.addTeam}
                            </button>

                        </div>

                        {/* Teams List */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {teams.map((team, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 group hover:border-cyan-aura transition-colors"
                                >
                                    {editingIndex === index ? (
                                        <div className="flex items-center gap-1 flex-1">
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                                                className="w-full px-2 py-1 text-sm border border-cyan-aura rounded focus:outline-none"
                                                autoFocus
                                            />
                                            <button onClick={saveEdit} className="text-green-500 hover:text-green-600">
                                                <i className="fas fa-check"></i>
                                            </button>
                                            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="font-medium text-gray-700 truncate">{team}</span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openLogoModal(team)}
                                                    className="text-gray-500 hover:text-cyan-aura p-1"
                                                    title="เปลี่ยนโลโก้"
                                                >
                                                    <i className="fas fa-image text-xs"></i>
                                                </button>
                                                <button
                                                    onClick={() => startEditing(index)}
                                                    className="text-blue-500 hover:text-blue-600 p-1"
                                                    title="แก้ไข"
                                                >
                                                    <i className="fas fa-edit text-xs"></i>
                                                </button>
                                                <button
                                                    onClick={() => deleteTeam(index)}
                                                    className="text-red-500 hover:text-red-600 p-1"
                                                    title="ลบ"
                                                >
                                                    <i className="fas fa-trash text-xs"></i>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {teams.length < 2 && (
                            <p className="text-red-500 text-sm mt-2">
                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                {t.admin.drawPage.errorMinTeams}
                            </p>
                        )}
                    </div>

                    {/* Date Settings - แสดงเฉพาะตอนยังไม่เริ่มจับสลาก และมีทีมพอ */}
                    {!isDrawing && !drawComplete && teams.length >= 2 && (
                        <div className="mb-8 border-t border-gray-100 pt-6">
                            <h3 className="font-bold text-gray-700 text-lg mb-4">
                                <i className="fas fa-calendar-alt mr-2 text-cyan-aura"></i>
                                {t.admin.drawPage.dateSettings} ({totalRounds} Match Days)
                            </h3>


                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {Array.from({ length: totalRounds }).map((_, i) => {
                                    const day = i + 1;
                                    return (
                                        <div key={day} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="text-xs font-bold text-gray-500 mb-1">{t.admin.drawPage.round} {day}</div>
                                            <input
                                                type="date"
                                                value={customMatchDates[day] || ''}
                                                onChange={(e) => handleDateChange(day, e.target.value)}
                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-cyan-aura"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        {!isDrawing && !drawComplete && (
                            <button
                                onClick={startDraw}
                                disabled={teams.length < 2}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-aura to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fas fa-dice"></i>
                                {t.admin.drawPage.startDraw}
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
                                        <><i className="fas fa-circle-notch fa-spin"></i> {t.admin.drawPage.saving}</>
                                    ) : (
                                        <><i className="fas fa-save"></i> {t.admin.drawPage.saveFixtures}</>
                                    )}
                                </button>
                                <button
                                    onClick={resetDraw}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
                                >
                                    <i className="fas fa-redo"></i>
                                    {t.admin.drawPage.resetDraw}
                                </button>
                            </>
                        )}

                        {/* Clear Fixtures Button - Always visible */}
                        <button
                            onClick={clearAllFixtures}
                            disabled={clearing}
                            className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition-all disabled:opacity-50 ml-auto"
                        >
                            {clearing ? (
                                <><i className="fas fa-circle-notch fa-spin"></i> {t.admin.drawPage.clearing}</>
                            ) : (
                                <><i className="fas fa-trash-alt"></i> {t.admin.drawPage.clearFixtures}</>
                            )}
                        </button>
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
                            {t.admin.drawPage.resultsTitle}
                        </h3>
                        {isDrawing && (
                            <span className="px-4 py-2 bg-cyan-aura/10 text-cyan-600 rounded-full text-sm font-bold animate-pulse">
                                <i className="fas fa-circle-notch fa-spin mr-2"></i>
                                {t.admin.drawPage.drawing} ({currentStep}/{matchDays.reduce((acc, d) => acc + (d && d.matches ? d.matches.length : 0), 0)})
                            </span>
                        )}
                        {drawComplete && (
                            <span className="px-4 py-2 bg-green-100 text-green-600 rounded-full text-sm font-bold">
                                <i className="fas fa-check mr-2"></i>
                                {t.admin.drawPage.drawComplete}
                            </span>
                        )}
                    </div>

                    <div className="p-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {matchDays.filter(round => round && round.day && round.matches).map((round) => (
                                <div
                                    key={round.day}
                                    className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-display font-bold text-uefa-dark">
                                            {t.admin.drawPage.round} {round.day}
                                        </h4>
                                        <span className="text-xs text-gray-500">
                                            {round.date}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {round.matches.map((match, idx) => {
                                            // Calculate global match index for this match
                                            const matchesBefore = matchDays
                                                .filter(r => r.day < round.day)
                                                .reduce((sum, r) => sum + r.matches.length, 0);
                                            const globalIdx = matchesBefore + idx;
                                            // Use displayedMatches.length for more reliable check
                                            const isRevealed = drawComplete || globalIdx < displayedMatches.length;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex items-center justify-between p-2 rounded-lg text-sm transition-all duration-300 ${isRevealed
                                                        ? 'bg-white shadow border-l-4 border-cyan-aura'
                                                        : 'bg-gray-200 opacity-30'
                                                        }`}
                                                >
                                                    <span className={`font-bold truncate flex-1 ${isRevealed ? 'text-blue-600' : 'text-gray-400'}`}>
                                                        {isRevealed ? match.blue : '???'}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold mx-1 ${isRevealed ? 'bg-cyan-aura text-white' : 'bg-gray-300 text-gray-500'
                                                        }`}>
                                                        VS
                                                    </span>
                                                    <span className={`font-bold truncate flex-1 text-right ${isRevealed ? 'text-red-600' : 'text-gray-400'}`}>
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
            {/* Logo Management Modal */}
            {logoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">{t.admin.drawPage.manageLogo.replace('{team}', selectedTeam)}</h3>
                            <button onClick={() => setLogoModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="flex justify-center mb-6">
                            <div className="flex flex-col items-center">
                                <div className="mb-2 text-sm text-gray-500">{t.admin.drawPage.current}</div>
                                <TeamLogo teamName={selectedTeam} size="xl" />
                            </div>
                            {logoPreview && (
                                <>
                                    <div className="flex items-center mx-4 text-gray-300">
                                        <i className="fas fa-arrow-right"></i>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="mb-2 text-sm text-cyan-aura font-bold">{t.admin.drawPage.new}</div>
                                        <img src={logoPreview} alt="New Logo" className="w-16 h-16 object-contain" />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setLogoUploadMode('file')}
                                className={`flex-1 py-1 px-3 rounded text-sm font-bold transition-colors ${logoUploadMode === 'file' ? 'bg-white text-cyan-aura shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {t.admin.drawPage.uploadFile}
                            </button>
                            <button
                                onClick={() => setLogoUploadMode('url')}
                                className={`flex-1 py-1 px-3 rounded text-sm font-bold transition-colors ${logoUploadMode === 'url' ? 'bg-white text-cyan-aura shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {t.admin.drawPage.useUrl}
                            </button>
                        </div>

                        <div className="mb-6">
                            {logoUploadMode === 'file' ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-aura transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                    <p className="text-sm text-gray-600">{t.admin.drawPage.clickToSelect}</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG (Max 2MB)</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">{t.admin.drawPage.enterUrl}</label>
                                    <input
                                        type="text"
                                        value={logoUrlInput}
                                        onChange={(e) => {
                                            setLogoUrlInput(e.target.value);
                                            setLogoPreview(e.target.value);
                                        }}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-aura"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setLogoModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold"
                            >
                                {t.admin.cancel}
                            </button>
                            <button
                                onClick={saveLogo}
                                disabled={uploadingLogo || (!logoFile && !logoUrlInput)}
                                className={`px-4 py-2 bg-gradient-to-r from-cyan-aura to-blue-600 text-white rounded-lg font-bold shadow-lg hover:shadow-cyan-aura/50 transition-all ${uploadingLogo ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {uploadingLogo ? t.admin.drawPage.saving : t.admin.drawPage.saveLogo}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
