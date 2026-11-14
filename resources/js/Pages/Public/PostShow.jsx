import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import MarkdownViewer from '../../Components/MarkdownViewer';
import { Calendar, User, ArrowLeft, LogIn, UserPlus, Sparkles, Share2 } from 'lucide-react';

export default function PostShow({ post }) {
    const formattedDate = post.published_at 
        ? new Date(post.published_at).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : '-';

    return (
        <AppLayout title={post.title}>
            <Head title={`${post.title} - BlogVerse Pro`} />

            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Link */}
                <div className="mb-8">
                    <Link
                        href="/articles"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Katalog Artikel</span>
                    </Link>
                </div>

                {/* Article Header */}
                <header className="mb-10 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
                        {post.category}
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="mt-4 text-lg text-slate-600 leading-relaxed italic">
                            "{post.excerpt}"
                        </p>
                    )}

                    <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                {post.user?.profile_photo_path ? (
                                    <img src={post.user.profile_photo_path} alt={post.user.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    post.user?.name?.charAt(0) || 'P'
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{post.user?.name}</p>
                                <p className="text-xs text-slate-500">@{post.user?.username}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>Dipublikasikan pada {formattedDate}</span>
                        </div>
                    </div>
                </header>

                {/* Cover Image */}
                {post.cover_image_path && (
                    <div className="mb-10 rounded-2xl overflow-hidden shadow-sm border border-slate-200 max-h-[480px]">
                        <img 
                            src={post.cover_image_path} 
                            alt={post.title} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                )}

                {/* Markdown Content (Rendered with TOAST UI Viewer) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm mb-16">
                    <MarkdownViewer content={post.content} />
                </div>

                {/* Bagian Bawah Halaman Baca Artikel: Kartu Ajakan Komunitas (PDF Section 3.6 Item 1) */}
                <div className="rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-8 sm:p-10 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-4 backdrop-blur">
                            <Sparkles className="w-3.5 h-3.5" />
                            Komunitas Penulis BlogVerse
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Terinspirasi untuk Berbagi Pengetahuan Anda?
                        </h3>
                        <p className="mt-2 text-sm sm:text-base text-indigo-100 leading-relaxed">
                            Bergabunglah bersama komunitas kreator kami. Tulis artikel berkualitas dengan editor Markdown interaktif dan bantuan asisten AI.
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-sm hover:bg-indigo-50 transition shadow-sm"
                            >
                                <UserPlus className="w-4 h-4 text-indigo-600" />
                                <span>Daftar Sebagai Penulis</span>
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white border border-indigo-400/30 font-medium text-sm transition"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Masuk ke Akun Anda</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </article>
        </AppLayout>
    );
}
