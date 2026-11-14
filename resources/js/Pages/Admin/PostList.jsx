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
        <AppLayout title="All Posts Monitoring">
            <Head title="All Posts - Admin Panel" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            System Monitoring
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            All User Articles
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Monitor all articles authored across the BlogVerse Pro platform.
                        </p>
                    </div>

                    <a
                        href="/admin/posts/export"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-sm"
                        title="Download entire article database as Excel (.xlsx)"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Export All Posts to Excel</span>
                    </a>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <form onSubmit={handleSearch} className="max-w-md relative">
                        <label htmlFor="admin-search-posts" className="sr-only">Search articles</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            id="admin-search-posts"
                            name="search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by title, author, category..."
                            aria-label="Search by title, author, category"
                            className="w-full pl-10 pr-24 py-2 rounded-xl border border-slate-800 text-sm focus:ring-2 focus:ring-amber-500 bg-slate-900 text-slate-100 placeholder:text-slate-400 shadow-sm"
                        />
                        <button
                            type="submit"
                            className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                            <thead className="bg-slate-950 text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-800">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Article Title</th>
                                    <th scope="col" className="px-6 py-4">Author</th>
                                    <th scope="col" className="px-6 py-4">Category</th>
                                    <th scope="col" className="px-6 py-4">Status</th>
                                    <th scope="col" className="px-6 py-4">Date</th>
                                    <th scope="col" className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {posts?.data?.length > 0 ? (
                                    posts.data.map((post) => (
                                        <tr key={post.id} className="hover:bg-slate-800/50 transition">
                                            <td className="px-6 py-4 font-semibold text-white max-w-sm truncate">
                                                {post.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-slate-200">{post.user?.name}</div>
                                                <div className="text-xs text-slate-400">@{post.user?.username}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                                                    {post.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    post.is_published 
                                                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' 
                                                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                                                }`}>
                                                    {post.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                                                {new Date(post.created_at).toLocaleDateString('en-US')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {post.is_published ? (
                                                    <Link
                                                        href={`/articles/${post.slug}`}
                                                        aria-label={`View article: ${post.title}`}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>View</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Draft</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                                            <p className="font-medium text-slate-300">No articles found in the system</p>
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
                                                    ? 'bg-amber-600 text-white font-bold'
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
        </AppLayout>
    );
}
