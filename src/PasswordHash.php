<?php

declare(strict_types=1);

const ALGO_CRYPT = PASSWORD_BCRYPT;

function docsHashPassword(string $password): string
{
	return password_hash($password, ALGO_CRYPT);
}

function docsPasswordHashMatches(string $password, string $hash): bool
{
	if ($hash === '' || !password_get_info($hash)['algo']) {
		return false;
	}

	return password_verify($password, $hash);
}
