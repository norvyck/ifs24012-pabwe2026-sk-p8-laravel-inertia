<?php

namespace App\Features\Profile\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileService
{
    /**
     * Update user profile information.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateProfile(User $user, array $data, ?UploadedFile $photo = null): bool
    {
        $updateData = [
            'name' => $data['name'],
            'email' => $data['email'],
        ];

        if (! empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        if ($photo) {
            $this->deleteProfilePhoto($user->profile_photo_path);
            $path = $photo->store('profiles', 'public');
            $updateData['profile_photo_path'] = '/storage/'.$path;
        }

        return $user->update($updateData);
    }

    /**
     * Delete profile photo.
     */
    protected function deleteProfilePhoto(?string $path): void
    {
        if ($path && str_starts_with($path, '/storage/')) {
            $relative = str_replace('/storage/', '', $path);
            if (Storage::disk('public')->exists($relative)) {
                Storage::disk('public')->delete($relative);
            }
        }
    }
}
