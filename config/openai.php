<?php

return [
    'api_key' => env('OPENAI_API_KEY'),
    'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
    'base_uri' => env('OPENAI_BASE_URI', 'https://api.openai.com/v1'),
];
