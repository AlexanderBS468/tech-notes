<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/Auth.php';

docsRequireBasicAuth();

$baseDir = realpath(__DIR__ . '/../storage/blocks');
$relativePath = $_GET['file'] ?? '';

if ($relativePath === '') {
	http_response_code(400);
	exit('File is required');
}

if (str_contains($relativePath, "\0")) {
	http_response_code(400);
	exit('Invalid path');
}

$fullPath = realpath($baseDir . '/' . $relativePath);

if ($fullPath === false || !str_starts_with($fullPath, $baseDir . DIRECTORY_SEPARATOR)) {
	http_response_code(403);
	exit('Access denied');
}

if (!is_file($fullPath)) {
	http_response_code(404);
	exit('File not found');
}

if (pathinfo($fullPath, PATHINFO_EXTENSION) !== 'html') {
	http_response_code(403);
	exit('Only html files allowed');
}

header('Content-Type: text/html; charset=UTF-8');
readfile($fullPath);
