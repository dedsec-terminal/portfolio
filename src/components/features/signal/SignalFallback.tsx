import { SignalDayType } from '@/lib/signal/schemas';

export default function SignalFallback({ data }: { data: SignalDayType }) {
  return (
    <div className="sr-only">
      <h2>Today for {data.date}</h2>
      <ol>
        {data.nodes.map((node) => (
          <li key={node.id}>
            <h3>{node.title}</h3>
            <p>Category: {node.category}, Tier: {node.tier}</p>
            <p>{node.description}</p>
            {node.url && <a href={node.url}>Source: {node.source}</a>}
          </li>
        ))}
      </ol>
    </div>
  );
}
