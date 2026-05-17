// Merges Fuse and semantic results into a single ranked list.
//
// Fuse scores are distance-like: 0 = perfect, 1 = worst. We flip to
// fuseScore = 1 - score so higher means better, matching semantic.
// Semantic scores are cosine similarities in [-1, 1] (typically 0..1 for
// related text after L2 normalization).
//
// A semantic-only match has to clear SEM_FLOOR — otherwise we'd flood
// the page with weak associations. Fuse matches always count.

const FUSE_W = 0.35;
const SEM_W = 0.65;
const SEM_FLOOR = 0.35;
const MAX_RESULTS = 30;

export function mergeResults(fuseRanked, semanticRanked, allCommands) {
  const byId = new Map();

  for (const r of fuseRanked) {
    byId.set(r.item.id, { id: r.item.id, fuse: 1 - r.score, sem: 0 });
  }
  for (const r of semanticRanked) {
    const existing = byId.get(r.id);
    if (existing) existing.sem = r.score;
    else byId.set(r.id, { id: r.id, fuse: 0, sem: r.score });
  }

  const cmdById = new Map(allCommands.map((c) => [c.id, c]));

  return [...byId.values()]
    .filter((r) => r.fuse > 0 || r.sem >= SEM_FLOOR)
    .map((r) => ({ ...r, combined: FUSE_W * r.fuse + SEM_W * r.sem }))
    .sort((a, b) => b.combined - a.combined)
    .slice(0, MAX_RESULTS)
    .map((r) => cmdById.get(r.id))
    .filter(Boolean);
}
