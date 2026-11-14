<?php

namespace App\Features\Post\Models;

use App\Models\User;
use Database\Factories\PostFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    /** @use HasFactory<PostFactory> */
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'posts';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'category',
        'excerpt',
        'content',
        'cover_image_path',
        'is_published',
        'published_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): PostFactory
    {
        return PostFactory::new();
    }

    /**
     * Get the user that owns the post.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for published posts.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
