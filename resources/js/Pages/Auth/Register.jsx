import React from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { UserPlus, User, Mail, AtSign, KeyRound, ArrowLeft, Loader2 } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <AppLayout title="Join as Writer">
            <Head title="Register as Writer - BlogVerse Pro" />

            <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
                    {/* Header */}
                    <div className="p-8 pb-6 bg-slate-900/60 border-b border-slate-800 text-center">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-indigo-950">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Join as Writer</h1>
                        <p className="text-sm text-slate-400 mt-1">Publish your ideas and build your blog portfolio</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="p-8 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="register-name">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    id="register-name"
                                    name="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. John Doe"
                                    required
                                    aria-label="Full Name"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                                />
                            </div>
                            {errors.name && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="register-username">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <AtSign className="w-4 h-4" />
                                </div>
                                <input
                                    id="register-username"
                                    name="username"
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="e.g. johndoe"
                                    required
                                    aria-label="Username"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                                />
                            </div>
                            {errors.username && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.username}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="register-email">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    id="register-email"
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    aria-label="Email Address"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="register-password">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <KeyRound className="w-4 h-4" />
                                </div>
                                <input
                                    id="register-password"
                                    name="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="At least 6 characters"
                                    required
                                    aria-label="Password"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                                />
                            </div>
                            {errors.password && <p className="text-xs text-rose-400 mt-1 font-medium">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="register-password-confirmation">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <KeyRound className="w-4 h-4" />
                                </div>
                                <input
                                    id="register-password-confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Re-type your password"
                                    required
                                    aria-label="Confirm Password"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-sm disabled:opacity-50 mt-2"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Registering...</span>
                                </>
                            ) : (
                                <span>Create Account</span>
                            )}
                        </button>

                        <div className="pt-4 border-t border-slate-800 text-center text-sm text-slate-400">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                                Sign In
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
