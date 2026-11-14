import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import MarkdownViewer from '../../Components/MarkdownViewer';
import { Calendar, User, ArrowLeft, LogIn, UserPlus, Sparkles, Share2 } from 'lucide-react';

export default function PostShow({ post }) {
    const formattedDate = post.published_at 
        ? new Date(post.published_at).toLocaleDateString('en-US', {
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
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Articles</span>
                    </Link>
                </div>

                {/* Article Header */}
                <header className="mb-10 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
                        {post.category}
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="mt-4 text-lg text-slate-300 leading-relaxed italic">
                            "{post.excerpt}"
                        </p>
                    )}

                    <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 flex items-center justify-center font-bold text-sm overflow-hidden relative">
                                <span>{post.user?.name?.charAt(0) || 'P'}</span>
                                {post.user?.profile_photo_path && (
                                    <img 
                                        src={post.user.profile_photo_path} 
                                        alt={post.user.name} 
                                        className="absolute inset-0 w-full h-full rounded-full object-cover" 
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-white">{post.user?.name}</p>
                                <p className="text-xs text-slate-400">@{post.user?.username}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span>Published on {formattedDate}</span>
                        </div>
                    </div>
                </header>

                {/* Cover Image */}
                {post.cover_image_path && (
                    <div className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-slate-800 max-h-[480px]">
                        <img 
                            src={post.cover_image_path} 
                            alt={post.title} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                )}

                {/* Markdown Content (Rendered with TOAST UI Viewer) */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 sm:p-12 shadow-lg mb-16">
                    <MarkdownViewer content={post.content} />
                </div>

                {/* Bagian Bawah Halaman Baca Artikel: Kartu Ajakan Komunitas (PDF Section 3.6 Item 1) */}
                <div className="rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-900/60 p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold mb-4 backdrop-blur">
                            <Sparkles className="w-3.5 h-3.5" />
                            BlogVerse Community
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                            Inspired to Share Your Ideas?
                        </h3>
                        <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
                            Join our community of authors and thinkers. Write high-quality articles with our interactive Markdown editor and AI assistance.
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition shadow-sm"
                            >
                                <UserPlus className="w-4 h-4 text-white" />
                                <span>Join as Writer</span>
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Sign In to Your Account</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </article>
        </AppLayout>
    );
}
