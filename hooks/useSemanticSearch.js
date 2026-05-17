'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { initSemantic, semanticSearch } from '@/lib/semanticSearch';

// Triggers a background preload of the embeddings file and the embedding
// model after the page has had a chance to render. Uses requestIdleCallback
// when available so the work doesn't fight first paint.
//
// status: 'idle' (before preload starts) | 'loading' | 'ready' | 'error'
// search(query): returns [{ id, score }] when ready, [] otherwise.

export default function useSemanticSearch() {
  const [status, setStatus] = useState('idle');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    let idleHandle = null;
    let timeoutHandle = null;

    const start = () => {
      if (cancelled) return;
      setStatus('loading');
      initSemantic()
        .then(() => {
          if (!cancelled && mountedRef.current) setStatus('ready');
        })
        .catch((err) => {
          if (!cancelled && mountedRef.current) {
            console.warn('semantic search unavailable, falling back to lexical only', err);
            setStatus('error');
          }
        });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleHandle = window.requestIdleCallback(start, { timeout: 2000 });
    } else {
      timeoutHandle = setTimeout(start, 800);
    }

    return () => {
      cancelled = true;
      mountedRef.current = false;
      if (idleHandle !== null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== null) clearTimeout(timeoutHandle);
    };
  }, []);

  const search = useCallback(async (query) => {
    if (status !== 'ready') return [];
    try {
      return await semanticSearch(query, { topK: 50 });
    } catch (err) {
      console.warn('semantic search query failed', err);
      return [];
    }
  }, [status]);

  return { status, search };
}
