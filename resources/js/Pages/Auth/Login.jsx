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
                <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
                    {/* Header */}
                    <div className="p-8 pb-6 bg-slate-900/60 border-b border-slate-800 text-center">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-indigo-950">
                            <LogIn className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
                        <p className="text-sm text-slate-400 mt-1">Sign in to manage and write your blog articles</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="p-8 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="login-username">
                                Username or Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    id="login-username"
                                    name="username"
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Enter username or email"
                                    required
                                    autoComplete="username"
                                    aria-label="Username or Email"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                                />
                            </div>
                            {errors.username && (
                                <p className="text-xs text-rose-400 mt-1 font-medium">{errors.username}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="login-password">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <KeyRound className="w-4 h-4" />
                                </div>
                                <input
                                    id="login-password"
                                    name="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                    aria-label="Password"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-rose-400 mt-1 font-medium">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label htmlFor="login-remember" className="flex items-center text-sm text-slate-400 cursor-pointer">
                                <input
                                    id="login-remember"
                                    name="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    aria-label="Remember me"
                                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                />
                                <span className="ml-2">Remember me</span>
                            </label>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-sm disabled:opacity-50"
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

                        <div className="pt-4 border-t border-slate-800 text-center text-sm text-slate-400">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
                                Join as Writer
                            </Link>
                        </div>

                        <div className="text-center">
                            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition font-medium">
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
