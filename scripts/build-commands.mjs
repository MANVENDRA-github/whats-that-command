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

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.error(`Source directory missing: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const files = (await readdir(SOURCE_DIR))
    .filter((f) => f.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    console.error(`No command files found in ${SOURCE_DIR}`);
    process.exit(1);
  }

  const errors = [];
  const entries = [];
  const seenIds = new Map();

  for (const file of files) {
    const full = path.join(SOURCE_DIR, file);
    let raw;
    try {
      raw = await readFile(full, 'utf8');
    } catch (err) {
      errors.push(`${file}: cannot read (${err.message})`);
      continue;
    }

    let entry;
    try {
      entry = JSON.parse(raw);
    } catch (err) {
      errors.push(`${file}: invalid JSON (${err.message})`);
      continue;
    }

    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`${file}: must be a single JSON object`);
      continue;
    }

    const label = typeof entry.id === 'string' && entry.id.trim() !== '' ? entry.id : file;

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

    if (typeof entry.id === 'string' && entry.id.trim() !== '') {
      const expectedFile = `${entry.id}.json`;
      if (file !== expectedFile) {
        errors.push(`${file}: filename should match id (expected ${expectedFile})`);
      }
      if (seenIds.has(entry.id)) {
        errors.push(`${entry.id}: duplicate id (also in ${seenIds.get(entry.id)})`);
      } else {
        seenIds.set(entry.id, file);
      }
    }

    entries.push({ file, entry });
  }

  const allIds = new Set(entries.map(({ entry }) => entry.id).filter(Boolean));
  for (const { file, entry } of entries) {
    if (entry.related === undefined) continue;
    const label = typeof entry.id === 'string' ? entry.id : file;
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

  console.log(`commands.json built — ${commands.length} entries from ${files.length} files.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
