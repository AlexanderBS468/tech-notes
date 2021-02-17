<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/Auth.php';

docsRequireBasicAuth();

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

		return strnatcasecmp($a['title'], $b['title']);
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
		$html .= '<a href="javascript:void()" class="js-doc-link" data-path="' . $path . '">' . $title . '</a>';
		$html .= '</li>';
	}

	$html .= '</ul>';

	return $html;
}

function buildSearchIndex(array $items, string $baseDir): array
{
	$index = [];

	foreach ($items as $item) {
		if ($item['type'] === 'dir') {
			$index = array_merge($index, buildSearchIndex($item['children'], $baseDir));
			continue;
		}

		$path = $item['path'];
		$fullPath = realpath($baseDir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $path));

		if ($fullPath === false || !str_starts_with($fullPath, $baseDir . DIRECTORY_SEPARATOR)) {
			continue;
		}

		$content = file_get_contents($fullPath);

		if ($content === false) {
			$content = '';
		}

		$text = html_entity_decode(strip_tags($content), ENT_QUOTES | ENT_HTML5, 'UTF-8');
		$text = preg_replace('/\s+/u', ' ', $text) ?? $text;

		$index[] = [
			'title' => $item['title'],
			'path' => $path,
			'content' => trim($text),
		];
	}

	return $index;
}

$baseDir = realpath(__DIR__ . '/../storage/blocks');
$tree = $baseDir ? scanBlocks($baseDir, $baseDir) : [];
$searchIndex = $baseDir ? buildSearchIndex($tree, $baseDir) : [];
?>
<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Local Dev Docs</title>
	<link rel="stylesheet" href="assets/css/app.min.css">
</head>
<body>
<div class="mobile-toolbar" aria-label="Навигация по документации">
	<button type="button" class="mobile-toolbar__button" data-panel-target="menu" aria-controls="docs-sidebar" aria-expanded="false">
		Меню
	</button>
	<button type="button" class="mobile-toolbar__button" data-panel-target="toc" aria-controls="docs-toc-sidebar" aria-expanded="false">
		Содержание
	</button>
</div>
<button type="button" class="mobile-panel-backdrop" aria-label="Закрыть панель"></button>
<div class="layout">
	<aside id="docs-sidebar" class="sidebar" data-mobile-panel="menu">
		<h1>Dev Docs</h1>
		<input type="text" id="search" class="search" placeholder="Поиск...">
		<div id="search-results" class="search-results" aria-live="polite"></div>
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

	<aside id="docs-toc-sidebar" class="toc-sidebar" data-mobile-panel="toc">
		<div class="toc">
			<div class="toc__title">Содержание</div>
			<div id="table-of-contents" class="toc__body">
				<div class="toc__empty">Выбери документ</div>
			</div>
		</div>
	</aside>
</div>

<script>
	window.docsIndex = <?= json_encode(
		$searchIndex,
		JSON_UNESCAPED_UNICODE
		| JSON_UNESCAPED_SLASHES
		| JSON_HEX_TAG
		| JSON_HEX_AMP
		| JSON_HEX_APOS
		| JSON_HEX_QUOT
	) ?>;
</script>
<script type="module" src="assets/js/app.js"></script>
<script src="assets/js/secret.js"></script>
</body>
</html>
