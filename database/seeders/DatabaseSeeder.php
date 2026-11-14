<?php

namespace Database\Seeders;

use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Administrator',
                'email' => 'admin@blogverse.test',
                'password' => Hash::make('admin'),
                'role' => 'admin',
                'profile_photo_path' => null,
            ]
        );

        $member = User::firstOrCreate(
            ['username' => 'member'],
            [
                'name' => 'Staff Writer',
                'email' => 'member@blogverse.test',
                'password' => Hash::make('member'),
                'role' => 'member',
                'profile_photo_path' => null,
            ]
        );

        $samplePosts = [
            [
                'user_id' => $admin->id,
                'title' => 'Welcome to BlogVerse Pro',
                'slug' => 'welcome-to-blogverse-pro',
                'category' => PostCategory::UMUM->value,
                'excerpt' => 'A modern publishing platform built for thoughtful writing, seamless sharing, and community engagement.',
                'content' => "## A Modern Publishing Space\n\nBlogVerse Pro provides a distraction-free environment to read, write, and share meaningful perspectives.\n\n### Key Highlights:\n- **Seamless Navigation**: Instant page transitions powered by Inertia.js and React.\n- **Interactive Markdown**: Write and format your thoughts with our rich live editor.\n- **Data Portability**: Easily backup and manage your articles using Excel export and import.\n- **AI Assisted Writing**: Brainstorm topics and generate starting drafts with AI.",
                'is_published' => true,
                'published_at' => now(),
            ],
            [
                'user_id' => $member->id,
                'title' => 'Getting Started with Modern Web Development',
                'slug' => 'getting-started-with-modern-web-development',
                'category' => PostCategory::TEKNOLOGI->value,
                'excerpt' => 'How modern reactive frontends empower creators to deliver fast, engaging digital experiences.',
                'content' => "## Simplifying Full-Stack Web Apps\n\nModern tooling allows developers to build rich, dynamic single-page application user experiences without unnecessary friction, pairing backend stability with reactive user interfaces.",
                'is_published' => true,
                'published_at' => now()->subDay(),
            ],
            [
                'user_id' => $member->id,
                'title' => 'Effective Time Management Strategies for Writers',
                'slug' => 'effective-time-management-strategies-for-writers',
                'category' => PostCategory::GAYA_HIDUP->value,
                'excerpt' => 'Practical productivity habits to maintain a consistent publishing rhythm each week.',
                'content' => "Consistency is the cornerstone of building an engaged readership. Utilizing time-blocking and preparing structured outlines can significantly improve creative flow and writing stamina.",
                'is_published' => true,
                'published_at' => now()->subDays(2),
            ],
            [
                'user_id' => $member->id,
                'title' => 'Draft Notes on Creative AI Assistance',
                'slug' => 'draft-notes-on-creative-ai-assistance',
                'category' => PostCategory::OPINI->value,
                'excerpt' => 'Initial observations on how large language models serve as collaborative thought partners for writers.',
                'content' => "Artificial intelligence serves best as a creative partner and writing accelerator (*copilot*) rather than replacing personal voice, original insight, and critical judgment.",
                'is_published' => false,
                'published_at' => null,
            ],
        ];

        foreach ($samplePosts as $postData) {
            Post::firstOrCreate(
                ['slug' => $postData['slug']],
                $postData
            );
        }
    }
}
