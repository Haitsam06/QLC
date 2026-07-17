<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DatabaseController extends Controller
{
    /**
     * List of models and their respective MongoDB collection names
     */
    private $models = [
        'User' => \App\Models\User::class,
        'Role' => \App\Models\Role::class,
        'Student' => \App\Models\Student::class,
        'Teacher' => \App\Models\Teacher::class,
        'Parents' => \App\Models\Parents::class,
        'Agenda' => \App\Models\Agenda::class,
        'Gallery' => \App\Models\Gallery::class,
        'Program' => \App\Models\Program::class,
        'ProgressReport' => \App\Models\ProgressReport::class,
        'SppPayment' => \App\Models\SppPayment::class,
        'Profile' => \App\Models\Profile::class,
        'MitraReport' => \App\Models\MitraReport::class,
        'Partner' => \App\Models\Partner::class,
        'Leader' => \App\Models\Leader::class,
        'Notification' => \App\Models\Notification::class,
        'Foundation' => \App\Models\Foundation::class,
    ];

    /**
     * Backup all MongoDB collections as JSON files packed inside a ZIP file
     */
    public function backupDatabase(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = auth()->user();
        if (!$user || !\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password admin salah atau sesi habis.'
            ], 403);
        }

        if (class_exists('\ZipArchive') === false) {
            return response()->json([
                'success' => false,
                'message' => 'PHP ZipArchive extension tidak aktif di server ini.'
            ], 500);
        }

        $zip = new \ZipArchive();
        $zipFileName = tempnam(sys_get_temp_dir(), 'qlc_backup_') . '.zip';

        if ($zip->open($zipFileName, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat berkas ZIP sementara.'
            ], 500);
        }

        foreach ($this->models as $name => $class) {
            // Retrieve raw documents using the model's collection name
            $collectionName = (new $class)->getTable();
            $data = DB::table($collectionName)->get()->toArray();

            // Convert to array of standard attributes (which contains BSON types serialized correctly)
            $formattedData = array_map(function ($item) {
                return (array) $item;
            }, $data);

            $zip->addFromString($name . '.json', json_encode($formattedData, JSON_PRETTY_PRINT));
        }

        $zip->close();

        return response()->download($zipFileName, 'qlc_backup_' . date('Ymd_His') . '.zip');
    }

    /**
     * Restore MongoDB collections from an uploaded backup ZIP file
     */
    public function restoreDatabase(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|file|mimes:zip|max:10240', // max 10MB
            'password'    => 'required|string',
        ]);

        $user = auth()->user();
        if (!$user || !\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password admin salah atau sesi habis.'
            ], 403);
        }

        if (class_exists('\ZipArchive') === false) {
            return response()->json([
                'success' => false,
                'message' => 'PHP ZipArchive extension tidak aktif di server ini.'
            ], 500);
        }

        $file = $request->file('backup_file');
        $zip = new \ZipArchive();

        if ($zip->open($file->getRealPath()) !== true) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuka berkas ZIP backup.'
            ], 400);
        }

        // Verify all expected JSON files exist in the backup to prevent half-restoring
        foreach ($this->models as $name => $class) {
            if ($zip->locateName($name . '.json') === false) {
                $zip->close();
                return response()->json([
                    'success' => false,
                    'message' => "Berkas cadangan tidak valid. Berkas {$name}.json tidak ditemukan."
                ], 400);
            }
        }

        try {
            DB::beginTransaction();

            foreach ($this->models as $name => $class) {
                $collectionName = (new $class)->getTable();
                $jsonContent = $zip->getFromName($name . '.json');
                $data = json_decode($jsonContent, true);

                if (is_array($data)) {
                    // Truncate the collection first
                    DB::table($collectionName)->truncate();

                    if (!empty($data)) {
                        // Recursively parse BSON objects & dates
                        $parsedData = $this->parseBackupData($data);
                        
                        // Insert raw BSON items to preserve database IDs
                        DB::table($collectionName)->insert($parsedData);
                    }
                }
            }

            DB::commit();
            $zip->close();

            return response()->json([
                'success' => true,
                'message' => 'Database berhasil dipulihkan dari cadangan.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            $zip->close();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memulihkan database: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper to parse data array recursively converting ISO 8601 strings and $oid objects
     */
    private function parseBackupData(array $data)
    {
        return array_map(function ($item) {
            return $this->parseBackupItem($item);
        }, $data);
    }

    private function parseBackupItem($item)
    {
        if (is_array($item)) {
            // Check if it's an ObjectId representation: ['$oid' => '...']
            if (count($item) === 1 && isset($item['$oid'])) {
                return new \MongoDB\BSON\ObjectId($item['$oid']);
            }
            
            // Recursively parse array keys
            foreach ($item as $key => $value) {
                $item[$key] = $this->parseBackupItem($value);
            }
        } elseif (is_string($item)) {
            // Check if it's an ISO 8601 date string (e.g. 2026-05-27T01:57:47.773000Z)
            if (preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/', $item)) {
                try {
                    return Carbon::parse($item);
                } catch (\Exception $e) {
                    // ignore and keep as string if parsing fails
                }
            }
        }
        return $item;
    }
}
