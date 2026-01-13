import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

// Helper to clean name (remove prefixes)
const cleanName = (rawName) => {
    if (!rawName) return '';
    let name = rawName.trim();
    // Common Thai prefixes to strip
    const prefixes = ['นาย', 'นางสาว', 'นาง', 'ด.ช.', 'ด.ญ.', 'เด็กชาย', 'เด็กหญิง', 'Mr.', 'Ms.', 'Mrs.'];
    prefixes.sort((a, b) => b.length - a.length);
    for (const prefix of prefixes) {
        if (name.startsWith(prefix)) return name.substring(prefix.length).trim();
    }
    return name;
};

// Helper to parse CSV manually (robust version)
const parseCSV = (text) => {
    // Remove BOM if present
    const cleanText = text.replace(/^\uFEFF/, '');
    const lines = cleanText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    // Detect delimiter
    const firstLine = lines[0];
    let delimiter = ',';
    if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = ';';
    if ((firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = '\t';

    const data = [];

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
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [importPreview, setImportPreview] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', grade: '', team: '', inGameName: '', openId: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
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
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    const showSuccess = (msg) => {
        Toast.fire({ icon: 'success', title: msg });
    };

    const showError = (msg, title = 'Error') => {
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
        } catch (err) {
            console.error(err);
            // Inline error display is better for initial load failure
            setError(err.message || 'Failed to fetch players');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const processResult = (text) => {
            const parsed = parseCSV(text);
            if (parsed.length === 0) {
                Swal.fire('Warning', 'No data found. Please check CSV format.', 'warning');
            } else {
                showSuccess(`Found ${parsed.length} rows`);
            }
            setImportPreview(parsed);
            setIsImporting(true);
        };

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            // Check for keywords indicating correct decoding (Thai or English header)
            const looksCorrect = text.includes('ชื่อ') || text.includes('Name') || text.includes('ทีม') || text.includes('Team');

            if (!looksCorrect) {
                // Try TIS-620 / Windows-874 (likely for Excel CSV on Windows)
                const reader2 = new FileReader();
                reader2.onload = (evt2) => {
                    const text2 = evt2.target.result;
                    // If text2 looks better, use it
                    if (text2.includes('ชื่อ') || text2.includes('Name') || text2.includes('ทีม')) {
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
            Swal.fire('Error', 'No valid data found to import.', 'error');
            return;
        }

        try {
            // Show loading
            Swal.fire({
                title: 'Importing...',
                text: 'Please wait while we process the data.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            await axios.post(`${API_URL}/players/import`, importPreview, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            // Success
            Swal.fire({
                icon: 'success',
                title: 'Import Successful!',
                text: `Successfully imported ${importPreview.length} players.`,
                confirmButtonColor: '#15C8FF'
            });

            setIsImporting(false);
            setImportPreview([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchPlayers();

        } catch (error) {
            // Close loading swal if still open
            if (Swal.isVisible() && Swal.isLoading()) Swal.close();

            if (error.response?.status === 401 || error.response?.status === 403) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Session Expired',
                    text: 'Your login session has expired. Please login again.',
                    confirmButtonText: 'Go to Login',
                    willClose: () => { window.location.href = '/login'; }
                });
                return;
            }

            let msg = error.response?.data?.error || error.message || 'Unknown error';
            if (error.response?.status === 404) {
                msg += "\n(Tip: Server endpoint not found. Try restarting the server.)";
            }
            showError(msg, 'Import Failed');
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const headers = { Authorization: `Bearer ${getToken()}` };
            if (editingId) {
                await axios.put(`${API_URL}/players/${editingId}`, formData, { headers });
                showSuccess('Player updated successfully');
                setEditingId(null);
            } else {
                await axios.post(`${API_URL}/players`, formData, { headers });
                showSuccess('Player added successfully');
            }
            setFormData({ name: '', grade: '', team: '', inGameName: '', openId: '' });
            fetchPlayers();
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                Swal.fire('Session Expired', 'Please login again', 'warning').then(() => window.location.href = '/login');
                return;
            }
            showError(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleEdit = (p) => {
        setEditingId(p._id);
        setFormData({
            name: p.name,
            grade: p.grade,
            team: p.team,
            inGameName: p.inGameName,
            openId: p.openId
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/players/${id}`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                showSuccess('Player has been deleted.');
                fetchPlayers();
            } catch (error) {
                if (error.response?.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                showError('Failed to delete player');
            }
        }
    };

    const handleClearAll = async () => {
        const result = await Swal.fire({
            title: 'Clear ALL Players?',
            text: "This will delete every player in the roster. This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Yes, DELETE ALL!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/players/all/clear`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                Swal.fire(
                    'Deleted!',
                    'All players have been cleared.',
                    'success'
                );
                fetchPlayers();
            } catch (error) {
                showError('Failed to clear database');
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
            <h2 className="text-2xl font-bold text-uefa-dark">จัดการทะเบียนผู้เล่น (Roster)</h2>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <i className="fas fa-file-csv text-green-600"></i>
                    Import CSV
                </h3>
                <div className="flex gap-4 items-center mb-2">
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
                            hover:file:bg-blue-600 cursor-pointer
                        "
                    />
                    <div className="text-sm text-gray-500">
                        Format: ชื่อ-สกุล, ชั้น, ทีม, ชื่อในเกม, OpenID
                    </div>
                </div>

                {isImporting && importPreview.length > 0 && (
                    <div className="mt-4 bg-gray-50 p-4 rounded border">
                        <h4 className="font-bold mb-2">ตัวอย่างข้อมูล ({importPreview.length} รายการ)</h4>
                        <div className="overflow-x-auto max-h-60 mb-4">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="p-2">ชื่อ-สกุล</th>
                                        <th className="p-2">ชั้น</th>
                                        <th className="p-2">ทีม</th>
                                        <th className="p-2">ชื่อในเกม</th>
                                        <th className="p-2">OpenID</th>
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
                                        <tr><td colSpan="5" className="p-2 text-center text-gray-500">...และอีก {importPreview.length - 5} รายการ</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={confirmImport} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                ยืนยัน Import
                            </button>
                            <button onClick={() => { setIsImporting(false); setImportPreview([]); }} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold mb-4">{editingId ? 'แก้ไขข้อมูล' : 'เพิ่มผู้เล่นรายบุคคล'}</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input
                        name="name" placeholder="ชื่อ-สกุล Name" value={formData.name} onChange={handleInputChange} required
                        className="p-2 border rounded"
                    />
                    <input
                        name="grade" placeholder="ชั้น Grade/Class" value={formData.grade} onChange={handleInputChange}
                        className="p-2 border rounded"
                    />
                    <input
                        name="team" placeholder="ทีม Team" value={formData.team} onChange={handleInputChange} required
                        className="p-2 border rounded"
                    />
                    <input
                        name="inGameName" placeholder="ชื่อในเกม In-Game Name" value={formData.inGameName} onChange={handleInputChange}
                        className="p-2 border rounded"
                    />
                    <input
                        name="openId" placeholder="OpenID" value={formData.openId} onChange={handleInputChange}
                        className="p-2 border rounded"
                    />
                    <div className="flex gap-2 md:col-span-2 lg:col-span-1">
                        <button type="submit" className={`flex-1 py-2 px-4 rounded text-white ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-uefa-dark hover:bg-black'}`}>
                            {editingId ? 'บันทึกแก้ไข' : 'เพิ่มผู้เล่น'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', grade: '', team: '', inGameName: '', openId: '' }); }} className="bg-gray-400 text-white px-4 rounded">Cancel</button>
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
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h3 className="font-bold">รายชื่อในระบบ ({filteredPlayers.length})</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="ค้นหา (ชื่อ, ทีม, InGame)..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="p-2 border rounded text-sm w-64"
                        />
                        <button onClick={handleClearAll} className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm">
                            <i className="fas fa-trash-alt mr-1"></i> ล้างทั้งหมด
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="p-3 border-b">Team</th>
                                <th className="p-3 border-b">Name</th>
                                <th className="p-3 border-b">Grade</th>
                                <th className="p-3 border-b">In-Game</th>
                                <th className="p-3 border-b">OpenID</th>
                                <th className="p-3 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredPlayers.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">ไม่พบข้อมูล</td></tr>
                            ) : (
                                filteredPlayers.map(p => (
                                    <tr key={p._id} className="hover:bg-gray-50 border-b last:border-0 group">
                                        <td className="p-3 font-bold text-uefa-dark">{p.team}</td>
                                        <td className="p-3">{p.name}</td>
                                        <td className="p-3 text-gray-500">{p.grade}</td>
                                        <td className="p-3 font-mono text-cyan-700">{p.inGameName}</td>
                                        <td className="p-3 font-mono text-xs text-gray-400">{p.openId}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-700">
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700">
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
