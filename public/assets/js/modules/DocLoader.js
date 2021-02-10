export class DocLoader {
	constructor({ contentElement, menuLinkSelector }) {
		this.contentElement = contentElement;
		this.menuLinkSelector = menuLinkSelector;
	}

	async load(path) {
		try {
			const response = await fetch(`block.php?file=${encodeURIComponent(path)}`, {
				headers: {
					'X-Requested-With': 'XMLHttpRequest',
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const html = await response.text();
			this.contentElement.innerHTML = html;
			this.setActive(path);
		} catch (error) {
			this.contentElement.innerHTML = `
                <h2>Ошибка загрузки</h2>
                <p>Не удалось загрузить документ.</p>
                <pre>${String(error.message)}</pre>
            `;
		}
	}

	setActive(path) {
		document.querySelectorAll(this.menuLinkSelector).forEach(link => {
			link.classList.remove('active');
		});

		const activeLink = document.querySelector(
			`${this.menuLinkSelector}[data-path="${CSS.escape(path)}"]`
		);

		if (activeLink) {
			activeLink.classList.add('active');
		}
	}
}
