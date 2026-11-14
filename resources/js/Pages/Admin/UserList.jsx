import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Users, Search, FileText, ArrowRight, ShieldCheck, User } from 'lucide-react';

export default function UserList({ users, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/users', { search: searchTerm || undefined }, { preserveState: true });
    };

    return (
        <AppLayout title="Manage Users">
            <Head title="Manage Users - Admin Panel" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            Administrator Panel
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            System Users
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Manage users and inspect authored article contributions.
                        </p>
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
                            placeholder="Search by name, username, email..."
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

                {/* Users Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-4">ID</th>
                                    <th scope="col" className="px-6 py-4">User</th>
                                    <th scope="col" className="px-6 py-4">Role</th>
                                    <th scope="col" className="px-6 py-4">Total Articles</th>
                                    <th scope="col" className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {users?.data?.length > 0 ? (
                                    users.data.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/75 transition">
                                            <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                                #{u.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                                                        {u.profile_photo_path ? (
                                                            <img src={u.profile_photo_path} alt={u.name} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            u.name.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{u.name}</div>
                                                        <div className="text-xs text-slate-400">@{u.username} &bull; {u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                    u.role === 'admin' 
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                                                {u.posts_count} articles
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Link
                                                    href={`/admin/users/${u.id}/posts`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:border-indigo-600 transition shadow-xs"
                                                >
                                                    <FileText className="w-3.5 h-3.5" />
                                                    <span>View Articles</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                            <p className="font-medium text-slate-700">No users found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users?.links?.length > 3 && (
                        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Total: {users.total} Users
                            </span>
                            <div className="flex items-center gap-1">
                                {users.links.map((link, idx) => (
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
