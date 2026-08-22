'use client';

import { useLanyard } from 'use-lanyard';
import { siteConfig } from '../../lib/site';
import { FaDiscord } from 'react-icons/fa6';
import Image from 'next/image';

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

  // If no Discord ID is configured, render a graceful unavailable state
  if (!discordId) {
    return (
      <div className="flex items-center gap-2 text-[11px] font-mono text-subtle/70 uppercase tracking-widest">
        <FaDiscord size={12} className="opacity-50" />
        <span>Presence Unavailable</span>
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
      <div className="flex items-center gap-2 text-[11px] font-mono text-subtle/70 uppercase tracking-widest">
        <FaDiscord size={12} className="opacity-50 animate-pulse" />
        <span>Connecting...</span>
      </div>
    );
  }

  const { discord_user, discord_status, activities } = presence;
  const statusColor = STATUS_COLORS[discord_status] || STATUS_COLORS.offline;

  // Priority: custom status (type 4), then game/rich-presence activity (type 0).
  // Listening and streaming activity are intentionally not rendered here.
  const customActivity = activities.find(
    (a: { type: number; name?: string; state?: string }) =>
      a.type === 4 || (a.type !== 2 && a.type !== 1)
  );

  return (
    <div className="flex flex-col gap-3 border border-border/30 bg-card/20 rounded-md p-3 max-w-[280px]">
      <div className="flex items-center gap-3">
        {/* Avatar with Status Indicator */}
        <div className="relative flex-shrink-0">
          {discord_user.avatar ? (
            <Image
              src={`https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.webp?size=64`}
              alt={`${discord_user.username}'s avatar`}
              width={32}
              height={32}
              className="rounded-full bg-border/50"
              unoptimized
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-border/50 flex items-center justify-center">
              <FaDiscord size={16} className="text-muted/50" />
            </div>
          )}
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-background ${statusColor}`}
            title={`Status: ${discord_status}`}
            aria-label={`Status: ${discord_status}`}
          />
        </div>

        {/* Identity */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs font-medium text-foreground/90 truncate">
            {discord_user.global_name || discord_user.username}
          </span>
          <span className="text-[10px] text-muted/70 truncate uppercase tracking-wider">
            {discord_status === 'offline' ? 'Offline' : 'Active'}
          </span>
        </div>
      </div>

      {/* Activity display (only if not offline) */}
      {discord_status !== 'offline' && (
        <div className="flex flex-col gap-1.5">
          {/* Custom / Game Activity */}
          {customActivity && (
            <div className="text-[11px] text-muted/80 flex flex-col min-w-0">
              {customActivity.type === 4 && customActivity.state && (
                <span className="truncate">{customActivity.state}</span>
              )}
              {customActivity.type === 0 && (
                <span className="truncate">
                  Playing{' '}
                  <span className="font-medium text-foreground/80">
                    {customActivity.name}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
