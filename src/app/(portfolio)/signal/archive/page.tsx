import fs from 'fs';
import path from 'path';

export default function SignalArchivePage() {
  let archiveDates: string[] = [];
  let error = null;

  try {
    const historyDir = path.join(process.cwd(), 'signal/history');
    if (fs.existsSync(historyDir)) {
      const files = fs.readdirSync(historyDir);
      archiveDates = files
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.replace('.json', ''))
        .sort((a, b) => b.localeCompare(a));
    }
  } catch (err) {
    error =
      err instanceof Error ? err.message : 'Unable to load the Signal archive.';
  }

  return (
    <div className="glass-surface m-3 flex min-h-screen flex-col items-center rounded-2xl px-6 pt-32 lg:m-6 lg:px-12">
      <h1 className="text-4xl font-bold font-sans tracking-tight text-brand-neutral-100 mb-8">
        Signal Archive
      </h1>

      {error && <p className="text-brand-neutral-400">{error}</p>}

      <div className="w-full max-w-2xl bg-brand-neutral-800/20 rounded-xl p-8 border border-brand-neutral-700/50 backdrop-blur-md">
        {archiveDates.length === 0 ? (
          <p className="text-brand-neutral-400">No archived signals found.</p>
        ) : (
          <ul className="space-y-2 font-mono text-sm">
            {archiveDates.map((date) => (
              <li
                key={date}
                className="text-brand-neutral-300 flex justify-between p-2 hover:bg-brand-neutral-700/30 rounded transition-colors cursor-default"
              >
                <span>{date}</span>
                <span className="text-brand-neutral-500">
                  signal/history/{date}.json
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
