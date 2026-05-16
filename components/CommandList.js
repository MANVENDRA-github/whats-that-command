import CommandCard from './CommandCard';

export default function CommandList({ commands }) {
  return (
    <ul className="space-y-3">
      {commands.map((cmd) => (
        <li key={cmd.id}>
          <CommandCard cmd={cmd} />
        </li>
      ))}
    </ul>
  );
}
