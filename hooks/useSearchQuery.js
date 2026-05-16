'use client';

import { useEffect, useRef, useState } from 'react';

export default function useSearchQuery() {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const ae = document.activeElement;
      const tag = ae?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || ae?.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get('q') || '');
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      const url = new URL(window.location.href);
      if (query) url.searchParams.set('q', query);
      else url.searchParams.delete('q');
      const next = url.pathname + url.search + url.hash;
      const current =
        window.location.pathname + window.location.search + window.location.hash;
      if (next !== current) {
        window.history.replaceState(null, '', next);
      }
    }, 120);
    return () => clearTimeout(id);
  }, [query]);

  return {
    query,
    setQuery,
    inputRef,
    hasQuery: query.trim().length > 0
  };
}
