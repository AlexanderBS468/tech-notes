# Local Dev Docs
**English** | [Русский](README_ru.md)

[How It Works](#how-it-works) ·
[Project Structure](#project-structure) ·
[How to Run](#how-to-run) ·
[How to Add New Articles](#how-to-add-new-articles) ·
[Important Rules](#important-rules) ·
[Code and Documentation](#code-and-documentation) ·
[Why `block.php` Exists](#why-blockphp-exists) ·
[Troubleshooting](#troubleshooting) ·
[Project Idea](#project-idea) ·
[Possible Improvements](#possible-improvements)

Local documentation for notes about Laravel, PHP, Git, interview preparation, and practical developer cheat sheets.

## How It Works

The project consists of:

- `public/index.php` — the main page and automatic menu generation from folders
- `public/block.php` — secure delivery of HTML blocks
- `public/assets/js/app.js` — start init point app
- `public/assets/js/core/App.js` — Core App script
- `public/assets/js/modules` — modules for document loading, search, and the current document table of contents
- `public/assets/css/app.css` — styles
- `storage/blocks/` — the actual documentation files stored as separate `.html` files

## Project Structure

```text
docs/
  public/
    index.php
    block.php
    assets/
      js/
        app.js
        core/
          App.js
        modules/
          DocLoader.js
          Search.js
          TableOfContents.js
      css/
        app.css
  storage/
    blocks/
      laravel/
        middleware.html
        service-provider.html
      git/
        templates-commands.html
```

## How to Run

From the `public` folder:

```bash
php -S localhost:9999
```

Then open in your browser:

[http://localhost:9999](http://localhost:9999)

## How to Add New Articles

Just create a new `.html` file inside `storage/blocks`.

Examples:

```text
storage/blocks/laravel/queues.html
storage/blocks/php/interfaces.html
storage/blocks/interviews/laravel/middleware-short.html
```

After refreshing the page, the new file will automatically appear in the menu.

## Important Rules

- Documentation blocks must be stored only inside `storage/blocks`
- Only `.html` files are allowed
- The menu structure is generated automatically from folders
- If a file does not appear, check its extension and path
- If project code changes, update this README and `README_ru.md` when the behavior, structure, or run instructions change

## Code and Documentation

When changing the project code, keep the documentation in sync.

Update the README files if you change:

- project structure
- run commands
- JavaScript module names or responsibilities
- PHP page loading or block delivery logic
- rules for adding documentation blocks
- search behavior
- table of contents behavior

This keeps the project understandable after future refactoring.

## Why `block.php` Exists

`block.php` is used for secure block loading.

It:

- accepts a file path
- checks that the file is actually located inside `storage/blocks`
- prevents access outside that directory
- serves only `.html` files

This is needed to avoid accidentally opening `.env`, `.php`, `.json`, or other unwanted files.

## Troubleshooting

### A block does not load
Check the following:

- whether the local PHP server is running
- whether the file actually exists
- whether the path is correct
- whether the file has the `.html` extension

### A new file does not appear in the menu
Check the following:

- whether it is located inside `storage/blocks`
- whether the file extension is exactly `.html`
- whether there is a typo in the folder name

## Project Idea

This is not a full website, but a local knowledge base for:

- storing short cheat sheets
- quickly reviewing topics
- collecting code examples

## Possible Improvements

- collapsible menu groups
- search not only by menu items, but also by content
- sticky table of contents for the current document
- tags
- favorites
- markdown instead of html
- file sorting
- `_meta.json` for selected folders
- light/dark theme
- PDF export
