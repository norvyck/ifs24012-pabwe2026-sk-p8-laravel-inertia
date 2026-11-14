<?php

namespace Tests\Unit;

use App\Http\Middleware\EnsurePostOwnership;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class EnsurePostOwnershipEdgeCaseTest extends TestCase
{
    public function test_aborts_when_not_authenticated(): void
    {
        $this->expectException(HttpException::class);

        $request = Request::create('/dashboard/posts/1');
        $middleware = new EnsurePostOwnership;
        $middleware->handle($request, fn () => response('OK'));
    }

    public function test_returns_404_when_post_not_found(): void
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->get('/dashboard/posts/99999');
        $response->assertStatus(404);
    }
}
