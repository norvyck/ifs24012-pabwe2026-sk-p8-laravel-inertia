import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Search, Sparkles, BookOpen, Clock, User, ArrowRight, LogIn, UserPlus } from 'lucide-react';

export default function PostIndex({ posts, filters, categories }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const activeCategory = filters?.category || '';

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/articles', {
            search: searchTerm || undefined,
            category: activeCategory || undefined,
        }, { preserveState: true });
    };

    const handleCategoryFilter = (cat) => {
        const newCategory = activeCategory === cat ? undefined : cat;
        router.get('/articles', {
            search: searchTerm || undefined,
            category: newCategory,
        }, { preserveState: true });
    };

    return (
        <AppLayout title="Beranda Publik">
            <Head title="Katalog Artikel Publik - BlogVerse Pro" />

            {/* Hero Banner Beranda with CTAs (PDF Requirement Section 3.6 Item 1) */}
            <div className="bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        Ruang Publikasi Multi-Tier
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none">
                        Gagasan Hebat, <span className="text-indigo-600">Dituangkan Leluasa.</span>
                    </h1>
                    <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Jelajahi tulisan pilihan dari para kreator atau mulai buat portofolio tulisan Anda sendiri dengan kemudahan format Markdown dan asisten AI.
                    </p>

                    {/* CTA Buttons to Login and Register */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold text-sm hover:border-indigo-600 hover:text-indigo-600 transition shadow-sm"
                        >
                            <LogIn className="w-4 h-4 text-slate-500" />
                            <span>Masuk ke Akun</span>
                        </Link>
                        <Link
                            href="/register"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Daftar Sebagai Penulis</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content & Articles Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search Bar & Categories Filter */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="w-full md:w-96 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari judul atau topik artikel..."
                            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                        />
                        <button
                            type="submit"
                            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition"
                        >
                            Cari
                        </button>
                    </form>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        <button
                            type="button"
                            onClick={() => handleCategoryFilter('')}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                                !activeCategory 
                                    ? 'bg-slate-900 text-white' 
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Semua Kategori
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleCategoryFilter(cat)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                                    activeCategory === cat
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Articles Grid */}
                {posts?.data?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.data.map((post) => (
                            <article 
                                key={post.id}
                                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col overflow-hidden"
                            >
                                {/* Cover Image if exists */}
                                {post.cover_image_path ? (
                                    <div className="h-48 w-full overflow-hidden bg-slate-100 relative">
                                        <img 
                                            src={post.cover_image_path} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                                        />
                                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold bg-white/90 text-indigo-700 shadow-sm backdrop-blur">
                                            {post.category}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="h-32 w-full bg-gradient-to-r from-indigo-50 to-purple-50 p-6 flex items-start justify-between">
                                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100 text-indigo-700">
                                            {post.category}
                                        </span>
                                        <BookOpen className="w-5 h-5 text-indigo-300" />
                                    </div>
                                )}

                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-2">
                                            <Link href={`/articles/${post.slug}`}>
                                                {post.title}
                                            </Link>
                                        </h2>
                                        <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                                            {post.excerpt || 'Baca tulisan lengkapnya untuk mengetahui detail ulasan.'}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-[10px]">
                                                {post.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="font-medium text-slate-700">{post.user?.name}</span>
                                        </div>
                                        <Link 
                                            href={`/articles/${post.slug}`}
                                            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 group-hover:translate-x-1 transition"
                                        >
                                            <span>Baca</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-800">Belum Ada Artikel yang Ditemukan</h3>
                        <p className="text-sm text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau pilih kategori lain.</p>
                    </div>
                )}

                {/* Pagination */}
                {posts?.links?.length > 3 && (
                    <div className="mt-12 flex items-center justify-center gap-1">
                        {posts.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                                    link.active
                                        ? 'bg-indigo-600 text-white font-bold'
                                        : link.url
                                        ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                        : 'opacity-40 pointer-events-none'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
