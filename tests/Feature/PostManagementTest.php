<?php

namespace Tests\Feature;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class PostManagementTest extends TestCase
{
    public function test_guest_is_redirected_from_dashboard(): void
    {
        $response = $this->get('/dashboard/posts');
        $response->assertRedirect('/login');
    }

    public function test_member_can_view_own_posts_index_and_stats(): void
    {
        $user = User::factory()->create();
        Post::factory()->count(3)->create(['user_id' => $user->id, 'is_published' => true]);
        Post::factory()->count(2)->create(['user_id' => $user->id, 'is_published' => false]);

        $response = $this->actingAs($user)->get('/dashboard/posts');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Post/Index')
            ->where('stats.total', 5)
            ->where('stats.published', 3)
            ->where('stats.draft', 2)
        );
    }

    public function test_member_can_create_new_post(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/dashboard/posts', [
            'title' => 'Judul Artikel Baru',
            'category' => 'Teknologi',
            'excerpt' => 'Ringkasan singkat artikel.',
            'content' => '## Konten Utama Artikel',
            'cover_image' => UploadedFile::fake()->image('cover.jpg'),
            'is_published' => true,
        ]);

        $response->assertRedirect(route('dashboard.posts.index'));
        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'title' => 'Judul Artikel Baru',
            'slug' => 'judul-artikel-baru',
            'is_published' => true,
        ]);
    }

    public function test_member_can_view_and_update_post(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $showResponse = $this->actingAs($user)->get("/dashboard/posts/{$post->id}");
        $showResponse->assertStatus(200);
        $showResponse->assertInertia(fn ($page) => $page
            ->component('Post/Show')
            ->where('post.id', $post->id)
        );

        $updateResponse = $this->actingAs($user)->put("/dashboard/posts/{$post->id}", [
            'title' => 'Judul Baru Setelah Edit',
            'category' => 'Bisnis',
            'excerpt' => 'Excerpt terupdate',
            'content' => 'Konten terupdate lengkap',
            'is_published' => true,
        ]);

        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'title' => 'Judul Baru Setelah Edit',
            'category' => 'Bisnis',
        ]);
    }

    public function test_member_can_delete_post(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->delete("/dashboard/posts/{$post->id}");
        $response->assertRedirect(route('dashboard.posts.index'));
        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    }

    public function test_member_can_toggle_post_publication(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->draft()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->patch("/dashboard/posts/{$post->id}/publish");
        $response->assertRedirect();
        $this->assertTrue($post->fresh()->is_published);
        $this->assertNotNull($post->fresh()->published_at);

        // Toggle back
        $this->actingAs($user)->patch("/dashboard/posts/{$post->id}/publish");
        $this->assertFalse($post->fresh()->is_published);
    }

    public function test_member_can_upload_and_delete_cover(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id, 'cover_image_path' => null]);

        $uploadResponse = $this->actingAs($user)->post("/dashboard/posts/{$post->id}/cover", [
            'cover_image' => UploadedFile::fake()->image('new-cover.jpg'),
        ]);
        $uploadResponse->assertRedirect();
        $this->assertNotNull($post->fresh()->cover_image_path);

        $deleteResponse = $this->actingAs($user)->delete("/dashboard/posts/{$post->id}/cover");
        $deleteResponse->assertRedirect();
        $this->assertNull($post->fresh()->cover_image_path);
    }

    public function test_member_can_export_posts_to_excel(): void
    {
        $user = User::factory()->create();
        Post::factory()->count(2)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get('/dashboard/posts/export');
        $response->assertStatus(200);
        $this->assertTrue($response->headers->contains('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
    }

    public function test_member_can_import_posts_from_excel(): void
    {
        $user = User::factory()->create();

        // Create in-memory Excel file
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray([
            ['ID', 'Judul', 'Slug', 'Kategori', 'Konten'],
            [null, 'Artikel Impor Satu', 'artikel-impor-satu', 'Teknologi', 'Konten artikel satu'],
            [null, 'Artikel Impor Dua', 'artikel-impor-dua', 'Bisnis', 'Konten artikel dua'],
        ]);

        $tempPath = storage_path('framework/testing/import.xlsx');
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        $uploadedFile = new UploadedFile($tempPath, 'import.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);

        $response = $this->actingAs($user)->post('/dashboard/posts/import', [
            'file' => $uploadedFile,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'title' => 'Artikel Impor Satu',
        ]);
        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'title' => 'Artikel Impor Dua',
        ]);

        @unlink($tempPath);
    }

    public function test_member_can_generate_and_save_ai_posts(): void
    {
        $user = User::factory()->create();

        $genResponse = $this->actingAs($user)->postJson('/dashboard/posts/ai-generate', [
            'topic' => 'Kecerdasan Buatan',
            'count' => 2,
            'category' => 'Teknologi',
        ]);

        $genResponse->assertStatus(200);
        $genResponse->assertJsonStructure([
            'success',
            'posts' => [
                '*' => ['title', 'category', 'excerpt', 'content'],
            ],
        ]);

        $saveResponse = $this->actingAs($user)->post('/dashboard/posts/ai-save', [
            'posts' => [
                [
                    'title' => 'AI Generated 1',
                    'category' => 'Teknologi',
                    'excerpt' => 'AI Excerpt 1',
                    'content' => 'AI Content 1',
                ],
            ],
        ]);

        $saveResponse->assertRedirect(route('dashboard.posts.index'));
        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'title' => 'AI Generated 1',
            'is_published' => false,
        ]);
    }
}
