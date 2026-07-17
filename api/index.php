<?php

if (isset($_GET['debug'])) {
    header('Content-Type: text/plain');
    echo "REQUEST_URI: " . $_SERVER['REQUEST_URI'] . "\n";
    echo "SCRIPT_NAME: " . $_SERVER['SCRIPT_NAME'] . "\n";
    echo "PHP_SELF: " . $_SERVER['PHP_SELF'] . "\n";
    echo "PATH_INFO: " . ($_SERVER['PATH_INFO'] ?? 'NOT SET') . "\n";
    exit;
}

// Forward Vercel requests to Laravel's public/index.php
require __DIR__ . '/../public/index.php';
