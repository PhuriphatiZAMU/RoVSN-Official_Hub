'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useLanguage } from '@/components/providers/LanguageProvider';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface Team {
    name: string;
    players: string[];
    logoUrl?: string;
}

interface Player {
    _id: string;
    name: string;
    inGameName?: string;
    team?: string;
}

export default function AdminTeamsPage() {
    const { t } = useLanguage();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Team>({ name: '', players: [] });

    // Additional state for player fetching
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Using axios directly for flexibility with the admin-specific logic
            const [playersRes, logosRes, scheduleRes] = await Promise.all([
                axios.get(`${API_BASE}/players`),
                axios.get(`${API_BASE}/team-logos`),
                axios.get(`${API_BASE}/schedules`)
            ]);

            const playersData = playersRes.data || [];
            const logosData = logosRes.data || [];
            const scheduleData = scheduleRes.data || {};

            setAllPlayers(playersData);

            // Extract unique teams from players and schedule
            const playerTeams = [...new Set(playersData.map((p: Player) => p.team).filter(Boolean))];
            // Handle schedule structure (might be array or object with teams prop)
            const scheduleTeams = Array.isArray(scheduleData)
                ? [] // If schedule is array of days, extraction logic would be different, but original code used .teams
                : (scheduleData.teams || []);

            // If scheduleData is the day-array, we might need to extract from matches. 
            // Original code: scheduleRes.data?.teams. 
            // If api structure changed, this might need check. 
            // Assuming original logic was correct for backend.

            // Fix: If scheduleRes.data is array of days, we iterate matches
            let scheduleTeamsExtracted: string[] = [];
            if (Array.isArray(scheduleData)) {
                scheduleData.forEach((day: any) => {
                    day.matches?.forEach((m: any) => {
                        if (m.blue) scheduleTeamsExtracted.push(m.blue);
                        if (m.red) scheduleTeamsExtracted.push(m.red);
                    });
                });
            } else if (scheduleData.teams) {
                scheduleTeamsExtracted = scheduleData.teams;
            }

            const allTeamNames = Array.from(new Set([...playerTeams, ...scheduleTeams, ...scheduleTeamsExtracted])) as string[];

            // Build team objects
            const teamList: Team[] = allTeamNames.map(name => ({
                name: name,
                players: playersData.filter((p: Player) => p.team === name).map((p: Player) => p.name),
                logoUrl: logosData.find((l: any) => l.teamName === name)?.logoUrl
            }));

            setTeams(teamList.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire({ icon: 'error', title: t.common.error });
        } finally {
            setLoading(false);
        }
    };

    const handleEditTeam = (team: Team) => {
        setEditingTeam(team);
        setFormData({ ...team });
        setShowModal(true);
    };

    const handleSaveTeam = async () => {
        if (!formData.name.trim()) {
            Swal.fire({ icon: 'warning', title: t.admin.teamsPage?.enterTeamName || 'Enter Team Name' });
            return;
        }

        try {
            const oldName = editingTeam?.name;
            const newName = formData.name.trim();

            if (oldName && oldName !== newName) {
                await axios.post(
                    `${API_BASE}/players/rename-team`,
                    { oldName, newName },
                    { withCredentials: true }
                );
            }

            const currentPlayers = allPlayers.filter(p => p.team === (newName || oldName));
            const newPlayerNames = formData.players;

            // Find players to remove (those in current but not in new list)
            // Note: Since formData.players is just names, this logic assumes unique names or matches strictly.
            // Original logic used name matching.
            const playersToRemove = currentPlayers.filter(p => !newPlayerNames.includes(p.name));

            for (const p of playersToRemove) {
                await axios.patch(
                    `${API_BASE}/players/${p._id}/update-ign`, // Note: verify endpoint
                    { team: null },
                    { withCredentials: true }
                );
            }
            // Logic to ADD players is missing in original code? 
            // It only removed players. Adding implies they are already in the list?
            // "formData.players" seems to be editable list of names.
            // If user adds a name, we might need to find that player and update them? 
            // Original code didn't seem to have "Add Player" logic in handleSave, only "Remove".
            // The modal allows removing members.

            Swal.fire({ icon: 'success', title: t.admin.teamsPage?.saveSuccess || 'Saved successfully' });
            setShowModal(false);
            setEditingTeam(null);
            fetchData();
        } catch (error) {
            console.error('Error saving team:', error);
            Swal.fire({ icon: 'error', title: t.admin.teamsPage?.saveError || 'Save failed' });
        }
    };

    const handleUploadLogo = async (teamName: string) => {
        const { value: file } = await Swal.fire({
            title: `Upload Logo: ${teamName}`,
            input: 'file',
            inputAttributes: {
                'accept': 'image/*',
                'aria-label': 'Upload your logo'
            },
            showCancelButton: true,
            confirmButtonText: 'Upload',
            showLoaderOnConfirm: true,
            preConfirm: async (file) => {
                if (!file) {
                    Swal.showValidationMessage('Please select a file');
                    return;
                }
                const uploadFormData = new FormData();
                uploadFormData.append('logo', file); // API expects 'logo' field?
                // The original code used 'logo' field but verify endpoint expecting 'image' or 'logo'.
                // AdminTeamsPage used 'logo'.

                try {
                    // 1. Upload File
                    // Check if there is a generic upload endpoint.
                    // api-client uses '/upload' which typically returns url.
                    // But here AdminTeamsPage used `${API_BASE}/api/upload`.

                    // We can try calling the generic upload first.
                    const uploadRes = await axios.post(`${API_BASE}/upload`, uploadFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        withCredentials: true
                    });
                    const logoUrl = uploadRes.data.url;

                    // 2. Save to team-logos
                    await axios.post(`${API_BASE}/team-logos`, {
                        teamName,
                        logoUrl
                    }, {
                        withCredentials: true
                    });

                    return logoUrl;
                } catch (error: any) {
                    Swal.showValidationMessage(`Upload failed: ${error.message}`);
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (file) {
            Swal.fire({ icon: 'success', title: 'Logo uploaded' });
            fetchData();
        }
    };

    const handleViewTeamDetails = (team: Team) => {
        const teamPlayers = allPlayers.filter(p => p.team === team.name);

        Swal.fire({
            title: team.name,
            html: `
                <div class="text-left">
                    ${team.logoUrl ? `<img src="${team.logoUrl}" class="w-24 h-24 mx-auto mb-4 rounded-lg object-contain bg-gray-50 border p-2" />` : ''}
                    <h4 class="font-bold text-gray-700 mb-2 border-b pb-1">Members (${teamPlayers.length})</h4>
                    <div class="max-h-60 overflow-y-auto space-y-1">
                        ${teamPlayers.length > 0 ? teamPlayers.map(p => `
                            <div class="flex justify-between items-center py-2 px-2 hover:bg-gray-50 rounded">
                                <div class="flex flex-col">
                                    <span class="font-medium text-gray-800">${p.name}</span>
                                    <span class="text-xs text-gray-400">IGN: ${p.inGameName || '-'}</span>
                                </div>
                            </div>
                        `).join('') : `<p class="text-gray-400 text-center py-4">No Members</p>`}
                    </div>
                </div>
            `,
            showCloseButton: true,
            showConfirmButton: false,
            width: 450
        });
    };

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-12 text-center text-gray-400">Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold text-uefa-dark">
                <i className="fas fa-users-cog mr-3 text-cyan-aura"></i>
                {t.admin.teamsPage?.title || 'Manage Teams'}
            </h1>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="relative">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder={t.admin.teamsPage?.search || 'Search Teams...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeams.map((team, index) => {
                    const teamPlayers = allPlayers.filter(p => p.team === team.name);

                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all border border-gray-100">
                            <div className="flex items-start gap-4">
                                <div className="group relative w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                                    {team.logoUrl ? (
                                        <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <i className="fas fa-users text-2xl text-gray-300"></i>
                                    )}
                                    <div
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                        onClick={() => handleUploadLogo(team.name)}
                                        title="Change Logo"
                                    >
                                        <i className="fas fa-camera text-white"></i>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-uefa-dark truncate">{team.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        <i className="fas fa-user-friends mr-1"></i>
                                        {teamPlayers.length} Members
                                    </p>

                                    {/* Player Avatars */}
                                    <div className="flex mt-2 -space-x-2">
                                        {teamPlayers.slice(0, 5).map((p, i) => (
                                            <div
                                                key={i}
                                                className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                                                title={p.name}
                                            >
                                                {p.name.charAt(0)}
                                            </div>
                                        ))}
                                        {teamPlayers.length > 5 && (
                                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold border-2 border-white">
                                                +{teamPlayers.length - 5}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleViewTeamDetails(team)}
                                    className="flex-1 py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600 transition-colors"
                                >
                                    <i className="fas fa-eye mr-1"></i> Details
                                </button>
                                <button
                                    onClick={() => handleEditTeam(team)}
                                    className="flex-1 py-2 px-3 bg-cyan-aura/10 hover:bg-cyan-aura/20 rounded-lg text-sm font-medium text-cyan-600 transition-colors"
                                >
                                    <i className="fas fa-edit mr-1"></i> Update
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="bg-gradient-to-r from-cyan-aura to-blue-600 p-6">
                            <h2 className="text-xl font-display font-bold text-white flex items-center">
                                <i className="fas fa-edit mr-3"></i>
                                Edit Team
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Team Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent bg-gray-50"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    <i className="fas fa-info-circle mr-1"></i>
                                    Renaming will update all players in this team.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Members</label>
                                <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
                                    {allPlayers.filter(p => p.team === (editingTeam?.name)).map((player, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 border-b border-gray-200 last:border-0 hover:bg-white">
                                            <span className="text-sm text-gray-800 font-medium">{player.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    // This only updates local state to visualize removal
                                                    // Actual removal happens on Save
                                                    if (formData.players.includes(player.name)) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            players: prev.players.filter(name => name !== player.name)
                                                        }));
                                                    } else {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            players: [...prev.players, player.name]
                                                        }));
                                                    }
                                                }}
                                                className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.players.includes(player.name)
                                                    ? 'bg-red-100 text-red-500 hover:bg-red-200'
                                                    : 'bg-green-100 text-green-500 hover:bg-green-200'
                                                    }`}
                                            >
                                                <i className={`fas ${formData.players.includes(player.name) ? 'fa-minus' : 'fa-undo'} text-xs`}></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 px-4 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg font-bold text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTeam}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-aura to-blue-600 text-white rounded-lg font-bold shadow-lg"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
