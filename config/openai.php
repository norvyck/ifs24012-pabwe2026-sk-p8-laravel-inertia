<?php

return [
    'api_key' => env('OPENAI_API_KEY'),
    'model' => env('OPENAI_MODEL', 'gemini-3.8-flash'),
    'base_uri' => env('OPENAI_BASE_URI', 'https://generativelanguage.googleapis.com/v1beta/openai'),
];
