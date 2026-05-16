export function groupByCategory(commands) {
  const acc = {};
  for (const cmd of commands) {
    (acc[cmd.category] ??= []).push(cmd);
  }
  return Object.entries(acc).sort(([a], [b]) => a.localeCompare(b));
}

export function getCommandsByTool(commands, tool) {
  return commands.filter((c) => c.tool === tool);
}

export function countCategories(commands) {
  return new Set(commands.map((c) => c.category)).size;
}
