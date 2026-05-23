export const fuseOptions = {
  keys: [
    { name: 'tags', weight: 0.35 },
    { name: 'intents', weight: 0.35 },
    { name: 'description', weight: 0.2 },
    { name: 'command', weight: 0.1 }
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true
};
