import { App } from './core/App.js';

document.addEventListener('DOMContentLoaded', () => {
	const app = new App({
		contentSelector: '#doc-content',
		searchInputSelector: '#search',
		searchResultsSelector: '#search-results',
		menuLinkSelector: '.js-doc-link',
		docsIndex: window.docsIndex || [],
	});

	app.init();
});