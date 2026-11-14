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
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            Author Dashboard
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Manage publications, edit Markdown content, and import/export your articles.
                        </p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Write New Post</span>
                        </button>

                        <button
                            onClick={() => setIsAiModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition shadow-sm"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Create with AI</span>
                        </button>

                        <a
                            href="/dashboard/posts/export"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-medium text-sm transition shadow-sm"
                            title="Export all articles to Excel (.xlsx)"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                            <span>Export</span>
                        </a>

                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-medium text-sm transition shadow-sm"
                            title="Import articles from Excel"
                        >
                            <Upload className="w-4 h-4 text-indigo-400" />
                            <span>Import</span>
                        </button>
                    </div>
                </div>

                {/* 3 Ringkasan Statistik Artikel (PDF Section 3.6 Item 4) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Posts</p>
                            <p className="text-3xl font-extrabold text-white mt-1">{stats?.total || 0}</p>
                            <p className="text-xs text-slate-400 mt-1">All saved articles</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
                            <Layers className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Total Published</p>
                            <p className="text-3xl font-extrabold text-white mt-1">{stats?.published || 0}</p>
                            <p className="text-xs text-slate-400 mt-1">Live in public catalog (is_published = true)</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Drafts</p>
                            <p className="text-3xl font-extrabold text-white mt-1">{stats?.draft || 0}</p>
                            <p className="text-xs text-slate-400 mt-1">Personal drafts (is_published = false)</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <form onSubmit={handleSearch} className="max-w-md relative">
                        <label htmlFor="filter-posts" className="sr-only">Filter articles</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            id="filter-posts"
                            name="search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter by title or keywords..."
                            aria-label="Filter by title or keywords"
                            className="w-full pl-10 pr-24 py-2 rounded-xl border border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-slate-100 placeholder:text-slate-400 shadow-sm"
                        />
                        <button
                            type="submit"
                            className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Format List View (Bukan Card, Ringkas, Tanpa Deskripsi) (PDF Section 3.6 Item 2) */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                            <thead className="bg-slate-950 text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-800">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Article Title</th>
                                    <th scope="col" className="px-6 py-4">Category</th>
                                    <th scope="col" className="px-6 py-4">Status</th>
                                    <th scope="col" className="px-6 py-4">Date</th>
                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {posts?.data?.length > 0 ? (
                                    posts.data.map((post) => (
                                         <tr key={post.id} className="hover:bg-slate-800/50 transition">
                                            <td className="px-6 py-4 font-semibold text-white max-w-md truncate">
                                                <Link 
                                                    href={`/dashboard/posts/${post.id}`} 
                                                    className="hover:text-indigo-400 transition"
                                                >
                                                    {post.title}
                                                </Link>
                                                <div className="text-xs text-slate-400 font-normal mt-0.5">
                                                    slug: /{post.slug}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                                                    {post.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleTogglePublish(post.id)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                                                        post.is_published
                                                            ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/60'
                                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-750 border border-slate-700'
                                                    }`}
                                                    title="Click to toggle publish status"
                                                    aria-label={`Toggle publish status for ${post.title}`}
                                                >
                                                    {post.is_published ? (
                                                        <>
                                                            <ToggleRight className="w-4 h-4 text-emerald-400" />
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
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                                                {new Date(post.created_at).toLocaleDateString('en-US')}
                                            </td>
                                            {/* Menu Tindakan Kebab ( ⋮ ) (PDF Section 3.6 Item 3) */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right relative">
                                                <button
                                                    onClick={() => setOpenKebabId(openKebabId === post.id ? null : post.id)}
                                                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                                                    title={`Actions for ${post.title}`}
                                                    aria-label={`Actions for ${post.title}`}
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>

                                                {/* Dropdown Kebab Menu */}
                                                {openKebabId === post.id && (
                                                    <div className="absolute right-6 mt-1 w-48 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-1.5 z-30 text-left animate-in fade-in-50">
                                                        <Link
                                                            href={`/dashboard/posts/${post.id}`}
                                                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-indigo-400 hover:bg-slate-700 transition"
                                                        >
                                                            <Eye className="w-4 h-4 text-indigo-400" />
                                                            <span>View Details</span>
                                                        </Link>
                                                        <button
                                                            onClick={() => openEditModal(post)}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-indigo-400 hover:bg-slate-700 transition text-left"
                                                        >
                                                            <Pencil className="w-4 h-4 text-indigo-400" />
                                                            <span>Edit Post</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleTogglePublish(post.id)}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition text-left"
                                                        >
                                                            <Clock className="w-4 h-4 text-slate-400" />
                                                            <span>{post.is_published ? 'Set as Draft' : 'Publish'}</span>
                                                        </button>
                                                        <div className="my-1 border-t border-slate-700"></div>
                                                        <button
                                                            onClick={() => handleDeletePost(post.id)}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition text-left"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-rose-400" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                                            <p className="font-medium text-slate-300">No articles in your dashboard yet</p>
                                            <p className="text-xs text-slate-400 mt-1">Start writing a new article or create drafts with AI.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {posts?.links?.length > 3 && (
                        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                                Showing {posts.from || 0} - {posts.to || 0} of {posts.total} articles
                            </span>
                            <div className="flex items-center gap-1">
                                {posts.links.map((link, idx) => (
                                    link.url ? (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 rounded-lg text-xs transition ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white font-bold'
                                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            }`}
                                        />
                                    ) : (
                                        <span
                                            key={idx}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            aria-disabled="true"
                                            className="px-3 py-1 rounded-lg text-xs text-slate-400 opacity-60 cursor-not-allowed select-none"
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* FULLSCREEN MODAL: Tambah dan Ubah Artikel (PDF Section 3.6 & 3.7) */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden animate-in fade-in">
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
                            aria-label="Close modal"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Modal Body (Scrollable form) */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label htmlFor="create-post-title" className="block text-sm font-semibold text-slate-300">
                                    Article Title <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    id="create-post-title"
                                    name="title"
                                    type="text"
                                    value={postData.title}
                                    onChange={(e) => setPostData('title', e.target.value)}
                                    placeholder="Enter article title..."
                                    aria-label="Article Title"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-400 text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                                    required
                                />
                                {postErrors.title && <p className="text-xs text-rose-400 font-medium">{postErrors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-post-category" className="block text-sm font-semibold text-slate-300">
                                    Category <span className="text-rose-400">*</span>
                                </label>
                                <select
                                    id="create-post-category"
                                    name="category"
                                    value={postData.category}
                                    onChange={(e) => setPostData('category', e.target.value)}
                                    aria-label="Category"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                                >
                                    {categories.map((c) => (
                                        <option key={c} value={c} className="bg-slate-900 text-slate-100">{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="create-post-excerpt" className="block text-sm font-semibold text-slate-300">
                                Excerpt / Teaser Summary (1-2 sentences)
                            </label>
                            <textarea
                                id="create-post-excerpt"
                                name="excerpt"
                                value={postData.excerpt}
                                onChange={(e) => setPostData('excerpt', e.target.value)}
                                rows="2"
                                placeholder="Write a brief teaser summary for readers..."
                                aria-label="Excerpt / Teaser Summary"
                                className="w-full px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-400 text-sm focus:ring-2 focus:ring-indigo-500"
                            ></textarea>
                        </div>

                        {/* Foto Sampul */}
                        <div className="space-y-2">
                            <label htmlFor="create-post-cover" className="block text-sm font-semibold text-slate-300">
                                Cover Image
                            </label>
                            <input
                                id="create-post-cover"
                                name="cover_image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPostData('cover_image', e.target.files[0])}
                                aria-label="Cover Image"
                                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer border border-slate-700 rounded-xl p-2 bg-slate-900"
                            />
                        </div>

                        {/* TOAST UI Editor */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-300">
                                Article Content (Markdown Format) <span className="text-rose-400">*</span>
                            </label>
                            <MarkdownEditor
                                initialValue={postData.content}
                                onChange={(val) => setPostData('content', val)}
                                height="420px"
                            />
                            {postErrors.content && <p className="text-xs text-rose-400 font-medium">{postErrors.content}</p>}
                        </div>

                        {/* Toggle Publish */}
                        <div className="pt-2">
                            <label htmlFor="create-post-publish" className="flex items-center gap-3 cursor-pointer">
                                <input
                                    id="create-post-publish"
                                    name="is_published"
                                    type="checkbox"
                                    checked={postData.is_published}
                                    onChange={(e) => setPostData('is_published', e.target.checked)}
                                    aria-label="Publish immediately to public catalog"
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-900"
                                />
                                <span className="text-sm font-medium text-slate-300">
                                    Publish immediately to public catalog
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Footer Kontras & Tombol Aksi di Kanan Bawah (Distinct colored footer) (PDF Section 3.6 & 3.7) */}
                    <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSavePost}
                            disabled={postProcessing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-sm disabled:opacity-50"
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
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in">
                        {/* Header */}
                        <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between border-b border-purple-800">
                            <div className="flex items-center gap-2.5">
                                <Sparkles className="w-5 h-5 text-purple-300" />
                                <h2 className="font-bold text-lg">AI Post Generator</h2>
                            </div>
                            <button onClick={() => setIsAiModalOpen(false)} aria-label="Close AI generator modal" className="text-purple-300 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto space-y-5">
                            <form onSubmit={handleGenerateAi} className="space-y-4">
                                <div>
                                    <label htmlFor="ai-topic" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                                        Topic or Keywords
                                    </label>
                                    <input
                                        id="ai-topic"
                                        name="topic"
                                        type="text"
                                        value={aiTopic}
                                        onChange={(e) => setAiTopic(e.target.value)}
                                        placeholder="e.g. Modern Web Development with React and Inertia"
                                        aria-label="Topic or Keywords"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-400 text-sm focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        {/* Input type="number" with bounds validation (PDF Section 3.6 Item 5) */}
                                        <label htmlFor="ai-count" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                                            Number of Articles (1 - 5)
                                        </label>
                                        <input
                                            id="ai-count"
                                            name="count"
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={aiCount}
                                            onChange={(e) => setAiCount(Math.min(5, Math.max(1, Number(e.target.value))))}
                                            aria-label="Number of Articles"
                                            required
                                            className="w-full px-4 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm focus:ring-2 focus:ring-purple-500 font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="ai-category" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                                            Target Category
                                        </label>
                                        <select
                                            id="ai-category"
                                            name="category"
                                            value={aiCategory}
                                            onChange={(e) => setAiCategory(e.target.value)}
                                            aria-label="Target Category"
                                            className="w-full px-4 py-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm focus:ring-2 focus:ring-purple-500"
                                        >
                                            {categories.map((c) => (
                                                <option key={c} value={c} className="bg-slate-900 text-slate-100">{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isGeneratingAi}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition shadow-sm disabled:opacity-50"
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
                                <div className="pt-4 border-t border-slate-800 space-y-4">
                                    <h3 className="text-sm font-bold text-slate-200">
                                        AI Results ({aiGeneratedPosts.length} ready to save):
                                    </h3>
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                        {aiGeneratedPosts.map((post, idx) => (
                                            <div key={idx} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-left">
                                                <p className="font-bold text-sm text-white">{post.title}</p>
                                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-purple-950/80 text-purple-300 border border-purple-800/60 rounded mt-1 inline-block">
                                                    {post.category}
                                                </span>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{post.excerpt}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSaveAiBatch}
                                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-sm"
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
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-w-md w-full p-6 animate-in fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-lg text-white flex items-center gap-2">
                                <Upload className="w-5 h-5 text-indigo-400" />
                                <span>Import Articles from Excel</span>
                            </h2>
                            <button onClick={() => setIsImportModalOpen(false)} aria-label="Close import modal" className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleImportSubmit} className="space-y-4">
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Upload a spreadsheet file (<strong>.xlsx, .xls, .csv</strong>) with Title, Category, and Content columns.
                            </p>

                            <div>
                                <label htmlFor="import-excel-file" className="block text-sm font-semibold text-slate-300 mb-2">
                                    Excel File
                                </label>
                                <input
                                    id="import-excel-file"
                                    name="file"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={(e) => setImportFile(e.target.files[0])}
                                    aria-label="Excel spreadsheet file"
                                    required
                                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer border border-dashed border-slate-700 rounded-xl p-3 bg-slate-950"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isImporting || !importFile}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50"
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
