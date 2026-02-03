'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import apiService from '@/lib/api-client';
import TeamLogo from '@/components/common/TeamLogo';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function AdminLogosPage() {
    const { t } = useLanguage();
    const [teams, setTeams] = useState<string[]>([]);
    const [teamLogos, setTeamLogos] = useState<Record<string, string>>({});
    const [selectedTeam, setSelectedTeam] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch teams (which include logos in newer API, but checking structure)
            const teamsList = await apiService.getTeams();
            // teamsList is Team[]: { _id, name, logo, ... }

            const names = teamsList.map(t => t.name).sort();
            const logosMap: Record<string, string> = {};
            teamsList.forEach(t => {
                if (t.logo) logosMap[t.name] = t.logo;
            });

            setTeams(names);
            setTeamLogos(logosMap);
        } catch (error) {
            console.error('Error fetching teams:', error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
            setLogoUrl('');
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

                // Use apiService.uploadImage
                const result = await apiService.uploadImage(formData);
                finalUrl = result.url;
            }

            // 2. Save Team Logo URL
            if (finalUrl) {
                // apiService.createTeamLogo matches existing usage
                await apiService.createTeamLogo({ teamName: selectedTeam, logoUrl: finalUrl });
                setMessage({ type: 'success', text: t.admin.logosPage?.successUpdate || 'Logo updated successfully' });

                // Clear state
                setSelectedTeam('');
                setLogoUrl('');
                setLogoFile(null);
                setLogoPreview('');

                // Refresh data
                fetchData();
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (teamName: string) => {
        const result = await Swal.fire({
            title: `Delete logo for ${teamName}?`,
            text: "Are you sure you want to remove this logo?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it'
        });

        if (result.isConfirmed) {
            try {
                await apiService.deleteTeamLogo(teamName);
                setMessage({ type: 'success', text: `Deleted logo for ${teamName}` });
                fetchData();
            } catch (error: any) {
                setMessage({ type: 'error', text: `Error: ${error.message}` });
            }
        }
    };

    if (isFetching) return <div className="p-12 text-center text-gray-400">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <h1 className="text-2xl font-display font-bold text-uefa-dark">
                <i className="fas fa-upload mr-3 text-cyan-aura"></i>
                {t.admin.logosPage?.title || 'Manage Team Logos'}
            </h1>

            {/* Upload Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Team Select */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                {t.admin.logosPage?.selectTeam || 'Select Team'}
                            </label>
                            <select
                                value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-cyan-aura focus:ring-2 focus:ring-cyan-aura/20 outline-none transition-shadow"
                                required
                            >
                                <option value="">Select a team...</option>
                                {teams.map(team => (
                                    <option key={team} value={team}>{team}</option>
                                ))}
                            </select>
                        </div>

                        {/* Mode Toggle */}
                        <div className="md:col-span-2 flex justify-center md:justify-start">
                            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('file')}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${uploadMode === 'file'
                                            ? 'bg-white text-cyan-aura shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Upload File
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('url')}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${uploadMode === 'url'
                                            ? 'bg-white text-cyan-aura shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Image URL
                                </button>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="md:col-span-2">
                            {uploadMode === 'file' ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-cyan-aura hover:bg-cyan-50/30 transition-all cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                                    <p className="text-gray-600 font-medium">Drag & drop or click to upload</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG (Max 2MB)</p>
                                    {logoFile && (
                                        <div className="mt-4 text-cyan-aura font-bold bg-white inline-block px-3 py-1 rounded shadow-sm border border-cyan-100">
                                            <i className="fas fa-check mr-2"></i>
                                            {logoFile.name}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                                    <input
                                        type="url"
                                        value={logoUrl}
                                        onChange={(e) => {
                                            setLogoUrl(e.target.value);
                                            setLogoPreview(e.target.value);
                                        }}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-cyan-aura outline-none"
                                        required={uploadMode === 'url'}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview Section */}
                    {logoPreview && (
                        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col sm:flex-row items-center gap-6 animate-fade-in">
                            <div className="w-24 h-24 bg-white rounded-lg border p-2 flex items-center justify-center shadow-sm">
                                <img
                                    src={logoPreview}
                                    alt="Preview"
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e: any) => e.target.src = 'https://via.placeholder.com/80?text=Error'}
                                />
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="font-bold text-lg text-uefa-dark">Preview</h3>
                                <p className="text-sm text-gray-500">
                                    Updating logo for: <span className="font-bold text-cyan-600">{selectedTeam || '...'}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {message && (
                        <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                            {message.text}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !selectedTeam || (uploadMode === 'url' && !logoUrl) || (uploadMode === 'file' && !logoFile)}
                        className="mt-6 w-full py-3.5 bg-gradient-to-r from-cyan-aura to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-aura/50 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-[0.99]"
                    >
                        {loading ? (
                            <span><i className="fas fa-spinner fa-spin mr-2"></i> Uploading...</span>
                        ) : (
                            <span><i className="fas fa-save mr-2"></i> Save Logo</span>
                        )}
                    </button>
                </form>
            </div>

            {/* Current Logos Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-uefa-dark">
                        {t.admin.logosPage?.currentLogos || 'Current Logos'}
                    </h2>
                </div>
                <div className="p-6">
                    {teams.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No teams found.</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {teams.map(team => (
                                <div key={team} className={`p-4 rounded-xl border-2 flex flex-col items-center justify-between min-h-[160px] transition-all ${teamLogos[team] ? 'border-green-100 bg-green-50/30' : 'border-gray-100 bg-gray-50/50'
                                    }`}>
                                    <div className="flex-1 flex items-center justify-center w-full mb-3">
                                        <TeamLogo teamName={team} size="lg" />
                                    </div>
                                    <div className="w-full text-center">
                                        <div className="font-bold text-sm text-gray-800 truncate mb-1" title={team}>
                                            {team}
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className={teamLogos[team] ? 'text-green-600' : 'text-gray-400'}>
                                                {teamLogos[team] ? 'Has Logo' : 'No Logo'}
                                            </span>
                                            {teamLogos[team] && (
                                                <button
                                                    onClick={() => handleDelete(team)}
                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                                                    title="Delete Logo"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
