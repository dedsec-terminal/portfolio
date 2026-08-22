'use client';

import { useLanyard } from 'use-lanyard';
import { siteConfig } from '../../lib/site';

// Activity types in Discord:
// 0: Playing
// 1: Streaming
// 2: Listening
// 3: Watching
// 4: Custom
// 5: Competing

const STATUS_COLORS: Record<string, string> = {
  online: 'bg-green-500/80',
  idle: 'bg-amber-500/80',
  dnd: 'bg-red-500/80',
  offline: 'bg-gray-500/80',
};

export default function DiscordPresence() {
  const discordId = siteConfig.discordId;

  // If no Discord ID is configured, retain a compact, neutral status signal.
  if (!discordId) {
    return (
      <div
        className="flex items-center gap-1.5 text-[10px] font-mono text-subtle/70 uppercase tracking-widest"
        aria-label="Discord status: unavailable"
      >
        <span
          className="size-1.5 rounded-full bg-gray-500/80"
          aria-hidden="true"
        />
        <span>Offline</span>
      </div>
    );
  }

  return <PresenceSubscriber discordId={discordId} />;
}

function PresenceSubscriber({ discordId }: { discordId: string }) {
  const presence = useLanyard(discordId as `${bigint}`);

  // Loading or unavailable
  if (!presence) {
    return (
      <div
        className="flex items-center gap-1.5 text-[10px] font-mono text-subtle/70 uppercase tracking-widest"
        aria-label="Discord status: connecting"
      >
        <span
          className="size-1.5 rounded-full bg-gray-500/80 animate-pulse"
          aria-hidden="true"
        />
        <span>Connecting...</span>
      </div>
    );
  }

  const { discord_status } = presence;
  const statusColor = STATUS_COLORS[discord_status] || STATUS_COLORS.offline;
  const statusLabel = discord_status === 'offline' ? 'Offline' : 'Active';

  return (
    <div
      className="flex items-center gap-1.5 text-[10px] font-mono text-subtle/70 uppercase tracking-widest"
      aria-label={`Discord status: ${statusLabel}`}
    >
      <span
        className={`size-1.5 rounded-full ${statusColor}`}
        title={`Discord status: ${statusLabel}`}
        aria-hidden="true"
      />
      <span>{statusLabel}</span>
    </div>
  );
}
