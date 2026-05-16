#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const dataPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'commands.json');

let raw;
try {
  raw = fs.readFileSync(dataPath, 'utf8');
} catch (err) {
  console.error(`Could not read ${dataPath}: ${err.message}`);
  process.exit(1);
}

let commands;
try {
  commands = JSON.parse(raw);
} catch (err) {
  console.error(`commands.json is not valid JSON: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(commands)) {
  console.error('commands.json must contain an array at the top level.');
  process.exit(1);
}

const REQUIRED_STRING_FIELDS = ['id', 'command', 'description', 'tool', 'category'];
const errors = [];

const seenIds = new Map();
const allIds = new Set();

commands.forEach((entry, i) => {
  const label = entry && typeof entry === 'object' && typeof entry.id === 'string' && entry.id.trim() !== ''
    ? entry.id
    : `entry at index ${i}`;

  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    errors.push(`${label}: entry must be a JSON object`);
    return;
  }

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
    if (seenIds.has(entry.id)) {
      errors.push(`${entry.id}: duplicate id (also at index ${seenIds.get(entry.id)})`);
    } else {
      seenIds.set(entry.id, i);
      allIds.add(entry.id);
    }
  }
});

commands.forEach((entry, i) => {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return;
  const label = typeof entry.id === 'string' && entry.id.trim() !== '' ? entry.id : `entry at index ${i}`;

  if (entry.related === undefined) return;
  if (!Array.isArray(entry.related)) {
    errors.push(`${label}: "related" must be an array when present`);
    return;
  }
  entry.related.forEach((ref) => {
    if (typeof ref !== 'string') {
      errors.push(`${label}: "related" contains a non-string value`);
      return;
    }
    if (!allIds.has(ref)) {
      errors.push(`${label}: related id "${ref}" does not exist in the dataset`);
    }
  });
});

if (errors.length > 0) {
  console.error(`commands.json failed validation (${errors.length} problem${errors.length === 1 ? '' : 's'}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`commands.json OK — ${commands.length} entries, all checks passed.`);
