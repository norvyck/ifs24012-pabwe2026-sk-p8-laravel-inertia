<?php

namespace Tests\Unit;

use App\Features\Post\Models\Post;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class MiddlewareTest extends TestCase
{
    public function test_ensure_role_allows_authorized_user(): void
    {
        $user = User::factory()->admin()->create();
        $request = Request::create('/admin/users');
        $request->setUserResolver(fn () => $user);

        $middleware = new EnsureRole;
        $response = $middleware->handle($request, fn () => response('OK'), 'admin');

        $this->assertEquals('OK', $response->getContent());
    }

    public function test_ensure_role_aborts_unauthorized_user(): void
    {
        $this->expectException(HttpException::class);

        $user = User::factory()->member()->create();
        $request = Request::create('/admin/users');
        $request->setUserResolver(fn () => $user);

        $middleware = new EnsureRole;
        $middleware->handle($request, fn () => response('OK'), 'admin');
    }

    public function test_ensure_post_ownership_allows_owner_via_route(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get("/dashboard/posts/{$post->id}");
        $response->assertStatus(200);
    }

    public function test_ensure_post_ownership_blocks_non_owner(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($user)->get("/dashboard/posts/{$post->id}");
        $response->assertStatus(403);
    }

    public function test_handle_inertia_requests_share_props(): void
    {
        $user = User::factory()->create();
        $request = Request::create('/');
        $request->setUserResolver(fn () => $user);
        $request->setLaravelSession(app('session')->driver());

        $middleware = new HandleInertiaRequests;
        $shared = $middleware->share($request);

        $this->assertArrayHasKey('auth', $shared);
        $this->assertEquals($user->id, $shared['auth']['user']['id']);
        $this->assertArrayHasKey('flash', $shared);
    }
}
