'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import apiService from '@/lib/api-client';
import TeamLogo from '@/components/common/TeamLogo';
import { useLanguage } from '@/components/providers/LanguageProvider';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function AdminDrawPage() {
    const { t } = useLanguage();

    // Teams Management
    const [teams, setTeams] = useState<string[]>([]);

    // Draw State
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawComplete, setDrawComplete] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [matchDays, setMatchDays] = useState<any[]>([]);
    const [displayedMatches, setDisplayedMatches] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [message, setMessage] = useState<{ type: string, text: string } | null>(null);

    // Edit Team State
    const [newTeamName, setNewTeamName] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    // Custom Dates
    const [customMatchDates, setCustomMatchDates] = useState<Record<number, string>>({});

    // Logo Modal State
    const [logoModalOpen, setLogoModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [logoUploadMode, setLogoUploadMode] = useState<'file' | 'url'>('file');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoUrlInput, setLogoUrlInput] = useState('');
    const [logoPreview, setLogoPreview] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);

    useEffect(() => {
        fetchRosterTeams();
    }, []);

    const fetchRosterTeams = async () => {
        try {
            const players = await apiService.getPlayers();
            if (players) {
                const rosterTeams = [...new Set(players.map(p => p.team).filter((t): t is string => !!t))].sort();
                if (rosterTeams.length > 0) {
                    setTeams(rosterTeams);
                }
            }
        } catch (err) {
            console.error("Failed to auto-load teams:", err);
        }
    };

    // --- Team Management ---

    const addTeam = () => {
        const name = newTeamName.trim();
        if (!name) {
            setMessage({ type: 'error', text: 'Team name cannot be empty' });
            return;
        }
        if (teams.includes(name)) {
            setMessage({ type: 'error', text: 'Team name already exists' });
            return;
        }
        setTeams([...teams, name]);
        setNewTeamName('');
        setMessage({ type: 'success', text: `Added team ${name}` });
    };

    const deleteTeam = async (index: number) => {
        const teamName = teams[index];
        const result = await Swal.fire({
            title: `Remove ${teamName}?`,
            text: "This removes the team from the draw list only.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Remove'
        });

        if (result.isConfirmed) {
            setTeams(prev => prev.filter((_, i) => i !== index));
            setMessage({ type: 'success', text: `Removed ${teamName}` });
        }
    };

    const startEditing = (index: number) => {
        setEditingIndex(index);
        setEditingName(teams[index]);
    };

    const saveEdit = () => {
        const name = editingName.trim();
        if (!name) return;
        if (teams.some((t, i) => t === name && i !== editingIndex)) {
            setMessage({ type: 'error', text: 'Duplicate team name' });
            return;
        }
        const newTeams = [...teams];
        newTeams[editingIndex!] = name;
        setTeams(newTeams);
        setEditingIndex(null);
        setEditingName('');
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditingName('');
    };

    // --- Round Robin Logic ---

    const calculateTotalRounds = (teamCount: number) => {
        if (teamCount < 2) return 0;
        const isEven = teamCount % 2 === 0;
        return isEven ? teamCount - 1 : teamCount;
    };

    const totalRounds = calculateTotalRounds(teams.length);

    const handleDateChange = (day: number, value: string) => {
        setCustomMatchDates(prev => ({ ...prev, [day]: value }));
    };

    const generateRoundRobin = (teamList: string[]) => {
        const n = teamList.length;
        const rounds = [];
        const teamsCopy = [...teamList];

        if (n % 2 !== 0) {
            teamsCopy.push('BYE');
        }

        const numRounds = teamsCopy.length - 1;
        const halfSize = teamsCopy.length / 2;
        const teamIndexes = teamsCopy.map((_, i) => i).slice(1);

        const getRoundDate = (roundNum: number) => customMatchDates[roundNum] || '';

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

            teamIndexes.push(teamIndexes.shift()!);
        }

        return rounds;
    };

    const startDraw = () => {
        if (teams.length < 2) {
            setMessage({ type: 'error', text: 'Need at least 2 teams' });
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

    const saveToFixtures = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const payload = {
                schedule: matchDays,
                teams: teams
            };

            await apiService.createSchedule(payload);

            setMessage({ type: 'success', text: 'Fixtures saved successfully' });
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    const clearAllFixtures = async () => {
        const result = await Swal.fire({
            title: 'Clear All Fixtures?',
            text: "This will delete all schedule and results data!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, Clear All'
        });

        if (result.isConfirmed) {
            setClearing(true);
            try {
                await axios.delete(`${API_BASE}/schedules/clear`, { withCredentials: true });
                setMessage({ type: 'success', text: 'All fixture data cleared.' });
                setTimeout(() => window.location.reload(), 1500);
            } catch (error: any) {
                setMessage({ type: 'error', text: error.message });
                setClearing(false);
            }
        }
    };

    const resetDraw = () => {
        setIsDrawing(false);
        setDrawComplete(false);
        setCurrentStep(0);
        setMatchDays([]);
        setDisplayedMatches([]);
        setMessage(null);
    };

    // --- Logo Modal Logic ---

    const openLogoModal = (teamName: string) => {
        setSelectedTeam(teamName);
        setLogoModalOpen(true);
        setLogoUploadMode('file');
        setLogoFile(null);
        setLogoUrlInput('');
        setLogoPreview('');
    };

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
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

            if (logoUploadMode === 'file' && logoFile) {
                const formData = new FormData();
                formData.append('logo', logoFile);
                const result = await apiService.uploadImage(formData);
                finalUrl = result.url;
            }

            if (finalUrl) {
                await apiService.createTeamLogo({ teamName: selectedTeam, logoUrl: finalUrl });
                setMessage({ type: 'success', text: 'Logo saved successfully' });
                setLogoModalOpen(false);
            }
        } catch (err: any) {
            console.error(err);
            Swal.fire('Error', 'Failed to save logo', 'error');
        } finally {
            setUploadingLogo(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <h1 className="text-2xl font-display font-bold text-uefa-dark">
                <i className="fas fa-random mr-3 text-cyan-aura"></i>
                {t.admin.drawPage?.title || 'Tournament Draw'}
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

                {/* Team Management */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700 text-lg">
                            <i className="fas fa-users mr-2 text-cyan-aura"></i>
                            {t.admin.drawPage?.manageTeams || 'Manage Teams'} ({teams.length})
                        </h3>
                    </div>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTeam()}
                            placeholder="Add Team Name"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-aura"
                        />
                        <button
                            onClick={addTeam}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-bold"
                        >
                            <i className="fas fa-plus mr-1"></i> Add
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {teams.map((team, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 group hover:border-cyan-aura transition-all">
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
                                        <button onClick={saveEdit} className="text-green-500 hover:text-green-600"><i className="fas fa-check"></i></button>
                                        <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <TeamLogo teamName={team} size="sm" />
                                            <span className="font-medium text-gray-700 truncate text-sm" title={team}>{team}</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openLogoModal(team)} className="text-gray-400 hover:text-cyan-aura p-1" title="Change Logo"><i className="fas fa-image text-xs"></i></button>
                                            <button onClick={() => startEditing(index)} className="text-blue-400 hover:text-blue-600 p-1" title="Edit"><i className="fas fa-edit text-xs"></i></button>
                                            <button onClick={() => deleteTeam(index)} className="text-red-400 hover:text-red-600 p-1" title="Remove"><i className="fas fa-trash text-xs"></i></button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Date Settings */}
                {!isDrawing && !drawComplete && teams.length >= 2 && (
                    <div className="mb-8 border-t border-gray-100 pt-6">
                        <h3 className="font-bold text-gray-700 text-lg mb-4">
                            <i className="fas fa-calendar-alt mr-2 text-cyan-aura"></i>
                            Date Settings ({totalRounds} Days)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {Array.from({ length: totalRounds }).map((_, i) => {
                                const day = i + 1;
                                return (
                                    <div key={day} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="text-xs font-bold text-gray-500 mb-1">Round {day}</div>
                                        <input
                                            type="date"
                                            value={customMatchDates[day] || ''}
                                            onChange={(e) => handleDateChange(day, e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-cyan-aura outline-none"
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
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-aura to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-aura/50 disabled:opacity-50 transition-all"
                        >
                            <i className="fas fa-dice"></i> Start Draw
                        </button>
                    )}

                    {drawComplete && (
                        <>
                            <button
                                onClick={saveToFixtures}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
                            >
                                {saving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                                Save Fixtures
                            </button>
                            <button
                                onClick={resetDraw}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
                            >
                                <i className="fas fa-redo"></i> Reset
                            </button>
                        </>
                    )}

                    <button
                        onClick={clearAllFixtures}
                        disabled={clearing}
                        className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition-all ml-auto"
                    >
                        {clearing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash-alt"></i>}
                        Clear Fixtures
                    </button>
                </div>

                {message && (
                    <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                        {message.text}
                    </div>
                )}
            </div>

            {/* Drawing Animation / Results */}
            {(isDrawing || drawComplete) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-uefa-dark uppercase flex items-center gap-2">
                            <i className="fas fa-list-ol text-cyan-aura"></i>
                            Draw Results
                        </h3>
                        {isDrawing && (
                            <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold animate-pulse">
                                Drawing...
                            </span>
                        )}
                    </div>
                    <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matchDays.filter(round => round && round.day && round.matches).map((round) => (
                            <div key={round.day} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                    <span className="font-bold text-gray-700">Round {round.day}</span>
                                    <span className="text-xs text-gray-500">{round.date}</span>
                                </div>
                                <div className="p-2 space-y-2">
                                    {round.matches.map((match: any, idx: number) => {
                                        const matchesBefore = matchDays.filter(r => r.day < round.day).reduce((sum, r) => sum + r.matches.length, 0);
                                        const globalIdx = matchesBefore + idx;
                                        const isRevealed = drawComplete || globalIdx < displayedMatches.length;

                                        return (
                                            <div key={idx} className={`flex items-center justify-between p-2 rounded-lg text-sm transition-all duration-300 ${isRevealed ? 'bg-white border border-gray-100 shadow-sm' : 'bg-gray-100 opacity-50'}`}>
                                                <div className="flex-1 font-bold text-blue-700 truncate">{isRevealed ? match.blue : '???'}</div>
                                                <div className="px-2 text-xs text-gray-400 font-bold">VS</div>
                                                <div className="flex-1 font-bold text-red-700 truncate text-right">{isRevealed ? match.red : '???'}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Logo Modal */}
            {logoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in">
                        <div className="bg-gradient-to-r from-cyan-aura to-blue-600 p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">Manage Logo: {selectedTeam}</h3>
                            <button onClick={() => setLogoModalOpen(false)} className="hover:text-gray-200"><i className="fas fa-times"></i></button>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-center items-center gap-6 mb-6">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 mb-2">Current</p>
                                    <TeamLogo teamName={selectedTeam || ''} size="lg" />
                                </div>
                                {logoPreview && (
                                    <>
                                        <i className="fas fa-arrow-right text-gray-300"></i>
                                        <div className="text-center">
                                            <p className="text-xs text-cyan-500 mb-2">New</p>
                                            <img src={logoPreview} className="w-16 h-16 object-contain rounded-lg border" />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setLogoUploadMode('file')}
                                    className={`flex-1 py-1 px-3 rounded text-sm font-bold transition-colors ${logoUploadMode === 'file' ? 'bg-white text-cyan-aura shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    File
                                </button>
                                <button
                                    onClick={() => setLogoUploadMode('url')}
                                    className={`flex-1 py-1 px-3 rounded text-sm font-bold transition-colors ${logoUploadMode === 'url' ? 'bg-white text-cyan-aura shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    URL
                                </button>
                            </div>

                            <div className="mb-6">
                                {logoUploadMode === 'file' ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-aura transition-all cursor-pointer relative bg-gray-50">
                                        <input type="file" accept="image/*" onChange={handleLogoFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <i className="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i>
                                        <p className="text-sm text-gray-600">Click to upload</p>
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        className="w-full border p-2 rounded"
                                        placeholder="Image URL"
                                        value={logoUrlInput}
                                        onChange={e => { setLogoUrlInput(e.target.value); setLogoPreview(e.target.value); }}
                                    />
                                )}
                            </div>

                            <button
                                onClick={saveLogo}
                                disabled={uploadingLogo || (!logoFile && !logoUrlInput)}
                                className="w-full py-3 bg-cyan-aura text-white font-bold rounded-lg shadow-lg hover:bg-cyan-600 transition-all"
                            >
                                {uploadingLogo ? 'Saving...' : 'Save Logo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
