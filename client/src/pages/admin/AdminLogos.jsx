import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { postTeamLogo } from '../../services/api';
import TeamLogo from '../../components/common/TeamLogo';
import { useConfirmModal } from '../../components/common/ConfirmModal';

export default function AdminLogos() {
    const { teams, teamLogos } = useData();
    const { token } = useAuth();
    const { showConfirm } = useConfirmModal();

    const [selectedTeam, setSelectedTeam] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'url'
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const envUrl = import.meta.env.VITE_API_URL || '';
    const API_BASE_URL = envUrl ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`) : '/api';

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
            setLogoUrl(''); // Clear URL input logic
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTeam) return;
        if (uploadMode === 'url' && !logoUrl) return;
        if (uploadMode === 'file' && !logoFile) return;

        setLoading(true);
        setMessage(null);

        try {
            let finalUrl = logoUrl;

            // 1. Upload File if mode is file
            if (uploadMode === 'file' && logoFile) {
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
                await postTeamLogo({ teamName: selectedTeam, logoUrl: finalUrl }, token);
                setMessage({ type: 'success', text: 'อัปเดตโลโก้สำเร็จ!' });
                setSelectedTeam('');
                setLogoUrl('');
                setLogoFile(null);
                setLogoPreview('');

                // Reload page to refresh data
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (error) {
            setMessage({ type: 'error', text: `เกิดข้อผิดพลาด: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (teamName) => {
        showConfirm({
            title: `ลบโลโก้ทีม ${teamName}`,
            message: 'คุณต้องการลบโลโก้นี้ใช่หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้',
            onConfirm: async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/team-logos/${encodeURIComponent(teamName)}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (!res.ok) throw new Error('Failed to delete logo');

                    setMessage({ type: 'success', text: `ลบโลโก้ทีม ${teamName} เรียบร้อย` });
                    // Reload to refresh
                    setTimeout(() => window.location.reload(), 1000);
                } catch (error) {
                    setMessage({ type: 'error', text: `เกิดข้อผิดพลาด: ${error.message}` });
                }
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Upload Form */}
            <div className="bg-white rounded-xl shadow-sm mb-8">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-display font-bold text-uefa-dark uppercase">
                        <i className="fas fa-upload mr-2 text-cyan-aura"></i>
                        อัปโหลดโลโก้ทีม
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Team Select */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">เลือกทีม</label>
                            <select
                                value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none"
                                required
                            >
                                <option value="">-- เลือกทีม --</option>
                                {teams.map(team => (
                                    <option key={team} value={team}>{team}</option>
                                ))}
                            </select>
                        </div>

                        {/* Logo URL */}
                        {/* Upload Mode Toggle */}
                        <div className="md:col-span-2">
                            <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg w-fit mx-auto md:mx-0">
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('file')}
                                    className={`py-1 px-4 rounded text-sm font-bold transition-colors ${uploadMode === 'file' ? 'bg-white text-cyan-aura shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    อัปโหลดไฟล์
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('url')}
                                    className={`py-1 px-4 rounded text-sm font-bold transition-colors ${uploadMode === 'url' ? 'bg-white text-cyan-aura shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    ใช้ URL
                                </button>
                            </div>
                        </div>

                        {/* File Upload / URL Input */}
                        <div className="md:col-span-2">
                            {uploadMode === 'file' ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-cyan-aura transition-colors cursor-pointer relative bg-gray-50">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                                    <p className="text-gray-600 font-medium">คลิกหรือลากไฟล์มาวางที่นี่</p>
                                    <p className="text-sm text-gray-400 mt-1">PNG, JPG, SVG (Max 2MB)</p>
                                    {logoFile && (
                                        <div className="mt-4 text-cyan-aura font-bold">
                                            <i className="fas fa-check mr-2"></i>
                                            {logoFile.name}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        URL โลโก้
                                        <span className="font-normal text-gray-500 ml-2">(รองรับรูปจาก URL ภายนอก)</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={logoUrl}
                                        onChange={(e) => {
                                            setLogoUrl(e.target.value);
                                            setLogoPreview(e.target.value);
                                        }}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none"
                                        required={uploadMode === 'url'}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview */}
                    {(logoPreview) && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm font-bold text-gray-700 mb-2">ตัวอย่างโลโก้</label>
                            <div className="flex items-center gap-4">
                                <img
                                    src={logoPreview}
                                    alt="Preview"
                                    className="w-24 h-24 object-contain bg-white rounded-lg border p-2"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=Error'}
                                />
                                <div>
                                    <p className="font-bold text-lg text-uefa-dark">{selectedTeam || 'ทีมที่เลือก'}</p>
                                    {uploadMode === 'url' && <p className="text-sm text-gray-500 break-all">{logoUrl}</p>}
                                    {uploadMode === 'file' && <p className="text-sm text-gray-500">{logoFile?.name}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className={`mt-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !selectedTeam || (uploadMode === 'url' && !logoUrl) || (uploadMode === 'file' && !logoFile)}
                        className="mt-6 w-full bg-cyan-aura text-uefa-dark font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-circle-notch fa-spin"></i>
                                กำลังอัปโหลด...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save"></i>
                                บันทึกโลโก้
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Current Logos */}
            <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-display font-bold text-uefa-dark uppercase">
                        <i className="fas fa-images mr-2 text-cyan-aura"></i>
                        โลโก้ทีมปัจจุบัน
                    </h2>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {teams.map(team => (
                            <div
                                key={team}
                                className={`p-4 rounded-lg border-2 text-center ${teamLogos[team] ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                                    }`}
                            >
                                <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                                    <TeamLogo teamName={team} size="xl" />
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-sm font-bold text-gray-700 truncate flex-1 text-left">{team}</p>
                                    {teamLogos[team] && (
                                        <button
                                            onClick={() => handleDelete(team)}
                                            className="ml-2 text-red-400 hover:text-red-600 transition-colors p-1"
                                            title="ลบโลโก้"
                                        >
                                            <i className="fas fa-trash-alt text-xs"></i>
                                        </button>
                                    )}
                                </div>
                                <p className={`text-xs mt-1 text-left ${teamLogos[team] ? 'text-green-600' : 'text-gray-400'}`}>
                                    {teamLogos[team] ? (
                                        <><i className="fas fa-check mr-1"></i>มีโลโก้</>
                                    ) : (
                                        <><i className="fas fa-times mr-1"></i>ยังไม่มีโลโก้</>
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
