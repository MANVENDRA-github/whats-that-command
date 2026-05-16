import { notFound } from 'next/navigation';
import commands from '@/commands.json';
import { TOOLS, TOOL_META, isValidTool } from '@/lib/tools';
import { getCommandsByTool, countCategories } from '@/lib/commands';
import Navbar from '@/components/Navbar';
import ToolBrowser from '@/components/ToolBrowser';

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ tool }));
}

export async function generateMetadata({ params }) {
  const { tool } = await params;
  if (!isValidTool(tool)) return {};
  const meta = TOOL_META[tool];
  return {
    title: `${meta.title} commands — What's that command?`,
    description: meta.blurb
  };
}

export default async function ToolPage({ params }) {
  const { tool } = await params;
  if (!isValidTool(tool)) notFound();

  const meta = TOOL_META[tool];
  const toolCommands = getCommandsByTool(commands, tool);
  const categoryCount = countCategories(toolCommands);

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
