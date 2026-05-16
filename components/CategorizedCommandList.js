import { groupByCategory } from '@/lib/commands';
import CommandList from './CommandList';

export default function CategorizedCommandList({ commands }) {
  const groups = groupByCategory(commands);

  return (
    <>
      {groups.map(([category, items]) => (
        <div key={category} className="mb-14 last:mb-0">
          <p className="kicker mb-5">{category}</p>
          <CommandList commands={items} />
        </div>
      ))}
    </>
  );
}
