#!/usr/bin/env node
// Builds the static-embedding search assets from the Model2Vec model
// `minishlab/potion-base-8M`.
//
// Model2Vec ("potion") is a distilled static embedder: a token -> vector
// lookup table with PCA + Zipf weighting already baked in. Embedding any text
// is just "tokenize, look up rows, average, normalize" — no neural network, so
// it runs in well under a millisecond in the browser with no WASM.
//
// This script, run on `prebuild` (and via `npm run embed`):
//   1. downloads the potion model + tokenizer once (cached under .cache/)
//   2. prunes the vocab to ASCII tokens and int8-quantizes the table
//   3. writes public/token-table.bin + public/token-vocab.json  (the runtime
//      embedder)
//   4. embeds every command and writes public/embeddings.json
//
// Commands here and queries in the browser are embedded by the *same* code
// path (lib/wordpiece.mjs + the embed() below mirrors lib/staticEmbed.js), so
// the vectors are directly comparable.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTokenizer } from '../lib/wordpiece.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const COMMANDS_FILE = path.join(REPO_ROOT, 'commands.json');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');
const CACHE_DIR = path.join(REPO_ROOT, '.cache', 'potion-base-8M');

const MODEL_REPO = 'minishlab/potion-base-8M';
const HF_BASE = `https://huggingface.co/${MODEL_REPO}/resolve/main`;
const FILES = ['model.safetensors', 'tokenizer.json'];

// --- model download (cached) -------------------------------------------------

async function ensureModelFiles() {
  await mkdir(CACHE_DIR, { recursive: true });
  for (const name of FILES) {
    const dest = path.join(CACHE_DIR, name);
    if (existsSync(dest)) continue;
    console.log(`downloading ${MODEL_REPO}/${name} …`);
    const res = await fetch(`${HF_BASE}/${name}`);
    if (!res.ok) {
      throw new Error(`failed to download ${name}: HTTP ${res.status}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    console.log(`  cached ${name} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`);
  }
}

// --- safetensors parsing -----------------------------------------------------

// Reads the single F32 `embeddings` tensor out of a .safetensors file.
function parseEmbeddingsTensor(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const headerLen = Number(dv.getBigUint64(0, true));
  const header = JSON.parse(buf.toString('utf8', 8, 8 + headerLen));
  const meta = header.embeddings;
  if (!meta) throw new Error('safetensors: no "embeddings" tensor found');
  if (meta.dtype !== 'F32') throw new Error(`safetensors: expected F32, got ${meta.dtype}`);

  const [rows, dim] = meta.shape;
  const [start, end] = meta.data_offsets;
  const base = 8 + headerLen;
  // Copy into a fresh, 4-byte-aligned buffer before the Float32Array view.
  const slice = buf.buffer.slice(buf.byteOffset + base + start, buf.byteOffset + base + end);
  return { rows, dim, matrix: new Float32Array(slice) };
}

// --- vocab pruning -----------------------------------------------------------

// Keep a token only if it is plain printable ASCII (optionally behind the ##
// subword prefix). Drops [unused*] placeholders and every non-Latin script —
// useless on an English shell-command site, and pruned words still decompose
// into the ASCII subword/character tokens we keep.
function keepToken(tok) {
  if (/^\[unused\d+\]$/.test(tok)) return false;
  const body = tok.startsWith('##') ? tok.slice(2) : tok;
  return body.length > 0 && /^[\x21-\x7e]+$/.test(body);
}

// --- int8 quantization -------------------------------------------------------

// Symmetric per-row int8: each row keeps its own scale so small-magnitude
// rows (Zipf-damped frequent tokens) don't lose all their precision.
function quantizeRow(matrix, offset, dim) {
  let max = 0;
  for (let i = 0; i < dim; i++) {
    const a = Math.abs(matrix[offset + i]);
    if (a > max) max = a;
  }
  const scale = max > 0 ? max / 127 : 1;
  const q = new Int8Array(dim);
  for (let i = 0; i < dim; i++) {
    let v = Math.round(matrix[offset + i] / scale);
    if (v > 127) v = 127;
    else if (v < -127) v = -127;
    q[i] = v;
  }
  return { q, scale };
}

// --- embedding (mirrors lib/staticEmbed.js exactly) --------------------------

function makeEmbedder({ dim, scales, table, tokenize }) {
  return function embed(text) {
    const ids = tokenize(text);
    const vec = new Float32Array(dim);
    if (ids.length === 0) return vec;
    for (const id of ids) {
      const scale = scales[id];
      const start = id * dim;
      for (let d = 0; d < dim; d++) vec[d] += table[start + d] * scale;
    }
    let norm = 0;
    for (let d = 0; d < dim; d++) {
      vec[d] /= ids.length;
      norm += vec[d] * vec[d];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) for (let d = 0; d < dim; d++) vec[d] /= norm;
    return vec;
  };
}

// Description + tags + intents — the human-intent text. The literal command
// is deliberately excluded: its flags and symbols are tokenizer noise that
// only dilute the vector. Lexical (Fuse) search still covers the command.
function searchableText(cmd) {
  const parts = [cmd.description];
  if (Array.isArray(cmd.tags) && cmd.tags.length) parts.push(cmd.tags.join(', '));
  if (Array.isArray(cmd.intents) && cmd.intents.length) parts.push(cmd.intents.join(', '));
  return parts.join('. ');
}

// --- main --------------------------------------------------------------------

async function main() {
  if (!existsSync(COMMANDS_FILE)) {
    console.error(`${COMMANDS_FILE} missing — run "npm run validate" first.`);
    process.exit(1);
  }

  await ensureModelFiles();

  // Tokenizer vocab.
  const tokenizerJson = JSON.parse(
    await readFile(path.join(CACHE_DIR, 'tokenizer.json'), 'utf8')
  );
  const fullVocab = tokenizerJson.model.vocab;
  const unkToken = tokenizerJson.model.unk_token ?? '[UNK]';
  const subwordPrefix = tokenizerJson.model.continuing_subword_prefix ?? '##';

  // Embedding matrix.
  const safetensors = await readFile(path.join(CACHE_DIR, 'model.safetensors'));
  const { rows, dim, matrix } = parseEmbeddingsTensor(safetensors);
  console.log(`potion model: ${rows} tokens x ${dim} dims`);

  // Prune + quantize. New ids are assigned densely so the runtime table has
  // no gaps; [UNK] must survive the prune (it does — it is ASCII).
  const kept = [];
  for (const [tok, id] of Object.entries(fullVocab)) {
    if (id < rows && keepToken(tok)) kept.push({ tok, id });
  }
  if (!kept.some(({ tok }) => tok === unkToken)) {
    throw new Error(`prune dropped the unknown token "${unkToken}"`);
  }

  const count = kept.length;
  const vocab = {};
  const scales = new Float32Array(count);
  const table = new Int8Array(count * dim);
  kept.forEach(({ tok, id }, newId) => {
    vocab[tok] = newId;
    const { q, scale } = quantizeRow(matrix, id * dim, dim);
    scales[newId] = scale;
    table.set(q, newId * dim);
  });
  console.log(`pruned vocab: ${rows} -> ${count} tokens`);

  // Write the runtime table: [count float32 scales][count*dim int8 values].
  await mkdir(PUBLIC_DIR, { recursive: true });
  const binBuf = Buffer.concat([
    Buffer.from(scales.buffer, scales.byteOffset, scales.byteLength),
    Buffer.from(table.buffer, table.byteOffset, table.byteLength)
  ]);
  await writeFile(path.join(PUBLIC_DIR, 'token-table.bin'), binBuf);
  await writeFile(
    path.join(PUBLIC_DIR, 'token-vocab.json'),
    JSON.stringify({ model: MODEL_REPO, dim, count, unkToken, prefix: subwordPrefix, vocab })
  );
  console.log(`token-table.bin written — ${(binBuf.length / 1024 / 1024).toFixed(2)} MB`);

  // Embed every command through the exact runtime pipeline.
  const tokenize = createTokenizer({ vocab, unkToken, subwordPrefix });
  const embed = makeEmbedder({ dim, scales, table, tokenize });

  const commands = JSON.parse(await readFile(COMMANDS_FILE, 'utf8'));
  const entries = commands.map((cmd) => ({
    id: cmd.id,
    vector: Array.from(embed(searchableText(cmd)), (v) => Number(v.toFixed(6)))
  }));
  await writeFile(
    path.join(PUBLIC_DIR, 'embeddings.json'),
    JSON.stringify({ model: MODEL_REPO, method: 'static', dim, entries }) + '\n'
  );
  console.log(`embeddings.json written — ${entries.length} commands`);

  // Smoke test: print the top matches for a few intent-style queries so the
  // SEM_FLOOR / weights in lib/mergeSearch.js can be eyeballed.
  const byId = new Map(commands.map((c) => [c.id, c]));
  const probes = [
    'undo my last commit',
    'something is using my port',
    'see whats running in docker',
    'throw away all my changes',
    'download a file from a url'
  ];
  console.log('\n--- smoke test (cosine similarity) ---');
  for (const q of probes) {
    const qv = embed(q);
    const ranked = entries
      .map((e) => ({ id: e.id, score: e.vector.reduce((s, v, i) => s + v * qv[i], 0) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    console.log(`\n  "${q}"`);
    for (const r of ranked) {
      console.log(`    ${r.score.toFixed(3)}  ${r.id} — ${byId.get(r.id)?.command}`);
    }
  }
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
