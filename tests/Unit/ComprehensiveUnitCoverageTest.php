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

    public function test_post_category_enum_all_cases(): void
    {
        $cases = PostCategory::cases();
        $this->assertCount(6, $cases);

        foreach ($cases as $case) {
            $this->assertNotEmpty($case->value);
            $this->assertNotEmpty($case->label());
        }

        $values = PostCategory::values();
        $this->assertContains(PostCategory::TEKNOLOGI->value, $values);
        $this->assertContains(PostCategory::PENDIDIKAN->value, $values);
        $this->assertContains(PostCategory::GAYA_HIDUP->value, $values);
        $this->assertContains(PostCategory::BISNIS->value, $values);
        $this->assertContains(PostCategory::OPINI->value, $values);
        $this->assertContains(PostCategory::UMUM->value, $values);
    }
}
