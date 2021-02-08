<?php

declare(strict_types=1);

function formatTitle(string $name): string
{
	$name = pathinfo($name, PATHINFO_FILENAME);
	$name = str_replace(['-', '_'], ' ', $name);
	return mb_convert_case($name, MB_CASE_TITLE, 'UTF-8');
}

function scanBlocks(string $dir, string $baseDir): array
{
	$items = [];
	$files = scandir($dir);

	if ($files === false) {
		return [];
	}

	foreach ($files as $file) {
		if ($file === '.' || $file === '..') {
			continue;
		}

		$fullPath = $dir . DIRECTORY_SEPARATOR . $file;

		if (is_dir($fullPath)) {
			$children = scanBlocks($fullPath, $baseDir);

			if ($children !== []) {
				$items[] = [
					'type' => 'dir',
					'title' => formatTitle($file),
					'children' => $children,
				];
			}

			continue;
		}

		if (pathinfo($fullPath, PATHINFO_EXTENSION) !== 'html') {
			continue;
		}

		$relativePath = ltrim(str_replace($baseDir, '', $fullPath), DIRECTORY_SEPARATOR);
		$relativePath = str_replace(DIRECTORY_SEPARATOR, '/', $relativePath);

		$items[] = [
			'type' => 'file',
			'title' => formatTitle($file),
			'path' => $relativePath,
		];
	}

	usort($items, static function (array $a, array $b): int {
		if ($a['type'] !== $b['type']) {
			return $a['type'] === 'dir' ? -1 : 1;
		}

		return strcmp($a['title'], $b['title']);
	});

	return $items;
}

function renderMenu(array $items): string
{
	$html = '<ul class="doc-menu">';

	foreach ($items as $item) {
		if ($item['type'] === 'dir') {
			$html .= '<li class="doc-menu-group">';
			$html .= '<div class="doc-menu-group-title">' . htmlspecialchars($item['title'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</div>';
			$html .= renderMenu($item['children']);
			$html .= '</li>';
			continue;
		}

		$title = htmlspecialchars($item['title'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
		$path = htmlspecialchars($item['path'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

		$html .= '<li class="doc-menu-item">';
		$html .= '<a href="#" class="js-doc-link" data-path="' . $path . '">' . $title . '</a>';
		$html .= '</li>';
	}

	$html .= '</ul>';

	return $html;
}

$baseDir = realpath(__DIR__ . '/../storage/blocks');
$tree = $baseDir ? scanBlocks($baseDir, $baseDir) : [];
?>
<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Local Dev Docs</title>
	<link rel="stylesheet" href="assets/css/app.css">
</head>
<body>
<div class="layout">
	<aside class="sidebar">
		<h1>Dev Docs</h1>
		<input type="text" id="search" placeholder="Поиск...">
		<nav id="menu">
			<?= renderMenu($tree) ?>
		</nav>
	</aside>

	<main class="content">
		<div id="doc-content">
			<h2>Документация</h2>
			<p>Выбери тему в меню слева.</p>
		</div>
		<div class="footer">
			Локальная база знаний. Дальше можно разрастить в полноценную документацию по Laravel / PHP / Symfony / Bitrix.
		</div>
	</main>
</div>

<script src="assets/js/app.js"></script>
</body>
</html>