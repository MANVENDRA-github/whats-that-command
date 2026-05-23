// BERT-uncased WordPiece tokenizer — pure ESM, zero dependencies.
//
// Shared by the build script (scripts/build-static-embeddings.mjs) and the
// runtime embedder (lib/staticEmbed.js). Commands are tokenized at build time
// and queries at search time; their vectors only line up if both sides run
// this exact code, so this module is the single source of truth.
//
// Mirrors Hugging Face's BertNormalizer (clean_text, strip_accents, lowercase)
// + BertPreTokenizer + WordPiece, which is what potion-base-8M's tokenizer is.
// Chinese-character handling is intentionally dropped: the shipped vocab is
// pruned to ASCII, so CJK input simply falls through to [UNK].

// --- normalization -----------------------------------------------------------

function isControl(cp) {
  // Tab / newline / carriage-return count as whitespace, not control chars.
  if (cp === 0x09 || cp === 0x0a || cp === 0x0d) return false;
  return cp === 0x00 || cp === 0xfffd || (cp <= 0x1f) || (cp >= 0x7f && cp <= 0x9f);
}

function cleanText(text) {
  let out = '';
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (isControl(cp)) continue;
    out += /\s/.test(ch) ? ' ' : ch; // collapse every whitespace flavour to a space
  }
  return out;
}

function stripAccents(text) {
  // NFD splits an accented letter into base + combining mark; drop the marks.
  return text.normalize('NFD').replace(/\p{Mn}/gu, '');
}

function normalize(text) {
  return stripAccents(cleanText(text)).toLowerCase();
}

function isPunct(ch) {
  const cp = ch.codePointAt(0);
  // BERT treats every non-alphanumeric ASCII char as punctuation...
  if ((cp >= 33 && cp <= 47) || (cp >= 58 && cp <= 64) ||
      (cp >= 91 && cp <= 96) || (cp >= 123 && cp <= 126)) {
    return true;
  }
  // ...plus anything in a Unicode punctuation category.
  return /\p{P}/u.test(ch);
}

// Splits normalized text into words, isolating each punctuation char as its
// own word — the BasicTokenizer step before WordPiece.
function basicTokenize(text) {
  const words = [];
  for (const chunk of normalize(text).split(/\s+/)) {
    if (!chunk) continue;
    let buf = '';
    for (const ch of chunk) {
      if (isPunct(ch)) {
        if (buf) { words.push(buf); buf = ''; }
        words.push(ch);
      } else {
        buf += ch;
      }
    }
    if (buf) words.push(buf);
  }
  return words;
}

// --- tokenizer factory -------------------------------------------------------

/**
 * Build a tokenizer bound to a vocab.
 * @param {object} opts
 * @param {Record<string, number>} opts.vocab - token string -> id
 * @param {string} [opts.unkToken]
 * @param {string} [opts.subwordPrefix]
 * @param {number} [opts.maxCharsPerWord]
 * @returns {(text: string) => number[]} tokenize -> array of token ids
 */
export function createTokenizer({
  vocab,
  unkToken = '[UNK]',
  subwordPrefix = '##',
  maxCharsPerWord = 100
}) {
  const unkId = vocab[unkToken];
  if (unkId === undefined) {
    throw new Error(`vocab is missing the unknown token "${unkToken}"`);
  }

  // Greedy longest-match-first WordPiece for a single word.
  function wordToIds(word) {
    const chars = [...word]; // codepoint-aware: surrogate pairs stay intact
    if (chars.length > maxCharsPerWord) return [unkId];

    const ids = [];
    let start = 0;
    while (start < chars.length) {
      let end = chars.length;
      let matchId;
      while (start < end) {
        const piece = (start > 0 ? subwordPrefix : '') + chars.slice(start, end).join('');
        const id = vocab[piece];
        if (id !== undefined) { matchId = id; break; }
        end--;
      }
      if (matchId === undefined) return [unkId]; // a single missing piece fails the whole word
      ids.push(matchId);
      start = end;
    }
    return ids;
  }

  return function tokenize(text) {
    const ids = [];
    for (const word of basicTokenize(text ?? '')) {
      for (const id of wordToIds(word)) ids.push(id);
    }
    return ids;
  };
}
