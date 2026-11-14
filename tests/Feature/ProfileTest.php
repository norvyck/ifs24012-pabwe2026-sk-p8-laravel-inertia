<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    public function test_guest_cannot_access_profile(): void
    {
        $response = $this->get('/profile');
        $response->assertRedirect('/login');
    }

    public function test_user_can_view_profile_edit_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/profile');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Profile/Edit')
            ->where('user.id', $user->id)
        );
    }

    public function test_user_can_update_profile_info_and_photo(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $response = $this->actingAs($user)->put('/profile', [
            'name' => 'Nama Terupdate',
            'email' => 'terupdate@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
            'profile_photo' => UploadedFile::fake()->image('avatar.jpg'),
        ]);

        $response->assertRedirect();
        $user->refresh();

        $this->assertEquals('Nama Terupdate', $user->name);
        $this->assertEquals('terupdate@example.com', $user->email);
        $this->assertTrue(Hash::check('newpassword123', $user->password));
        $this->assertNotNull($user->profile_photo_path);
    }
}
