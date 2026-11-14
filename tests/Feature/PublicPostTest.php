<?php

namespace Tests\Feature;

use App\Features\Post\Models\Post;
use Tests\TestCase;

class PublicPostTest extends TestCase
{
    public function test_home_page_returns_published_posts(): void
    {
        $publishedPost = Post::factory()->published()->create();
        $draftPost = Post::factory()->draft()->create();

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/PostIndex')
            ->has('posts.data')
            ->has('categories')
        );
    }

    public function test_articles_index_with_search_and_category_filter(): void
    {
        $post = Post::factory()->published()->create([
            'title' => 'Laravel 13 Inertia Guide',
            'category' => 'Teknologi',
        ]);

        $response = $this->get('/articles?search=Inertia&category=Teknologi');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/PostIndex')
            ->where('filters.search', 'Inertia')
            ->where('filters.category', 'Teknologi')
        );
    }

    public function test_single_article_page_displays_published_post(): void
    {
        $post = Post::factory()->published()->create();

        $response = $this->get("/articles/{$post->slug}");
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/PostShow')
            ->where('post.id', $post->id)
        );
    }

    public function test_single_article_returns_404_for_draft_or_missing_post(): void
    {
        $draft = Post::factory()->draft()->create();

        $response = $this->get("/articles/{$draft->slug}");
        $response->assertStatus(404);

        $responseMissing = $this->get('/articles/non-existent-slug');
        $responseMissing->assertStatus(404);
    }
}
