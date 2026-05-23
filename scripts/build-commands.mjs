#!/usr/bin/env node
// Reads every .json file under content/commands/, validates each entry,
// validates cross-references, and writes the concatenated commands.json
// that the app and embedding pipeline both consume.
//
// commands.json is a build artifact — see .gitignore. Run this before
// `next dev` and `next build` (wired via the predev / prebuild scripts).

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(REPO_ROOT, 'content', 'commands');
const OUTPUT_FILE = path.join(REPO_ROOT, 'commands.json');

const REQUIRED_STRING_FIELDS = ['id', 'command', 'description', 'tool', 'category'];

async function walkJson(dir) {
  const out = [];
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await walkJson(full)));
    } else if (ent.isFile() && ent.name.endsWith('.json')) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.error(`Source directory missing: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const fullPaths = (await walkJson(SOURCE_DIR)).sort();

  if (fullPaths.length === 0) {
    console.error(`No command files found under ${SOURCE_DIR}`);
    process.exit(1);
  }

  const errors = [];
  const entries = [];
  const seenIds = new Map();

  for (const full of fullPaths) {
    const relPath = path.relative(SOURCE_DIR, full).split(path.sep).join('/');
    const basename = path.basename(full);
    const relSegments = relPath.split('/');
    // Files live under <tool>/[<category>/]<file>.json — the top-level segment
    // is the tool. Anything deeper (a category subfolder) is organizational
    // and not enforced by the build, so the layout can evolve without code
    // changes here.
    const toolSegment = relSegments.length >= 2 ? relSegments[0] : null;
    const inToolFolder = toolSegment !== null;

    let raw;
    try {
      raw = await readFile(full, 'utf8');
    } catch (err) {
      errors.push(`${relPath}: cannot read (${err.message})`);
      continue;
    }

    let entry;
    try {
      entry = JSON.parse(raw);
    } catch (err) {
      errors.push(`${relPath}: invalid JSON (${err.message})`);
      continue;
    }

    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`${relPath}: must be a single JSON object`);
      continue;
    }

    const label = typeof entry.id === 'string' && entry.id.trim() !== '' ? entry.id : relPath;

    for (const field of REQUIRED_STRING_FIELDS) {
      const v = entry[field];
      if (typeof v !== 'string' || v.trim() === '') {
        errors.push(`${label}: missing or empty "${field}"`);
      }
    }

    if (!Array.isArray(entry.tags) || entry.tags.length === 0) {
      errors.push(`${label}: "tags" must be a non-empty array`);
    } else if (entry.tags.some((t) => typeof t !== 'string' || t.trim() === '')) {
      errors.push(`${label}: every tag in "tags" must be a non-empty string`);
    }

    if ('danger' in entry && typeof entry.danger !== 'boolean') {
      errors.push(`${label}: "danger" must be a boolean when present (got ${typeof entry.danger})`);
    }

    // Optional: extra natural-language phrasings folded into search. Boosts
    // both lexical (Fuse) and semantic recall — see build-static-embeddings.mjs.
    if ('intents' in entry) {
      if (!Array.isArray(entry.intents)) {
        errors.push(`${label}: "intents" must be an array when present`);
      } else if (entry.intents.some((t) => typeof t !== 'string' || t.trim() === '')) {
        errors.push(`${label}: every entry in "intents" must be a non-empty string`);
      }
    }

    if (typeof entry.id === 'string' && entry.id.trim() !== '') {
      const expectedFile = `${entry.id}.json`;
      if (basename !== expectedFile) {
        errors.push(`${relPath}: filename should match id (expected ${expectedFile})`);
      }
      if (seenIds.has(entry.id)) {
        errors.push(`${entry.id}: duplicate id (also in ${seenIds.get(entry.id)})`);
      } else {
        seenIds.set(entry.id, relPath);
      }
    }

    if (!inToolFolder) {
      errors.push(`${relPath}: must live under a tool subfolder (content/commands/<tool>/)`);
    } else if (typeof entry.tool === 'string' && entry.tool.trim() !== '' && toolSegment !== entry.tool) {
      errors.push(`${relPath}: top-level folder "${toolSegment}" must match tool "${entry.tool}"`);
    }

    entries.push({ relPath, entry });
  }

  const allIds = new Set(entries.map(({ entry }) => entry.id).filter(Boolean));
  for (const { relPath, entry } of entries) {
    if (entry.related === undefined) continue;
    const label = typeof entry.id === 'string' ? entry.id : relPath;
    if (!Array.isArray(entry.related)) {
      errors.push(`${label}: "related" must be an array when present`);
      continue;
    }
    for (const ref of entry.related) {
      if (typeof ref !== 'string') {
        errors.push(`${label}: "related" contains a non-string value`);
        continue;
      }
      if (!allIds.has(ref)) {
        errors.push(`${label}: related id "${ref}" does not exist in the dataset`);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`commands failed validation (${errors.length} problem${errors.length === 1 ? '' : 's'}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  const commands = entries
    .map(({ entry }) => entry)
    .sort((a, b) => a.id.localeCompare(b.id));

  mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify(commands, null, 2) + '\n', 'utf8');

  console.log(`commands.json built — ${commands.length} entries from ${fullPaths.length} files.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
