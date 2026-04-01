# CLAUDE.md

## Project Overview

This is a GitHub Pages site that hosts UI prototypes. The `index.html` at the root provides card-based navigation to prototypes organized under `prototypes/`.

## Route Conventions

- All directory and file names must be **lowercase** with **hyphens** replacing spaces (e.g., `More Menu Updates` → `more-menu-updates`)
- Prototype HTML files are named by version number only (e.g., `v6.html`, not `v6-prototype.html`)
- Structure: `prototypes/<feature-name>/<version>.html`

## Critical: macOS Case-Insensitive Filesystem

**Do NOT rename a directory by only changing its case** (e.g., `mv Prototypes prototypes`). macOS treats these as the same path, and the operation will silently fail or collide.

Instead, rename through a temporary intermediate:

```sh
mv Prototypes _tmp && mv _tmp prototypes
```

This applies to any case-only rename on macOS (files or directories). Failing to do this can result in **permanent data loss** for untracked files.

## Working with Untracked Files

Before performing any destructive filesystem operations (`rm -rf`, `mv` that overwrites), verify whether the files are tracked by git. Untracked files cannot be recovered from git history. When in doubt, commit or back up files first.

## Updating index.html

When adding new prototypes, add a corresponding card link to `index.html`. Each card should display the human-readable folder name and the version number, linking to the prototype's route-compliant path.
