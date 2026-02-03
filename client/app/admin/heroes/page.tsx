'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface Hero {
    _id: string;
    name: string;
    imageUrl: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function AdminHeroesPage() {
    const { t } = useLanguage();
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHeroes();
    }, []);

    const fetchHeroes = async () => {
        try {
            const res = await axios.get(`${API_BASE}/heroes`, { withCredentials: true });
            setHeroes(res.data || []);
        } catch (error) {
            console.error('Failed to fetch heroes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('heroes', files[i]);
        }

        try {
            const res = await axios.post(`${API_BASE}/heroes/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            const count = res.data.heroes?.length || 0;
            Swal.fire({
                icon: 'success',
                title: 'Upload Successful',
                text: `Uploaded ${count} heroes successfully`
            });
            fetchHeroes();
        } catch (error: any) {
            console.error('Upload error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed',
                text: error.response?.data?.error || error.message
            });
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (hero: Hero) => {
        const result = await Swal.fire({
            title: `Delete ${hero.name}?`,
            html: `<div class="text-center">
                <img src="${hero.imageUrl}" alt="${hero.name}" class="w-20 h-20 mx-auto mb-3 rounded-lg" onerror="this.src='https://via.placeholder.com/80'" />
                <p class="font-bold text-gray-700">This cannot be undone.</p>
            </div>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE}/heroes/${hero._id}`, { withCredentials: true });
                Swal.fire('Deleted!', 'Hero has been deleted.', 'success');
                fetchHeroes();
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.error || 'Failed to delete hero', 'error');
            }
        }
    };

    const handleEdit = async (hero: Hero) => {
        const { value: newName } = await Swal.fire({
            title: 'Edit Hero Name',
            input: 'text',
            inputValue: hero.name,
            inputPlaceholder: 'Hero Name',
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value) return 'You need to write something!';
            }
        });

        if (newName && newName !== hero.name) {
            try {
                await axios.put(`${API_BASE}/heroes/${hero._id}`, { name: newName }, { withCredentials: true });
                Swal.fire({ icon: 'success', title: 'Updated successfully', timer: 1500, showConfirmButton: false });
                fetchHeroes();
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.error || 'Failed to update hero', 'error');
            }
        }
    };

    const handleClearAll = async () => {
        const result = await Swal.fire({
            title: 'Clear ALL Heroes?',
            text: 'This will delete ALL heroes. This cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, clear all'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE}/heroes/all/clear`, { withCredentials: true });
                Swal.fire('Cleared!', 'All heroes have been removed.', 'success');
                fetchHeroes();
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.error || 'Failed to clear heroes', 'error');
            }
        }
    };

    const filteredHeroes = heroes.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-uefa-dark">
                        <i className="fas fa-mask mr-3 text-cyan-aura"></i>
                        {t.admin.heroesPage?.title || 'Manage Heroes'}
                    </h1>
                    <p className="text-gray-500 text-sm">Upload and manage hero images for scraping.</p>
                </div>

                <div className="flex gap-3">
                    <label className="cursor-pointer px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2 transform active:scale-95">
                        <i className={`fas ${uploading ? 'fa-spinner fa-spin' : 'fa-upload'}`}></i>
                        {uploading ? 'Uploading...' : (t.admin.heroesPage?.upload || 'Upload Heroes')}
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
                            className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition shadow-sm"
                        >
                            <i className="fas fa-trash mr-2"></i>
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Upload Tips */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-800 text-sm">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                    <i className="fas fa-info-circle"></i> Instructions
                </h3>
                <ul className="list-disc list-inside space-y-1 opacity-80">
                    <li>File names should match the hero name exactly (e.g. "Murad.png", "Violet.jpg").</li>
                    <li>The system uses the filename (without extension) as the Hero Name.</li>
                    <li>Supported formats: JPG, PNG, WEBP.</li>
                </ul>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="relative">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="Search heroes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-aura outline-none"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
                <span><i className="fas fa-image mr-1"></i> Total: <strong className="text-gray-800">{heroes.length}</strong></span>
                {searchTerm && (
                    <span><i className="fas fa-filter mr-1"></i> Matches: <strong className="text-gray-800">{filteredHeroes.length}</strong></span>
                )}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : filteredHeroes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                    <i className="fas fa-ghost text-5xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 font-bold">No heroes found</p>
                    <p className="text-sm text-gray-400">Upload some images to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                    {filteredHeroes.map(hero => (
                        <div
                            key={hero._id}
                            className="group relative aspect-square bg-white rounded-xl shadow-sm overflow-hidden border-2 border-transparent hover:border-cyan-aura transition-all cursor-pointer"
                        >
                            <img
                                src={hero.imageUrl}
                                alt={hero.name}
                                className="w-full h-full object-cover"
                                onError={(e: any) => {
                                    e.target.src = 'https://via.placeholder.com/100?text=' + encodeURIComponent(hero.name);
                                }}
                            />

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                                <p className="text-white text-xs font-bold truncate text-center drop-shadow-md">{hero.name}</p>
                            </div>

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                <button
                                    onClick={() => handleEdit(hero)}
                                    className="w-8 h-8 bg-white/90 text-blue-600 rounded-full hover:bg-white hover:scale-110 transition shadow-lg flex items-center justify-center"
                                    title="Edit Name"
                                >
                                    <i className="fas fa-pencil-alt text-xs"></i>
                                </button>
                                <button
                                    onClick={() => handleDelete(hero)}
                                    className="w-8 h-8 bg-white/90 text-red-600 rounded-full hover:bg-white hover:scale-110 transition shadow-lg flex items-center justify-center"
                                    title="Delete"
                                >
                                    <i className="fas fa-trash-alt text-xs"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
