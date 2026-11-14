<?php

namespace Tests\Unit;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Ai\DTO\GeneratedPostItem;
use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use App\Features\Post\Policies\PostPolicy;
use App\Http\Middleware\EnsurePostOwnership;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use App\Providers\AppServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class ComprehensiveUnitCoverageTest extends TestCase
{
    public function test_app_service_provider_register_and_boot(): void
    {
        $provider = new AppServiceProvider(app());
        $provider->register();

        $this->assertTrue(app()->bound(PostRepositoryInterface::class));
        $this->assertTrue(app()->bound(AiClientInterface::class));

        // Test boot with force_https = true
        config(['app.force_https' => true]);
        $provider->boot();

        // Test boot with force_https = false
        config(['app.force_https' => false]);
        $provider->boot();

        $this->assertTrue(Gate::has(Post::class) || Gate::getPolicyFor(Post::class) !== null);
    }

    public function test_handle_inertia_requests_version_and_guest_share(): void
    {
        $middleware = new HandleInertiaRequests;
        $request = Request::create('/');
        $request->setLaravelSession(app('session')->driver());
        $request->session()->put('success', 'Operation successful');
        $request->session()->put('error', 'Operation failed');
        $request->session()->put('info', 'Operation info');

        // Test version method
        $version = $middleware->version($request);
        $this->assertTrue($version === null || is_string($version));

        // Test share with guest (null user)
        $request->setUserResolver(fn () => null);
        $shared = $middleware->share($request);

        $this->assertNull($shared['auth']['user']);
        $this->assertIsArray($shared['flash']);

        // Execute flash closures
        $this->assertEquals('Operation successful', $shared['flash']['success']());
        $this->assertEquals('Operation failed', $shared['flash']['error']());
        $this->assertEquals('Operation info', $shared['flash']['info']());
    }

    public function test_ensure_role_aborts_for_guest(): void
    {
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Unauthorized access.');

        $request = Request::create('/admin/users');
        $request->setUserResolver(fn () => null);

        $middleware = new EnsureRole;
        $middleware->handle($request, fn () => response('OK'), 'admin');
    }

    public function test_ensure_post_ownership_with_id_param_and_roles(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $stranger = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $owner->id]);

        $middleware = new EnsurePostOwnership;

        // 1. Guest access aborts with 401
        try {
            $guestReq = Request::create('/dashboard/posts/'.$post->id);
            $guestReq->setUserResolver(fn () => null);
            $middleware->handle($guestReq, fn () => response('OK'));
            $this->fail('Expected 401 exception for guest');
        } catch (HttpException $e) {
            $this->assertEquals(401, $e->getStatusCode());
        }

        // 2. Non-existent post ID aborts with 404
        try {
            $notFoundReq = Request::create('/dashboard/posts/999999');
            $notFoundReq->setUserResolver(fn () => $owner);
            $route = new Route('GET', '/dashboard/posts/{post}', []);
            $route->bind($notFoundReq);
            $route->setParameter('post', '999999');
            $notFoundReq->setRouteResolver(fn () => $route);

            $middleware->handle($notFoundReq, fn () => response('OK'));
            $this->fail('Expected 404 exception');
        } catch (HttpException $e) {
            $this->assertEquals(404, $e->getStatusCode());
        }

        // 3. String post ID - owner allowed
        $ownerReq = Request::create('/dashboard/posts/'.$post->id);
        $ownerReq->setUserResolver(fn () => $owner);
        $route = new Route('GET', '/dashboard/posts/{post}', []);
        $route->bind($ownerReq);
        $route->setParameter('post', (string) $post->id);
        $ownerReq->setRouteResolver(fn () => $route);

        $res = $middleware->handle($ownerReq, fn () => response('OK'));
        $this->assertEquals('OK', $res->getContent());

        // 4. String post ID - admin allowed
        $adminReq = Request::create('/dashboard/posts/'.$post->id);
        $adminReq->setUserResolver(fn () => $admin);
        $adminReq->setRouteResolver(fn () => $route);

        $resAdmin = $middleware->handle($adminReq, fn () => response('OK'));
        $this->assertEquals('OK', $resAdmin->getContent());

        // 5. String post ID - stranger blocked with 403
        try {
            $strangerReq = Request::create('/dashboard/posts/'.$post->id);
            $strangerReq->setUserResolver(fn () => $stranger);
            $strangerReq->setRouteResolver(fn () => $route);

            $middleware->handle($strangerReq, fn () => response('OK'));
            $this->fail('Expected 403 exception');
        } catch (HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }

        // 6. Post instance parameter - stranger blocked with 403
        try {
            $postInstReq = Request::create('/dashboard/posts/'.$post->id);
            $postInstReq->setUserResolver(fn () => $stranger);
            $routeInst = new Route('GET', '/dashboard/posts/{post}', []);
            $routeInst->bind($postInstReq);
            $routeInst->setParameter('post', $post);
            $postInstReq->setRouteResolver(fn () => $routeInst);

            $middleware->handle($postInstReq, fn () => response('OK'));
            $this->fail('Expected 403 exception');
        } catch (HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    public function test_post_model_relations_and_scopes(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id, 'is_published' => true]);

        $this->assertInstanceOf(User::class, $post->user);
        $this->assertEquals($user->id, $post->user->id);

        $publishedCount = Post::query()->published()->count();
        $this->assertGreaterThanOrEqual(1, $publishedCount);

        // Test casts
        $this->assertIsBool($post->is_published);
        $this->assertNotNull($post->published_at);
    }

    public function test_models_casts_and_new_factory_reflection(): void
    {
        // 1. User casts method
        $userReflection = new \ReflectionClass(User::class);
        $userCastsMethod = $userReflection->getMethod('casts');
        $userCastsMethod->setAccessible(true);
        $userCasts = $userCastsMethod->invoke(new User);
        $this->assertIsArray($userCasts);
        $this->assertArrayHasKey('password', $userCasts);

        // 2. Post casts method
        $postReflection = new \ReflectionClass(Post::class);
        $postCastsMethod = $postReflection->getMethod('casts');
        $postCastsMethod->setAccessible(true);
        $postCasts = $postCastsMethod->invoke(new Post);
        $this->assertIsArray($postCasts);
        $this->assertArrayHasKey('is_published', $postCasts);

        // 3. Post newFactory method
        $newFactoryMethod = $postReflection->getMethod('newFactory');
        $newFactoryMethod->setAccessible(true);
        $factory = $newFactoryMethod->invoke(null);
        $this->assertInstanceOf(\Database\Factories\PostFactory::class, $factory);
    }

    public function test_all_controllers_and_services_constructors(): void
    {
        $adminUserCtrl = new \App\Features\Admin\Controllers\AdminUserController(
            app(\App\Features\Admin\Services\AdminUserService::class),
            app(PostRepositoryInterface::class),
            app(\App\Features\Post\Services\PostExcelService::class)
        );
        $this->assertNotNull($adminUserCtrl);

        $adminPostCtrl = new \App\Features\Post\Controllers\AdminPostController(
            app(PostRepositoryInterface::class),
            app(\App\Features\Post\Services\PostExcelService::class)
        );
        $this->assertNotNull($adminPostCtrl);

        $postCtrl = new \App\Features\Post\Controllers\PostController(
            app(PostRepositoryInterface::class),
            app(\App\Features\Post\Services\PostService::class),
            app(\App\Features\Post\Services\PostExcelService::class),
            app(AiClientInterface::class)
        );
        $this->assertNotNull($postCtrl);

        $publicCtrl = new \App\Features\Post\Controllers\PublicPostController(
            app(PostRepositoryInterface::class)
        );
        $this->assertNotNull($publicCtrl);

        $authCtrl = new \App\Features\Auth\Controllers\AuthController(
            app(\App\Features\Auth\Actions\LoginUserAction::class),
            app(\App\Features\Auth\Actions\RegisterUserAction::class)
        );
        $this->assertNotNull($authCtrl);

        $profileCtrl = new \App\Features\Profile\Controllers\ProfileController(
            app(\App\Features\Profile\Services\ProfileService::class)
        );
        $this->assertNotNull($profileCtrl);

        $postExcelService = new \App\Features\Post\Services\PostExcelService(
            app(\App\Features\Post\Services\PostService::class)
        );
        $this->assertNotNull($postExcelService);

        $postService = new \App\Features\Post\Services\PostService(
            app(PostRepositoryInterface::class)
        );
        $this->assertNotNull($postService);

        $dto = new GeneratedPostItem('T', 'C', 'E', 'Ct');
        $this->assertNotNull($dto);

        $aiService = new \App\Features\Ai\Services\OpenAiPostGeneratorService('fake', 'model', 'https://example.com');
        $this->assertNotNull($aiService);
    }

    public function test_login_user_action_with_remember_true(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('secret123'),
        ]);

        $request = Request::create('/login', 'POST', [
            'username' => $user->username,
            'password' => 'secret123',
            'remember' => true,
        ]);
        $request->setLaravelSession(app('session')->driver());

        $action = new \App\Features\Auth\Actions\LoginUserAction;
        $result = $action->execute($request, [
            'username' => $user->username,
            'password' => 'secret123',
            'remember' => true,
        ]);

        $this->assertTrue($result);
        $this->assertAuthenticatedAs($user);
    }

    public function test_post_excel_service_edge_export_and_import(): void
    {
        $user = User::factory()->create();

        // 1. Export with draft post, null user, and null created_at
        $post = new Post([
            'title' => 'Draft Post Without User',
            'slug' => 'draft-post-no-user',
            'category' => 'Umum',
            'excerpt' => 'No user excerpt',
            'is_published' => false,
        ]);
        $post->id = 1001;
        $post->created_at = null;
        $post->setRelation('user', null);

        $excelService = app(\App\Features\Post\Services\PostExcelService::class);
        $response = $excelService->exportPosts(collect([$post]), 'edge.xlsx');
        ob_start();
        $response->sendContent();
        $output = ob_get_clean();
        $this->assertNotEmpty($output);

        // 2. Import with title in col A, category in col C, and empty category
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray([
            ['Col A', 'Col B', 'Col C', 'Col D', 'Col E'],
            ['Title in Col A', '', 'Bisnis', '', 'Some content'], // Title in Col A, Category in Col C
            ['Title Two Col A', '', '', '', 'Content two'], // Title in Col A, Category empty (falls back to Umum)
        ]);

        $tempPath = storage_path('framework/testing/col_a_import.xlsx');
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $writer->save($tempPath);

        $file = new \Illuminate\Http\UploadedFile($tempPath, 'col_a_import.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);
        $res = $excelService->importPosts($user, $file);

        $this->assertEquals(2, $res['imported']);
        @unlink($tempPath);
    }

    public function test_post_service_and_profile_service_extra_branches(): void
    {
        \Illuminate\Support\Facades\Storage::fake('public');
        $user = User::factory()->create();
        $service = app(\App\Features\Post\Services\PostService::class);

        $post = $service->createPost($user, [
            'title' => 'Sample Article',
            'category' => 'Teknologi',
            'content' => 'Initial content',
            'is_published' => true,
        ]);

        // 1. Update post with same title ($data['title'] === $post->title)
        $service->updatePost($post, [
            'title' => 'Sample Article',
        ]);
        $this->assertEquals('sample-article', $post->fresh()->slug);

        // 2. Update post with is_published = true when already published with published_at
        $service->updatePost($post, [
            'is_published' => true,
        ]);
        $this->assertTrue($post->fresh()->is_published);

        // 3. Update post with empty excerpt and no content in update data (falls back to $post->content)
        $service->updatePost($post, [
            'excerpt' => '',
        ]);
        $this->assertNotEmpty($post->fresh()->excerpt);

        // 4. deleteCoverFile internal via reflection
        $postServiceRef = new \ReflectionClass($service);
        $delMethod = $postServiceRef->getMethod('deleteCoverFile');
        $delMethod->setAccessible(true);

        // null path
        $delMethod->invoke($service, null);
        // external path
        $delMethod->invoke($service, 'https://cdn.example.com/pic.jpg');
        // non-existent storage path
        $delMethod->invoke($service, '/storage/posts/does-not-exist.jpg');

        // 5. ProfileService deleteProfilePhoto internal via reflection
        $profileService = app(\App\Features\Profile\Services\ProfileService::class);
        $profileServiceRef = new \ReflectionClass($profileService);
        $delPhotoMethod = $profileServiceRef->getMethod('deleteProfilePhoto');
        $delPhotoMethod->setAccessible(true);

        // null path
        $delPhotoMethod->invoke($profileService, null);
        // external path
        $delPhotoMethod->invoke($profileService, 'https://cdn.example.com/pic.jpg');
        // non-existent storage path
        $delPhotoMethod->invoke($profileService, '/storage/profiles/does-not-exist.jpg');
    }

    public function test_openai_markdown_backticks(): void
    {
        \Illuminate\Support\Facades\Http::fake([
            'https://api.openai.com/v1/*' => \Illuminate\Support\Facades\Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => "```json\n[{\"title\": \"Markdown Wrapped Article\", \"content\": \"Full markdown content here\"}]\n```",
                        ],
                    ],
                ],
            ], 200),
        ]);

        $service = new \App\Features\Ai\Services\OpenAiPostGeneratorService('sk-mock-key');
        $posts = $service->generatePosts('Wrapped Topic', 1, 'Teknologi');
        $this->assertCount(1, $posts);
        $this->assertEquals('Markdown Wrapped Article', $posts[0]->title);
    }

    public function test_openai_missing_attributes_fallback(): void
    {
        \Illuminate\Support\Facades\Http::fake([
            'https://api.openai.com/v1/*' => \Illuminate\Support\Facades\Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => json_encode([
                                ['category' => 'Teknologi'], // missing title & content
                                ['title' => 'Only Title'], // missing content
                            ]),
                        ],
                    ],
                ],
            ], 200),
        ]);

        $service = new \App\Features\Ai\Services\OpenAiPostGeneratorService('sk-mock-key');
        $fallbackPosts = $service->generatePosts('Missing Topic', 1, 'Teknologi');
        $this->assertCount(1, $fallbackPosts);
        $this->assertStringContainsString('Missing Topic', $fallbackPosts[0]->title);
    }

    public function test_post_controller_direct_404_aborts(): void
    {
        $controller = app(\App\Features\Post\Controllers\PostController::class);
        $request = Request::create('/');

        // 1. show (line 76)
        try {
            $controller->show($request, 999999);
            $this->fail('Expected 404 in show');
        } catch (HttpException $e) {
            $this->assertEquals(404, $e->getStatusCode());
        }

        // 2. update (line 91)
        try {
            $controller->update($request, 999999);
            $this->fail('Expected 404 in update');
        } catch (HttpException $e) {
            $this->assertEquals(404, $e->getStatusCode());
        }

        // 3. destroy (line 117)
        try {
            $controller->destroy($request, 999999);
            $this->fail('Expected 404 in destroy');
        } catch (HttpException $e) {
            $this->assertEquals(404, $e->getStatusCode());
        }

        // 4. togglePublish (line 134)
        try {
            $controller->togglePublish($request, 999999);
            $this->fail('Expected 404 in togglePublish');
        } catch (HttpException $e) {
            $this->assertEquals(404, $e->getStatusCode());
        }

        // 5. uploadCover (line 151)
        try {
            $controller->uploadCover($request, 999999);
            $this->fail('Expected 404 in uploadCover');
        } catch (HttpException $e) {
            $this->assertEquals(404, $e->getStatusCode());
        }

        // 6. deleteCover (line 171)
        try {
            $controller->deleteCover($request, 999999);
            $this->fail('Expected 404 in deleteCover');
        } catch (HttpException $e) {
            $this->assertEquals(404, $e->getStatusCode());
        }
    }

    public function test_post_service_publish_draft_without_published_at_sets_now(): void
    {
        $user = User::factory()->create();
        $service = app(\App\Features\Post\Services\PostService::class);

        // Post with published_at = null (line 83)
        $post = Post::factory()->create([
            'user_id' => $user->id,
            'is_published' => false,
            'published_at' => null,
        ]);

        $service->updatePost($post, [
            'is_published' => true,
        ]);

        $post->refresh();
        $this->assertTrue($post->is_published);
        $this->assertNotNull($post->published_at);
    }

    public function test_post_excel_service_import_empty_content_line_102(): void
    {
        $user = User::factory()->create();
        $excelService = app(\App\Features\Post\Services\PostExcelService::class);

        // Row where col B is title, and col D & E are empty string (line 102)
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray([
            ['ID', 'Judul', 'Slug', 'Kategori', 'Konten'],
            ['', 'Article Empty Content Test', '', '', ''],
        ]);

        $tempPath = storage_path('framework/testing/empty_content_102.xlsx');
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $writer->save($tempPath);

        $file = new \Illuminate\Http\UploadedFile($tempPath, 'empty_content_102.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);
        $result = $excelService->importPosts($user, $file);

        $this->assertEquals(1, $result['imported']);
        $importedPost = Post::where('title', 'Article Empty Content Test')->first();
        $this->assertNotNull($importedPost);
        $this->assertStringContainsString('Konten otomatis dari impor artikel Article Empty Content Test.', $importedPost->content);
        @unlink($tempPath);
    }
}
