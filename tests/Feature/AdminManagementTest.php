<?php

namespace Tests\Feature;

use App\Features\Post\Models\Post;
use App\Models\User;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $member = User::factory()->member()->create();

        $responseUsers = $this->actingAs($member)->get('/admin/users');
        $responseUsers->assertStatus(403);

        $responsePosts = $this->actingAs($member)->get('/admin/posts');
        $responsePosts->assertStatus(403);
    }

    public function test_admin_can_view_users_list(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get('/admin/users');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/UserList')
            ->has('users.data')
        );
    }

    public function test_admin_can_view_and_export_user_posts(): void
    {
        $admin = User::factory()->admin()->create();
        $targetUser = User::factory()->member()->create();
        Post::factory()->count(2)->create(['user_id' => $targetUser->id]);

        $viewResponse = $this->actingAs($admin)->get("/admin/users/{$targetUser->id}/posts");
        $viewResponse->assertStatus(200);
        $viewResponse->assertInertia(fn ($page) => $page
            ->component('Admin/UserPostList')
            ->where('targetUser.id', $targetUser->id)
            ->has('posts.data')
        );

        $exportResponse = $this->actingAs($admin)->get("/admin/users/{$targetUser->id}/posts/export");
        $exportResponse->assertStatus(200);
        $this->assertTrue($exportResponse->headers->contains('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
    }

    public function test_admin_can_view_all_posts_and_export_system_posts(): void
    {
        $admin = User::factory()->admin()->create();
        Post::factory()->count(4)->create();

        $viewResponse = $this->actingAs($admin)->get('/admin/posts');
        $viewResponse->assertStatus(200);
        $viewResponse->assertInertia(fn ($page) => $page
            ->component('Admin/PostList')
            ->has('posts.data')
        );

        $exportResponse = $this->actingAs($admin)->get('/admin/posts/export');
        $exportResponse->assertStatus(200);
        $this->assertTrue($exportResponse->headers->contains('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
    }
}
