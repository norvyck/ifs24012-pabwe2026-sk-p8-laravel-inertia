<?php

namespace App\Features\Post\Controllers;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use App\Features\Post\Services\PostExcelService;
use App\Features\Post\Services\PostService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PostController extends Controller
{
    public function __construct(
        protected PostRepositoryInterface $postRepository,
        protected PostService $postService,
        protected PostExcelService $excelService,
        protected AiClientInterface $aiClient,
    ) {}

    /**
     * Display author posts list & statistics.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = $request->query('search');

        $posts = $this->postRepository->getUserPosts($user->id, $search, 10);
        $stats = $this->postRepository->getUserStats($user->id);
        $categories = PostCategory::values();

        return Inertia::render('Post/Index', [
            'posts' => $posts,
            'stats' => $stats,
            'filters' => ['search' => $search],
            'categories' => $categories,
        ]);
    }

    /**
     * Store new post.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:'.implode(',', PostCategory::values())],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'cover_image' => ['nullable', 'image', 'max:2048'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $coverImage = $request->file('cover_image');
        $this->postService->createPost($request->user(), $validated, $coverImage);

        return redirect()->route('dashboard.posts.index')
            ->with('success', 'Article created successfully!');
    }

    /**
     * Show single post detail for author.
     */
    public function show(Request $request, int|string $postId): Response
    {
        $post = $this->postRepository->findById((int) $postId);
        if (! $post) {
            abort(404, 'Article not found.');
        }

        return Inertia::render('Post/Show', [
            'post' => $post,
        ]);
    }

    /**
     * Update existing post.
     */
    public function update(Request $request, int|string $postId): RedirectResponse
    {
        $post = $this->postRepository->findById((int) $postId);
        if (! $post) {
            abort(404, 'Article not found.');
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:'.implode(',', PostCategory::values())],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'cover_image' => ['nullable', 'image', 'max:2048'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $coverImage = $request->file('cover_image');
        $this->postService->updatePost($post, $validated, $coverImage);

        return redirect()->back()
            ->with('success', 'Article updated successfully!');
    }

    /**
     * Delete post.
     */
    public function destroy(Request $request, int|string $postId): RedirectResponse
    {
        $post = $this->postRepository->findById((int) $postId);
        if (! $post) {
            abort(404, 'Article not found.');
        }

        $this->postService->deleteCover($post);
        $this->postRepository->delete($post);

        return redirect()->route('dashboard.posts.index')
            ->with('success', 'Article deleted successfully!');
    }

    /**
     * Toggle publication status.
     */
    public function togglePublish(Request $request, int|string $postId): RedirectResponse
    {
        $post = $this->postRepository->findById((int) $postId);
        if (! $post) {
            abort(404, 'Article not found.');
        }

        $this->postService->togglePublish($post);
        $statusMsg = $post->fresh()->is_published ? 'published' : 'draft';

        return redirect()->back()
            ->with('success', "Article status updated to {$statusMsg}!");
    }

    /**
     * Upload cover image.
     */
    public function uploadCover(Request $request, int|string $postId): RedirectResponse
    {
        $post = $this->postRepository->findById((int) $postId);
        if (! $post) {
            abort(404, 'Article not found.');
        }

        $request->validate([
            'cover_image' => ['required', 'image', 'max:2048'],
        ]);

        $this->postService->uploadCover($post, $request->file('cover_image'));

        return redirect()->back()
            ->with('success', 'Cover image uploaded successfully!');
    }

    /**
     * Remove cover image.
     */
    public function deleteCover(Request $request, int|string $postId): RedirectResponse
    {
        $post = $this->postRepository->findById((int) $postId);
        if (! $post) {
            abort(404, 'Article not found.');
        }

        $this->postService->deleteCover($post);

        return redirect()->back()
            ->with('success', 'Cover image removed successfully!');
    }

    /**
     * Export author posts to Excel.
     */
    public function export(Request $request): StreamedResponse
    {
        $user = $request->user();
        $posts = $this->postRepository->getAllUserPosts($user->id);

        return $this->excelService->exportPosts($posts, "posts_{$user->username}.xlsx");
    }

    /**
     * Import posts from Excel.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
        ]);

        $result = $this->excelService->importPosts($request->user(), $request->file('file'));

        if ($result['imported'] > 0) {
            return redirect()->back()
                ->with('success', "Successfully imported {$result['imported']} articles.");
        }

        return redirect()->back()
            ->with('error', 'No articles were imported. Please check the Excel file format.');
    }

    /**
     * Generate draft articles with AI.
     */
    public function generateAi(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'topic' => ['required', 'string', 'max:255'],
            'count' => ['required', 'integer', 'min:1', 'max:5'],
            'category' => ['nullable', 'string', 'in:'.implode(',', PostCategory::values())],
        ]);

        $items = $this->aiClient->generatePosts(
            $validated['topic'],
            (int) $validated['count'],
            $validated['category'] ?? null
        );

        $results = array_map(fn ($item) => $item->toArray(), $items);

        return response()->json([
            'success' => true,
            'posts' => $results,
        ]);
    }

    /**
     * Save batch AI generated posts.
     */
    public function saveAiPosts(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'posts' => ['required', 'array', 'min:1'],
            'posts.*.title' => ['required', 'string'],
            'posts.*.category' => ['required', 'string'],
            'posts.*.excerpt' => ['nullable', 'string'],
            'posts.*.content' => ['required', 'string'],
        ]);

        $saved = $this->postService->saveBatchAiPosts($request->user(), $validated['posts']);

        return redirect()->route('dashboard.posts.index')
            ->with('success', 'Successfully saved '.count($saved).' AI-generated articles to drafts.');
    }
}
