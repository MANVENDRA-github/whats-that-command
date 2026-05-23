export const TOOLS = ['git', 'docker', 'bash'];

/**
 * Per-tool metadata — single source of truth for everything that
 * differs by tool (display name, blurb, Tailwind tint classes).
 *
 * `bgClass` / `textClass` are referenced from Tailwind classNames,
 * so they MUST be literal strings (don't build them with template
 * interpolation in component code, or Tailwind's content scanner
 * won't pick them up).
 */
export const TOOL_META = {
  git: {
    title: 'git',
    blurb: 'Version control. What changed, what to undo, how to share it.',
    bgClass: 'bg-git',
    textClass: 'text-git'
  },
  docker: {
    title: 'docker',
    blurb: 'Containers, images, compose, networks. The everyday lifecycle.',
    bgClass: 'bg-docker',
    textClass: 'text-docker'
  },
  bash: {
    title: 'bash',
    blurb: 'The shell toolbox. Find, grep, processes, ports, archives, text.',
    bgClass: 'bg-bash',
    textClass: 'text-bash'
  }
};

export function isValidTool(tool) {
  return TOOLS.includes(tool);
}

export function toolHref(tool) {
  return `/${tool}`;
}

export function toolBgClass(tool, fallback = 'bg-ink') {
  return TOOL_META[tool]?.bgClass ?? fallback;
}

export function toolTextClass(tool, fallback = 'text-ink') {
  return TOOL_META[tool]?.textClass ?? fallback;
}
