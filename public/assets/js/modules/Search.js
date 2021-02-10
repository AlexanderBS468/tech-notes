export class Search {
	constructor({ inputElement, resultsElement, docsIndex, onOpen }) {
		this.inputElement = inputElement;
		this.resultsElement = resultsElement;
		this.docsIndex = Array.isArray(docsIndex) ? docsIndex : [];
		this.onOpen = onOpen;
	}

	init() {
		if (!this.inputElement || !this.resultsElement) {
			return;
		}

		this.inputElement.addEventListener('input', () => {
			const query = this.inputElement.value.trim();
			this.render(query);
		});

		this.resultsElement.addEventListener('click', (event) => {
			const item = event.target.closest('.search-results__item');

			if (!item) {
				return;
			}

			const path = item.dataset.path;
			if (!path) {
				return;
			}

			this.onOpen(path);
			this.clear();
		});
	}

	render(query) {
		if (!query) {
			this.clearResults();
			return;
		}

		const results = this.search(query);

		if (!results.length) {
			this.resultsElement.innerHTML = '<div class="search-results__empty">Ничего не найдено</div>';
			this.resultsElement.style.display = 'block';
			return;
		}

		this.resultsElement.innerHTML = results.map(item => `
            <button type="button" class="search-results__item" data-path="${this.escape(item.path)}">
                <div class="search-results__title">${this.escape(item.title)}</div>
                <div class="search-results__path">${this.escape(item.path)}</div>
            </button>
        `).join('');

		this.resultsElement.style.display = 'block';
	}

	search(query) {
		const q = query.toLowerCase();

		return this.docsIndex
			.map(item => ({
				...item,
				score: this.score(item, q),
			}))
			.filter(item => item.score > 0)
			.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
			.slice(0, 20);
	}

	score(item, query) {
		let score = 0;
		const title = String(item.title || '').toLowerCase();
		const path = String(item.path || '').toLowerCase();
		const content = String(item.content || '').toLowerCase();

		if (title.includes(query)) score += 10;
		if (path.includes(query)) score += 5;
		if (content.includes(query)) score += 1;

		return score;
	}

	clear() {
		this.inputElement.value = '';
		this.clearResults();
	}

	clearResults() {
		this.resultsElement.innerHTML = '';
		this.resultsElement.style.display = 'none';
	}

	escape(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}
}
