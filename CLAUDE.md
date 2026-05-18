# whats-that-command — project context

Persistent context for Claude Code. Read this at the start of every session. Keep it updated when status or conventions change.

## What this is

A website that solves one specific pain: *"I know there's a shell command that does X, but I can't remember it."*

A fast, searchable, browsable reference for shell/terminal commands, focused on **git, docker, and bash**. The differentiator is **intent-based search**: users type plain English ("undo last commit", "kill process on a port") and get the right command — even when none of their words appear in the command itself.

Not a generic cheatsheet dump. Curation quality matters more than coverage.

## Tech stack

- **Next.js 16 (App Router)**, JavaScript, no `src/` dir — React 19
- **Static export** (`output: 'export'`) — no backend, no runtime, ships as HTML/JS/CSS
- **Tailwind CSS** for UI, theme extended with the design-system palette (`paper`, `paper-2`, `hairline`, `ink`, `accent`, `accent-deep`, `moss`, `muted`) and shadow utilities (`shadow-block`, `shadow-block-sm`, `shadow-card`). Prefer these tokens over hex literals.
- **next/font/google** for self-hosted Fraunces (display), Spline Sans (body), and Spline Sans Mono (mono/labels). No runtime font requests.
- **Hybrid search** — Fuse.js for instant fuzzy/typo-tolerant lexical matching, plus a semantic layer using **@huggingface/transformers** (`all-MiniLM-L6-v2`, int8-quantized) running entirely in the browser. Both are loaded lazily and combined per query — see "Search architecture" below.
- **Framer Motion** for the scroll-driven landing demo and scroll-in fade-ups. Wrap the page in `<MotionConfig reducedMotion="user">` so all motion components respect the OS preference automatically; use `useReducedMotion()` for explicit branching when needed (the terminal demo swaps to a static variant).
- Deployed as a static site (Vercel-friendly)

Why static: no server means no server-side attack surface and trivially cheap hosting. Embeddings, model weights, and dataset all ship as static assets to the browser.

### Security posture

- No middleware, no auth, no API routes, no user input persisted anywhere
- Search input filters an in-memory JSON dataset; never rendered as HTML, never sent anywhere
- `next` on `^16.2.6` — clears all currently disclosed Next.js CVEs (the older 14.2.x chain was flagged for server-side issues that don't apply to static export, but we upgraded to keep `npm audit` clean)
- `overrides.postcss: ^8.5.10` forces the patched postcss across all transitive deps (Next 16 nested an older one)
- `npm audit` must be clean before merging any dependency bump. Currently: `0 vulnerabilities`.

## Data model

Each command lives in its own file under `content/commands/<id>.json`. One entry per file. The filename must match the `id`. Example `content/commands/git-undo-last-commit.json`:

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

The `tags` field is the most important field. It encodes how a **human** describes the need, using words that do **not** appear in the command. Curate carefully — this is what makes intent-based search work, both for Fuse (which weights tags 0.4) and for semantic embeddings (which include tags in the text fed to the model).

`id` convention: `<tool>-<kebab-case-action>`.

The runtime `commands.json` at the repo root is a **generated build artifact** — concatenated from `content/commands/*.json` by `scripts/build-commands.mjs`. It is gitignored. Do not edit it directly; edit the per-command files and re-run `npm run validate`.

## Build pipeline

Two scripts run on `predev` and `prebuild`:

- `scripts/build-commands.mjs` — reads `content/commands/*.json`, validates each entry (required string fields, non-empty `tags`, boolean `danger`, unique `id`, resolvable `related` refs, filename-matches-id), and writes the concatenated `commands.json`. A failing entry blocks the build — fix the entry rather than skipping the check.
- `scripts/generate-embeddings.mjs` — reads `commands.json`, embeds `description + tags + command` for each entry with the int8-quantized `all-MiniLM-L6-v2`, writes `public/embeddings.json`. Uses a content hash per entry to skip re-embedding unchanged commands (first cold run ~30s; subsequent runs ~1s).

`npm run validate` runs just the dataset build. `npm run embed` runs just the embedder. `prebuild` runs both.

## Search architecture

Hybrid: lexical (Fuse) + semantic (embeddings). Both run client-side in the browser. Results are merged in `lib/mergeSearch.js`.

### Fuse.js config (use exactly this)

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

### Semantic layer

- **Model.** `Xenova/all-MiniLM-L6-v2`, 384-dim, int8-quantized (`dtype: 'q8'`). The **same** model is used at build time (Node) and runtime (browser) so vectors stay aligned. Don't change the model in one place without changing the other and regenerating embeddings — vectors from different models are not comparable.
- **Storage.** `public/embeddings.json` ships with the site (~8KB per command — 82 commands ≈ 650KB). Loaded once per session and converted to `Float32Array` for fast cosine.
- **Loading.** `hooks/useSemanticSearch.js` triggers `initSemantic()` on `requestIdleCallback` after the page mounts. The transformers package is dynamically imported so it lands in a separate ~512KB chunk, not the home page initial bundle. ONNX Runtime Web also lazy-fetches a ~23MB WASM binary on first activation — heavy on first ever visit, cached forever after.
- **Hybrid scoring.** Fuse score is flipped to `1 - score` so higher is better. Combined score is `0.35 * fuseScore + 0.65 * semanticScore`. Semantic-only matches (Fuse missed them entirely) must clear `SEM_FLOOR = 0.35` cosine similarity to appear. See `lib/mergeSearch.js`.
- **Fallback.** Until semantic is ready, Fuse alone returns results so the user sees something within ms. When semantic becomes ready, results silently upgrade. If the model fails to load, the page stays fully functional as a Fuse-only experience — log a warning, don't surface an error to the user.

## Design system (Editorial Brutalist / Warm Paper)

This is the visual language. Don't substitute your own taste for any specified value.

- **Palette.** Warm light, never inverted to dark. Exact hex (also exposed as CSS vars and Tailwind colors):
  - Background `--paper #f4efe4`, secondary surface `--paper-2 #ece5d4`
  - Hairlines `--hairline #d6cdb5`, ink (text + hard borders) `--ink #16140f`
  - Primary accent `--accent #d8442b` (oxblood), hover/emphasis `--accent-deep #a82e1c`
  - Success / "done" `--accent-2 #3a4a36` (moss), muted text `--muted #6b6452`
- **Typography.** Fraunces (display) 500–600 + italic for emphasis in `--accent-deep`. Spline Sans for body (17px, line-height ~1.5). Spline Sans Mono for kicker/eyebrow labels (11–14px, uppercase, `tracking-kicker` = 0.18em), code, file names, tags. Sentence case in prose; uppercase reserved for mono kickers only.
- **Signature devices** (these make the style recognizable):
  - Hard offset shadow, no blur — `shadow-block` (18px) on marketing/major blocks, `shadow-block-sm` (12px) on cards inside grids, `shadow-card` (4px) on the search input. Never soft/blurred shadows.
  - 2px solid `--ink` border on the same major blocks. Borders are structural, not decorative.
  - Square corners everywhere; the one exception is small mono pill tags (e.g. example queries) which may be fully rounded.
  - Paper-grain noise applied as a CSS `background-image` on `body` (subtle — felt, not seen).
  - Kicker labels via `.kicker` (40px solid accent rule + mono uppercase). `.kicker--invert` swaps text color for inverted blocks.
  - One headline word gets a hand-drawn-looking accent strike-through via `.strike-word` (accent bar, rotated -1.5deg).
  - Section dividers are 2px hairline rules via `.section-rule`.
  - Inverted blocks (ink bg, paper text) are used **sparingly** — reserve for the single strongest moment (currently the final CTA).
- **Utility vs marketing intensity.** The search box and result rows are a utility interface and stay calmer: 1px hairline borders on repeating rows, no shadows on individual results, ink-bordered search field with a 4px ink shadow that becomes a 4px **accent** shadow on focus. Marketing sections (hero copy, terminal demo, value props, CTA) take the full intensity. Same palette and fonts; quieter voice in utility regions.
- **Layout.** Centered column, `max-w-page` (responsive via `--page-max` CSS var: 1080px default, 1200px at ≥1280, 1360px at ≥1536, 1560px at ≥1920, 1760px at ≥2400), 28px side padding (`px-7`). Generous vertical rhythm; let blocks breathe.
- **Tone of any copy.** Direct, slightly blunt, confident. Short declarative sentences. Name the reader's pain in concrete terms. No marketing fluff, no exclamation marks. Confront the obvious objection head-on (e.g. the inverted CTA tells the reader exactly what to do next rather than restating the value prop).
- **Motion.** Fade-ups on scroll use Framer Motion with `whileInView` and `viewport={{ once: true }}`, ~0.7s ease-out. The terminal demo's scale+opacity is scroll-linked via `useScroll`+`useTransform`. Hover transforms are short and use only `translate`. All motion respects the reduced-motion preference (see the `MotionConfig` and global CSS guard).

## Conventions

- **Client-side only.** No backend, no database, no API routes. The semantic search layer is heavy but still 100% static — no server, no API keys, no per-query cost.
- **Edit dataset files individually under `content/commands/`.** Never hand-edit the generated `commands.json` or `public/embeddings.json` — they're build artifacts. Filename must match `id`.
- **Tags are for human intent**, not man-page jargon. If a tag word appears in the command itself, it's the wrong tag. Tags also flow into the embedded text, so they help semantic matches too.
- **Mark dangerous commands.** Anything that destroys data, rewrites history irrecoverably, or affects shared state (`rm -rf`, `git push --force`, `git reset --hard`, `docker system prune`, etc.) gets `"danger": true`.
- **When a command's `description`, `tags`, or `command` change, embeddings need a refresh.** The embedder is content-hashed, so just running `npm run embed` (or any build) regenerates only the changed entries automatically. Commit the updated `public/embeddings.json`? No — it's gitignored and regenerated on every build.
- **Validation blocks the build.** `scripts/build-commands.mjs` runs on `predev` and `prebuild`. Every entry must have the required string fields (`id`, `command`, `description`, `tool`, `category`), a non-empty `tags` array, a globally unique `id`, valid `related` ids, a boolean `danger` when present, and a filename matching its `id`. A failing entry blocks dev and build — fix the entry rather than skipping the check.
- **The search box stays above the fold.** The home page hero is the search input itself — auto-focused, centered, and fully visible without scrolling on a typical laptop AND a typical mobile viewport. Anything that competes with it for the first screen loses. The scroll-driven terminal demo and value section are reward content below the fold; they must never gate access to the search.
- **Respect `prefers-reduced-motion`.** Any new scroll-linked or auto-playing animation must have a static fallback. Use `useReducedMotion()` from framer-motion for React or media-query guards in CSS. The page must remain fully usable and not janky with motion reduced.
- **Animation discipline.** Only animate `transform` and `opacity`. Never animate `width`, `height`, `top`, or other layout-triggering properties — they cause jank and break the above-the-fold guarantee.
- **Keep the site runnable after every step.** No half-finished features merged to main.

## Build order / status

1. Scaffold Next.js + Tailwind + Fuse.js — **done**
2. Create CLAUDE.md — **done**
3. Seed `commands.json` with ~30 git commands — **done**
4. Build home page: search box + Fuse + results with copy + danger flag — **done**
5. Data validation script wired to `prebuild` — **done**
6. Keyboard UX on home page (auto-focus, `/` to focus, Escape to clear, accessible label) — **done**
7. URL-driven search state (`?q=` is shareable; back/forward works) — **done**
8. Landing page: navbar, search-first hero with example pills, scroll-driven terminal demo, value section + CTA — **done**
9. Browse-by-tool view (`/[tool]`), grouped by category — **done**
10. Split dataset into one file per command, build-time concatenated — **done** (`content/commands/*.json` → `commands.json`)
11. Semantic search layer (build-time embeddings + in-browser MiniLM, hybrid with Fuse) — **done** (82 entries, ~650KB embeddings, ~33MB lazy first-load for model+WASM, cached after)
12. Expand dataset across git, docker, bash (hundreds of entries) — **pending**
13. Per-command static pages (`/c/[id]`) — **pending**
14. Tune hybrid scoring weights and `SEM_FLOOR` once dataset is larger — **pending**

## Run locally

```
npm install
npm run dev
```

Static build:

```
npm run build   # outputs to ./out
```
