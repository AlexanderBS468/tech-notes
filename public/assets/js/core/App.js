import { DocLoader } from '../modules/DocLoader.js';
import { Search } from '../modules/Search.js';
import { TableOfContents } from '../modules/TableOfContents.js';

export class App {
	constructor(config) {
		this.config = config;
		this.contentElement = document.querySelector(config.contentSelector);
		this.searchInput = document.querySelector(config.searchInputSelector);
		this.searchResults = document.querySelector(config.searchResultsSelector);
		this.tableOfContentsElement = document.querySelector(config.tableOfContentsSelector);
		this.mobilePanelButtons = Array.from(document.querySelectorAll('[data-panel-target]'));
		this.mobilePanelBackdrop = document.querySelector('.mobile-panel-backdrop');

		this.tableOfContents = new TableOfContents({
			contentElement: this.contentElement,
			tocElement: this.tableOfContentsElement,
		});

		this.docLoader = new DocLoader({
			contentElement: this.contentElement,
			menuLinkSelector: config.menuLinkSelector,
			onLoad: () => this.tableOfContents.build(),
			onError: () => this.tableOfContents.clear('Нет содержания'),
		});

		this.search = new Search({
			inputElement: this.searchInput,
			resultsElement: this.searchResults,
			docsIndex: config.docsIndex,
			onOpen: (path) => {
				this.closeMobilePanels();
				this.docLoader.load(path);
			},
		});
	}

	init() {
		this.bindMenu();
		this.bindMobilePanels();
		this.search.init();
		this.tableOfContents.init();
		this.openFirstDocument();
	}

	bindMenu() {
		document.addEventListener('click', (event) => {
			const link = event.target.closest(this.config.menuLinkSelector);

			if (!link) {
				return;
			}

			event.preventDefault();

			const path = link.dataset.path;
			if (!path) {
				return;
			}

			this.docLoader.load(path);
			this.closeMobilePanels();
		});
	}

	bindMobilePanels() {
		this.mobilePanelButtons.forEach(button => {
			button.addEventListener('click', () => {
				this.toggleMobilePanel(button.dataset.panelTarget);
			});
		});

		if (this.mobilePanelBackdrop) {
			this.mobilePanelBackdrop.addEventListener('click', () => this.closeMobilePanels());
		}

		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				this.closeMobilePanels();
			}
		});

		document.addEventListener('click', (event) => {
			if (event.target.closest('.toc__link')) {
				this.closeMobilePanels();
			}
		});
	}

	toggleMobilePanel(name) {
		const isOpen = document.body.dataset.mobilePanel === name;

		if (isOpen) {
			this.closeMobilePanels();
			return;
		}

		document.body.dataset.mobilePanel = name;
		document.body.classList.add('mobile-panel-is-open');
		this.updateMobilePanelButtons(name);
	}

	closeMobilePanels() {
		delete document.body.dataset.mobilePanel;
		document.body.classList.remove('mobile-panel-is-open');
		this.updateMobilePanelButtons('');
	}

	updateMobilePanelButtons(activeName) {
		this.mobilePanelButtons.forEach(button => {
			const isActive = button.dataset.panelTarget === activeName;
			button.classList.toggle('active', isActive);
			button.setAttribute('aria-expanded', isActive ? 'true' : 'false');
		});
	}

	openFirstDocument() {
		const firstLink = document.querySelector(this.config.menuLinkSelector);

		if (firstLink?.dataset.path) {
			this.docLoader.load(firstLink.dataset.path);
		}
	}
}
