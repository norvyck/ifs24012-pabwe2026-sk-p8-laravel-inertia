<?php

namespace Tests\Unit;

use App\Features\Post\Models\Post;
use App\Features\Post\Policies\PostPolicy;
use App\Models\User;
use Tests\TestCase;

class PostPolicyTest extends TestCase
{
    public function test_post_policy_view(): void
    {
        $policy = new PostPolicy;

        $publishedPost = Post::factory()->published()->create();
        $this->assertTrue($policy->view(null, $publishedPost));

        $draftPost = Post::factory()->draft()->create();
        $this->assertFalse($policy->view(null, $draftPost));

        $owner = $draftPost->user;
        $this->assertTrue($policy->view($owner, $draftPost));

        $admin = User::factory()->admin()->create();
        $this->assertTrue($policy->view($admin, $draftPost));

        $stranger = User::factory()->member()->create();
        $this->assertFalse($policy->view($stranger, $draftPost));
    }

    public function test_post_policy_create_update_delete(): void
    {
        $policy = new PostPolicy;

        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $stranger = User::factory()->create();

        $post = Post::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($policy->create($user));

        $this->assertTrue($policy->update($user, $post));
        $this->assertTrue($policy->update($admin, $post));
        $this->assertFalse($policy->update($stranger, $post));

        $this->assertTrue($policy->delete($user, $post));
        $this->assertTrue($policy->delete($admin, $post));
        $this->assertFalse($policy->delete($stranger, $post));
    }
}
