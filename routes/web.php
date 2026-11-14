<?php

use App\Features\Admin\Controllers\AdminUserController;
use App\Features\Auth\Controllers\AuthController;
use App\Features\Post\Controllers\AdminPostController;
use App\Features\Post\Controllers\PostController;
use App\Features\Post\Controllers\PublicPostController;
use App\Features\Profile\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public (Guest & General) Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [PublicPostController::class, 'index'])->name('home');
Route::get('/articles', [PublicPostController::class, 'index'])->name('articles.index');
Route::get('/articles/{slug}', [PublicPostController::class, 'show'])->name('articles.show');

/*
|--------------------------------------------------------------------------
| Guest Authentication Routes
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/login', [AuthController::class, 'authenticate']);

    Route::get('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/register', [AuthController::class, 'storeUser']);
});

/*
|--------------------------------------------------------------------------
| Authenticated User Routes (Common)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
});

/*
|--------------------------------------------------------------------------
| Member (Author) Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->prefix('dashboard')->name('dashboard.')->group(function () {
    // Specific static sub-paths (must come before {post})
    Route::get('/posts/export', [PostController::class, 'export'])->name('posts.export');
    Route::post('/posts/import', [PostController::class, 'import'])->name('posts.import');
    Route::post('/posts/ai-generate', [PostController::class, 'generateAi'])->name('posts.ai.generate');
    Route::post('/posts/ai-save', [PostController::class, 'saveAiPosts'])->name('posts.ai.save');

    // Post Resource Routes
    Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
    Route::post('/posts', [PostController::class, 'store'])->name('posts.store');

    // Post Specific Routes with Ownership Protection
    Route::middleware('post.owner')->whereNumber('post')->group(function () {
        Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show');
        Route::put('/posts/{post}', [PostController::class, 'update'])->name('posts.update');
        Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
        Route::patch('/posts/{post}/publish', [PostController::class, 'togglePublish'])->name('posts.publish');
        Route::post('/posts/{post}/cover', [PostController::class, 'uploadCover'])->name('posts.cover.upload');
        Route::delete('/posts/{post}/cover', [PostController::class, 'deleteCover'])->name('posts.cover.destroy');
    });
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Users Management
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}/posts', [AdminUserController::class, 'userPosts'])->name('users.posts');
    Route::get('/users/{user}/posts/export', [AdminUserController::class, 'exportUserPosts'])->name('users.posts.export');

    // Posts Monitoring
    Route::get('/posts/export', [AdminPostController::class, 'export'])->name('posts.export');
    Route::get('/posts', [AdminPostController::class, 'index'])->name('posts.index');
});
