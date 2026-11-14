<?php

namespace App\Features\Profile\Controllers;

use App\Features\Profile\Services\ProfileService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        protected ProfileService $profileService,
    ) {}

    /**
     * Show the profile edit page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the user profile.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
        ]);

        $this->profileService->updateProfile($user, $validated, $request->file('profile_photo'));

        return redirect()->back()
            ->with('success', 'Profile updated successfully!');
    }
}
