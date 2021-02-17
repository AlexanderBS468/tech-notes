<?php

declare(strict_types=1);

function docsHashPassword(string $password): string
{
	return password_hash($password, PASSWORD_BCRYPT);
}

function docsPasswordHashMatches(string $password, string $hash): bool
{
	if ($hash === '' || !password_get_info($hash)['algo']) {
		return false;
	}

	return password_verify($password, $hash);
}
