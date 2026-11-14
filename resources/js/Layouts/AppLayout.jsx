import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    BookOpen, 
    FileText, 
    User, 
    LogOut, 
    LogIn, 
    UserPlus, 
    Shield, 
    Users, 
    CheckCircle2, 
    AlertCircle, 
    X,
    Loader2
} from 'lucide-react';

export default function AppLayout({ children, title }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const [isProcessing, setIsProcessing] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);

    // Track Inertia request lifecycle for global loading indicators
    useEffect(() => {
        const removeStart = router.on('start', () => setIsProcessing(true));
        const removeFinish = router.on('finish', () => setIsProcessing(false));

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    // Track flash messages
    useEffect(() => {
        if (flash?.success) {
            setAlertMessage({ type: 'success', text: flash.success });
        } else if (flash?.error) {
            setAlertMessage({ type: 'error', text: flash.error });
        }
    }, [flash]);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            {/* Top Progress Bar */}
            {isProcessing && (
                <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-indigo-600 animate-pulse transition-all duration-300">
                    <div className="h-full bg-white/40 w-1/3 animate-[shimmer_1.5s_infinite]"></div>
                </div>
            )}

            {/* Floating Status Pill */}
            {isProcessing && (
                <div className="fixed top-18 right-6 z-50 flex items-center gap-2.5 px-4 py-2 bg-indigo-900/90 text-white rounded-full shadow-lg backdrop-blur text-sm font-medium animate-bounce">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />
                    <span>Memproses tindakan...</span>
                </div>
            )}

            {/* Sticky Top Navbar */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Brand Logo */}
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-indigo-700 transition">
                                    B
                                </div>
                                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
                                    BlogVerse <span className="text-indigo-600 font-semibold text-sm px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100">Pro</span>
                                </span>
                            </Link>

                            <nav className="hidden md:flex items-center gap-1">
                                <Link 
                                    href="/" 
                                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition"
                                >
                                    Beranda
                                </Link>
                                <Link 
                                    href="/articles" 
                                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition"
                                >
                                    Katalog Artikel
                                </Link>
                                {user && (
                                    <Link 
                                        href="/dashboard/posts" 
                                        className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition flex items-center gap-1.5"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Dashboard Saya
                                    </Link>
                                )}
                                {user?.role === 'admin' && (
                                    <>
                                        <Link 
                                            href="/admin/posts" 
                                            className="px-3 py-2 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 transition flex items-center gap-1.5"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Monitoring Artikel
                                        </Link>
                                        <Link 
                                            href="/admin/users" 
                                            className="px-3 py-2 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 transition flex items-center gap-1.5"
                                        >
                                            <Users className="w-4 h-4" />
                                            Kelola Pengguna
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>

                        {/* Right Auth Navigation */}
                        <div className="flex items-center gap-3">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <Link 
                                        href="/profile" 
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-xs overflow-hidden">
                                            {user.profile_photo_path ? (
                                                <img src={user.profile_photo_path} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                user.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="hidden sm:inline font-medium">{user.name}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600 uppercase tracking-wider">
                                            {user.role}
                                        </span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Keluar (Logout)"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        <span>Masuk</span>
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>Daftar Penulis</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Flash Alert Banner */}
            {alertMessage && (
                <div className={`border-b transition-all ${
                    alertMessage.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            {alertMessage.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                            )}
                            <span className="text-sm font-medium">{alertMessage.text}</span>
                        </div>
                        <button 
                            onClick={() => setAlertMessage(null)} 
                            className="p-1 rounded-md hover:bg-black/5 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1">
                {children}
            </main>

            {/* Editorial Footer */}
            <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                    B
                                </div>
                                <span className="text-lg font-bold text-white tracking-tight">BlogVerse Pro</span>
                            </div>
                            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                                Platform publikasi artikel modern multi-tier dengan Clean Architecture, didukung integrasi OpenAI, TOAST UI Editor, dan ekspor spreadsheet.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">Navigasi Utama</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="/" className="hover:text-white transition">Beranda Publik</Link>
                                </li>
                                <li>
                                    <Link href="/articles" className="hover:text-white transition">Katalog Artikel</Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">Akun & Penulis</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="/login" className="hover:text-white transition">Halaman Login (Masuk)</Link>
                                </li>
                                <li>
                                    <Link href="/register" className="hover:text-white transition">Halaman Register (Daftar Penulis)</Link>
                                </li>
                                {user && (
                                    <li>
                                        <Link href="/dashboard/posts" className="hover:text-white transition">Dashboard Artikel Pribadi</Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                        <p>© 2026 BlogVerse Pro. Praktikum Pemrograman Web (PABWE).</p>
                        <p>Laravel 13 &bull; Inertia.js &bull; React &bull; PostgreSQL</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
