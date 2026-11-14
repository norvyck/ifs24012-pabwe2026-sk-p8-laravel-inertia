<?php

namespace App\Features\Post\Enums;

enum PostCategory: string
{
    case TEKNOLOGI = 'Teknologi';
    case PENDIDIKAN = 'Pendidikan';
    case GAYA_HIDUP = 'Gaya Hidup';
    case BISNIS = 'Bisnis';
    case OPINI = 'Opini';
    case UMUM = 'Umum';

    /**
     * Get human readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::TEKNOLOGI => 'Teknologi & Koding',
            self::PENDIDIKAN => 'Pendidikan & Tutorial',
            self::GAYA_HIDUP => 'Gaya Hidup & Produktivitas',
            self::BISNIS => 'Bisnis & Karir',
            self::OPINI => 'Opini & Pemikiran',
            self::UMUM => 'Umum',
        };
    }

    /**
     * Get all values as array.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
