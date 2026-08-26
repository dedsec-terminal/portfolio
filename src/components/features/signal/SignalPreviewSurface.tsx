import type { SignalDayType } from '@/lib/signal/schemas';

type SignalNode = SignalDayType['nodes'][number];

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export default function SignalPreviewSurface({
  node,
  className = '',
}: {
  node: SignalNode;
  className?: string;
}) {
  const title = node.title.replace(/^\[SAMPLE\]\s*/i, '');
  const seed = hash(node.id);
  const hue = seed % 360;
  const initial = title.charAt(0).toUpperCase() || 'S';

  return (
    <div className={`relative isolate overflow-hidden bg-background ${className}`} aria-hidden="true">
      {node.image ? (
        // Remote artwork is part of the daily artifact and can change without a build.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="absolute inset-0 h-full w-full object-cover grayscale transition duration-300 group-hover:grayscale-0"
          src={node.image}
          alt=""
          loading="lazy"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 18% 18%, hsl(${hue} 52% 52% / 0.68), transparent 38%), radial-gradient(circle at 78% 82%, hsl(${(hue + 78) % 360} 40% 42% / 0.5), transparent 44%), linear-gradient(135deg, hsl(${hue} 26% 18%), hsl(${(hue + 38) % 360} 24% 8%))`,
          }}
        >
          <span className="absolute left-[8%] top-[3%] select-none font-mono text-[clamp(5rem,18vw,15rem)] font-semibold leading-none tracking-[-0.12em] text-background/25">
            {initial}
          </span>
          <span className="absolute inset-[13%] border border-background/35" />
          <span className="absolute bottom-[19%] left-0 h-px w-full bg-background/40" />
          <span className="absolute left-[59%] top-0 h-full w-px bg-background/30" />
        </div>
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-background/10" />
      <span className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-[0.3em] text-background/75">
        Signal {String((seed % 97) + 1).padStart(2, '0')}
      </span>
    </div>
  );
}
