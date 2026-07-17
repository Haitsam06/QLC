<?php

// Fix Vercel stripping /api prefix from Laravel routes
$_SERVER['SCRIPT_NAME'] = '/index.php';

// Forward Vercel requests to Laravel's public/index.php
require __DIR__ . '/../public/index.php';
