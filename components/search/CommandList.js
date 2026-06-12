import CommandCard from './CommandCard';

export default function CommandList({ commands }) {
  return (
    <ul className="space-y-3">
      {commands.map((cmd, i) => (
        <li key={cmd.id}>
          {/* stagger the first few results like terminal output scrolling in */}
          <CommandCard cmd={cmd} style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }} />
        </li>
      ))}
    </ul>
  );
}
