<?php

namespace App\Features\Post\Controllers;

use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Services\PostExcelService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminPostController extends Controller
{
    public function __construct(
        protected PostRepositoryInterface $postRepository,
        protected PostExcelService $excelService,
    ) {}

    /**
     * Display all posts across the system for admin.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $posts = $this->postRepository->getAllPosts($search, 10);

        return Inertia::render('Admin/PostList', [
            'posts' => $posts,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Export all system posts to Excel.
     */
    public function export(): StreamedResponse
    {
        $posts = $this->postRepository->getAllSystemPosts();

        return $this->excelService->exportPosts($posts, 'semua_artikel_sistem.xlsx');
    }
}
