import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Search, Sparkles, BookOpen, Clock, User, ArrowRight, LogIn, UserPlus } from 'lucide-react';

export default function PostIndex({ posts, filters, categories }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const activeCategory = filters?.category || '';

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/articles', {
            search: searchTerm || undefined,
            category: activeCategory || undefined,
        }, { preserveState: true });
    };

    const handleCategoryFilter = (cat) => {
        const newCategory = activeCategory === cat ? undefined : cat;
        router.get('/articles', {
            search: searchTerm || undefined,
            category: newCategory,
        }, { preserveState: true });
    };

    return (
        <AppLayout title="Articles">
            <Head title="Explore Articles - BlogVerse Pro" />

            {/* Hero Banner Beranda with CTAs (PDF Requirement Section 3.6 Item 1) */}
            <div className="bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950 border-b border-slate-800">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        Modern Publishing Platform
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none">
                        Great Ideas, <span className="text-indigo-400">Thoughtfully Told.</span>
                    </h1>
                    <p className="mt-5 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Discover stories, insights, and perspectives from authors worldwide, or share your own thoughts with the community.
                    </p>

                    {/* CTA Buttons to Login and Register */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-sm hover:border-indigo-500 hover:text-white transition shadow-sm"
                        >
                            <LogIn className="w-4 h-4 text-slate-400" />
                            <span>Sign In</span>
                        </Link>
                        <Link
                            href="/register"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition shadow-lg shadow-indigo-950"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Join as Writer</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content & Articles Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search Bar & Categories Filter */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="w-full md:w-96 relative">
                        <label htmlFor="public-search-articles" className="sr-only">Search articles</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            id="public-search-articles"
                            name="search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search articles by title or keyword..."
                            aria-label="Search articles by title or keyword"
                            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-slate-100 placeholder:text-slate-400 shadow-sm"
                        />
                        <button
                            type="submit"
                            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
                        >
                            Search
                        </button>
                    </form>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        <button
                            type="button"
                            onClick={() => handleCategoryFilter('')}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                                !activeCategory 
                                    ? 'bg-slate-800 text-white border border-slate-700' 
                                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            All Categories
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleCategoryFilter(cat)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                                    activeCategory === cat
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Articles Grid */}
                {posts?.data?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.data.map((post) => (
                            <article 
                                key={post.id}
                                className="group bg-slate-900 rounded-2xl border border-slate-800 shadow-md hover:border-slate-700 transition-all flex flex-col overflow-hidden"
                            >
                                {/* Cover Image if exists */}
                                {post.cover_image_path ? (
                                    <div className="h-48 w-full overflow-hidden bg-slate-800 relative">
                                        <img 
                                            src={post.cover_image_path} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                                        />
                                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-950/80 text-indigo-300 border border-indigo-800/60 shadow-sm backdrop-blur">
                                            {post.category}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="h-32 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/40 p-6 flex items-start justify-between border-b border-slate-800">
                                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                                            {post.category}
                                        </span>
                                        <BookOpen className="w-5 h-5 text-indigo-400/60" />
                                    </div>
                                )}

                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition line-clamp-2">
                                            <Link href={`/articles/${post.slug}`}>
                                                {post.title}
                                            </Link>
                                        </h2>
                                        <p className="mt-2 text-sm text-slate-400 line-clamp-3 leading-relaxed">
                                            {post.excerpt || 'Read the full article to explore insights and details.'}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-[10px]">
                                                {post.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="font-medium text-slate-300">{post.user?.name}</span>
                                        </div>
                                        <Link 
                                            href={`/articles/${post.slug}`}
                                            aria-label={`Read article: ${post.title}`}
                                            className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 group-hover:translate-x-1 transition"
                                        >
                                            <span>Read</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-900 rounded-2xl border border-dashed border-slate-800 p-12 text-center">
                        <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-lg font-bold text-slate-200">No Articles Found</p>
                        <p className="text-sm text-slate-400 mt-1">Try adjusting your search keywords or filter by another category.</p>
                    </div>
                )}

                {/* Pagination */}
                {posts?.links?.length > 3 && (
                    <div className="mt-12 flex items-center justify-center gap-1">
                        {posts.links.map((link, idx) => (
                            link.url ? (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                                        link.active
                                            ? 'bg-indigo-600 text-white font-bold'
                                            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                                    }`}
                                />
                            ) : (
                                <span
                                    key={idx}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    aria-disabled="true"
                                    className="px-3 py-1.5 rounded-lg text-sm text-slate-400 opacity-60 cursor-not-allowed select-none"
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
