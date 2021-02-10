import { DocLoader } from '../modules/DocLoader.js';
import { Search } from '../modules/Search.js';

export class App {
	constructor(config) {
		this.config = config;
		this.contentElement = document.querySelector(config.contentSelector);
		this.searchInput = document.querySelector(config.searchInputSelector);
		this.searchResults = document.querySelector(config.searchResultsSelector);

		this.docLoader = new DocLoader({
			contentElement: this.contentElement,
			menuLinkSelector: config.menuLinkSelector,
		});

		this.search = new Search({
			inputElement: this.searchInput,
			resultsElement: this.searchResults,
			docsIndex: config.docsIndex,
			onOpen: (path) => this.docLoader.load(path),
		});
	}

	init() {
		this.bindMenu();
		this.search.init();
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
		});
	}

	openFirstDocument() {
		const firstLink = document.querySelector(this.config.menuLinkSelector);

		if (firstLink?.dataset.path) {
			this.docLoader.load(firstLink.dataset.path);
		}
	}
}
