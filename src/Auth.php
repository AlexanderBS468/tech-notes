<?php

declare(strict_types=1);

require_once __DIR__ . '/PasswordHash.php';

function docsRequireBasicAuth(): void
{
	if (!docsAuthEnabled()) {
		return;
	}

	$expectedUser = getenv('DOCS_AUTH_USER');
	$passwordHash = getenv('DOCS_AUTH_PASSWORD_HASH');

	if (!is_string($expectedUser) || $expectedUser === '' || !is_string($passwordHash) || $passwordHash === '') {
		docsAuthConfigurationError();
	}

	[$user, $password] = docsReadBasicAuthCredentials();

	if (
		!is_string($user)
		|| !is_string($password)
		|| !hash_equals($expectedUser, $user)
		|| !docsPasswordHashMatches($password, $passwordHash)
	) {
		header('WWW-Authenticate: Basic realm="Local Dev Docs", charset="UTF-8"');
		http_response_code(401);
		header('Content-Type: text/plain; charset=UTF-8');
		exit('Authentication required');
	}
}

function docsAuthEnabled(): bool
{
	$value = getenv('DOCS_AUTH_ENABLED');

	if (!is_string($value)) {
		return false;
	}

	return in_array(strtolower($value), ['1', 'true', 'yes', 'on'], true);
}

function docsReadBasicAuthCredentials(): array
{
	if (isset($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW'])) {
		return [$_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']];
	}

	$authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

	if (!is_string($authorization) || stripos($authorization, 'Basic ') !== 0) {
		return [null, null];
	}

	$decoded = base64_decode(substr($authorization, 6), true);

	if (!is_string($decoded) || !str_contains($decoded, ':')) {
		return [null, null];
	}

	return explode(':', $decoded, 2);
}

function docsAuthConfigurationError(): void
{
	http_response_code(500);
	header('Content-Type: text/plain; charset=UTF-8');
	exit('Auth is not configured');
}
