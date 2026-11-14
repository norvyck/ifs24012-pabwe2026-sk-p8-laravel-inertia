<?php

namespace App\Features\Post\Policies;

use App\Features\Post\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Post $post): bool
    {
        if ($post->is_published) {
            return true;
        }

        if (! $user) {
            return false;
        }

        return $user->isAdmin() || (int) $post->user_id === (int) $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Post $post): bool
    {
        return $user->isAdmin() || (int) $post->user_id === (int) $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Post $post): bool
    {
        return $user->isAdmin() || (int) $post->user_id === (int) $user->id;
    }
}
