# whats-that-command — project context

Persistent context for Claude Code. Read this at the start of every session. Keep it updated when status or conventions change.

## What this is

A website that solves one specific pain: *"I know there's a shell command that does X, but I can't remember it."*

A fast, searchable, browsable reference for shell/terminal commands, focused on **git, docker, and bash**. The differentiator is **intent-based search**: users type plain English ("undo last commit", "kill process on a port") and get the right command — even when none of their words appear in the command itself.

Not a generic cheatsheet dump. Curation quality matters more than coverage.

## Tech stack

- **Next.js 16 (App Router)**, JavaScript, no `src/` dir — React 19
- **Static export** (`output: 'export'`) — no backend, no runtime, ships as HTML/JS/CSS
- **Tailwind CSS** for UI
- **Fuse.js** for client-side fuzzy search
- Deployed as a static site (Vercel-friendly)

Why static: no server means no server-side attack surface and trivially cheap hosting. The whole point is that everything fits in a JSON file shipped to the browser.

### Security posture

- No middleware, no auth, no API routes, no user input persisted anywhere
- Search input filters an in-memory JSON dataset; never rendered as HTML, never sent anywhere
- `next` on `^16.2.6` — clears all currently disclosed Next.js CVEs (the older 14.2.x chain was flagged for server-side issues that don't apply to static export, but we upgraded to keep `npm audit` clean)
- `overrides.postcss: ^8.5.10` forces the patched postcss across all transitive deps (Next 16 nested an older one)
- `npm audit` must be clean before merging any dependency bump. Currently: `0 vulnerabilities`.

## Data model

All commands live in `commands.json` at the repo root. One entry per command:

```json
{
  "id": "git-undo-last-commit",
  "command": "git reset --soft HEAD~1",
  "description": "Undo the last commit but keep the changes staged",
  "tool": "git",
  "category": "history",
  "tags": ["undo", "revert", "mistake", "uncommit", "rollback"],
  "example": "git reset --soft HEAD~1",
  "danger": false,
  "related": ["git-amend-commit", "git-hard-reset"]
}
```

The `tags` field is the most important field. It encodes how a **human** describes the need, using words that do **not** appear in the command. Curate carefully — this is what makes intent-based search work.

`id` convention: `<tool>-<kebab-case-action>`.

## Fuse.js config (use exactly this)

```js
const fuse = new Fuse(commands, {
  keys: [
    { name: 'tags', weight: 0.4 },
    { name: 'description', weight: 0.3 },
    { name: 'command', weight: 0.2 },
    { name: 'tool', weight: 0.1 }
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true
});
```

## Conventions

- **Client-side only.** No backend, no database, no API routes.
- **One JSON file** for the dataset. Don't shard until it actually causes problems.
- **Tags are for human intent**, not man-page jargon. If a tag word appears in the command itself, it's the wrong tag.
- **Mark dangerous commands.** Anything that destroys data, rewrites history irrecoverably, or affects shared state (`rm -rf`, `git push --force`, `git reset --hard`, `docker system prune`, etc.) gets `"danger": true`.
- **`commands.json` is validated** by `scripts/validate-commands.js`, run automatically on `prebuild`. Every entry must have the required string fields (`id`, `command`, `description`, `tool`, `category`), a non-empty `tags` array, a globally unique `id`, valid `related` ids that resolve to other entries, and a boolean `danger` when the field is present. A failing dataset blocks the build — fix the entry rather than skipping the check.
- **Keep the site runnable after every step.** No half-finished features merged to main.

## Build order / status

1. Scaffold Next.js + Tailwind + Fuse.js — **done**
2. Create CLAUDE.md — **done**
3. Seed `commands.json` with ~30 git commands — **done** (30 entries)
4. Build home page: search box + Fuse + results with copy + danger flag — **done**
5. Data validation script for `commands.json` wired to `prebuild` — **done**
6. Keyboard UX on home page (auto-focus, `/` to focus, Escape to clear, accessible label) — **done**
7. URL-driven search state (`?q=` is shareable; back/forward works) — **done**
8. Browse-by-tool view (`/[tool]`), grouped by category — **pending**
9. Expand dataset across git, docker, bash (hundreds of entries) — **pending**
10. Per-command static pages (`/c/[id]`) — **pending**
11. (Later) Semantic search layer behind Fuse — **pending**

## Run locally

```
npm install
npm run dev
```

Static build:

```
npm run build   # outputs to ./out
```
