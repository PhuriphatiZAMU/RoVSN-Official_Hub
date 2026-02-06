'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface Player {
    _id?: string;
    name: string;
    grade?: string;
    team: string;
    inGameName?: string;
    openId?: string;
}

interface PlayerFormData {
    name: string;
    grade: string;
    team: string;
    inGameName: string;
    openId: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper to clean name
const cleanName = (rawName: any) => {
    if (!rawName) return '';
    let name = String(rawName).trim();
    const prefixes = ['นาย', 'นางสาว', 'นาง', 'ด.ช.', 'ด.ญ.', 'เด็กชาย', 'เด็กหญิง', 'Mr.', 'Ms.', 'Mrs.'];
    prefixes.sort((a, b) => b.length - a.length);
    for (const prefix of prefixes) {
        if (name.startsWith(prefix)) return name.substring(prefix.length).trim();
    }
    return name;
};

// Helper to parse CSV
const parseCSV = (text: any) => {
    if (typeof text !== 'string') return [];

    // Remove BOM
    const cleanText = text.replace(/^\uFEFF/, '');
    const lines = cleanText.split(/\r?\n/).filter((line: string) => line.trim() !== '');
    if (lines.length === 0) return [];

    const firstLine = lines[0];
    let delimiter = ',';
    if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = ';';
    if ((firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = '\t';

    const data: Player[] = [];
    let startIndex = 0;
    const headerLine = lines[0].toLowerCase();

    if (headerLine.includes('ชื่อ') || headerLine.includes('name') ||
        headerLine.includes('class') || headerLine.includes('ทีม') ||
        headerLine.includes('grade') || headerLine.includes('open')) {
        startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(delimiter).map((p: string) => p.trim().replace(/^["']|["']$/g, ''));

        if (parts.length >= 1 && parts.some((p: string) => p !== '')) {
            data.push({
                name: cleanName(parts[0]),
                grade: parts[1] || '',
                team: parts[2] || '',
                inGameName: parts[3] || '',
                openId: parts[4] || ''
            });
        }
    }
    return data;
};

export default function AdminPlayersPage() {
    const { t } = useLanguage();
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [importPreview, setImportPreview] = useState<Player[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<PlayerFormData>({
        name: '', grade: '', team: '', inGameName: '', openId: ''
    });

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE}/players`, { withCredentials: true });
            setPlayers(res.data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to fetch players');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const processResult = (result: string | ArrayBuffer | null) => {
            if (typeof result !== 'string') return;
            const parsed = parseCSV(result);
            if (parsed.length === 0) {
                Swal.fire({ icon: 'warning', title: t.admin.noData || 'No Data Found' });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: `Parsed ${parsed.length} items`,
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            setImportPreview(parsed);
            setIsImporting(true);
        };

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result;
            if (typeof text !== 'string') return;

            const looksCorrect = text.includes('ชื่อ') || text.includes('Name') || text.includes('ทีม') || text.includes('Team');

            if (!looksCorrect) {
                const reader2 = new FileReader();
                reader2.onload = (evt2) => {
                    const text2 = evt2.target?.result;
                    if (typeof text2 === 'string' && (text2.includes('ชื่อ') || text2.includes('Name'))) {
                        processResult(text2);
                    } else {
                        processResult(text);
                    }
                };
                reader2.readAsText(file, 'windows-874'); // Thai encoding fallback
            } else {
                processResult(text);
            }
        };
        reader.readAsText(file, 'UTF-8');
    };

    const confirmImport = async () => {
        if (importPreview.length === 0) return;

        try {
            Swal.fire({
                title: 'Importing...',
                didOpen: () => Swal.showLoading()
            });

            await axios.post(`${API_BASE}/players/import`, importPreview, { withCredentials: true });

            Swal.fire({
                icon: 'success',
                title: 'Import Successful',
                text: `Imported ${importPreview.length} players.`
            });

            setIsImporting(false);
            setImportPreview([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchPlayers();
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Import Failed',
                text: error.response?.data?.error || error.message
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${API_BASE}/players/${editingId}`, formData, { withCredentials: true });
                Swal.fire({ icon: 'success', title: 'Updated successfully', timer: 1500, showConfirmButton: false });
                setEditingId(null);
            } else {
                await axios.post(`${API_BASE}/players`, formData, { withCredentials: true });
                Swal.fire({ icon: 'success', title: 'Added successfully', timer: 1500, showConfirmButton: false });
            }
            setFormData({ name: '', grade: '', team: '', inGameName: '', openId: '' });
            fetchPlayers();
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Operation Failed',
                text: error.response?.data?.error || error.message
            });
        }
    };

    const handleEdit = (p: Player) => {
        setEditingId(p._id || null);
        setFormData({
            name: p.name,
            grade: p.grade || '',
            team: p.team,
            inGameName: p.inGameName || '',
            openId: p.openId || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE}/players/${id}`, { withCredentials: true });
                Swal.fire('Deleted!', 'Player has been deleted.', 'success');
                fetchPlayers();
            } catch (error: any) {
                Swal.fire('Error', 'Failed to delete player.', 'error');
            }
        }
    };

    const handleClearAll = async () => {
        const result = await Swal.fire({
            title: 'Clear ALL players?',
            text: 'This will delete ALL player data. This cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, clear all!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE}/players/all/clear`, { withCredentials: true });
                Swal.fire('Cleared!', 'All players have been removed.', 'success');
                fetchPlayers();
            } catch (error) {
                Swal.fire('Error', 'Failed to clear players.', 'error');
            }
        }
    };

    const filteredPlayers = players.filter(p =>
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.team && p.team.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.inGameName && p.inGameName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold text-uefa-dark">
                <i className="fas fa-users mr-3 text-cyan-aura"></i>
                {t.admin.rosterTitle || 'Manage Players'}
            </h1>

            {/* Import Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-700">
                    <i className="fas fa-file-csv text-green-600"></i>
                    {t.admin.importCsv || 'Import CSV'}
                </h3>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-cyan-aura file:text-white
                            hover:file:bg-cyan-600 cursor-pointer"
                    />
                    <div className="text-sm text-gray-400">
                        Format: Name, Grade, Team, IGN, OpenID
                    </div>
                </div>

                {/* Import Preview */}
                {isImporting && importPreview.length > 0 && (
                    <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-gray-700">Preview ({importPreview.length} Items)</h4>
                            <div className="flex gap-2">
                                <button onClick={() => { setIsImporting(false); setImportPreview([]); }} className="px-3 py-1 bg-gray-300 rounded text-sm font-bold text-gray-600 hover:bg-gray-400">Cancel</button>
                                <button onClick={confirmImport} className="px-3 py-1 bg-green-500 rounded text-sm font-bold text-white hover:bg-green-600">Confirm Import</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto max-h-60 rounded border border-gray-200 bg-white">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-600 sticky top-0">
                                    <tr>
                                        <th className="p-2 border-b">Name</th>
                                        <th className="p-2 border-b">Team</th>
                                        <th className="p-2 border-b">IGN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importPreview.slice(0, 10).map((p, i) => (
                                        <tr key={i} className="border-b last:border-0">
                                            <td className="p-2">{p.name}</td>
                                            <td className="p-2">{p.team}</td>
                                            <td className="p-2">{p.inGameName}</td>
                                        </tr>
                                    ))}
                                    {importPreview.length > 10 && (
                                        <tr><td colSpan={3} className="p-2 text-center text-gray-400">...and {importPreview.length - 10} more</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4 text-gray-700">
                    {editingId ? 'Edit Player' : 'Add Single Player'}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <input name="name" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-aura outline-none" />
                    <input name="grade" placeholder="Grade" value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-aura outline-none" />
                    <input name="team" placeholder="Team" value={formData.team} onChange={(e) => setFormData({ ...formData, team: e.target.value })} required className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-aura outline-none" />
                    <input name="inGameName" placeholder="In-Game Name" value={formData.inGameName} onChange={(e) => setFormData({ ...formData, inGameName: e.target.value })} className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-aura outline-none" />
                    <input name="openId" placeholder="OpenID" value={formData.openId} onChange={(e) => setFormData({ ...formData, openId: e.target.value })} className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-aura outline-none" />

                    <div className="flex gap-2">
                        <button type="submit" className={`flex-1 rounded-lg font-bold text-white shadow-sm transition-transform active:scale-95 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-uefa-dark hover:bg-black'}`}>
                            {editingId ? 'Update' : 'Add'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', grade: '', team: '', inGameName: '', openId: '' }); }} className="px-3 bg-gray-300 rounded-lg hover:bg-gray-400 text-gray-700">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-700">Players ({filteredPlayers.length})</h3>
                    <div className="flex gap-4">
                        <div className="relative">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-aura outline-none"
                            />
                        </div>
                        <button onClick={handleClearAll} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold text-xs hover:bg-red-200 transition-colors">
                            Clear All
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-3 rounded-l-lg">Team</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Grade</th>
                                <th className="p-3">IGN</th>
                                <th className="p-3 text-center rounded-r-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-100">
                            {filteredPlayers.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No players found.</td></tr>
                            ) : (
                                filteredPlayers.map(p => (
                                    <tr key={p._id} className="hover:bg-gray-50 group transition-colors">
                                        <td className="p-3 font-bold text-uefa-dark">{p.team}</td>
                                        <td className="p-3">{p.name}</td>
                                        <td className="p-3 text-gray-500">{p.grade}</td>
                                        <td className="p-3 text-cyan-600 font-mono">{p.inGameName}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors">
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button onClick={() => handleDelete(p._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
