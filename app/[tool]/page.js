import { notFound } from 'next/navigation';
import commands from '@/commands.json';
import { TOOLS, TOOL_META, isValidTool } from '@/lib/tools';
import { getCommandsByTool, countCategories } from '@/lib/commands';
import Navbar from '@/components/Navbar';
import ToolHero from '@/components/ToolHero';
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

  const toolCommands = getCommandsByTool(commands, tool);
  const categoryCount = countCategories(toolCommands);

  return (
    <>
      <Navbar />
      <main>
        <ToolHero
          tool={tool}
          commandCount={toolCommands.length}
          categoryCount={categoryCount}
        />

        <hr className="section-rule mx-auto max-w-page" />

        <ToolBrowser tool={tool} commands={toolCommands} />
      </main>
    </>
  );
}
