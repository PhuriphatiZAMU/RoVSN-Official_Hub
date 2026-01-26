import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import TeamLogo from '../../components/common/TeamLogo';
import { useConfirmModal } from '../../components/common/ConfirmModal';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminLogos() {
    const { teams, teamLogos } = useData();
    const { token } = useAuth();
    const { showConfirm } = useConfirmModal() as any;
    const { t } = useLanguage();

    const [selectedTeam, setSelectedTeam] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'url'
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

    const envUrl = import.meta.env.VITE_API_URL || '';
    const API_BASE_URL = envUrl ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`) : '/api';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
            setLogoUrl(''); // Clear URL input logic
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
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
                const result = await apiService.uploadImage(formData);
                finalUrl = result.url;
            }

            // 2. Save Team Logo URL
            if (finalUrl) {
                await apiService.createTeamLogo({ teamName: selectedTeam, logoUrl: finalUrl });
                setMessage({ type: 'success', text: t.admin.logosPage.successUpdate });
                setSelectedTeam('');
                setLogoUrl('');
                setLogoFile(null);
                setLogoPreview('');

                // Reload page to refresh data
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: `${t.admin.logosPage.errorGeneric}: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (teamName: string) => {
        showConfirm({
            title: t.admin.logosPage.deleteConfirm.replace('{team}', teamName),
            message: t.admin.logosPage.deleteConfirmText,
            onConfirm: async () => {
                try {
                    await apiService.deleteTeamLogo(teamName);

                    setMessage({ type: 'success', text: t.admin.logosPage.successDelete.replace('{team}', teamName) });
                    // Reload to refresh
                    setTimeout(() => window.location.reload(), 1000);
                } catch (error: any) {
                    setMessage({ type: 'error', text: `${t.admin.logosPage.errorGeneric}: ${error.message}` });
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
                        {t.admin.logosPage.title}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Team Select */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t.admin.logosPage.selectTeam}</label>
                            <select
                                value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none text-base"
                                required
                            >
                                <option value="">{t.admin.logosPage.selectTeamPlaceholder}</option>
                                {teams.map(team => (
                                    <option key={team} value={team}>{team}</option>
                                ))}
                            </select>
                        </div>

                        {/* Logo URL */}
                        {/* Upload Mode Toggle */}
                        <div className="md:col-span-2">
                            <div className="flex flex-col sm:flex-row gap-2 mb-4 bg-gray-100 p-1 rounded-lg w-full sm:w-fit mx-auto md:mx-0">
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('file')}
                                    className={`py-2 sm:py-1 px-4 rounded text-sm font-bold transition-colors w-full sm:w-auto ${uploadMode === 'file' ? 'bg-white text-cyan-aura shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {t.admin.logosPage.uploadFile}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('url')}
                                    className={`py-2 sm:py-1 px-4 rounded text-sm font-bold transition-colors w-full sm:w-auto ${uploadMode === 'url' ? 'bg-white text-cyan-aura shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {t.admin.logosPage.useUrl}
                                </button>
                            </div>
                        </div>

                        {/* File Upload / URL Input */}
                        <div className="md:col-span-2">
                            {uploadMode === 'file' ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-cyan-aura transition-colors cursor-pointer relative bg-gray-50 admin-upload-area">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                                    <p className="text-gray-600 font-medium text-sm sm:text-base">{t.admin.logosPage.dropZone}</p>
                                    <p className="text-xs sm:text-sm text-gray-400 mt-1">PNG, JPG, SVG (Max 2MB)</p>
                                    {logoFile && (
                                        <div className="mt-4 text-cyan-aura font-bold break-all">
                                            <i className="fas fa-check mr-2"></i>
                                            {logoFile.name}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {t.admin.logosPage.urlLabel}
                                        <span className="font-normal text-gray-500 ml-2 hidden sm:inline">{t.admin.logosPage.urlHelp}</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={logoUrl}
                                        onChange={(e) => {
                                            setLogoUrl(e.target.value);
                                            setLogoPreview(e.target.value);
                                        }}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none text-base"
                                        required={uploadMode === 'url'}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview */}
                    {(logoPreview) && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t.admin.logosPage.preview}</label>
                            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                                <img
                                    src={logoPreview}
                                    alt="Preview"
                                    className="w-24 h-24 object-contain bg-white rounded-lg border p-2"
                                    onError={(e: any) => e.target.src = 'https://via.placeholder.com/80?text=Error'}
                                />
                                <div>
                                    <p className="font-bold text-lg text-uefa-dark">{selectedTeam || t.admin.logosPage.selectTeam}</p>
                                    {uploadMode === 'url' && <p className="text-sm text-gray-500 break-all">{logoUrl}</p>}
                                    {uploadMode === 'file' && <p className="text-sm text-gray-500 break-all">{logoFile?.name}</p>}
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
                        className="mt-6 w-full bg-cyan-aura text-uefa-dark font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
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
                        {t.admin.logosPage.currentLogos}
                    </h2>
                </div>

                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 team-logo-grid">
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
                                        <><i className="fas fa-check mr-1"></i>{t.admin.logosPage.hasLogo}</>
                                    ) : (
                                        <><i className="fas fa-times mr-1"></i>{t.admin.logosPage.noLogo}</>
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
