import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { User, Mail, KeyRound, Upload, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function Edit({ user }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        profile_photo: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/profile');
    };

    return (
        <AppLayout title="Author Profile">
            <Head title="Edit Profile - BlogVerse Pro" />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-6">
                    <Link
                        href="/dashboard/posts"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-white shadow-sm">
                            {user.profile_photo_path ? (
                                <img src={user.profile_photo_path} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
                            <p className="text-xs text-slate-500">@{user.username} &bull; Role: <span className="uppercase font-semibold text-indigo-600">{user.role}</span></p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Profile Photo
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('profile_photo', e.target.files[0])}
                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-300 rounded-xl p-2"
                            />
                            {errors.profile_photo && <p className="text-xs text-rose-600 mt-1">{errors.profile_photo}</p>}
                        </div>

                        <div className="pt-6 border-t border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 mb-1">Change Password (Optional)</h3>
                            <p className="text-xs text-slate-500 mb-4">Leave blank if you do not want to change your password.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="At least 6 characters"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Re-type new password"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-sm disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <span>Save Changes</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
