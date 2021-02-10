document.addEventListener('click', async (event) => {
	const button = event.target.closest('.js-copy-hidden');
	if (!button) return;

	const value = button.dataset.copy || '';
	if (!value) return;

	await navigator.clipboard.writeText(value);

	const oldText = button.textContent;
	button.textContent = 'Copied';
	setTimeout(() => {
		button.textContent = oldText;
	}, 1000);
});
