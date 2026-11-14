<?php

namespace App\Features\Ai\Contracts;

use App\Features\Ai\DTO\GeneratedPostItem;

interface AiClientInterface
{
    /**
     * Generate posts based on topic/prompt and count.
     *
     * @return list<GeneratedPostItem>
     */
    public function generatePosts(string $topic, int $count = 1, ?string $category = null): array;
}
