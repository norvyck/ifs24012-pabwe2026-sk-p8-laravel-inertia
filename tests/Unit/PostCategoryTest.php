<?php

namespace Tests\Unit;

use App\Features\Post\Enums\PostCategory;
use PHPUnit\Framework\TestCase;

class PostCategoryTest extends TestCase
{
    public function test_it_returns_all_enum_values(): void
    {
        $values = PostCategory::values();

        $this->assertContains('Teknologi', $values);
        $this->assertContains('Pendidikan', $values);
        $this->assertContains('Gaya Hidup', $values);
        $this->assertContains('Bisnis', $values);
        $this->assertContains('Opini', $values);
        $this->assertContains('Umum', $values);
        $this->assertCount(6, $values);
    }

    public function test_it_returns_correct_labels(): void
    {
        $this->assertEquals('Teknologi & Koding', PostCategory::TEKNOLOGI->label());
        $this->assertEquals('Pendidikan & Tutorial', PostCategory::PENDIDIKAN->label());
        $this->assertEquals('Gaya Hidup & Produktivitas', PostCategory::GAYA_HIDUP->label());
        $this->assertEquals('Bisnis & Karir', PostCategory::BISNIS->label());
        $this->assertEquals('Opini & Pemikiran', PostCategory::OPINI->label());
        $this->assertEquals('Umum', PostCategory::UMUM->label());
    }
}
