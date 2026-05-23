'use client';

import { useEffect, useState } from 'react';

// Returns `value` delayed by `delayMs` — it only updates once the input has
// stopped changing for that long. Used to debounce the search query so a fast
// typist triggers one search after they pause, not one per keystroke.
export default function useDebouncedValue(value, delayMs = 150) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
