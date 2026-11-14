<?php

namespace App\Features\Post\Services;

use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PostService
{
    public function __construct(
        protected PostRepositoryInterface $repository,
    ) {}

    /**
     * Create a new post.
     *
     * @param  array<string, mixed>  $data
     */
    public function createPost(User $user, array $data, ?UploadedFile $coverImage = null): Post
    {
        $slug = $this->generateUniqueSlug($data['title']);

        $isPublished = (bool) ($data['is_published'] ?? false);
        $publishedAt = $isPublished ? ($data['published_at'] ?? now()) : null;

        $coverImagePath = null;
        if ($coverImage) {
            $path = $coverImage->store('posts', 'public');
            $coverImagePath = '/storage/'.$path;
        }

        $excerpt = ! empty($data['excerpt'])
            ? $data['excerpt']
            : Str::limit(strip_tags((string) $data['content']), 160);

        return $this->repository->create([
            'user_id' => $user->id,
            'title' => $data['title'],
            'slug' => $slug,
            'category' => $data['category'],
            'excerpt' => $excerpt,
            'content' => $data['content'],
            'cover_image_path' => $coverImagePath,
            'is_published' => $isPublished,
            'published_at' => $publishedAt,
        ]);
    }

    /**
     * Update an existing post.
     *
     * @param  array<string, mixed>  $data
     */
    public function updatePost(Post $post, array $data, ?UploadedFile $coverImage = null): bool
    {
        $updateData = [];

        if (isset($data['title']) && $data['title'] !== $post->title) {
            $updateData['title'] = $data['title'];
            $updateData['slug'] = $this->generateUniqueSlug($data['title'], $post->id);
        }

        if (isset($data['category'])) {
            $updateData['category'] = $data['category'];
        }

        if (array_key_exists('excerpt', $data)) {
            $updateData['excerpt'] = $data['excerpt'] ?: Str::limit(strip_tags((string) ($data['content'] ?? $post->content)), 160);
        }

        if (isset($data['content'])) {
            $updateData['content'] = $data['content'];
        }

        if (isset($data['is_published'])) {
            $isPublished = (bool) $data['is_published'];
            $updateData['is_published'] = $isPublished;
            if ($isPublished && ! $post->published_at) {
                $updateData['published_at'] = now();
            } elseif (! $isPublished) {
                $updateData['published_at'] = null;
            }
        }

        if ($coverImage) {
            $this->deleteCoverFile($post->cover_image_path);
            $path = $coverImage->store('posts', 'public');
            $updateData['cover_image_path'] = '/storage/'.$path;
        }

        return $this->repository->update($post, $updateData);
    }

    /**
     * Toggle post publication status.
     */
    public function togglePublish(Post $post): bool
    {
        $newStatus = ! $post->is_published;
        $publishedAt = $newStatus ? ($post->published_at ?? now()) : null;

        return $this->repository->update($post, [
            'is_published' => $newStatus,
            'published_at' => $publishedAt,
        ]);
    }

    /**
     * Upload cover image for a post.
     */
    public function uploadCover(Post $post, UploadedFile $coverImage): bool
    {
        $this->deleteCoverFile($post->cover_image_path);
        $path = $coverImage->store('posts', 'public');

        return $this->repository->update($post, [
            'cover_image_path' => '/storage/'.$path,
        ]);
    }

    /**
     * Remove cover image from a post.
     */
    public function deleteCover(Post $post): bool
    {
        $this->deleteCoverFile($post->cover_image_path);

        return $this->repository->update($post, [
            'cover_image_path' => null,
        ]);
    }

    /**
     * Save batch of AI generated posts.
     *
     * @param  list<array{title: string, category: string, excerpt?: string, content: string}>  $posts
     * @return list<Post>
     */
    public function saveBatchAiPosts(User $user, array $posts): array
    {
        $saved = [];
        foreach ($posts as $item) {
            if (! empty($item['title']) && ! empty($item['content'])) {
                $saved[] = $this->createPost($user, [
                    'title' => $item['title'],
                    'category' => $item['category'] ?? 'Umum',
                    'excerpt' => $item['excerpt'] ?? Str::limit(strip_tags((string) $item['content']), 160),
                    'content' => $item['content'],
                    'is_published' => false,
                ]);
            }
        }

        return $saved;
    }

    /**
     * Delete physical cover file.
     */
    protected function deleteCoverFile(?string $path): void
    {
        if ($path && str_starts_with($path, '/storage/')) {
            $relative = str_replace('/storage/', '', $path);
            if (Storage::disk('public')->exists($relative)) {
                Storage::disk('public')->delete($relative);
            }
        }
    }

    /**
     * Generate unique slug for post title.
     */
    protected function generateUniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        if (empty($base)) {
            $base = 'artikel';
        }

        $slug = $base;
        $counter = 1;

        while (Post::where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
