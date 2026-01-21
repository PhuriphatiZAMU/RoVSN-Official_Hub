import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Team {
    _id?: string;
    name: string;
    players: string[];
    logoUrl?: string;
    createdAt?: Date;
}

interface Player {
    _id: string;
    name: string;
    inGameName?: string;
    team?: string;
}

export default function AdminTeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [logos, setLogos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Team>({ name: '', players: [] });

    const getToken = () => sessionStorage.getItem('auth_token');

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [playersRes, logosRes, scheduleRes] = await Promise.all([
                axios.get(`${API_BASE}/api/players`),
                axios.get(`${API_BASE}/api/team-logos`),
                axios.get(`${API_BASE}/api/schedule`)
            ]);

            setPlayers(playersRes.data || []);
            setLogos(logosRes.data || []);

            // Extract unique teams from players and schedule
            const playerTeams = [...new Set(playersRes.data?.map((p: Player) => p.team).filter(Boolean))];
            const scheduleTeams = scheduleRes.data?.teams || [];
            const allTeamNames = [...new Set([...playerTeams, ...scheduleTeams])];

            // Build team objects
            const teamList: Team[] = allTeamNames.map(name => ({
                name: name as string,
                players: playersRes.data?.filter((p: Player) => p.team === name).map((p: Player) => p.name) || [],
                logoUrl: logosRes.data?.find((l: any) => l.teamName === name)?.logoUrl
            }));

            setTeams(teamList.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error('Error fetching data:', error);
            Toast.fire({ icon: 'error', title: 'ไม่สามารถโหลดข้อมูลได้' });
        } finally {
            setLoading(false);
        }
    };

    const getTeamLogo = (teamName: string) => {
        const logo = logos.find(l => l.teamName === teamName);
        return logo?.logoUrl;
    };

    const getTeamPlayers = (teamName: string) => {
        return players.filter(p => p.team === teamName);
    };

    const handleEditTeam = (team: Team) => {
        setEditingTeam(team);
        setFormData({ ...team });
        setShowModal(true);
    };

    const handleSaveTeam = async () => {
        if (!formData.name.trim()) {
            Toast.fire({ icon: 'warning', title: 'กรุณากรอกชื่อทีม' });
            return;
        }

        try {
            // Update players' team assignments
            const teamPlayers = getTeamPlayers(editingTeam?.name || '');

            for (const player of teamPlayers) {
                if (!formData.players.includes(player.name)) {
                    // Remove player from team
                    await axios.patch(
                        `${API_BASE}/api/players/${player._id}/update-ign`,
                        { team: null },
                        { headers: { Authorization: `Bearer ${getToken()}` } }
                    );
                }
            }

            Toast.fire({ icon: 'success', title: 'บันทึกข้อมูลทีมเรียบร้อย' });
            setShowModal(false);
            setEditingTeam(null);
            fetchData();
        } catch (error) {
            console.error('Error saving team:', error);
            Toast.fire({ icon: 'error', title: 'ไม่สามารถบันทึกได้' });
        }
    };

    const handleViewTeamDetails = (team: Team) => {
        const teamPlayers = getTeamPlayers(team.name);

        Swal.fire({
            title: team.name,
            html: `
                <div class="text-left">
                    ${team.logoUrl ? `<img src="${team.logoUrl}" class="w-20 h-20 mx-auto mb-4 rounded-lg object-contain bg-gray-100" />` : ''}
                    <h4 class="font-bold text-gray-700 mb-2">สมาชิกทีม (${teamPlayers.length} คน)</h4>
                    <div class="max-h-60 overflow-y-auto">
                        ${teamPlayers.length > 0 ? teamPlayers.map(p => `
                            <div class="flex justify-between items-center py-2 border-b border-gray-100">
                                <span class="font-medium">${p.name}</span>
                                <span class="text-gray-400 text-sm">${p.inGameName || '-'}</span>
                            </div>
                        `).join('') : '<p class="text-gray-400">ไม่มีสมาชิก</p>'}
                    </div>
                </div>
            `,
            showCloseButton: true,
            showConfirmButton: false,
            width: 400
        });
    };

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-aura border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-uefa-dark">
                        <i className="fas fa-users-cog mr-3 text-cyan-aura"></i>
                        จัดการทีม
                    </h1>
                    <p className="text-gray-500 mt-1">ดูและจัดการข้อมูลทีมทั้งหมด ({teams.length} ทีม)</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="relative">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="ค้นหาทีม..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                    />
                </div>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeams.map((team, index) => {
                    const teamPlayers = getTeamPlayers(team.name);
                    const logo = getTeamLogo(team.name);

                    return (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all border border-gray-100"
                        >
                            <div className="flex items-start gap-4">
                                {/* Logo */}
                                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {logo ? (
                                        <img src={logo} alt={team.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <i className="fas fa-users text-2xl text-gray-300"></i>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-uefa-dark truncate">{team.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        <i className="fas fa-user-friends mr-1"></i>
                                        {teamPlayers.length} สมาชิก
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

                            {/* Actions */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleViewTeamDetails(team)}
                                    className="flex-1 py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600 transition-colors"
                                >
                                    <i className="fas fa-eye mr-1"></i> ดูรายละเอียด
                                </button>
                                <button
                                    onClick={() => handleEditTeam(team)}
                                    className="flex-1 py-2 px-3 bg-cyan-aura/10 hover:bg-cyan-aura/20 rounded-lg text-sm font-medium text-cyan-600 transition-colors"
                                >
                                    <i className="fas fa-edit mr-1"></i> แก้ไข
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredTeams.length === 0 && (
                <div className="text-center py-12">
                    <i className="fas fa-users text-5xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500">ไม่พบทีมที่ค้นหา</p>
                </div>
            )}

            {/* Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-display font-bold text-uefa-dark">
                                <i className="fas fa-edit mr-2 text-cyan-aura"></i>
                                แก้ไขทีม
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อทีม</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">สมาชิกทีม</label>
                                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                    {getTeamPlayers(editingTeam?.name || '').map((player, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded">
                                            <span>{player.name}</span>
                                            <span className="text-gray-400 text-sm">{player.inGameName}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => { setShowModal(false); setEditingTeam(null); }}
                                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-600 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSaveTeam}
                                className="flex-1 py-3 px-4 bg-cyan-aura hover:bg-cyan-500 rounded-lg font-medium text-white transition-colors"
                            >
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
