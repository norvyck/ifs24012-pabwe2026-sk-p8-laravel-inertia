import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { 
    FileSpreadsheet, 
    Search, 
    Eye, 
    ShieldAlert, 
    FileText 
} from 'lucide-react';

export default function PostList({ posts, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/posts', { search: searchTerm || undefined }, { preserveState: true });
    };

    return (
        <AppLayout title="Monitoring Seluruh Artikel">
            <Head title="Monitoring Seluruh Artikel - Panel Admin" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Monitoring Seluruh Sistem
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Semua Artikel Pengguna
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Pantau seluruh tulisan yang dibuat oleh para penulis di sistem BlogVerse Pro.
                        </p>
                    </div>

                    <a
                        href="/admin/posts/export"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-sm"
                        title="Unduh seluruh database artikel ke file Excel (.xlsx)"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Ekspor Semua Artikel ke Excel</span>
                    </a>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <form onSubmit={handleSearch} className="max-w-md relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari berdasarkan judul, penulis, kategori..."
                            className="w-full pl-10 pr-24 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 bg-white shadow-sm"
                        />
                        <button
                            type="submit"
                            className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Judul Artikel</th>
                                    <th scope="col" className="px-6 py-4">Penulis</th>
                                    <th scope="col" className="px-6 py-4">Kategori</th>
                                    <th scope="col" className="px-6 py-4">Status</th>
                                    <th scope="col" className="px-6 py-4">Tanggal</th>
                                    <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {posts?.data?.length > 0 ? (
                                    posts.data.map((post) => (
                                        <tr key={post.id} className="hover:bg-slate-50/75 transition">
                                            <td className="px-6 py-4 font-semibold text-slate-900 max-w-sm truncate">
                                                {post.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-slate-800">{post.user?.name}</div>
                                                <div className="text-xs text-slate-400">@{post.user?.username}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                                    {post.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    post.is_published 
                                                        ? 'bg-emerald-50 text-emerald-700' 
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {post.is_published ? 'Publik' : 'Draf'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                                {new Date(post.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {post.is_published ? (
                                                    <Link
                                                        href={`/articles/${post.slug}`}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Buka</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Draf</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                            <p className="font-medium text-slate-700">Belum ada artikel di sistem</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {posts?.links?.length > 3 && (
                        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Menampilkan {posts.from || 0} - {posts.to || 0} dari {posts.total} artikel
                            </span>
                            <div className="flex items-center gap-1">
                                {posts.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded-lg text-xs transition ${
                                            link.active
                                                ? 'bg-amber-600 text-white font-bold'
                                                : link.url
                                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                : 'opacity-40 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
