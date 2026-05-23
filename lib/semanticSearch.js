'use client';

// Client-side semantic search over static (Model2Vec / potion) embeddings.
//
// No neural network at runtime: embedText() is a token-table lookup, so a
// query embeds in well under a millisecond, synchronously, once the table has
// loaded once. Query vectors line up with public/embeddings.json because both
// are produced by scripts/build-static-embeddings.mjs through the same code.
//
// Singleton: one embeddings-file fetch per session. Safe to call initSemantic()
// multiple times — later callers get the same in-flight promise.

import { initStaticEmbed, embedText } from '@/lib/staticEmbed';

let embeddingsPromise = null;

function isBrowser() {
  return typeof window !== 'undefined';
}

async function loadEmbeddings() {
  if (!isBrowser()) throw new Error('semanticSearch only runs in the browser');
  if (embeddingsPromise) return embeddingsPromise;
  embeddingsPromise = (async () => {
    const res = await fetch('/embeddings.json');
    if (!res.ok) throw new Error(`failed to fetch embeddings.json: ${res.status}`);
    const data = await res.json();
    // Convert each vector to a Float32Array up-front for faster dot products.
    return data.entries.map((e) => ({ id: e.id, vector: Float32Array.from(e.vector) }));
  })();
  return embeddingsPromise;
}

// Preload the embeddings file and the token table in parallel. Call this from
// an idle callback after the page mounts so search is ready before first use.
export async function initSemantic() {
  if (!isBrowser()) return;
  await Promise.all([loadEmbeddings(), initStaticEmbed()]);
}

function dot(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

// Returns ranked [{ id, score }] in descending score order. Score is the
// cosine similarity in [-1, 1]; query and stored vectors are both L2-
// normalized, so cosine == dot product.
export async function semanticSearch(query, { topK = 50 } = {}) {
  const q = (query ?? '').trim();
  if (!q) return [];

  const [entries, qVec] = await Promise.all([loadEmbeddings(), embedText(q)]);
  const scored = entries.map((e) => ({ id: e.id, score: dot(qVec, e.vector) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
