# Local Dev Docs
**English** | [Русский](README_ru.md)

[How It Works](#how-it-works) ·
[Project Structure](#project-structure) ·
[How to Run](#how-to-run) ·
[Authentication](#authentication) ·
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
- `src/Auth.php` — authentication helper for Basic Auth and session login
- `public/assets/js/app.js` — start init point app
- `public/assets/js/core/App.js` — Core App script
- `public/assets/js/modules` — modules for document loading, search, and the current document table of contents
- `public/assets/css/app.css` — styles
- `storage/blocks/` — the actual documentation files stored as separate `.html` files

The menu uses natural sorting: `Unit 2` appears before `Unit 10`, not the other way around.

The table of contents is synchronized with the current document: scrolling the page moves the table of contents, and scrolling the table of contents moves the page by the same scroll progress.

On small screens, the left menu and the right table of contents are hidden in separate panels. The mobile top bar opens the document menu or the current article table of contents, and the panel closes after selecting an item.

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

## Authentication

Authentication is disabled by default for local development.

Enable HTTP Basic authentication on a server. The password is stored in `.env` as a bcrypt hash, not as plain text.

First generate the hash:

```bash
php tools/hash-password.php
```

The script asks for the password twice and prints a hash. Put that hash into `.env`:

You can also read the password from standard input:

```bash
php tools/hash-password.php --stdin < password.txt
```

Do not commit the password file. For manual use, the interactive command without arguments is safer because the password does not end up in shell history.

Verify a password/hash pair with:

```bash
php tools/verify-password.php
```

The script asks for the password and hash, then prints `MATCH` or `NO MATCH`.

```bash
DOCS_AUTH_ENABLED=1
DOCS_AUTH_USER=admin
DOCS_AUTH_PASSWORD_HASH='$2y$10$...'
```

Both `public/index.php` and `public/block.php` require authentication, so direct block requests are protected too.

If `DOCS_AUTH_ENABLED=1` is set without `DOCS_AUTH_USER` and a password via `DOCS_AUTH_PASSWORD_HASH`, the app returns `500` and does not open publicly.

Basic Auth sends the password in the request header, so a public server should use HTTPS. The hash in `.env` avoids storing the plain password on the server, but it does not replace HTTPS.

Important notes:

- bcrypt hashes contain `$`, so wrap the hash in single quotes in `.env`
- if the hash reaches the container without proper quoting, part of it may be lost and `password_get_info()` will show `unknown`
- after changing `.env`, recreate the container; a simple restart may not reload environment variables
- browsers cache Basic Auth for the current address; use an incognito window, another port, or `curl -u user:password` for a clean test
- `password_hash()` creates a different hash every time for the same password; this is expected
- generate hashes with `PASSWORD_BCRYPT` directly, without a custom redefined constant

## Docker

Create a `.env` file on the server:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
DOCS_HOST_PORT=9999
DOCS_AUTH_ENABLED=1
DOCS_AUTH_USER=admin
DOCS_AUTH_PASSWORD_HASH='$2y$10$your-generated-password-hash'
```

Start the container with editable project files mounted into it:

```bash
docker-compose up -d --build
```

Then open:

```text
http://SERVER_IP:9999
```

`DOCS_HOST_PORT` controls the server port. For example, `DOCS_HOST_PORT=18080` opens `http://SERVER_IP:18080`.

The container listens on port `9999` inside Docker. Only the host port from `DOCS_HOST_PORT` is exposed on the server.

The compose file does not set a fixed `container_name`, so Docker Compose creates a project-scoped container name and avoids name conflicts with other containers. The common conflict is the host port; change `DOCS_HOST_PORT` if port `9999` is already used.

The compose file mounts these folders into the container:

```text
./public  -> /app/public
./src     -> /app/src
./storage -> /app/storage
```

That means you can edit docs in `storage/blocks`, PHP code, CSS, and JavaScript on the server without rebuilding the image. If you change `.env`, recreate the container:

```bash
docker-compose up -d
```

Stop the container:

```bash
docker-compose down
```

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
