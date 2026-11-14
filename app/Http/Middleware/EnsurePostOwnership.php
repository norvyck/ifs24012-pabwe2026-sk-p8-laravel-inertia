<?php

namespace App\Http\Middleware;

use App\Features\Post\Models\Post;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePostOwnership
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $postParam = $request->route('post');
        $post = $postParam instanceof Post ? $postParam : Post::find($postParam);

        if (! $post) {
            abort(404, 'Article not found.');
        }

        if ($user->role !== 'admin' && (int) $post->user_id !== (int) $user->id) {
            abort(403, 'You do not have permission to manage this article.');
        }

        return $next($request);
    }
}
