<?php

namespace App\Features\Post\Repositories;

use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PostRepository implements PostRepositoryInterface
{
    public function getPublishedPaginated(?string $search = null, ?string $category = null, int $perPage = 9): LengthAwarePaginator
    {
        return Post::query()
            ->with('user:id,name,username,profile_photo_path')
            ->published()
            ->when($category, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('published_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findPublishedBySlug(string $slug): ?Post
    {
        return Post::query()
            ->with('user:id,name,username,profile_photo_path')
            ->published()
            ->where('slug', $slug)
            ->first();
    }

    public function findById(int $id): ?Post
    {
        return Post::query()
            ->with('user:id,name,username,profile_photo_path')
            ->find($id);
    }

    public function getUserPosts(int $userId, ?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return Post::query()
            ->where('user_id', $userId)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getAllUserPosts(int $userId): Collection
    {
        return Post::query()
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function getAllPosts(?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return Post::query()
            ->with('user:id,name,username,email')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($uq) use ($search) {
                            $uq->where('name', 'like', "%{$search}%")
                                ->orWhere('username', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getAllSystemPosts(): Collection
    {
        return Post::query()
            ->with('user:id,name,username,email')
            ->orderByDesc('created_at')
            ->get();
    }

    public function create(array $data): Post
    {
        return Post::create($data);
    }

    public function update(Post $post, array $data): bool
    {
        return $post->update($data);
    }

    public function delete(Post $post): bool
    {
        return (bool) $post->delete();
    }

    /**
     * @return array{total: int, published: int, draft: int}
     */
    public function getUserStats(int $userId): array
    {
        $total = Post::where('user_id', $userId)->count();
        $published = Post::where('user_id', $userId)->where('is_published', true)->count();
        $draft = $total - $published;

        return [
            'total' => $total,
            'published' => $published,
            'draft' => $draft,
        ];
    }
}
