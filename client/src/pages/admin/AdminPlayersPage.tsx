import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useLanguage } from '../../context/LanguageContext';

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

// Helper to clean name (remove prefixes)
const cleanName = (rawName: any) => {
    if (!rawName) return '';
    let name = String(rawName).trim();
    // Common Thai prefixes to strip
    const prefixes = ['นาย', 'นางสาว', 'นาง', 'ด.ช.', 'ด.ญ.', 'เด็กชาย', 'เด็กหญิง', 'Mr.', 'Ms.', 'Mrs.'];
    prefixes.sort((a, b) => b.length - a.length);
    for (const prefix of prefixes) {
        if (name.startsWith(prefix)) return name.substring(prefix.length).trim();
    }
    return name;
};

// Helper to parse CSV manually (robust version)
const parseCSV = (text: any) => {
    if (typeof text !== 'string') return [];

    // Remove BOM if present
    const cleanText = text.replace(/^\uFEFF/, '');
    const lines = cleanText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    // Detect delimiter
    const firstLine = lines[0];
    let delimiter = ',';
    if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = ';';
    if ((firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = '\t';

    const data: Player[] = [];

    // Smart Header Detection
    let startIndex = 0;
    const headerLine = lines[0].toLowerCase();
    // Keywords likely to be in a header row
    if (headerLine.includes('ชื่อ') || headerLine.includes('name') ||
        headerLine.includes('class') || headerLine.includes('ทีม') ||
        headerLine.includes('grade') || headerLine.includes('open')) {
        startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));

        // Allow partial data but ensure at least some content exists
        if (parts.length >= 1 && parts.some(p => p !== '')) {
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

    // Normalize API URL - ensure it ends with /api
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
    // Use sessionStorage as AuthContext does
    const getToken = () => sessionStorage.getItem('token');

    // SweetAlert2 Toast Mixin
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });

    const showSuccess = (msg: string) => {
        Toast.fire({ icon: 'success', title: msg });
    };

    const showError = (msg: string, title = 'Error') => {
        Swal.fire({
            icon: 'error',
            title: title,
            text: msg,
            confirmButtonColor: '#d33',
            background: '#fff',
            color: '#333'
        });
    };

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/players`);
            setPlayers(res.data);
        } catch (err: any) {
            console.error(err);
            // Inline error display is better for initial load failure
            setError(err.message || t.admin.playersPage.fetchError);
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
                Swal.fire(t.admin.warning, t.admin.noData, 'warning');
            } else {
                showSuccess(t.admin.playersPage.importSuccessText.replace('{count}', parsed.length.toString()));
            }
            setImportPreview(parsed);
            setIsImporting(true);
        };

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result;
            if (typeof text !== 'string') return;

            // Check for keywords indicating correct decoding (Thai or English header)
            const looksCorrect = text.includes('ชื่อ') || text.includes('Name') || text.includes('ทีม') || text.includes('Team');

            if (!looksCorrect) {
                // Try TIS-620 / Windows-874 (likely for Excel CSV on Windows)
                const reader2 = new FileReader();
                reader2.onload = (evt2) => {
                    const text2 = evt2.target?.result;
                    // If text2 looks better, use it
                    if (typeof text2 === 'string' && (text2.includes('ชื่อ') || text2.includes('Name') || text2.includes('ทีม'))) {
                        processResult(text2);
                    } else {
                        // Fallback to UTF-8
                        processResult(text);
                    }
                };
                reader2.readAsText(file, 'windows-874');
            } else {
                processResult(text);
            }
        };
        reader.readAsText(file, 'UTF-8');
    };

    const confirmImport = async () => {
        if (importPreview.length === 0) {
            Swal.fire('Error', t.admin.noData, 'error');
            return;
        }

        try {
            // Show loading
            Swal.fire({
                title: t.admin.loading,
                text: t.admin.playersPage.waitProcess,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            await axios.post(`${API_URL}/players/import`, importPreview, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            // Success
            Swal.fire({
                icon: 'success',
                title: t.admin.playersPage.importSuccessTitle,
                text: t.admin.playersPage.importSuccessText.replace('{count}', importPreview.length.toString()),
                confirmButtonColor: '#15C8FF'
            });

            setIsImporting(false);
            setImportPreview([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchPlayers();

        } catch (error: any) {
            // Close loading swal if still open
            if (Swal.isVisible() && Swal.isLoading()) Swal.close();

            if (error.response?.status === 401 || error.response?.status === 403) {
                Swal.fire({
                    icon: 'warning',
                    title: t.admin.sessionExpired,
                    text: t.admin.pleaseLogin,
                    confirmButtonText: 'Go to Login',
                    willClose: () => { window.location.href = '/login'; }
                });
                return;
            }

            let msg = error.response?.data?.error || error.message || t.admin.playersPage.unknownError;
            if (error.response?.status === 404) {
                msg += "\n(Tip: Server endpoint not found. Try restarting the server.)";
            }
            showError(msg, t.admin.playersPage.importFailed);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const headers = { Authorization: `Bearer ${getToken()}` };
            if (editingId) {
                await axios.put(`${API_URL}/players/${editingId}`, formData, { headers });
                showSuccess(t.admin.saveChanges);
                setEditingId(null);
            } else {
                await axios.post(`${API_URL}/players`, formData, { headers });
                showSuccess(t.admin.playersPage.addedSuccess);
            }
            setFormData({ name: '', grade: '', team: '', inGameName: '', openId: '' });
            fetchPlayers();
        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                Swal.fire(t.admin.sessionExpired, t.admin.pleaseLogin, 'warning').then(() => window.location.href = '/login');
                return;
            }
            showError(error.response?.data?.error || 'Operation failed');
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
            title: t.admin.playersPage.confirmDeleteText,
            text: t.admin.playersPage.confirmDeleteText,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t.admin.delete,
            cancelButtonText: t.admin.cancel
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/players/${id}`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                showSuccess(t.admin.playersPage.deletedSuccess);
                fetchPlayers();
            } catch (error: any) {
                if (error.response?.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                showError(t.admin.playersPage.deleteError);
            }
        }
    };

    const handleClearAll = async () => {
        const result = await Swal.fire({
            title: t.admin.clearAll + '?',
            text: t.admin.playersPage.confirmClearText,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#aaa',
            confirmButtonText: t.admin.playersPage.confirmClearBtn
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/players/all/clear`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                Swal.fire(
                    t.admin.playersPage.deletedTitle,
                    t.admin.playersPage.deletedAllText,
                    'success'
                );
                fetchPlayers();
            } catch (error) {
                showError(t.admin.playersPage.clearError);
            }
        }
    };

    const filteredPlayers = players.filter(p =>
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.team && p.team.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.inGameName && p.inGameName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-uefa-dark">{t.admin.rosterTitle}</h2>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <i className="fas fa-file-csv text-green-600"></i>
                    {t.admin.importCsv}
                </h3>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-2">
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="block w-full md:w-auto text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-cyan-aura file:text-white
                            hover:file:bg-blue-600 cursor-pointer
                        "
                    />
                    <div className="text-sm text-gray-500">
                        {t.admin.csvFormat}
                    </div>
                </div>

                {isImporting && importPreview.length > 0 && (
                    <div className="mt-4 bg-gray-50 p-4 rounded border">
                        <h4 className="font-bold mb-2">{t.admin.dataPreview} ({importPreview.length} Items)</h4>
                        <div className="overflow-x-auto max-h-60 mb-4">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="p-2">{t.admin.name}</th>
                                        <th className="p-2">{t.admin.grade}</th>
                                        <th className="p-2">{t.admin.team}</th>
                                        <th className="p-2">{t.admin.inGameName}</th>
                                        <th className="p-2">{t.admin.openId}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importPreview.slice(0, 5).map((p, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="p-2">{p.name}</td>
                                            <td className="p-2">{p.grade}</td>
                                            <td className="p-2">{p.team}</td>
                                            <td className="p-2">{p.inGameName}</td>
                                            <td className="p-2">{p.openId}</td>
                                        </tr>
                                    ))}
                                    {importPreview.length > 5 && (
                                        <tr><td colSpan={5} className="p-2 text-center text-gray-500">...and {importPreview.length - 5} more</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={confirmImport} className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                {t.admin.confirmImport}
                            </button>
                            <button onClick={() => { setIsImporting(false); setImportPreview([]); }} className="flex-1 md:flex-none px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
                                {t.admin.cancel}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold mb-4">{editingId ? t.admin.editPlayer : t.admin.addSinglePlayer}</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input
                        name="name" placeholder={t.admin.name} value={formData.name} onChange={handleInputChange} required
                        className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                    />
                    <input
                        name="grade" placeholder={t.admin.grade} value={formData.grade} onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                    />
                    <input
                        name="team" placeholder={t.admin.team} value={formData.team} onChange={handleInputChange} required
                        className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                    />
                    <input
                        name="inGameName" placeholder={t.admin.inGameName} value={formData.inGameName} onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                    />
                    <input
                        name="openId" placeholder={t.admin.openId} value={formData.openId} onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                    />
                    <div className="flex gap-2 md:col-span-2 lg:col-span-1">
                        <button type="submit" className={`flex-1 py-2 px-4 rounded-lg text-white font-bold shadow-md transition-transform active:scale-95 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-uefa-dark hover:bg-black'}`}>
                            {editingId ? t.admin.saveChanges : t.admin.addPlayer}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', grade: '', team: '', inGameName: '', openId: '' }); }} className="bg-gray-400 text-white px-4 rounded-lg hover:bg-gray-500">{t.admin.cancel}</button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-200">
                        <i className="fas fa-exclamation-circle mr-2"></i>
                        {error} (Try refreshing if fetch failed)
                    </div>
                )}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="font-bold whitespace-nowrap">{t.admin.playersInSystem} ({filteredPlayers.length})</h3>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder={t.admin.searchPlaceholder}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-aura focus:border-transparent"
                            />
                        </div>
                        <button onClick={handleClearAll} className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm font-bold whitespace-nowrap transition-colors w-full sm:w-auto text-center">
                            <i className="fas fa-trash-alt mr-1"></i> {t.admin.clearAll}
                        </button>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="p-3 border-b border-gray-200">{t.admin.team}</th>
                                <th className="p-3 border-b border-gray-200">{t.admin.name}</th>
                                <th className="p-3 border-b border-gray-200">{t.admin.grade}</th>
                                <th className="p-3 border-b border-gray-200">{t.admin.inGameName}</th>
                                <th className="p-3 border-b border-gray-200">{t.admin.openId}</th>
                                <th className="p-3 border-b border-gray-200 text-center">{t.admin.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredPlayers.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-400">{t.admin.noData}</td></tr>
                            ) : (
                                filteredPlayers.map(p => (
                                    <tr key={p._id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 group">
                                        <td className="p-3 font-bold text-uefa-dark max-w-[150px] truncate" title={p.team}>{p.team}</td>
                                        <td className="p-3 max-w-[150px] truncate" title={p.name}>{p.name}</td>
                                        <td className="p-3 text-gray-500">{p.grade}</td>
                                        <td className="p-3 font-mono text-cyan-700">{p.inGameName}</td>
                                        <td className="p-3 font-mono text-xs text-gray-400 bg-gray-50 rounded select-all">{p.openId}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(p)} className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                                                    <i className="fas fa-edit text-xs"></i>
                                                </button>
                                                <button onClick={() => handleDelete(p._id)} className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                                                    <i className="fas fa-trash text-xs"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {filteredPlayers.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                            {t.admin.noData}
                        </div>
                    ) : (
                        filteredPlayers.map(p => (
                            <div key={p._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative">
                                <span className="absolute top-4 right-4 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                    {p.grade || 'No Grade'}
                                </span>
                                <div className="mb-3 pr-16">
                                    <div className="text-xs text-uefa-dark font-bold uppercase tracking-wider mb-1">{p.team}</div>
                                    <div className="font-bold text-lg text-gray-800">{p.name}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div>
                                        <div className="text-xs text-gray-400">{t.admin.inGameName}</div>
                                        <div className="font-mono text-cyan-700 font-medium truncate">{p.inGameName || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400">{t.admin.openId}</div>
                                        <div className="font-mono text-gray-600 text-xs truncate">{p.openId || '-'}</div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(p)}
                                        className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                                    >
                                        <i className="fas fa-edit mr-1"></i> {t.admin.edit}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p._id)}
                                        className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                                    >
                                        <i className="fas fa-trash mr-1"></i> {t.admin.delete}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
