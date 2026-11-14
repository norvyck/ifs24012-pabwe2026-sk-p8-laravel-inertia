import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import MarkdownEditor from '../../Components/MarkdownEditor';
import { 
    Plus, 
    Sparkles, 
    FileSpreadsheet, 
    Upload, 
    MoreVertical, 
    Eye, 
    Pencil, 
    Trash2, 
    CheckCircle, 
    Clock, 
    FileText, 
    Search, 
    X, 
    Loader2,
    ToggleLeft,
    ToggleRight,
    Layers
} from 'lucide-react';

export default function PostIndex({ posts, stats, filters, categories }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [openKebabId, setOpenKebabId] = useState(null);

    // Fullscreen Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    // AI Modal State
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiCount, setAiCount] = useState(2);
    const [aiCategory, setAiCategory] = useState(categories[0] || 'Teknologi');
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [aiGeneratedPosts, setAiGeneratedPosts] = useState([]);

    // Import Modal State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    // Post Form for Add/Edit
    const { 
        data: postData, 
        setData: setPostData, 
        post: submitPost, 
        put: submitPut, 
        processing: postProcessing, 
        reset: resetPostForm, 
        errors: postErrors 
    } = useForm({
        title: '',
        category: categories[0] || 'Teknologi',
        excerpt: '',
        content: '',
        cover_image: null,
        is_published: false,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/dashboard/posts', { search: searchTerm || undefined }, { preserveState: true });
    };

    const openAddModal = () => {
        resetPostForm();
        setPostData({
            title: '',
            category: categories[0] || 'Teknologi',
            excerpt: '',
            content: '## Introduction\n\nWrite your article here...',
            cover_image: null,
            is_published: false,
        });
        setEditingPost(null);
        setIsAddModalOpen(true);
    };

    const openEditModal = (post) => {
        setEditingPost(post);
        setPostData({
            title: post.title,
            category: post.category,
            excerpt: post.excerpt || '',
            content: post.content,
            cover_image: null,
            is_published: Boolean(post.is_published),
        });
        setOpenKebabId(null);
        setIsAddModalOpen(true);
    };

    const handleSavePost = (e) => {
        e.preventDefault();
        if (editingPost) {
            // Update
            router.post(`/dashboard/posts/${editingPost.id}`, {
                _method: 'put',
                ...postData,
            }, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    resetPostForm();
                    setEditingPost(null);
                },
            });
        } else {
            // Create
            submitPost('/dashboard/posts', {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    resetPostForm();
                },
            });
        }
    };

    const handleTogglePublish = (postId) => {
        router.patch(`/dashboard/posts/${postId}/publish`, {}, {
            preserveScroll: true,
            onFinish: () => setOpenKebabId(null),
        });
    };

    const handleDeletePost = (postId) => {
        if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
            router.delete(`/dashboard/posts/${postId}`, {
                preserveScroll: true,
                onFinish: () => setOpenKebabId(null),
            });
        }
    };

    // AI Generation
    const handleGenerateAi = async (e) => {
        e.preventDefault();
        if (!aiTopic.trim()) return;

        setIsGeneratingAi(true);
        try {
            const res = await fetch('/dashboard/posts/ai-generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    topic: aiTopic,
                    count: Number(aiCount),
                    category: aiCategory,
                }),
            });
            const data = await res.json();
            if (data?.posts) {
                setAiGeneratedPosts(data.posts);
            }
        } catch (err) {
            alert('Failed to generate articles: ' + err.message);
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const handleSaveAiBatch = () => {
        if (!aiGeneratedPosts.length) return;
        router.post('/dashboard/posts/ai-save', {
            posts: aiGeneratedPosts,
        }, {
            onSuccess: () => {
                setIsAiModalOpen(false);
                setAiGeneratedPosts([]);
                setAiTopic('');
            },
        });
    };

    // Excel Import
    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (!importFile) return;

        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', importFile);

        router.post('/dashboard/posts/import', formData, {
            onFinish: () => {
                setIsImporting(false);
                setIsImportModalOpen(false);
                setImportFile(null);
            },
        });
    };

    return (
        <AppLayout title="Author Dashboard">
            <Head title="Manage Articles - BlogVerse Pro" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Author Dashboard
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Manage publications, edit Markdown content, and import/export your articles.
                        </p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Write New Post</span>
                        </button>

                        <button
                            onClick={() => setIsAiModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition shadow-sm"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Create with AI</span>
                        </button>

                        <a
                            href="/dashboard/posts/export"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition shadow-sm"
                            title="Export all articles to Excel (.xlsx)"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            <span>Export</span>
                        </a>

                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition shadow-sm"
                            title="Import articles from Excel"
                        >
                            <Upload className="w-4 h-4 text-indigo-600" />
                            <span>Import</span>
                        </button>
                    </div>
                </div>

                {/* 3 Ringkasan Statistik Artikel (PDF Section 3.6 Item 4) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Posts</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats?.total || 0}</h3>
                            <p className="text-xs text-slate-400 mt-1">All saved articles</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                            <Layers className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Total Published</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats?.published || 0}</h3>
                            <p className="text-xs text-slate-400 mt-1">Live in public catalog (is_published = true)</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Drafts</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats?.draft || 0}</h3>
                            <p className="text-xs text-slate-400 mt-1">Personal drafts (is_published = false)</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <form onSubmit={handleSearch} className="max-w-md relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter by title or keywords..."
                            className="w-full pl-10 pr-24 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                        />
                        <button
                            type="submit"
                            className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Format List View (Bukan Card, Ringkas, Tanpa Deskripsi) (PDF Section 3.6 Item 2) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Article Title</th>
                                    <th scope="col" className="px-6 py-4">Category</th>
                                    <th scope="col" className="px-6 py-4">Status</th>
                                    <th scope="col" className="px-6 py-4">Date</th>
                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {posts?.data?.length > 0 ? (
                                    posts.data.map((post) => (
                                        <tr key={post.id} className="hover:bg-slate-50/75 transition">
                                            <td className="px-6 py-4 font-semibold text-slate-900 max-w-md truncate">
                                                <Link 
                                                    href={`/dashboard/posts/${post.id}`} 
                                                    className="hover:text-indigo-600 transition"
                                                >
                                                    {post.title}
                                                </Link>
                                                <div className="text-xs text-slate-400 font-normal mt-0.5">
                                                    slug: /{post.slug}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                    {post.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleTogglePublish(post.id)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                                                        post.is_published
                                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                    title="Click to toggle publish status"
                                                >
                                                    {post.is_published ? (
                                                        <>
                                                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                                                            <span>Published</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ToggleLeft className="w-4 h-4 text-slate-400" />
                                                            <span>Draft</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                                {new Date(post.created_at).toLocaleDateString('en-US')}
                                            </td>
                                            {/* Menu Tindakan Kebab ( ⋮ ) (PDF Section 3.6 Item 3) */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right relative">
                                                <button
                                                    onClick={() => setOpenKebabId(openKebabId === post.id ? null : post.id)}
                                                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                                                    title="Actions Menu"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>

                                                {/* Dropdown Kebab Menu */}
                                                {openKebabId === post.id && (
                                                    <div className="absolute right-6 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 text-left animate-in fade-in-50">
                                                        <Link
                                                            href={`/dashboard/posts/${post.id}`}
                                                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition"
                                                        >
                                                            <Eye className="w-4 h-4 text-indigo-600" />
                                                            <span>View Details</span>
                                                        </Link>
                                                        <button
                                                            onClick={() => openEditModal(post)}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition text-left"
                                                        >
                                                            <Pencil className="w-4 h-4 text-indigo-600" />
                                                            <span>Edit Post</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleTogglePublish(post.id)}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition text-left"
                                                        >
                                                            <Clock className="w-4 h-4 text-slate-500" />
                                                            <span>{post.is_published ? 'Set as Draft' : 'Publish'}</span>
                                                        </button>
                                                        <div className="my-1 border-t border-slate-100"></div>
                                                        <button
                                                            onClick={() => handleDeletePost(post.id)}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition text-left"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                            <p className="font-medium text-slate-700">No articles in your dashboard yet</p>
                                            <p className="text-xs text-slate-400 mt-1">Start writing a new article or create drafts with AI.</p>
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
                                Showing {posts.from || 0} - {posts.to || 0} of {posts.total} articles
                            </span>
                            <div className="flex items-center gap-1">
                                {posts.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded-lg text-xs transition ${
                                            link.active
                                                ? 'bg-indigo-600 text-white font-bold'
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

            {/* FULLSCREEN MODAL: Tambah dan Ubah Artikel (PDF Section 3.6 & 3.7) */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden animate-in fade-in">
                    {/* Header Kontras (Distinct colored header) */}
                    <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm">
                                {editingPost ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold tracking-tight">
                                    {editingPost ? 'Edit Post' : 'Write New Post'}
                                </h2>
                                <p className="text-xs text-slate-400">
                                    {editingPost ? `Editing: ${editingPost.title}` : 'Use Markdown formatting for rich article formatting'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Modal Body (Scrollable form) */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-sm font-semibold text-slate-800">
                                    Article Title <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={postData.title}
                                    onChange={(e) => setPostData('title', e.target.value)}
                                    placeholder="Enter article title..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                                    required
                                />
                                {postErrors.title && <p className="text-xs text-rose-600">{postErrors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-800">
                                    Category <span className="text-rose-600">*</span>
                                </label>
                                <select
                                    value={postData.category}
                                    onChange={(e) => setPostData('category', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-800">
                                Excerpt / Teaser Summary (1-2 sentences)
                            </label>
                            <textarea
                                value={postData.excerpt}
                                onChange={(e) => setPostData('excerpt', e.target.value)}
                                rows="2"
                                placeholder="Write a brief teaser summary for readers..."
                                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                            ></textarea>
                        </div>

                        {/* Foto Sampul */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-800">
                                Cover Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPostData('cover_image', e.target.files[0])}
                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                            />
                        </div>

                        {/* TOAST UI Editor */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-800">
                                Article Content (Markdown Format) <span className="text-rose-600">*</span>
                            </label>
                            <MarkdownEditor
                                initialValue={postData.content}
                                onChange={(val) => setPostData('content', val)}
                                height="420px"
                            />
                            {postErrors.content && <p className="text-xs text-rose-600">{postErrors.content}</p>}
                        </div>

                        {/* Toggle Publish */}
                        <div className="pt-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={postData.is_published}
                                    onChange={(e) => setPostData('is_published', e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                />
                                <span className="text-sm font-medium text-slate-800">
                                    Publish immediately to public catalog
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Footer Kontras & Tombol Aksi di Kanan Bawah (Distinct colored footer) (PDF Section 3.6 & 3.7) */}
                    <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSavePost}
                            disabled={postProcessing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-sm disabled:opacity-50"
                        >
                            {postProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>{editingPost ? 'Save Changes' : 'Save Post'}</span>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL: AI Article Generator (PDF Section 3.6 Item 5) */}
            {isAiModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in">
                        {/* Header */}
                        <div className="px-6 py-4 bg-purple-700 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Sparkles className="w-5 h-5 text-purple-200" />
                                <h3 className="font-bold text-lg">AI Post Generator</h3>
                            </div>
                            <button onClick={() => setIsAiModalOpen(false)} className="text-purple-200 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto space-y-5">
                            <form onSubmit={handleGenerateAi} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                                        Topic or Keywords
                                    </label>
                                    <input
                                        type="text"
                                        value={aiTopic}
                                        onChange={(e) => setAiTopic(e.target.value)}
                                        placeholder="e.g. Modern Web Development with React and Inertia"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        {/* Input type="number" with bounds validation (PDF Section 3.6 Item 5) */}
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                                            Number of Articles (1 - 5)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={aiCount}
                                            onChange={(e) => setAiCount(Math.min(5, Math.max(1, Number(e.target.value))))}
                                            required
                                            className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                                            Target Category
                                        </label>
                                        <select
                                            value={aiCategory}
                                            onChange={(e) => setAiCategory(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 bg-white"
                                        >
                                            {categories.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isGeneratingAi}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition shadow-sm disabled:opacity-50"
                                >
                                    {isGeneratingAi ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Generating content with AI...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            <span>Generate {aiCount} Draft Articles</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Preview AI Posts */}
                            {aiGeneratedPosts.length > 0 && (
                                <div className="pt-4 border-t border-slate-200 space-y-4">
                                    <h4 className="text-sm font-bold text-slate-800">
                                        AI Results ({aiGeneratedPosts.length} ready to save):
                                    </h4>
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                        {aiGeneratedPosts.map((post, idx) => (
                                            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left">
                                                <p className="font-bold text-sm text-slate-900">{post.title}</p>
                                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-purple-100 text-purple-700 rounded mt-1 inline-block">
                                                    {post.category}
                                                </span>
                                                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{post.excerpt}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSaveAiBatch}
                                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-sm"
                                    >
                                        Save All to My Drafts
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Import Excel */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-indigo-600" />
                                <span>Import Articles from Excel</span>
                            </h3>
                            <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleImportSubmit} className="space-y-4">
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Upload a spreadsheet file (<strong>.xlsx, .xls, .csv</strong>) with Title, Category, and Content columns.
                            </p>

                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) => setImportFile(e.target.files[0])}
                                required
                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-dashed border-slate-300 rounded-xl p-3"
                            />

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isImporting || !importFile}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition disabled:opacity-50"
                                >
                                    {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                    <span>Start Import</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
