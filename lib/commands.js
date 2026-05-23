/**
 * @typedef {Object} Command
 * @property {string} id - Unique identifier, format `<tool>-<kebab-case-action>`.
 * @property {string} command - The shell command, may contain `<placeholders>`.
 * @property {string} description - Short human-readable description.
 * @property {('git'|'docker'|'bash')} tool - Tool the command belongs to.
 * @property {string} category - Category within the tool (e.g. `branch`, `undo`).
 * @property {string[]} tags - Human-intent keyword tags used by search.
 * @property {string[]} [intents] - Optional full-sentence phrasings of the need.
 * @property {string} [example] - Concrete example invocation.
 * @property {boolean} [danger] - True when the command is destructive.
 * @property {string[]} [related] - Other command ids related to this one.
 */

/**
 * Group commands by their `category` field, returning entries sorted alphabetically.
 * @param {Command[]} commands
 * @returns {Array<[string, Command[]]>}
 */
export function groupByCategory(commands) {
  const acc = {};
  for (const cmd of commands) {
    (acc[cmd.category] ??= []).push(cmd);
  }
  return Object.entries(acc).sort(([a], [b]) => a.localeCompare(b));
}

/**
 * Filter commands by tool name.
 * @param {Command[]} commands
 * @param {string} tool
 * @returns {Command[]}
 */
export function getCommandsByTool(commands, tool) {
  return commands.filter((c) => c.tool === tool);
}

/**
 * Count the distinct categories present in a set of commands.
 * @param {Command[]} commands
 * @returns {number}
 */
export function countCategories(commands) {
  return new Set(commands.map((c) => c.category)).size;
}
