<?php

namespace Tests\Unit;

use App\Features\Ai\DTO\GeneratedPostItem;
use App\Features\Ai\Services\OpenAiPostGeneratorService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiGeneratorTest extends TestCase
{
    public function test_generated_post_item_dto(): void
    {
        $dto = new GeneratedPostItem('Test Title', 'Teknologi', 'Test Excerpt', 'Test Content');

        $this->assertEquals('Test Title', $dto->title);
        $this->assertEquals('Teknologi', $dto->category);
        $this->assertEquals('Test Excerpt', $dto->excerpt);
        $this->assertEquals('Test Content', $dto->content);

        $array = $dto->toArray();
        $this->assertEquals([
            'title' => 'Test Title',
            'category' => 'Teknologi',
            'excerpt' => 'Test Excerpt',
            'content' => 'Test Content',
        ], $array);
    }

    public function test_it_generates_fallback_posts_when_no_api_key(): void
    {
        $service = new OpenAiPostGeneratorService(apiKey: '');
        $posts = $service->generatePosts('Laravel Inertia', 2, 'Teknologi');

        $this->assertCount(2, $posts);
        $this->assertStringContainsString('Laravel Inertia', $posts[0]->title);
        $this->assertEquals('Teknologi', $posts[0]->category);
    }

    public function test_it_generates_posts_via_mocked_http_api(): void
    {
        Http::fake([
            'https://api.openai.com/v1/*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => json_encode([
                                [
                                    'title' => 'OpenAI Article 1',
                                    'category' => 'Teknologi',
                                    'excerpt' => 'Excerpt 1',
                                    'content' => 'Content 1',
                                ],
                            ]),
                        ],
                    ],
                ],
            ], 200),
        ]);

        $service = new OpenAiPostGeneratorService(apiKey: 'fake-sk-key');
        $posts = $service->generatePosts('Testing', 1, 'Teknologi');

        $this->assertCount(1, $posts);
        $this->assertEquals('OpenAI Article 1', $posts[0]->title);
        $this->assertEquals('Teknologi', $posts[0]->category);
    }

    public function test_it_falls_back_gracefully_when_api_fails(): void
    {
        Http::fake([
            'https://api.openai.com/v1/*' => Http::response('Server Error', 500),
        ]);

        $service = new OpenAiPostGeneratorService(apiKey: 'fake-sk-key');
        $posts = $service->generatePosts('Testing Error', 1, 'Teknologi');

        $this->assertCount(1, $posts);
        $this->assertStringContainsString('Testing Error', $posts[0]->title);
    }
}
