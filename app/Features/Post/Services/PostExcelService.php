<?php

namespace App\Features\Post\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PostExcelService
{
    public function __construct(
        protected PostService $postService,
    ) {}

    /**
     * Export collection of posts to downloadable Excel spreadsheet.
     */
    public function exportPosts(Collection $posts, string $filename = 'posts.xlsx'): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Posts');

        // Headers
        $headers = ['ID', 'Judul', 'Slug', 'Kategori', 'Ringkasan', 'Status', 'Penulis', 'Tanggal Dibuat'];
        $sheet->fromArray($headers, null, 'A1');

        // Style header row
        $sheet->getStyle('A1:H1')->getFont()->setBold(true);

        $row = 2;
        foreach ($posts as $post) {
            $sheet->setCellValue("A{$row}", $post->id);
            $sheet->setCellValue("B{$row}", $post->title);
            $sheet->setCellValue("C{$row}", $post->slug);
            $sheet->setCellValue("D{$row}", $post->category);
            $sheet->setCellValue("E{$row}", $post->excerpt);
            $sheet->setCellValue("F{$row}", $post->is_published ? 'Published' : 'Draft');
            $sheet->setCellValue("G{$row}", $post->user?->name ?? 'Unknown');
            $sheet->setCellValue("H{$row}", $post->created_at?->format('Y-m-d H:i:s') ?? '-');
            $row++;
        }

        // Auto size columns
        foreach (range('A', 'H') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Import posts from an uploaded Excel file for the given user.
     *
     * @return array{imported: int, errors: list<string>}
     */
    public function importPosts(User $user, UploadedFile $file): array
    {
        $spreadsheet = IOFactory::load($file->getRealPath());
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray(null, true, true, true);

        $imported = 0;
        $errors = [];

        // Expected header format: Judul (B atau kolom 1), Kategori, Konten, Ringkasan
        // We assume Row 1 is header
        $isFirst = true;
        $rowNumber = 1;

        foreach ($rows as $row) {
            if ($isFirst) {
                $isFirst = false;
                $rowNumber++;

                continue;
            }

            // Read columns flexibly: title can be in col A or B
            $title = trim((string) ($row['B'] ?? $row['A'] ?? ''));
            $category = trim((string) ($row['D'] ?? $row['C'] ?? 'Umum'));
            $content = trim((string) ($row['E'] ?? $row['D'] ?? ''));
            $excerpt = trim((string) ($row['E'] ?? ''));

            if (empty($title)) {
                $rowNumber++;

                continue;
            }

            if (empty($content)) {
                $content = $excerpt ?: "Konten otomatis dari impor artikel {$title}.";
            }

            try {
                $this->postService->createPost($user, [
                    'title' => $title,
                    'category' => $category ?: 'Umum',
                    'excerpt' => $excerpt ?: Str::limit($content, 150),
                    'content' => $content,
                    'is_published' => false,
                ]);
                $imported++;
            } catch (\Throwable $e) {
                $errors[] = "Baris {$rowNumber}: ".$e->getMessage();
            }

            $rowNumber++;
        }

        return [
            'imported' => $imported,
            'errors' => $errors,
        ];
    }
}
