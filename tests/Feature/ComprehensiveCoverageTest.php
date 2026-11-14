<?php

namespace Tests\Feature;

use App\Features\Admin\Services\AdminUserService;
use App\Features\Ai\Services\OpenAiPostGeneratorService;
use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use App\Features\Post\Repositories\PostRepository;
use App\Features\Post\Services\PostExcelService;
use App\Features\Post\Services\PostService;
use App\Features\Profile\Services\ProfileService;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class ComprehensiveCoverageTest extends TestCase
{
    public function test_post_service_edge_cases(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $service = app(PostService::class);

        // 1. Create post with empty excerpt (falls back to content limit)
        $post1 = $service->createPost($user, [
            'title' => 'First Post For Edge Cases',
            'category' => PostCategory::TEKNOLOGI->value,
            'excerpt' => '',
            'content' => '## Markdown content with sufficient length to test fallback excerpt behavior',
            'is_published' => false,
        ]);
        $this->assertNotEmpty($post1->excerpt);

        // 2. Non-ascii / empty slug fallback: "???" -> "artikel"
        $postNonAscii = $service->createPost($user, [
            'title' => '???',
            'category' => PostCategory::UMUM->value,
            'content' => 'Content for non ascii title',
        ]);
        $this->assertStringStartsWith('artikel', $postNonAscii->slug);

        // 3. Slug collisions
        $coll1 = $service->createPost($user, [
            'title' => 'Unique Collision Test',
            'category' => PostCategory::TEKNOLOGI->value,
            'content' => 'Collision 1',
        ]);
        $coll2 = $service->createPost($user, [
            'title' => 'Unique Collision Test',
            'category' => PostCategory::TEKNOLOGI->value,
            'content' => 'Collision 2',
        ]);
        $coll3 = $service->createPost($user, [
            'title' => 'Unique Collision Test',
            'category' => PostCategory::TEKNOLOGI->value,
            'content' => 'Collision 3',
        ]);
        $this->assertEquals('unique-collision-test', $coll1->slug);
        $this->assertEquals('unique-collision-test-1', $coll2->slug);
        $this->assertEquals('unique-collision-test-2', $coll3->slug);

        // 4. Update post title, category, empty excerpt, and unpublish (nullifies published_at)
        $post1->update(['is_published' => true, 'published_at' => now()]);
        $service->updatePost($post1, [
            'title' => 'Updated Title Collision Test',
            'category' => PostCategory::BISNIS->value,
            'excerpt' => '',
            'content' => 'Updated content body',
            'is_published' => false,
        ]);
        $post1->refresh();
        $this->assertEquals('Updated Title Collision Test', $post1->title);
        $this->assertEquals(PostCategory::BISNIS->value, $post1->category);
        $this->assertFalse($post1->is_published);
        $this->assertNull($post1->published_at);

        // 5. Update post with cover image when old cover exists on disk
        $oldFile = UploadedFile::fake()->image('old-cover.jpg');
        $oldPath = $oldFile->store('posts', 'public');
        $post1->update(['cover_image_path' => '/storage/'.$oldPath]);
        $this->assertTrue(Storage::disk('public')->exists($oldPath));

        $newFile = UploadedFile::fake()->image('new-cover.jpg');
        $service->updatePost($post1, [], $newFile);
        $post1->refresh();
        $this->assertFalse(Storage::disk('public')->exists($oldPath));

        // 6. Update cover when old cover is external or not in storage
        $post1->update(['cover_image_path' => 'https://example.com/cover.jpg']);
        $service->uploadCover($post1, UploadedFile::fake()->image('another-cover.jpg'));
        $post1->refresh();
        $this->assertStringStartsWith('/storage/posts/', $post1->cover_image_path);

        // 7. Delete cover
        $service->deleteCover($post1);
        $post1->refresh();
        $this->assertNull($post1->cover_image_path);

        // 8. Toggle publish back and forth
        $service->togglePublish($post1);
        $post1->refresh();
        $this->assertTrue($post1->is_published);
        $this->assertNotNull($post1->published_at);

        $service->togglePublish($post1);
        $post1->refresh();
        $this->assertFalse($post1->is_published);

        // 9. Save batch AI posts with empty items to cover validation branch
        $saved = $service->saveBatchAiPosts($user, [
            ['title' => '', 'content' => '', 'category' => ''],
            ['title' => 'Batch Post 1', 'category' => 'Teknologi', 'excerpt' => 'Batch Excerpt', 'content' => 'Batch Content'],
        ]);
        $this->assertCount(1, $saved);
    }

    public function test_post_excel_service_stream_and_import_branches(): void
    {
        $user = User::factory()->create();
        $posts = Post::factory()->count(2)->create(['user_id' => $user->id]);
        $excelService = app(PostExcelService::class);

        // 1. Test export stream execution
        $response = $excelService->exportPosts($posts, 'test_export.xlsx');
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();
        $this->assertNotEmpty($content);

        // 2. Test import with empty title row and fallback content row
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray([
            ['ID', 'Judul', 'Slug', 'Kategori', 'Konten'],
            ['', '', '', '', ''], // Row with empty title (skipped)
            [null, 'Artikel Fallback Konten', 'artikel-fallback', 'Umum', ''], // Row with empty content (uses fallback)
        ]);

        $tempPath = storage_path('framework/testing/branch_import.xlsx');
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        $file = new UploadedFile($tempPath, 'branch_import.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);
        $result = $excelService->importPosts($user, $file);

        $this->assertEquals(1, $result['imported']);
        $this->assertEmpty($result['errors']);

        // 3. Test importPosts catch block with mocked PostService throwing exception
        $mockPostService = \Mockery::mock(PostService::class);
        $mockPostService->shouldReceive('createPost')->andThrow(new \RuntimeException('Mock create failure'));
        $mockExcelService = new PostExcelService($mockPostService);

        $mockResult = $mockExcelService->importPosts($user, $file);
        $this->assertEquals(0, $mockResult['imported']);
        $this->assertCount(1, $mockResult['errors']);
        $this->assertStringContainsString('Mock create failure', $mockResult['errors'][0]);

        @unlink($tempPath);
    }

    public function test_post_repository_search_and_query_branches(): void
    {
        $userA = User::factory()->create(['name' => 'John Developer', 'username' => 'johndev']);
        $userB = User::factory()->create(['name' => 'Alice Designer', 'username' => 'alicedesign']);

        $post1 = Post::factory()->published()->create([
            'user_id' => $userA->id,
            'title' => 'Mastering React 19',
            'category' => PostCategory::TEKNOLOGI->value,
            'excerpt' => 'A guide to new React features',
            'content' => 'Deep dive into concurrent rendering',
        ]);

        $post2 = Post::factory()->published()->create([
            'user_id' => $userB->id,
            'title' => 'Modern UI Typography',
            'category' => PostCategory::GAYA_HIDUP->value,
            'excerpt' => 'Plus Jakarta Sans in design',
            'content' => 'How typography transforms readability',
        ]);

        $repo = app(PostRepositoryInterface::class);

        // 1. Search in getPublishedPaginated by category, title, excerpt, and content
        $resCat = $repo->getPublishedPaginated(category: PostCategory::TEKNOLOGI->value);
        $this->assertGreaterThanOrEqual(1, $resCat->total());

        $resTitle = $repo->getPublishedPaginated(search: 'React');
        $this->assertGreaterThanOrEqual(1, $resTitle->total());

        $resExcerpt = $repo->getPublishedPaginated(search: 'typography');
        $this->assertGreaterThanOrEqual(1, $resExcerpt->total());

        $resContent = $repo->getPublishedPaginated(search: 'concurrent');
        $this->assertGreaterThanOrEqual(1, $resContent->total());

        // 2. getUserPosts with search matching title, excerpt, and content
        $resUserTitle = $repo->getUserPosts($userA->id, 'Mastering');
        $this->assertEquals(1, $resUserTitle->total());

        $resUserExcerpt = $repo->getUserPosts($userA->id, 'React features');
        $this->assertEquals(1, $resUserExcerpt->total());

        $resUserContent = $repo->getUserPosts($userA->id, 'rendering');
        $this->assertEquals(1, $resUserContent->total());

        // 3. getAllPosts with search matching title, category, user name, and user username
        $resAllTitle = $repo->getAllPosts('Mastering');
        $this->assertGreaterThanOrEqual(1, $resAllTitle->total());

        $resAllCategory = $repo->getAllPosts('Teknologi');
        $this->assertGreaterThanOrEqual(1, $resAllCategory->total());

        $resAllUserName = $repo->getAllPosts('John Developer');
        $this->assertGreaterThanOrEqual(1, $resAllUserName->total());

        $resAllUserUsername = $repo->getAllPosts('alicedesign');
        $this->assertGreaterThanOrEqual(1, $resAllUserUsername->total());

        // 4. getAllSystemPosts & findById
        $allSystem = $repo->getAllSystemPosts();
        $this->assertGreaterThanOrEqual(2, $allSystem->count());

        $this->assertNotNull($repo->findById($post1->id));
        $this->assertNull($repo->findById(999999));
    }

    public function test_admin_user_service_search_branches(): void
    {
        $user = User::factory()->create([
            'name' => 'Charlie Searchable',
            'username' => 'charliesearch',
            'email' => 'charlie.search@example.test',
        ]);

        $service = app(AdminUserService::class);

        // Search by name
        $byName = $service->getPaginatedUsers('Charlie Searchable');
        $this->assertEquals(1, $byName->total());

        // Search by username
        $byUsername = $service->getPaginatedUsers('charliesearch');
        $this->assertEquals(1, $byUsername->total());

        // Search by email
        $byEmail = $service->getPaginatedUsers('charlie.search@example.test');
        $this->assertEquals(1, $byEmail->total());
    }

    public function test_profile_service_branches(): void
    {
        Storage::fake('public');
        $service = app(ProfileService::class);
        $user = User::factory()->create(['password' => bcrypt('oldpassword')]);

        // 1. Update without password and without photo
        $service->updateProfile($user, [
            'name' => 'Name Without Password Change',
            'email' => 'nopass@example.test',
            'password' => '',
        ]);
        $user->refresh();
        $this->assertEquals('Name Without Password Change', $user->name);

        // 2. Update with photo when existing photo exists on public disk
        $oldPhoto = UploadedFile::fake()->image('old_avatar.jpg');
        $storedOld = $oldPhoto->store('profiles', 'public');
        $user->update(['profile_photo_path' => '/storage/'.$storedOld]);
        $this->assertTrue(Storage::disk('public')->exists($storedOld));

        $newPhoto = UploadedFile::fake()->image('new_avatar.jpg');
        $service->updateProfile($user, [
            'name' => 'Name With New Photo',
            'email' => 'nopass@example.test',
        ], $newPhoto);

        $user->refresh();
        $this->assertFalse(Storage::disk('public')->exists($storedOld));
        $this->assertStringStartsWith('/storage/profiles/', $user->profile_photo_path);

        // 3. Update with photo when old photo does not start with /storage/
        $user->update(['profile_photo_path' => 'https://gravatar.com/avatar/sample']);
        $anotherPhoto = UploadedFile::fake()->image('another_avatar.jpg');
        $service->updateProfile($user, [
            'name' => 'Name With External Photo Overwrite',
            'email' => 'nopass@example.test',
        ], $anotherPhoto);
        $user->refresh();
        $this->assertStringStartsWith('/storage/profiles/', $user->profile_photo_path);
    }

    public function test_openai_generator_service_count_and_category_bounds(): void
    {
        $serviceNoKey = new OpenAiPostGeneratorService(apiKey: '');
        $clampedLow = $serviceNoKey->generatePosts('Low Count', -5, null);
        $this->assertCount(1, $clampedLow);
        $this->assertEquals(PostCategory::TEKNOLOGI->value, $clampedLow[0]->category);

        $clampedHigh = $serviceNoKey->generatePosts('High Count', 10, 'InvalidCategory');
        $this->assertCount(5, $clampedHigh);
        $this->assertEquals(PostCategory::TEKNOLOGI->value, $clampedHigh[0]->category);
    }

    public function test_openai_generator_service_with_incomplete_keys(): void
    {
        Http::fake([
            'https://api.openai.com/v1/*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => json_encode([
                                [
                                    'title' => 'Article Missing Some Keys',
                                    'content' => 'Full article content for missing keys test',
                                ],
                            ]),
                        ],
                    ],
                ],
            ], 200),
        ]);

        $serviceWithKey = new OpenAiPostGeneratorService(apiKey: 'sk-mock-key');
        $items = $serviceWithKey->generatePosts('Testing Missing Keys', 1, PostCategory::BISNIS->value);
        $this->assertCount(1, $items);
        $this->assertEquals(PostCategory::BISNIS->value, $items[0]->category);
        $this->assertNotEmpty($items[0]->excerpt);
    }

    public function test_openai_generator_service_with_empty_json_fallback(): void
    {
        Http::fake([
            'https://api.openai.com/v1/*' => Http::response([
                'choices' => [
                    ['message' => ['content' => '[]']],
                ],
            ], 200),
        ]);

        $serviceWithKey = new OpenAiPostGeneratorService(apiKey: 'sk-mock-key');
        $fallbackItems = $serviceWithKey->generatePosts('Fallback Empty JSON', 1, PostCategory::PENDIDIKAN->value);
        $this->assertCount(1, $fallbackItems);
        $this->assertStringContainsString('Fallback Empty JSON', $fallbackItems[0]->title);
    }

    public function test_openai_generator_service_with_network_exception(): void
    {
        Http::fake([
            'https://api.openai.com/v1/*' => fn () => throw new \RuntimeException('Mock network error'),
        ]);

        $serviceWithKey = new OpenAiPostGeneratorService(apiKey: 'sk-mock-key');
        $exceptionFallback = $serviceWithKey->generatePosts('Exception Topic', 1, PostCategory::OPINI->value);
        $this->assertCount(1, $exceptionFallback);
        $this->assertStringContainsString('Exception Topic', $exceptionFallback[0]->title);
    }

    public function test_post_controller_edge_cases(): void
    {
        $user = User::factory()->create();

        // 1. Search filter in post index
        $responseIndex = $this->actingAs($user)->get('/dashboard/posts?search=TestSearch');
        $responseIndex->assertStatus(200);

        // 2. Abort 404 for missing post in show, update, destroy, togglePublish, uploadCover, deleteCover
        $this->actingAs($user)->get('/dashboard/posts/999999')->assertStatus(404);
        $this->actingAs($user)->put('/dashboard/posts/999999', [
            'title' => 'T', 'category' => 'Umum', 'content' => 'C',
        ])->assertStatus(404);
        $this->actingAs($user)->delete('/dashboard/posts/999999')->assertStatus(404);
        $this->actingAs($user)->patch('/dashboard/posts/999999/publish')->assertStatus(404);
        $this->actingAs($user)->post('/dashboard/posts/999999/cover')->assertStatus(404);
        $this->actingAs($user)->delete('/dashboard/posts/999999/cover')->assertStatus(404);

        // 3. Export stream execution
        $exportRes = $this->actingAs($user)->get('/dashboard/posts/export');
        $exportRes->assertStatus(200);
        ob_start();
        $exportRes->sendContent();
        $exportContent = ob_get_clean();
        $this->assertNotEmpty($exportContent);

        // 4. Import with 0 imported articles triggers error redirect flash
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray([
            ['ID', 'Judul', 'Slug', 'Kategori', 'Konten'],
            ['', '', '', '', ''], // empty row
        ]);
        $emptyPath = storage_path('framework/testing/empty_import.xlsx');
        $writer = new Xlsx($spreadsheet);
        $writer->save($emptyPath);

        $uploadFile = new UploadedFile($emptyPath, 'empty_import.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);
        $importRes = $this->actingAs($user)->post('/dashboard/posts/import', [
            'file' => $uploadFile,
        ]);
        $importRes->assertRedirect();
        $importRes->assertSessionHas('error');
        @unlink($emptyPath);

        // 5. Generate AI posts without category parameter
        $aiRes = $this->actingAs($user)->postJson('/dashboard/posts/ai-generate', [
            'topic' => 'AI Topic Without Category',
            'count' => 1,
        ]);
        $aiRes->assertStatus(200);
        $aiRes->assertJson(['success' => true]);
    }

    public function test_admin_controllers_search_and_export(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->member()->create();
        Post::factory()->count(2)->create(['user_id' => $member->id]);

        // 1. AdminUserController index with search
        $resUsers = $this->actingAs($admin)->get('/admin/users?search=member');
        $resUsers->assertStatus(200);

        // 2. AdminUserController userPosts with search
        $resUserPosts = $this->actingAs($admin)->get("/admin/users/{$member->id}/posts?search=article");
        $resUserPosts->assertStatus(200);

        // 3. AdminUserController exportUserPosts streamed response execution
        $resUserExport = $this->actingAs($admin)->get("/admin/users/{$member->id}/posts/export");
        $resUserExport->assertStatus(200);
        ob_start();
        $resUserExport->sendContent();
        $userCsv = ob_get_clean();
        $this->assertNotEmpty($userCsv);

        // 4. AdminPostController index with search
        $resAllPosts = $this->actingAs($admin)->get('/admin/posts?search=article');
        $resAllPosts->assertStatus(200);

        // 5. AdminPostController export streamed response execution
        $resSystemExport = $this->actingAs($admin)->get('/admin/posts/export');
        $resSystemExport->assertStatus(200);
        ob_start();
        $resSystemExport->sendContent();
        $systemCsv = ob_get_clean();
        $this->assertNotEmpty($systemCsv);
    }
}
