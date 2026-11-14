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
        <AppLayout title="Daftar Penulis">
            <Head title="Daftar Penulis - BlogVerse Pro" />

            <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-8 pb-6 bg-slate-50 border-b border-slate-100 text-center">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-sm">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Bergabung Menjadi Penulis</h2>
                        <p className="text-sm text-slate-500 mt-1">Publikasikan ide brilian dan kelola portofolio artikel Anda</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="p-8 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Budi Santoso"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                                />
                            </div>
                            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Username Unik
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <AtSign className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Contoh: budisantoso"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                                />
                            </div>
                            {errors.username && <p className="text-xs text-rose-600 mt-1">{errors.username}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Alamat Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@email.com"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <KeyRound className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Minimal 6 karakter"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                                />
                            </div>
                            {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Konfirmasi Kata Sandi
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <KeyRound className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Ulangi kata sandi"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-sm disabled:opacity-50 mt-2"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Mendaftarkan...</span>
                                </>
                            ) : (
                                <span>Daftar Akun Baru</span>
                            )}
                        </button>

                        <div className="pt-4 border-t border-slate-100 text-center text-sm text-slate-600">
                            Sudah memiliki akun?{' '}
                            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                                Masuk ke akun Anda
                            </Link>
                        </div>

                        <div className="text-center">
                            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Kembali ke Beranda Publik</span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
