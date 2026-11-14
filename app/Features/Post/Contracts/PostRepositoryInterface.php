<?php

namespace App\Features\Post\Contracts;

use App\Features\Post\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PostRepositoryInterface
{
    public function getPublishedPaginated(?string $search = null, ?string $category = null, int $perPage = 9): LengthAwarePaginator;

    public function findPublishedBySlug(string $slug): ?Post;

    public function findById(int $id): ?Post;

    public function getUserPosts(int $userId, ?string $search = null, int $perPage = 10): LengthAwarePaginator;

    public function getAllUserPosts(int $userId): Collection;

    public function getAllPosts(?string $search = null, int $perPage = 10): LengthAwarePaginator;

    public function getAllSystemPosts(): Collection;

    public function create(array $data): Post;

    public function update(Post $post, array $data): bool;

    public function delete(Post $post): bool;

    /**
     * @return array{total: int, published: int, draft: int}
     */
    public function getUserStats(int $userId): array;
}
