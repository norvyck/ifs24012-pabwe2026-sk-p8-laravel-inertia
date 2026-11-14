<?php

namespace Tests\Unit;

use App\Models\User;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    public function test_user_roles(): void
    {
        $admin = User::factory()->admin()->create();
        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($admin->isMember());

        $member = User::factory()->member()->create();
        $this->assertTrue($member->isMember());
        $this->assertFalse($member->isAdmin());
    }

    public function test_user_has_many_posts(): void
    {
        $user = User::factory()->create();
        $this->assertNotNull($user->posts());
    }
}
