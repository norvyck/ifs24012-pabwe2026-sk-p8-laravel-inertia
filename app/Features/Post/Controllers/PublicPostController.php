<?php

namespace App\Features\Post\Controllers;

use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Enums\PostCategory;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicPostController extends Controller
{
    public function __construct(
        protected PostRepositoryInterface $postRepository,
    ) {}

    /**
     * Display public home/articles gallery.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $category = $request->query('category');

        $posts = $this->postRepository->getPublishedPaginated($search, $category, 9);
        $categories = PostCategory::values();

        return Inertia::render('Public/PostIndex', [
            'posts' => $posts,
            'filters' => [
                'search' => $search,
                'category' => $category,
            ],
            'categories' => $categories,
        ]);
    }

    /**
     * Display single public article.
     */
    public function show(string $slug): Response
    {
        $post = $this->postRepository->findPublishedBySlug($slug);

        if (! $post) {
            abort(404, 'Artikel tidak ditemukan atau belum dipublikasikan.');
        }

        return Inertia::render('Public/PostShow', [
            'post' => $post,
        ]);
    }
}
