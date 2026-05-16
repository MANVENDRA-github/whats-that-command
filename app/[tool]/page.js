import { notFound } from 'next/navigation';
import commands from '@/commands.json';
import Navbar from '@/components/Navbar';
import ToolBrowser from '@/components/ToolBrowser';

const TOOLS = ['git', 'docker', 'bash'];

const TOOL_META = {
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

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ tool }));
}

export async function generateMetadata({ params }) {
  const { tool } = await params;
  if (!TOOLS.includes(tool)) return {};
  const meta = TOOL_META[tool];
  return {
    title: `${meta.title} commands — What's that command?`,
    description: meta.blurb
  };
}

export default async function ToolPage({ params }) {
  const { tool } = await params;
  if (!TOOLS.includes(tool)) notFound();

  const meta = TOOL_META[tool];
  const toolCommands = commands.filter((c) => c.tool === tool);
  const categoryCount = new Set(toolCommands.map((c) => c.category)).size;

  return (
    <>
      <Navbar />
      <main>
        <section className="mx-auto max-w-page px-5 pb-12 pt-12 sm:px-7 sm:pb-16 sm:pt-20 lg:pt-24">
          <div className="max-w-3xl">
            <h1
              className="font-display font-medium leading-[1.04] tracking-tight text-ink"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw + 1rem, 5rem)' }}
            >
              {meta.title}
              <span className="text-accent">.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
              {meta.blurb}
            </p>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-kicker text-muted">
              {toolCommands.length} commands · {categoryCount}{' '}
              {categoryCount === 1 ? 'category' : 'categories'}
            </p>
          </div>
        </section>

        <hr className="section-rule mx-auto max-w-page" />

        <ToolBrowser tool={tool} commands={toolCommands} />
      </main>
    </>
  );
}
