import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { 
    ArrowLeft, 
    FileSpreadsheet, 
    Search, 
    Eye, 
    Layers, 
    CheckCircle, 
    Clock, 
    FileText,
    Shield
} from 'lucide-react';

export default function UserPostList({ targetUser, posts, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(`/admin/users/${targetUser.id}/posts`, { search: searchTerm || undefined }, { preserveState: true });
    };

    return (
        <AppLayout title={`User Articles: ${targetUser.name}`}>
            <Head title={`Articles by ${targetUser.name} - Admin Panel`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back button */}
                <div className="mb-6">
                    <Link
                        href="/admin/users"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Users List</span>
                    </Link>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
                            <Shield className="w-3.5 h-3.5" />
                            Author Monitoring (Read-Only)
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Articles by: {targetUser.name}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            @{targetUser.username} &bull; {targetUser.email}
                        </p>
                    </div>

                    <a
                        href={`/admin/users/${targetUser.id}/posts/export`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-sm"
                        title="Download articles written by this user to Excel"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Export User's Articles to Excel</span>
                    </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-slate-500">Total Articles</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.total || 0}</h3>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-emerald-600">Published</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.published || 0}</h3>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-amber-600">Drafts</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.draft || 0}</h3>
                    </div>
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
                            placeholder="Search articles..."
                            className="w-full pl-10 pr-24 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 bg-white shadow-sm"
                        />
                        <button
                            type="submit"
                            className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Title</th>
                                    <th scope="col" className="px-6 py-4">Category</th>
                                    <th scope="col" className="px-6 py-4">Status</th>
                                    <th scope="col" className="px-6 py-4">Date</th>
                                    <th scope="col" className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {posts?.data?.length > 0 ? (
                                    posts.data.map((post) => (
                                        <tr key={post.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 font-semibold text-slate-900 max-w-md truncate">
                                                {post.title}
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
                                                    {post.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                                {new Date(post.created_at).toLocaleDateString('en-US')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {post.is_published ? (
                                                    <Link
                                                        href={`/articles/${post.slug}`}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>View</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Draft (Private)</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                            <p className="font-medium text-slate-700">This user has not created any articles yet</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
