# Local Dev Docs
**English** | [Русский](README_ru.md)

[How It Works](#how-it-works) ·
[Project Structure](#project-structure) ·
[How to Run](#how-to-run) ·
[Basic Auth](#basic-auth) ·
[Docker](#docker) ·
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
- `src/Auth.php` — HTTP Basic authentication helper
- `public/assets/js/app.js` — start init point app
- `public/assets/js/core/App.js` — Core App script
- `public/assets/js/modules` — modules for document loading, search, and the current document table of contents
- `public/assets/css/app.css` — styles
- `storage/blocks/` — the actual documentation files stored as separate `.html` files

The table of contents is synchronized with the current document: scrolling the page moves the table of contents, and scrolling the table of contents moves the page by the same scroll progress.

## Project Structure

```text
docs/
  Dockerfile
  src/
    Auth.php
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

## Basic Auth

HTTP Basic authentication is disabled by default for local development.

Enable it on a server with environment variables:

```bash
DOCS_AUTH_ENABLED=1
DOCS_AUTH_USER=admin
DOCS_AUTH_PASSWORD=change-me
```

Both `public/index.php` and `public/block.php` require the same credentials, so direct block requests are protected too.

If `DOCS_AUTH_ENABLED=1` is set without `DOCS_AUTH_USER` or `DOCS_AUTH_PASSWORD`, the app returns `500` and does not open publicly. Do not commit real passwords. Set them in your server, Docker, or cloud environment.

## Docker

Build the image from the project root:

```bash
docker build -t local-dev-docs .
```

Run it on a selected host port with Basic Auth enabled:

```bash
docker run -d \
  --name local-dev-docs \
  -p 9999:8080 \
  -e DOCS_AUTH_ENABLED=1 \
  -e DOCS_AUTH_USER=admin \
  -e DOCS_AUTH_PASSWORD=change-me \
  local-dev-docs
```

Or create a `.env` file on the server:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
DOCS_AUTH_ENABLED=1
DOCS_AUTH_USER=admin
DOCS_AUTH_PASSWORD=your-real-password
```

Run Docker with that file:

```bash
docker run -d \
  --name local-dev-docs \
  -p 9999:8080 \
  --env-file .env \
  local-dev-docs
```

Then open:

```text
http://SERVER_IP:9999
```

Change the left side of `-p 9999:8080` to expose another server port.

The `.env` file is ignored by Git. Commit only `.env.example`, never the real `.env`.

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
- Docker build or run commands
- JavaScript module names or responsibilities
- PHP page loading or block delivery logic
- authentication behavior or required environment variables
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
