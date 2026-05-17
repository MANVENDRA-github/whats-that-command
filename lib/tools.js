export const TOOLS = ['git', 'docker', 'bash'];

export const TOOL_META = {
  git: {
    title: 'git',
    blurb: 'Version control. What changed, what to undo, how to share it.'
  },
  docker: {
    title: 'docker',
    blurb: 'Containers, images, compose, networks. The everyday lifecycle.'
  },
  bash: {
    title: 'bash',
    blurb: 'The shell toolbox. Find, grep, processes, ports, archives, text.'
  }
};

export function isValidTool(tool) {
  return TOOLS.includes(tool);
}

export function toolHref(tool) {
  return `/${tool}`;
}
