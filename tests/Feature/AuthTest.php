<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Auth/Login'));
    }

    public function test_users_can_authenticate_using_username(): void
    {
        $user = User::factory()->create([
            'username' => 'penulis123',
            'password' => Hash::make('password123'),
            'role' => 'member',
        ]);

        $response = $this->post('/login', [
            'username' => 'penulis123',
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard.posts.index'));
    }

    public function test_users_can_authenticate_using_email(): void
    {
        $user = User::factory()->create([
            'email' => 'user@blogverse.test',
            'password' => Hash::make('password123'),
            'role' => 'member',
        ]);

        $response = $this->post('/login', [
            'username' => 'user@blogverse.test',
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard.posts.index'));
    }

    public function test_admin_is_redirected_to_admin_panel_after_login(): void
    {
        $admin = User::factory()->admin()->create([
            'username' => 'admin_super',
            'password' => Hash::make('admin123'),
        ]);

        $response = $this->post('/login', [
            'username' => 'admin_super',
            'password' => 'admin123',
        ]);

        $this->assertAuthenticatedAs($admin);
        $response->assertRedirect(route('admin.posts.index'));
    }

    public function test_users_cannot_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'username' => 'valid_user',
            'password' => Hash::make('correct_pass'),
        ]);

        $response = $this->post('/login', [
            'username' => 'valid_user',
            'password' => 'wrong_pass',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('username');
    }

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Auth/Register'));
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Penulis Baru',
            'username' => 'penulis_baru',
            'email' => 'baru@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'username' => 'penulis_baru',
            'email' => 'baru@example.com',
            'role' => 'member',
        ]);
        $response->assertRedirect(route('dashboard.posts.index'));
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect(route('home'));
    }
}
