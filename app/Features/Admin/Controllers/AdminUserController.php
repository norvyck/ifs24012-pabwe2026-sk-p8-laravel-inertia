<?php

namespace App\Features\Admin\Controllers;

use App\Features\Admin\Services\AdminUserService;
use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Services\PostExcelService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminUserController extends Controller
{
    public function __construct(
        protected AdminUserService $userService,
        protected PostRepositoryInterface $postRepository,
        protected PostExcelService $excelService,
    ) {}

    /**
     * Display list of users.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $users = $this->userService->getPaginatedUsers($search, 10);

        return Inertia::render('Admin/UserList', [
            'users' => $users,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Display posts belonging to a specific user (read-only for admin).
     */
    public function userPosts(Request $request, User $user): Response
    {
        $search = $request->query('search');
        $posts = $this->postRepository->getUserPosts($user->id, $search, 10);
        $stats = $this->postRepository->getUserStats($user->id);

        return Inertia::render('Admin/UserPostList', [
            'targetUser' => $user,
            'posts' => $posts,
            'stats' => $stats,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Export posts of specific user to Excel.
     */
    public function exportUserPosts(User $user): StreamedResponse
    {
        $posts = $this->postRepository->getAllUserPosts($user->id);

        return $this->excelService->exportPosts($posts, "artikel_user_{$user->username}.xlsx");
    }
}
