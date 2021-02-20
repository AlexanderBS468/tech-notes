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
		this.menuStorageKey = 'docsCollapsedMenuGroups';
		this.collapsedMenuGroups = this.readCollapsedMenuGroups();

		this.tableOfContents = new TableOfContents({
			contentElement: this.contentElement,
			tocElement: this.tableOfContentsElement,
		});

		this.docLoader = new DocLoader({
			contentElement: this.contentElement,
			menuLinkSelector: config.menuLinkSelector,
			onLoad: (path) => {
				this.tableOfContents.build();
				this.expandMenuPath(path);
			},
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
		this.applyMenuGroupState();
		this.search.init();
		this.tableOfContents.init();
		this.openFirstDocument();
	}

	bindMenu() {
		document.addEventListener('click', (event) => {
			const groupToggle = event.target.closest('.js-menu-group-toggle');

			if (groupToggle) {
				event.preventDefault();
				this.toggleMenuGroup(groupToggle);
				return;
			}

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

	applyMenuGroupState() {
		document.querySelectorAll('.js-menu-group-toggle').forEach(toggle => {
			this.setMenuGroupCollapsed(toggle, this.collapsedMenuGroups.has(toggle.dataset.groupPath));
		});
	}

	toggleMenuGroup(toggle) {
		const groupPath = toggle.dataset.groupPath;

		if (!groupPath) {
			return;
		}

		const isCollapsed = !this.collapsedMenuGroups.has(groupPath);

		if (isCollapsed) {
			this.collapsedMenuGroups.add(groupPath);
		} else {
			this.collapsedMenuGroups.delete(groupPath);
		}

		this.setMenuGroupCollapsed(toggle, isCollapsed);
		this.saveCollapsedMenuGroups();
	}

	setMenuGroupCollapsed(toggle, isCollapsed) {
		const group = toggle.closest('.doc-menu-group');

		if (!group) {
			return;
		}

		group.classList.toggle('is-collapsed', isCollapsed);
		toggle.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
	}

	expandMenuPath(path) {
		if (!path) {
			return;
		}

		const parts = path.split('/');
		parts.pop();

		let changed = false;

		parts.reduce((currentPath, part) => {
			const groupPath = currentPath ? `${currentPath}/${part}` : part;
			const toggle = document.querySelector(`.js-menu-group-toggle[data-group-path="${CSS.escape(groupPath)}"]`);

			if (toggle) {
				this.collapsedMenuGroups.delete(groupPath);
				this.setMenuGroupCollapsed(toggle, false);
				changed = true;
			}

			return groupPath;
		}, '');

		if (changed) {
			this.saveCollapsedMenuGroups();
		}
	}

	readCollapsedMenuGroups() {
		try {
			const storedValue = window.localStorage.getItem(this.menuStorageKey);
			const groups = JSON.parse(storedValue || '[]');

			return new Set(Array.isArray(groups) ? groups : []);
		} catch (error) {
			return new Set();
		}
	}

	saveCollapsedMenuGroups() {
		try {
			window.localStorage.setItem(this.menuStorageKey, JSON.stringify(Array.from(this.collapsedMenuGroups)));
		} catch (error) {
			// Menu state persistence is optional; the accordion still works without it.
		}
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
