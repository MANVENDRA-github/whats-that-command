// Client-side semantic search.
//
// Lazy-loads the same quantized all-MiniLM-L6-v2 model used at build time
// (see scripts/generate-embeddings.mjs), embeds the user's query, and
// ranks commands by cosine similarity against /embeddings.json.
//
// Singleton: one model instance and one embeddings-file fetch per session.
// Safe to call init() multiple times — the second caller gets the same
// in-flight promise.

const MODEL = 'Xenova/all-MiniLM-L6-v2';
const DTYPE = 'q8';

let extractPromise = null;
let embeddingsPromise = null;

function isBrowser() {
  return typeof window !== 'undefined';
}

async function loadExtractor() {
  if (!isBrowser()) throw new Error('semanticSearch only runs in the browser');
  if (extractPromise) return extractPromise;
  extractPromise = (async () => {
    const { pipeline } = await import('@huggingface/transformers');
    return pipeline('feature-extraction', MODEL, { dtype: DTYPE });
  })();
  return extractPromise;
}

async function loadEmbeddings() {
  if (!isBrowser()) throw new Error('semanticSearch only runs in the browser');
  if (embeddingsPromise) return embeddingsPromise;
  embeddingsPromise = (async () => {
    const res = await fetch('/embeddings.json');
    if (!res.ok) throw new Error(`failed to fetch embeddings.json: ${res.status}`);
    const data = await res.json();
    // Convert each vector to a Float32Array up-front for faster dot products.
    return {
      ...data,
      entries: data.entries.map((e) => ({ id: e.id, vector: Float32Array.from(e.vector) }))
    };
  })();
  return embeddingsPromise;
}

// Preload both the embeddings file and the model in parallel. Call this
// from an idle callback after the home page mounts so the model is ready
// by the time the user searches.
export async function initSemantic() {
  if (!isBrowser()) return;
  await Promise.all([loadEmbeddings(), loadExtractor()]);
}

function dot(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

// Returns ranked [{ id, score }] in descending score order. Score is the
// cosine similarity in [-1, 1]; both query and stored vectors are L2-
// normalized so cosine == dot product.
export async function semanticSearch(query, { topK = 50 } = {}) {
  const q = (query ?? '').trim();
  if (!q) return [];

  const [extract, data] = await Promise.all([loadExtractor(), loadEmbeddings()]);
  const output = await extract(q, { pooling: 'mean', normalize: true });
  const qVec = Float32Array.from(output.data);

  const scored = new Array(data.entries.length);
  for (let i = 0; i < data.entries.length; i++) {
    const e = data.entries[i];
    scored[i] = { id: e.id, score: dot(qVec, e.vector) };
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
