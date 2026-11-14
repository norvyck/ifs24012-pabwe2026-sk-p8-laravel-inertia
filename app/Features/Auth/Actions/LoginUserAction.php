<?php

namespace App\Features\Auth\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginUserAction
{
    /**
     * Authenticate user with username or email.
     *
     * @param  array{username: string, password: string, remember?: bool}  $credentials
     */
    public function execute(Request $request, array $credentials): bool
    {
        $loginField = filter_var($credentials['username'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $attemptData = [
            $loginField => $credentials['username'],
            'password' => $credentials['password'],
        ];

        $remember = (bool) ($credentials['remember'] ?? false);

        if (! Auth::attempt($attemptData, $remember)) {
            throw ValidationException::withMessages([
                'username' => 'Kredensial yang diberikan tidak cocok dengan data kami.',
            ]);
        }

        $request->session()->regenerate();

        return true;
    }
}
