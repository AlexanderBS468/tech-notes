document.addEventListener('DOMContentLoaded', () => {
	const content = document.getElementById('doc-content');
	const searchInput = document.getElementById('search');

	async function loadBlock(path) {
		try {
			const response = await fetch(`block.php?file=${encodeURIComponent(path)}`, {
				headers: {
					'X-Requested-With': 'XMLHttpRequest'
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const html = await response.text();
			content.innerHTML = html;

			document.querySelectorAll('.js-doc-link').forEach(link => {
				link.classList.remove('active');
			});

			const activeLink = document.querySelector(`.js-doc-link[data-path="${CSS.escape(path)}"]`);
			if (activeLink) {
				activeLink.classList.add('active');
			}
		} catch (error) {
			content.innerHTML = `
                <h2>Ошибка загрузки</h2>
                <p>Не удалось загрузить документ.</p>
                <pre>${error.message}</pre>
            `;
		}
	}

	document.addEventListener('click', (event) => {
		const link = event.target.closest('.js-doc-link');

		if (!link) {
			return;
		}

		event.preventDefault();

		const path = link.dataset.path;
		if (!path) {
			return;
		}

		loadBlock(path);
	});

	if (searchInput) {
		searchInput.addEventListener('input', () => {
			const query = searchInput.value.trim().toLowerCase();

			document.querySelectorAll('.doc-menu-item').forEach(item => {
				const text = item.textContent.toLowerCase();
				item.style.display = text.includes(query) ? '' : 'none';
			});

			document.querySelectorAll('.doc-menu-group').forEach(group => {
				const hasVisibleChildren = Array.from(group.querySelectorAll(':scope > .doc-menu > .doc-menu-item'))
					.some(item => item.style.display !== 'none');

				group.style.display = hasVisibleChildren ? '' : 'none';
			});
		});
	}

	const firstLink = document.querySelector('.js-doc-link');
	if (firstLink && firstLink.dataset.path) {
		loadBlock(firstLink.dataset.path);
	}
});