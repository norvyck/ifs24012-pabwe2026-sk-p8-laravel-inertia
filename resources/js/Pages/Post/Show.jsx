import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import MarkdownViewer from '../../Components/MarkdownViewer';
import { 
    ArrowLeft, 
    Calendar, 
    ToggleLeft, 
    ToggleRight, 
    Trash2, 
    Upload, 
    Image, 
    Pencil, 
    Clock, 
    CheckCircle2 
} from 'lucide-react';

export default function PostShow({ post }) {
    const [isUploadingCover, setIsUploadingCover] = useState(false);

    const handleTogglePublish = () => {
        router.patch(`/dashboard/posts/${post.id}/publish`);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this article?')) {
            router.delete(`/dashboard/posts/${post.id}`);
        }
    };

    const handleCoverUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingCover(true);
        const formData = new FormData();
        formData.append('cover_image', file);

        router.post(`/dashboard/posts/${post.id}/cover`, formData, {
            onFinish: () => setIsUploadingCover(false),
        });
    };

    const handleDeleteCover = () => {
        if (confirm('Remove the cover image for this article?')) {
            router.delete(`/dashboard/posts/${post.id}/cover`);
        }
    };

    return (
        <AppLayout title={post.title}>
            <Head title={`Article: ${post.title} - BlogVerse Pro`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Back and Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <Link
                        href="/dashboard/posts"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Author Dashboard</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleTogglePublish}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                                post.is_published
                                    ? 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 border border-amber-800/50'
                                    : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-800/50'
                            }`}
                        >
                            {post.is_published ? (
                                <>
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Set as Draft</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Publish</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 border border-rose-800/50 transition"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                        </button>
                    </div>
                </div>

                {/* Article Card */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-8 sm:p-12 mb-8">
                    {/* Status & Category */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                            {post.category}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            post.is_published 
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' 
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                            {post.is_published ? 'Published' : 'Draft'}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="mt-3 text-base text-slate-300 italic">
                            "{post.excerpt}"
                        </p>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-4 text-xs text-slate-400">
                        <span>Created: {new Date(post.created_at).toLocaleDateString('en-US')}</span>
                        {post.published_at && (
                            <span>Published: {new Date(post.published_at).toLocaleDateString('en-US')}</span>
                        )}
                        <span>Slug: /{post.slug}</span>
                    </div>

                    {/* Cover Section */}
                    <div className="mt-6 mb-8 p-4 bg-slate-950 rounded-xl border border-slate-800">
                        {post.cover_image_path ? (
                            <div className="space-y-3">
                                <div className="h-64 rounded-lg overflow-hidden border border-slate-800">
                                    <img src={post.cover_image_path} alt={post.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-medium">Active cover image</span>
                                    <button 
                                        onClick={handleDeleteCover} 
                                        className="text-rose-400 hover:text-rose-300 font-semibold"
                                    >
                                        Remove Cover Image
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Image className="w-4 h-4 text-slate-400" />
                                    <span>This article does not have a cover image yet.</span>
                                </div>
                                <label htmlFor="post-cover-upload" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer">
                                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Upload Cover</span>
                                    <input 
                                        id="post-cover-upload"
                                        name="cover_image"
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleCoverUpload} 
                                        aria-label="Upload Cover Image"
                                        className="hidden" 
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* TOAST UI Viewer rendered content */}
                    <div className="pt-6 border-t border-slate-800">
                        <MarkdownViewer content={post.content} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
