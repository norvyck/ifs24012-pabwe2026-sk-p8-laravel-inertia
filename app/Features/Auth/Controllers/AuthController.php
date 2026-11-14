<?php

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Actions\LoginUserAction;
use App\Features\Auth\Actions\RegisterUserAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function __construct(
        protected LoginUserAction $loginAction,
        protected RegisterUserAction $registerAction,
    ) {}

    /**
     * Show login page.
     */
    public function login(): Response
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Process login authentication.
     */
    public function authenticate(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $this->loginAction->execute($request, $credentials);

        $user = $request->user();
        if ($user && $user->isAdmin()) {
            return redirect()->intended(route('admin.posts.index'));
        }

        return redirect()->intended(route('dashboard.posts.index'));
    }

    /**
     * Show register page.
     */
    public function register(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Process user registration.
     */
    public function storeUser(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'alpha_dash', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $this->registerAction->execute($request, $validated);

        return redirect()->route('dashboard.posts.index')
            ->with('success', 'Account registered successfully! Welcome to BlogVerse Pro.');
    }

    /**
     * Destroy authenticated session.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}
