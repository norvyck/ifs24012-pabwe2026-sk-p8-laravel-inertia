<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Server Side Rendering
    |--------------------------------------------------------------------------
    */

    'ssr' => [

        'enabled' => (bool) env('INERTIA_SSR_ENABLED', false),

        'runtime' => env('INERTIA_SSR_RUNTIME', 'node'),

        'ensure_runtime_exists' => (bool) env('INERTIA_SSR_ENSURE_RUNTIME_EXISTS', false),

        'url' => env('INERTIA_SSR_URL', 'http://127.0.0.1:13714'),

        'hot_url' => env('INERTIA_SSR_HOT_URL'),

        'timeout' => env('INERTIA_SSR_TIMEOUT'),

        'ensure_bundle_exists' => (bool) env('INERTIA_SSR_ENSURE_BUNDLE_EXISTS', false),

        'throw_on_error' => (bool) env('INERTIA_SSR_THROW_ON_ERROR', false),

    ],

    /*
    |--------------------------------------------------------------------------
    | Pages
    |--------------------------------------------------------------------------
    */

    'pages' => [

        'ensure_pages_exist' => false,

        'paths' => [

            resource_path('js/Pages'),
            resource_path('js/pages'),

        ],

        'extensions' => [

            'js',
            'jsx',
            'svelte',
            'ts',
            'tsx',
            'vue',

        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Testing
    |--------------------------------------------------------------------------
    */

    'testing' => [

        'ensure_pages_exist' => false,

        'page_paths' => [

            resource_path('js/Pages'),
            resource_path('js/pages'),

        ],

    ],

    'expose_shared_prop_keys' => true,

    'store_previous_url' => false,

];
