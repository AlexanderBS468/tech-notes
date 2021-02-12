export class DocLoader {
	constructor({ contentElement, menuLinkSelector, onLoad, onError }) {
		this.contentElement = contentElement;
		this.menuLinkSelector = menuLinkSelector;
		this.onLoad = onLoad;
		this.onError = onError;
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
			window.scrollTo({
				top: 0,
				behavior: 'auto',
			});

			if (this.onLoad) {
				this.onLoad(path);
			}
		} catch (error) {
			this.contentElement.innerHTML = `
                <h2>Ошибка загрузки</h2>
                <p>Не удалось загрузить документ.</p>
                <pre>${String(error.message)}</pre>
            `;

			if (this.onError) {
				this.onError(error);
			}
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
