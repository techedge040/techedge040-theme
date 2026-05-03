# AI Agent Instructions for TechEdge040-Shopify

## Workspace overview

This workspace is centered on Shopify theme development.

- The workspace root now contains a local fork of Shopify Horizon.
- There is no root application package or monorepo; the root holds the theme repository, supporting docs, and VS Code settings.

## How to be productive here

- Focus code changes in the workspace root.
- Preserve the cloned Horizon theme structure and existing Liquid/CSS/JS patterns.
- Use `README-setup.md` and `README.md` as the primary documentation sources.

## Important commands

- `shopify theme serve --path .`
- `shopify theme push --path .`
- `shopify theme pull --path .`
- `shopify login --store <your-store>.myshopify.com`

## What not to do

- Do not assume this is a single Node.js app or package-based repo.
- Do not suggest installing `@shopify/shopify-ai-toolkit` from npm.
- Do not treat Horizon as a Theme Store starter theme; keep changes aligned with Horizon conventions.
- Do not move or refactor the theme into a different repository layout without explicit user direction.

## Key files

- `README-setup.md` — workspace setup and task guidance.
- `README.md` — Horizon documentation and theme best practices.
- `.vscode/tasks.json` — local task commands for theme serve/push/pull.

## Recommended agent behavior

- When modifying theme code, keep work inside `shopify-theme/` and follow existing asset, section, snippet, and template patterns.
- When updating workspace docs or editor configuration, change root files only.
- If the user request is unclear about scope, ask whether they want `shopify-theme/` theme work or a workspace/tooling update.
