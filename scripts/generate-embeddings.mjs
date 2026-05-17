#!/usr/bin/env node
// Embeds every command's searchable text with quantized all-MiniLM-L6-v2
// and writes public/embeddings.json. The same quantized model is loaded
// in the browser via lib/semanticSearch.js so vectors stay aligned.
//
// Content-hash caching: entries are only re-embedded when their text
// changes. First run on a clean dataset takes ~30s; subsequent runs
// on unchanged data are ~1s.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const COMMANDS_FILE = path.join(REPO_ROOT, 'commands.json');
const OUTPUT_FILE = path.join(REPO_ROOT, 'public', 'embeddings.json');

const MODEL = 'Xenova/all-MiniLM-L6-v2';
const DTYPE = 'q8';
const DIM = 384;

function searchableText(cmd) {
  const tags = Array.isArray(cmd.tags) ? cmd.tags.join(', ') : '';
  return `${cmd.description}. ${tags}. ${cmd.command}`;
}

function contentHash(cmd) {
  return createHash('sha256').update(searchableText(cmd)).digest('hex').slice(0, 16);
}

function loadExisting() {
  if (!existsSync(OUTPUT_FILE)) return null;
  try {
    const parsed = JSON.parse(readFileSync(OUTPUT_FILE, 'utf8'));
    if (parsed.model !== MODEL || parsed.dtype !== DTYPE || parsed.dim !== DIM) {
      console.log('Existing embeddings.json was built with a different model/dtype/dim — rebuilding from scratch.');
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function main() {
  if (!existsSync(COMMANDS_FILE)) {
    console.error(`${COMMANDS_FILE} missing — run "npm run validate" first.`);
    process.exit(1);
  }

  const commands = JSON.parse(await readFile(COMMANDS_FILE, 'utf8'));
  const existing = loadExisting();
  const cache = new Map(
    (existing?.entries ?? []).map((e) => [e.id, e])
  );

  const work = commands.map((cmd) => ({
    id: cmd.id,
    text: searchableText(cmd),
    hash: contentHash(cmd)
  }));

  const toEmbed = work.filter(({ id, hash }) => cache.get(id)?.hash !== hash);
  const reused = work.length - toEmbed.length;

  console.log(`embeddings: ${work.length} commands — ${reused} cached, ${toEmbed.length} to embed.`);

  let entries;
  if (toEmbed.length === 0) {
    entries = work.map(({ id, hash }) => ({
      id,
      hash,
      vector: cache.get(id).vector
    }));
  } else {
    const { pipeline } = await import('@huggingface/transformers');
    console.log(`Loading ${MODEL} (${DTYPE})…`);
    const extract = await pipeline('feature-extraction', MODEL, { dtype: DTYPE });

    const fresh = new Map();
    let done = 0;
    for (const { id, text, hash } of toEmbed) {
      const output = await extract(text, { pooling: 'mean', normalize: true });
      fresh.set(id, { id, hash, vector: Array.from(output.data) });
      done += 1;
      if (done % 10 === 0 || done === toEmbed.length) {
        console.log(`  embedded ${done}/${toEmbed.length}`);
      }
    }

    entries = work.map(({ id, hash }) => {
      const updated = fresh.get(id);
      if (updated) return updated;
      const cached = cache.get(id);
      return { id, hash, vector: cached.vector };
    });
  }

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  const payload = { model: MODEL, dtype: DTYPE, dim: DIM, entries };
  await writeFile(OUTPUT_FILE, JSON.stringify(payload) + '\n', 'utf8');

  const sizeKb = (Buffer.byteLength(JSON.stringify(payload), 'utf8') / 1024).toFixed(1);
  console.log(`embeddings.json written — ${entries.length} entries, ${sizeKb} KB.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
