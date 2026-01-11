import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { postTeamLogo } from '../../services/api';
import TeamLogo from '../../components/common/TeamLogo';

export default function AdminLogos() {
    const { teams, teamLogos } = useData();
    const { token } = useAuth();

    const [selectedTeam, setSelectedTeam] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTeam || !logoUrl) return;

        setLoading(true);
        setMessage(null);

        try {
            await postTeamLogo({ teamName: selectedTeam, logoUrl }, token);
            setMessage({ type: 'success', text: 'อัปเดตโลโก้สำเร็จ!' });
            setSelectedTeam('');
            setLogoUrl('');

            // Reload page to refresh data
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            setMessage({ type: 'error', text: `เกิดข้อผิดพลาด: ${error.message}` });
        } finally {
            setLoading(false);
        }
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
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                URL โลโก้
                                <span className="font-normal text-gray-500 ml-2">(รองรับรูปจาก URL ภายนอก)</span>
                            </label>
                            <input
                                type="url"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                placeholder="https://example.com/logo.png"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-cyan-aura focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    {logoUrl && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm font-bold text-gray-700 mb-2">ตัวอย่างโลโก้</label>
                            <div className="flex items-center gap-4">
                                <img
                                    src={logoUrl}
                                    alt="Preview"
                                    className="w-20 h-20 object-contain bg-white rounded-lg border p-2"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=Error'}
                                />
                                <div>
                                    <p className="font-bold">{selectedTeam || 'ทีมที่เลือก'}</p>
                                    <p className="text-sm text-gray-500 break-all">{logoUrl}</p>
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
                        disabled={loading || !selectedTeam || !logoUrl}
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
                                <p className="text-sm font-bold text-gray-700 truncate">{team}</p>
                                <p className={`text-xs mt-1 ${teamLogos[team] ? 'text-green-600' : 'text-gray-400'}`}>
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
