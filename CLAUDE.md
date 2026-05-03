# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a local fork of **Shopify Horizon v3.4.0** — a first-party Shopify theme. There is no root-level Node.js app or monorepo. The workspace root IS the theme repository.

- Do not assume this is a Node.js app or suggest installing npm packages.
- Do not treat this as a Theme Store starter; keep changes aligned with Horizon conventions.
- Do not refactor the theme into a different repository layout without explicit user direction.

## Development Commands

```sh
# Start local development server
shopify theme serve --path .

# Push theme to store
shopify theme push --path .

# Pull from store
shopify theme pull --path .

# Authenticate
shopify login --store <your-store>.myshopify.com
```

There is no build pipeline. No `npm run` commands. Use the VS Code tasks in [.vscode/tasks.json](.vscode/tasks.json) or run CLI commands directly.

Linting: Install the [Shopify Theme Check VS Code extension](https://marketplace.visualstudio.com/items?itemName=Shopify.theme-check) (`Shopify.theme-check`) for inline validation.

## Architecture

**Server-rendered Liquid** — no client-side framework. Pages are composed of JSON templates that reference sections, which contain blocks.

```
templates/   → JSON files defining page structure (which sections appear)
sections/    → Section definitions (.liquid) — major page regions
blocks/      → Reusable block components referenced from templates/sections
snippets/    → Utility Liquid partials (no schema, no merchant config)
assets/      → Flat directory: CSS, JS, SVG icons (no subdirectories)
config/      → settings_schema.json (global theme settings), settings_data.json
locales/     → i18n JSON files (30+ languages)
layout/      → theme.liquid, password.liquid
```

**Template → Section → Block hierarchy:**
- `templates/*.json` declare which sections a page uses
- Sections use `{% content_for 'blocks' %}` for merchant-configurable block areas
- Blocks are the leaf components (product-card, heading, image, etc.)

## Key Conventions

### Schemas — CRITICAL
Schemas are defined in `schemas/` as JavaScript source files and generated into `.liquid` files via `npm run build:schemas`. **Never edit `{% schema %}` blocks directly in `.liquid` files** — changes will be overwritten. Edit the JS source in `schemas/` and rebuild.

### Liquid
- Use `{% liquid %}` tags for multiline Liquid logic (not multiple `{% %}` blocks).
- Use `{% doc %}` / `{% enddoc %}` for snippet documentation with `@param` and `@example` tags.
- Prefer inline variable approach over extra `assign` declarations for simple props.
- Blocks require exactly ONE `{% content_for 'blocks' %}` per file; capture the output if you need it in multiple places.

### JavaScript
- **Zero external dependencies** — native browser APIs only.
- Extend the `Component` base class from `assets/component.js` for all web components.
- Use `const` over `let`, `for...of` over `.forEach()`, always `async/await` over `.then()`.
- Register custom elements with `customElements.define('tag-name', ClassName)`.

### CSS
- BEM naming convention for classes.
- Single class selectors preferred (max specificity 0 4 0); never use IDs as selectors or `!important`.
- Avoid `:has()` — performance impact on dynamic DOM updates.
- CSS variables scoped to components; global variables live in `snippets/theme-styles-variables.liquid` on `:root`.
- Never hardcode colors; use semantic variable names (`--color-primary`, `--color-text-disabled`).

### Accessibility
- WCAG 2.1 AA compliance throughout.
- Use native interactive elements: `<details>`/`<summary>`, `<dialog>`, `popover` attribute — no custom JS toggles.
- No zoom-preventing viewport meta attributes (`user-scalable=no`, `maximum-scale=1`).
- All features must be "Baseline widely available" (last two major browser versions).

### Localization
- All user-facing strings must use translation keys (`t:names.keyname` format).
- New keys must be added to `locales/en.default.schema.json` AND all other language files.
- Schema setting labels use `'t:settings.property'` patterns; content uses `'t:content.description'`.

## Cursor Rules

Detailed standards for every component type are in [.cursor/rules/](.cursor/rules/) (45+ `.mdc` files). These cover blocks, sections, snippets, templates, schemas, HTML, CSS, JavaScript, accessibility patterns, and localization. Consult these files when working on specific component types. The `.cursor/prompts/` and `.cursor/references/` directories contain living documents — update them proactively when discovering new patterns or edge cases.
