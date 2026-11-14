<?php

namespace App\Features\Ai\Services;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Ai\DTO\GeneratedPostItem;
use App\Features\Post\Enums\PostCategory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class OpenAiPostGeneratorService implements AiClientInterface
{
    public function __construct(
        protected ?string $apiKey = null,
        protected string $model = 'gpt-4o-mini',
        protected string $baseUri = 'https://api.openai.com/v1',
    ) {
        $this->apiKey = $apiKey ?? config('openai.api_key');
        $this->model = config('openai.model', 'gpt-4o-mini');
        $this->baseUri = config('openai.base_uri', 'https://api.openai.com/v1');
    }

    /**
     * Generate posts based on topic/prompt and count.
     *
     * @return list<GeneratedPostItem>
     */
    public function generatePosts(string $topic, int $count = 1, ?string $category = null): array
    {
        $count = max(1, min($count, 5));
        $validCategory = $category && in_array($category, PostCategory::values(), true)
            ? $category
            : PostCategory::TEKNOLOGI->value;

        if (! empty($this->apiKey)) {
            try {
                $prompt = "Hasilkan {$count} artikel blog tentang '{$topic}' dengan kategori '{$validCategory}'.\n"
                    ."Keluarkan HANYA format JSON array valid tanpa markdown formatting dengan struktur objek:\n"
                    .'[{"title": "Judul Artikel", "category": "'.$validCategory.'", "excerpt": "Ringkasan 1-2 kalimat.", "content": "Konten lengkap artikel dalam format Markdown..."}]';

                $response = Http::withToken($this->apiKey)
                    ->timeout(30)
                    ->post(rtrim($this->baseUri, '/').'/chat/completions', [
                        'model' => $this->model,
                        'messages' => [
                            ['role' => 'system', 'content' => 'Kamu adalah asisten jurnalis dan penulis blog profesional.'],
                            ['role' => 'user', 'content' => $prompt],
                        ],
                        'temperature' => 0.7,
                    ]);

                if ($response->successful()) {
                    $jsonContent = $response->json('choices.0.message.content');
                    $cleaned = preg_replace('/^```json\s*|\s*```$/i', '', trim((string) $jsonContent));
                    $data = json_decode((string) $cleaned, true);

                    if (is_array($data) && count($data) > 0) {
                        $items = [];
                        foreach ($data as $item) {
                            if (isset($item['title'], $item['content'])) {
                                $items[] = new GeneratedPostItem(
                                    title: (string) $item['title'],
                                    category: (string) ($item['category'] ?? $validCategory),
                                    excerpt: (string) ($item['excerpt'] ?? substr((string) $item['content'], 0, 150)),
                                    content: (string) $item['content'],
                                );
                            }
                        }
                        if (count($items) > 0) {
                            return $items;
                        }
                    }
                }
            } catch (Throwable $e) {
                Log::warning('OpenAI post generation failed, falling back to local generator: '.$e->getMessage());
            }
        }

        // Graceful mock/fallback generator
        $items = [];
        for ($i = 1; $i <= $count; $i++) {
            $suffix = $count > 1 ? " (Bagian {$i})" : '';
            $title = ucwords($topic).$suffix;
            $excerpt = "Panduan mendalam dan eksplorasi terperinci mengenai topik {$topic} dalam konteks {$validCategory}.";
            $content = "## Analisis dan Panduan: {$title}\n\n"
                ."Topik **{$topic}** memiliki dampak signifikan dalam ekosistem {$validCategory}. Tulisan ini mengupas berbagai sudut pandang strategis dan teknis yang relevan.\n\n"
                ."### Poin Penting:\n"
                ."- Pemahaman fundamental konsep {$topic}.\n"
                ."- Penerapan praktis dan tantangan implementasi di industri.\n"
                ."- Rekomendasi solusi untuk efisiensi jangka panjang.\n\n"
                .'Dibuat otomatis oleh AI Generator BlogVerse Pro.';

            $items[] = new GeneratedPostItem(
                title: $title,
                category: $validCategory,
                excerpt: $excerpt,
                content: $content,
            );
        }

        return $items;
    }
}
