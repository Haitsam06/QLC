<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;

abstract class Controller
{
    /**
     * Get the public URL for a given path or return it directly if it's already a URL.
     *
     * @param string|null $path
     * @return string|null
     */
    protected function getStorageUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        return Storage::url($path);
    }

    /**
     * Delete a file from storage, handling both relative paths and full URLs.
     *
     * @param string|null $urlOrPath
     * @param string|null $disk
     * @return bool
     */
    protected function deleteStorageFile(?string $urlOrPath, ?string $disk = null): bool
    {
        if (empty($urlOrPath)) {
            return false;
        }

        $path = $urlOrPath;

        if (filter_var($urlOrPath, FILTER_VALIDATE_URL)) {
            // Local storage URL format: http://domain/storage/path/to/file
            $localPrefix = url('storage/');
            if (str_contains($urlOrPath, $localPrefix)) {
                $path = str_replace($localPrefix, '', $urlOrPath);
                return Storage::disk('public')->delete(ltrim($path, '/'));
            } else {
                // If it is an external URL (S3, R2, etc.), parse the path
                $parsed = parse_url($urlOrPath, PHP_URL_PATH);
                if ($parsed) {
                    $path = ltrim($parsed, '/');
                    $bucket = env('AWS_BUCKET');
                    if ($bucket && str_starts_with($path, $bucket . '/')) {
                        $path = substr($path, strlen($bucket . '/'));
                    }
                }
            }
        }

        $disk = $disk ?? config('filesystems.default');
        return Storage::disk($disk)->delete(ltrim($path, '/'));
    }
}
