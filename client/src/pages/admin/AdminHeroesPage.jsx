import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

export default function AdminHeroesPage() {
    const { token } = useAuth();
    const [heroes, setHeroes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Normalize API URL
    const envUrl = import.meta.env.VITE_API_URL || '';
    const API_URL = envUrl ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`) : '/api';

    // SweetAlert Toast
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    // Fetch heroes on mount
    useEffect(() => {
        fetchHeroes();
    }, []);

    const fetchHeroes = async () => {
        try {
            const res = await fetch(`${API_URL}/heroes`);
            if (res.ok) {
                const data = await res.json();
                setHeroes(data);
            }
        } catch (error) {
            console.error('Failed to fetch heroes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle multiple file upload
    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('heroes', files[i]);
        }

        try {
            const res = await fetch(`${API_URL}/heroes/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            // Check if response is JSON
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server ไม่ตอบสนอง กรุณาตรวจสอบว่า Backend ทำงานอยู่');
            }

            const data = await res.json();

            if (res.ok) {
                Toast.fire({
                    icon: 'success',
                    title: `อัปโหลดสำเร็จ ${data.heroes?.length || 0} ฮีโร่`
                });
                fetchHeroes();
            } else {
                Toast.fire({
                    icon: 'error',
                    title: data.error || 'อัปโหลดล้มเหลว'
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            Toast.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด: ' + error.message
            });
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    // Delete hero
    const handleDelete = async (hero) => {
        const result = await Swal.fire({
            title: 'ลบฮีโร่?',
            html: `<div class="text-center">
                <img src="${hero.imageUrl}" alt="${hero.name}" class="w-20 h-20 mx-auto mb-3 rounded-lg" onerror="this.src='https://via.placeholder.com/80'" />
                <p class="font-bold">${hero.name}</p>
            </div>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/heroes/${hero._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    Toast.fire({ icon: 'success', title: 'ลบสำเร็จ' });
                    fetchHeroes();
                } else {
                    Toast.fire({ icon: 'error', title: 'ลบไม่สำเร็จ' });
                }
            } catch (error) {
                Toast.fire({ icon: 'error', title: error.message });
            }
        }
    };

    // Edit hero name
    const handleEdit = async (hero) => {
        const { value: newName } = await Swal.fire({
            title: 'แก้ไขชื่อฮีโร่',
            input: 'text',
            inputValue: hero.name,
            inputPlaceholder: 'ชื่อฮีโร่',
            showCancelButton: true,
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก',
            inputValidator: (value) => {
                if (!value) return 'กรุณากรอกชื่อ';
            }
        });

        if (newName && newName !== hero.name) {
            try {
                const res = await fetch(`${API_URL}/heroes/${hero._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ name: newName })
                });

                if (res.ok) {
                    Toast.fire({ icon: 'success', title: 'บันทึกสำเร็จ' });
                    fetchHeroes();
                } else {
                    Toast.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ' });
                }
            } catch (error) {
                Toast.fire({ icon: 'error', title: error.message });
            }
        }
    };

    // Clear all heroes
    const handleClearAll = async () => {
        const result = await Swal.fire({
            title: 'ลบฮีโร่ทั้งหมด?',
            text: 'การกระทำนี้ไม่สามารถย้อนกลับได้',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'ลบทั้งหมด',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/heroes/all/clear`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    Toast.fire({ icon: 'success', title: 'ลบทั้งหมดสำเร็จ' });
                    fetchHeroes();
                }
            } catch (error) {
                Toast.fire({ icon: 'error', title: error.message });
            }
        }
    };

    // Filter heroes by search
    const filteredHeroes = heroes.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">จัดการฮีโร่</h1>
                    <p className="text-gray-500 text-sm">อัปโหลด, แก้ไข, ลบรูปภาพฮีโร่</p>
                </div>

                <div className="flex gap-3">
                    {/* Upload Button */}
                    <label className="cursor-pointer px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-bold hover:from-cyan-600 hover:to-blue-600 transition flex items-center gap-2">
                        <i className={`fas ${uploading ? 'fa-spinner fa-spin' : 'fa-upload'}`}></i>
                        {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดฮีโร่'}
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                    </label>

                    {heroes.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
                        >
                            <i className="fas fa-trash mr-2"></i>
                            ลบทั้งหมด
                        </button>
                    )}
                </div>
            </div>

            {/* Upload Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 mb-2">
                    <i className="fas fa-info-circle mr-2"></i>
                    วิธีการอัปโหลด
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• เลือกไฟล์รูปภาพหลายไฟล์พร้อมกันได้</li>
                    <li>• ชื่อฮีโร่จะถูกดึงจากชื่อไฟล์ (เช่น <code className="bg-blue-100 px-1 rounded">Nakroth.png</code> → <strong>Nakroth</strong>)</li>
                    <li>• ถ้าชื่อซ้ำ ระบบจะอัปเดตรูปภาพให้อัตโนมัติ</li>
                </ul>
            </div>

            {/* Search */}
            <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                    type="text"
                    placeholder="ค้นหาฮีโร่..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
                <span><i className="fas fa-image mr-1"></i> ทั้งหมด: <strong className="text-gray-800">{heroes.length}</strong> ฮีโร่</span>
                {searchTerm && (
                    <span><i className="fas fa-filter mr-1"></i> แสดง: <strong className="text-gray-800">{filteredHeroes.length}</strong></span>
                )}
            </div>

            {/* Heroes Grid */}
            {loading ? (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            ) : filteredHeroes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <i className="fas fa-ghost text-6xl mb-4 text-gray-300"></i>
                    <p className="text-lg font-bold">ยังไม่มีฮีโร่</p>
                    <p className="text-sm">อัปโหลดรูปภาพฮีโร่เพื่อเริ่มต้น</p>
                </div>
            ) : (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                    {filteredHeroes.map(hero => (
                        <div
                            key={hero._id}
                            className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-cyan-500 transition cursor-pointer"
                        >
                            <img
                                src={hero.imageUrl}
                                alt={hero.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/100?text=' + encodeURIComponent(hero.name);
                                }}
                            />

                            {/* Overlay with name */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                <p className="text-white text-xs font-bold truncate text-center">{hero.name}</p>
                            </div>

                            {/* Action buttons */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                <button
                                    onClick={() => handleEdit(hero)}
                                    className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                                    title="แก้ไข"
                                >
                                    <i className="fas fa-edit text-xs"></i>
                                </button>
                                <button
                                    onClick={() => handleDelete(hero)}
                                    className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                    title="ลบ"
                                >
                                    <i className="fas fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
