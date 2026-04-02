---
name: add-prototype
description: Add a new prototype to the site. Use when the user wants to add a prototype from an existing file or from an idea/description.
---

# Add Prototype

You are adding a new prototype to a GitHub Pages site. The input (`$ARGUMENTS`) is either:

1. **A file path** to an existing HTML file to import
2. **An idea or description** to build a new prototype from

## Steps

### 1. Determine input type

- If the argument is a path to an existing file, read it and use its contents.
- If the argument is a description/idea, build the prototype HTML from scratch based on what the user describes.

### 2. Determine the route

Ask the user (if not obvious from context):
- **Feature name**: e.g., "More Menu Updates" — this becomes the folder name.
- **Version number**: e.g., "v7"
- **Prototype name** (optional): e.g., "Search" — if provided, the file is named `<name>-<version>.html` (e.g., `search-v1.html`). If omitted, just `<version>.html`.

Check `prototypes/` for existing folders. If the feature already has a folder, use it. If not, create one.

### 3. Apply route conventions

All paths must be **lowercase with hyphens** replacing spaces:
- `More Menu Updates` → `more-menu-updates`
- Final path: `prototypes/<feature-name>/<name>-<version>.html` or `prototypes/<feature-name>/<version>.html`

**CRITICAL — macOS case-insensitive filesystem**: Never rename a directory by only changing case (e.g., `mv Foo foo`). macOS treats these as the same path. Always rename through a temporary intermediate:
```sh
mv Original _tmp && mv _tmp target
```
Failure to do this can permanently delete untracked files.

### 4. Place the file

- If importing an existing file, **copy** it (do not move) to the target path, then confirm with the user before deleting the original.
- If creating from an idea, write the new HTML file directly to the target path.
- File name format: `<name>-<version>.html` (e.g., `search-v1.html`) or just `<version>.html` (e.g., `v3.html`) if no name is provided.

### 5. Update index.html

Read `index.html` and add a new card inside the `.cards` div, before the closing `</div>`:

```html
<a class="card" href="/prototypes/<feature-name>/<version>.html">
  <h2>Feature Display Name</h2>
  <p><version></p>
</a>
```

- The `<h2>` uses the human-readable feature name (title case with spaces).
- The `<p>` uses the version identifier (e.g., `v7`).
- Keep cards grouped by feature name for readability.

### 6. Confirm

Show the user:
- The file path created
- The route it will be accessible at
- The card added to `index.html`
