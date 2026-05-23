'use client';

// Runtime static-embedding text encoder.
//
// Loads the potion-base-8M token table built by scripts/build-static-embeddings.mjs
// (public/token-table.bin + public/token-vocab.json) and turns any string into
// a 256-dim unit vector by tokenizing, looking up the int8 rows, mean-pooling
// and L2-normalizing. There is no neural network and no WASM — embedText() is a
// handful of array reads, so a query embeds in well under a millisecond.
//
// The math here is the exact mirror of makeEmbedder() in the build script, so
// query vectors are directly comparable to the command vectors in
// public/embeddings.json.

import { createTokenizer } from '@/lib/wordpiece.mjs';

let loadPromise = null;

function isBrowser() {
  return typeof window !== 'undefined';
}

async function load() {
  if (!isBrowser()) throw new Error('staticEmbed only runs in the browser');
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    const [vocabRes, binRes] = await Promise.all([
      fetch('/token-vocab.json'),
      fetch('/token-table.bin')
    ]);
    if (!vocabRes.ok) throw new Error(`token-vocab.json: ${vocabRes.status}`);
    if (!binRes.ok) throw new Error(`token-table.bin: ${binRes.status}`);

    const meta = await vocabRes.json();
    const buf = await binRes.arrayBuffer();
    const { dim, count } = meta;

    // Layout: [count float32 row scales][count*dim int8 values].
    const scales = new Float32Array(buf, 0, count);
    const table = new Int8Array(buf, count * 4, count * dim);

    const tokenize = createTokenizer({
      vocab: meta.vocab,
      unkToken: meta.unkToken,
      subwordPrefix: meta.prefix
    });
    return { dim, scales, table, tokenize };
  })();
  return loadPromise;
}

// Kick off the table fetch ahead of the first query.
export function initStaticEmbed() {
  if (!isBrowser()) return Promise.resolve();
  return load();
}

// Embeds text into a normalized Float32Array. Resolves instantly once the
// table has loaded — the await is only the one-time fetch.
export async function embedText(text) {
  const { dim, scales, table, tokenize } = await load();
  const ids = tokenize(text ?? '');
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
}
