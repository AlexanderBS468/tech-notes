<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/PasswordHash.php';

function printUsage(): void
{
	fwrite(STDERR, 'Usage:' . PHP_EOL);
	fwrite(STDERR, '  php tools/hash-password.php' . PHP_EOL);
	fwrite(STDERR, '  php tools/hash-password.php --stdin < password.txt' . PHP_EOL);
}

function readPassword(string $prompt): string
{
	fwrite(STDERR, $prompt);

	$hideInput = function_exists('posix_isatty') && posix_isatty(0) && function_exists('shell_exec') && DIRECTORY_SEPARATOR === '/';

	if ($hideInput) {
		shell_exec('stty -echo');
	}

	$password = fgets(STDIN);

	if ($hideInput) {
		shell_exec('stty echo');
		fwrite(STDERR, PHP_EOL);
	}

	return rtrim((string) $password, "\r\n");
}

$options = getopt('', ['stdin', 'help']);

if (isset($options['help'])) {
	printUsage();
	exit(0);
}

if (isset($options['stdin'])) {
	$password = rtrim(stream_get_contents(STDIN), "\r\n");
	$repeat = $password;
} else {
	$password = readPassword('Password: ');
	$repeat = readPassword('Repeat password: ');
}

if ($password === '' || $repeat === '') {
	fwrite(STDERR, 'Password cannot be empty.' . PHP_EOL);
	printUsage();
	exit(1);
}

if (!hash_equals($password, $repeat)) {
	fwrite(STDERR, 'Passwords do not match.' . PHP_EOL);
	exit(1);
}

echo docsHashPassword($password), PHP_EOL;
