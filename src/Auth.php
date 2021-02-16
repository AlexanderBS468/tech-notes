<?php

declare(strict_types=1);

function docsRequireBasicAuth(): void
{
	if (!docsBasicAuthEnabled()) {
		return;
	}

	$expectedUser = getenv('DOCS_AUTH_USER');
	$expectedPassword = getenv('DOCS_AUTH_PASSWORD');

	if (!is_string($expectedUser) || $expectedUser === '' || !is_string($expectedPassword) || $expectedPassword === '') {
		http_response_code(500);
		header('Content-Type: text/plain; charset=UTF-8');
		exit('Basic auth is not configured');
	}

	[$user, $password] = docsReadBasicAuthCredentials();

	if (
		!is_string($user)
		|| !is_string($password)
		|| !hash_equals($expectedUser, $user)
		|| !hash_equals($expectedPassword, $password)
	) {
		header('WWW-Authenticate: Basic realm="Local Dev Docs", charset="UTF-8"');
		http_response_code(401);
		header('Content-Type: text/plain; charset=UTF-8');
		exit('Authentication required');
	}
}

function docsBasicAuthEnabled(): bool
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
