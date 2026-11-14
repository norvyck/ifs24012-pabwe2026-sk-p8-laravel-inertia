import React from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { LogIn, KeyRound, User, ArrowLeft, Loader2 } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <AppLayout title="Sign In">
            <Head title="Sign In - BlogVerse Pro" />

            <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-8 pb-6 bg-slate-50 border-b border-slate-100 text-center">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-sm">
                            <LogIn className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="text-sm text-slate-500 mt-1">Sign in to manage and write your blog articles</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="p-8 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="login-username">
                                Username or Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    id="login-username"
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Enter username or email"
                                    required
                                    autoComplete="username"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                                />
                            </div>
                            {errors.username && (
                                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.username}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="login-password">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <KeyRound className="w-4 h-4" />
                                </div>
                                <input
                                    id="login-password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm text-slate-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                />
                                <span className="ml-2">Remember me</span>
                            </label>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-sm disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>

                        <div className="pt-4 border-t border-slate-100 text-center text-sm text-slate-600">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
                                Join as Writer
                            </Link>
                        </div>

                        <div className="text-center">
                            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Back to Home</span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
