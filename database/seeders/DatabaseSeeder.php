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
                'name' => 'Penulis Blog',
                'email' => 'member@blogverse.test',
                'password' => Hash::make('member'),
                'role' => 'member',
                'profile_photo_path' => null,
            ]
        );

        $samplePosts = [
            [
                'user_id' => $admin->id,
                'title' => 'Selamat Datang di BlogVerse Pro',
                'slug' => 'selamat-datang-di-blogverse-pro',
                'category' => PostCategory::UMUM->value,
                'excerpt' => 'Platform publikasi modern dengan arsitektur Clean Architecture, Inertia.js, React, dan integrasi AI.',
                'content' => "## Platform Publikasi Generasi Baru\n\nBlogVerse Pro hadir membawa pengalaman membaca dan menulis artikel yang mulus, cepat, dan responsif.\n\n### Fitur Utama:\n- **Clean Architecture & Feature-First**: Struktur modular yang skalabel dan mudah di-maintain.\n- **Inertia.js & React**: Navigasi SPA cepat tanpa memuat ulang browser.\n- **TOAST UI Markdown Editor**: Menulis artikel kaya format dengan preview real-time.\n- **Export & Import Excel**: Cadangkan dan kelola koleksi tulisanmu dalam format spreadsheet.\n- **AI Article Generator**: Pembuatan draf otomatis didukung kecerdasan buatan.",
                'is_published' => true,
                'published_at' => now(),
            ],
            [
                'user_id' => $member->id,
                'title' => 'Memulai Pengembangan Modern dengan React dan Inertia',
                'slug' => 'memulai-pengembangan-modern-dengan-react-dan-inertia',
                'category' => PostCategory::TEKNOLOGI->value,
                'excerpt' => 'Bagaimana Inertia menjembatani backend Laravel yang kuat dengan fleksibilitas komponen React.',
                'content' => "## Mengapa Memilih Inertia.js?\n\nInertia menghilangkan kerumitan membangun REST API terpisah hanya untuk aplikasi internal. Kita tetap menikmati routing, controller, autentikasi, dan validasi bawaan Laravel sambil merender antarmuka interaktif React.",
                'is_published' => true,
                'published_at' => now()->subDay(),
            ],
            [
                'user_id' => $member->id,
                'title' => 'Strategi Manajemen Waktu untuk Penulis Konten',
                'slug' => 'strategi-manajemen-waktu-untuk-penulis-konten',
                'category' => PostCategory::GAYA_HIDUP->value,
                'excerpt' => 'Tips produktivitas praktis agar konsisten mempublikasikan artikel berkualitas setiap minggu.',
                'content' => 'Konsistensi adalah kunci dalam membangun audiens pembaca setia. Gunakan teknik time-blocking dan susun outline tulisan terlebih dahulu.',
                'is_published' => true,
                'published_at' => now()->subDays(2),
            ],
            [
                'user_id' => $member->id,
                'title' => 'Draf Ide Inovasi AI dalam Jurnalisme Digital',
                'slug' => 'draf-ide-inovasi-ai-dalam-jurnalisme-digital',
                'category' => PostCategory::OPINI->value,
                'excerpt' => 'Catatan awal eksplorasi integrasi model bahasa besar dalam kurasi berita lokal.',
                'content' => 'Kecerdasan buatan sebaiknya diposisikan sebagai asisten kreatif (*copilot*), bukan pengganti nalar kritis seorang jurnalis.',
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
