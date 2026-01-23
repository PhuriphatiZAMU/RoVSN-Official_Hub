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
                axios.get(`${API_BASE}/api/schedules`)
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
            const oldName = editingTeam?.name;
            const newName = formData.name.trim();

            if (oldName && oldName !== newName) {
                await axios.post(
                    `${API_BASE}/api/players/rename-team`,
                    { oldName, newName },
                    { headers: { Authorization: `Bearer ${getToken()}` } }
                );
            }

            const currentPlayers = getTeamPlayers(newName || oldName || '');
            const newPlayerNames = formData.players;

            const playersToRemove = currentPlayers.filter(p => !newPlayerNames.includes(p.name));
            for (const p of playersToRemove) {
                await axios.patch(
                    `${API_BASE}/api/players/${p._id}/update-ign`,
                    { team: null },
                    { headers: { Authorization: `Bearer ${getToken()}` } }
                );
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
                    ${team.logoUrl ? `<img src="${team.logoUrl}" class="w-24 h-24 mx-auto mb-4 rounded-lg object-contain bg-gray-50 border p-2" />` : ''}
                    <h4 class="font-bold text-gray-700 mb-2 border-b pb-1">สมาชิกทีม (${teamPlayers.length} คน)</h4>
                    <div class="max-h-60 overflow-y-auto space-y-1">
                        ${teamPlayers.length > 0 ? teamPlayers.map(p => `
                            <div class="flex justify-between items-center py-2 px-2 hover:bg-gray-50 rounded">
                                <div class="flex flex-col">
                                    <span class="font-medium text-gray-800">${p.name}</span>
                                    <span class="text-xs text-gray-400">IGN: ${p.inGameName || '-'}</span>
                                </div>
                                <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">Member</span>
                            </div>
                        `).join('') : '<p class="text-gray-400 text-center py-4">ไม่มีสมาชิก</p>'}
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

    const handleUploadLogo = async (teamName: string) => {
        const { value: file } = await Swal.fire({
            title: `อัปโหลดโลโก้ทีม ${teamName}`,
            input: 'file',
            inputAttributes: {
                'accept': 'image/*',
                'aria-label': 'Upload your profile picture'
            },
            html: '<p class="text-sm text-gray-500">รองรับไฟล์ PNG, JPG, SVG (Max 2MB)</p>',
            showCancelButton: true,
            confirmButtonText: 'อัปโหลด',
            cancelButtonText: 'ยกเลิก',
            showLoaderOnConfirm: true,
            preConfirm: async (file) => {
                if (!file) {
                    Swal.showValidationMessage('กรุณาเลือกไฟล์');
                    return;
                }
                const formData = new FormData();
                formData.append('logo', file);
                try {
                    const uploadRes = await axios.post(`${API_BASE}/api/upload`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${getToken()}`
                        }
                    });
                    const logoUrl = uploadRes.data.url;

                    // Save to team-logos
                    await axios.post(`${API_BASE}/api/team-logos`, {
                        teamName,
                        logoUrl
                    }, {
                        headers: { Authorization: `Bearer ${getToken()}` }
                    });

                    return logoUrl;
                } catch (error: any) {
                    Swal.showValidationMessage(`Upload failed: ${error.response?.data?.error || error.message}`);
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (file) {
            Toast.fire({ icon: 'success', title: 'อัปโหลดโลโก้เรียบร้อย' });
            fetchData();
        }
    };

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
                                <div className="group relative w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                                    {logo ? (
                                        <img src={logo} alt={team.name} className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <i className="fas fa-users text-2xl text-gray-300"></i>
                                    )}

                                    {/* Upload Overlay */}
                                    <div
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                        onClick={() => handleUploadLogo(team.name)}
                                        title="เปลี่ยนโลโก้"
                                    >
                                        <i className="fas fa-camera text-white"></i>
                                    </div>
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-aura to-blue-600 p-6">
                            <h2 className="text-xl font-display font-bold text-white flex items-center">
                                <i className="fas fa-edit mr-3"></i>
                                แก้ไขทีม {editingTeam?.name}
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อทีม</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent bg-gray-50"
                                    placeholder="ใส่ชื่อทีมใหม่..."
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    <i className="fas fa-info-circle mr-1"></i>
                                    การเปลี่ยนชื่อทีมจะอัปเดตผู้เล่นทุกคนในทีมอัตโนมัติ
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    สมาชิกทีม ({getTeamPlayers(editingTeam?.name || '').length} คน)
                                </label>
                                <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
                                    {getTeamPlayers(editingTeam?.name || '').length > 0 ? (
                                        getTeamPlayers(editingTeam?.name || '').map((player, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 border-b border-gray-200 last:border-0 hover:bg-white transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs">
                                                        {player.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-gray-800">{player.name}</div>
                                                        <div className="text-xs text-gray-500">{player.inGameName || 'No IGN'}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
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
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${formData.players.includes(player.name)
                                                        ? 'bg-red-100 text-red-500 hover:bg-red-200'
                                                        : 'bg-green-100 text-green-500 hover:bg-green-200'
                                                        }`}
                                                    title={formData.players.includes(player.name) ? "นำออกจากทีม" : "คืนค่า"}
                                                >
                                                    <i className={`fas ${formData.players.includes(player.name) ? 'fa-minus' : 'fa-undo'}`}></i>
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 text-sm">ไม่มีสมาชิก</div>
                                    )}
                                </div>
                                <p className="text-xs text-orange-500 mt-2">
                                    * กดปุ่ม (-) เพื่อนำผู้เล่นออก เมื่อบันทึกผู้เล่นจะกลายเป็นไม่มีทีม
                                </p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => { setShowModal(false); setEditingTeam(null); }}
                                className="flex-1 py-3 px-4 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg font-bold text-gray-700 transition-colors shadow-sm"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSaveTeam}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-aura to-blue-600 hover:shadow-cyan-aura/50 shadow-lg rounded-lg font-bold text-white transition-all transform active:scale-95"
                            >
                                <i className="fas fa-save mr-2"></i>
                                บันทึกการเปลี่ยนแปลง
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
