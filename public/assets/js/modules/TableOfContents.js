export class TableOfContents {
	constructor({ contentElement, tocElement }) {
		this.contentElement = contentElement;
		this.tocElement = tocElement;
		this.headingSelector = 'h2, h3, h4';
		this.observer = null;
		this.syncFrame = null;
		this.syncSource = null;
	}

	init() {
		if (!this.tocElement) {
			return;
		}

		this.tocElement.addEventListener('click', (event) => {
			const button = event.target.closest('.toc__link');

			if (!button) {
				return;
			}

			const id = button.dataset.targetId;
			const heading = id ? document.getElementById(id) : null;

			if (!heading) {
				return;
			}

			heading.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		});

		this.tocElement.addEventListener('scroll', () => {
			this.syncFromToc();
		});

		window.addEventListener('scroll', () => {
			this.syncFromPage();
		});
	}

	build() {
		if (!this.contentElement || !this.tocElement) {
			return;
		}

		this.disconnectObserver();

		const headings = Array.from(this.contentElement.querySelectorAll(this.headingSelector))
			.filter(heading => heading.textContent.trim() !== '');

		if (headings.length < 2) {
			this.clear('Нет содержания');
			return;
		}

		const usedIds = {};
		const items = headings.map((heading, index) => {
			const level = Number(heading.tagName.slice(1));
			const text = heading.textContent.trim();
			const id = this.ensureHeadingId(heading, text, index, usedIds);

			return { id, level, text };
		});

		this.tocElement.innerHTML = items.map(item => `
			<button type="button" class="toc__link toc__link--level-${item.level}" data-target-id="${this.escape(item.id)}" title="${this.escape(item.text)}">
				${this.escape(item.text)}
			</button>
		`).join('');

		this.tocElement.scrollTop = 0;
		this.observeHeadings(headings);
	}

	clear(message) {
		this.disconnectObserver();

		if (!this.tocElement) {
			return;
		}

		this.tocElement.innerHTML = `<div class="toc__empty">${this.escape(message)}</div>`;
	}

	ensureHeadingId(heading, text, index, usedIds) {
		const existingId = heading.id ? heading.id.trim() : '';
		let id = existingId || this.slugify(text, index);
		let counter = 2;

		while (usedIds[id]) {
			id = `${existingId || this.slugify(text, index)}-${counter}`;
			counter += 1;
		}

		usedIds[id] = true;
		heading.id = id;

		return id;
	}

	slugify(text, index) {
		const slug = text
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9а-яё]+/gi, '-')
			.replace(/^-+|-+$/g, '');

		return slug ? `toc-${slug}` : `toc-heading-${index + 1}`;
	}

	observeHeadings(headings) {
		if (!('IntersectionObserver' in window)) {
			this.setActive(headings[0].id);
			return;
		}

		this.observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					this.setActive(entry.target.id);
				}
			});
		}, {
			rootMargin: '0px 0px -75% 0px',
			threshold: 0.01,
		});

		headings.forEach(heading => this.observer.observe(heading));
		this.setActive(headings[0].id);
	}

	setActive(id) {
		if (!this.tocElement) {
			return;
		}

		this.tocElement.querySelectorAll('.toc__link').forEach(link => {
			const isActive = link.dataset.targetId === id;
			link.classList.toggle('active', isActive);
		});
	}

	disconnectObserver() {
		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}
	}

	syncFromToc() {
		if (this.syncSource === 'page') {
			return;
		}

		this.scheduleSync('toc', () => {
			const pageScrollable = this.getPageScrollable();
			const tocScrollable = this.getTocScrollable();

			if (pageScrollable <= 0 || tocScrollable <= 0) {
				return;
			}

			const progress = this.tocElement.scrollTop / tocScrollable;
			this.syncSource = 'toc';
			window.scrollTo({
				top: progress * pageScrollable,
				behavior: 'auto',
			});
			this.releaseSyncSource();
		});
	}

	syncFromPage() {
		if (this.syncSource === 'toc') {
			return;
		}

		this.scheduleSync('page', () => {
			const pageScrollable = this.getPageScrollable();
			const tocScrollable = this.getTocScrollable();

			if (pageScrollable <= 0 || tocScrollable <= 0) {
				return;
			}

			const progress = window.scrollY / pageScrollable;
			this.syncSource = 'page';
			this.tocElement.scrollTop = progress * tocScrollable;
			this.releaseSyncSource();
		});
	}

	scheduleSync(source, callback) {
		if (this.syncFrame) {
			cancelAnimationFrame(this.syncFrame);
		}

		this.syncFrame = requestAnimationFrame(() => {
			this.syncFrame = null;
			callback();
		});
	}

	releaseSyncSource() {
		requestAnimationFrame(() => {
			this.syncSource = null;
		});
	}

	getPageScrollable() {
		return Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
	}

	getTocScrollable() {
		return Math.max(this.tocElement.scrollHeight - this.tocElement.clientHeight, 0);
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
