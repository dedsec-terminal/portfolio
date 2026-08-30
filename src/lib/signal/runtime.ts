export interface SignalRunOptions {
  isRepair: boolean;
  requireGroq: boolean;
  generatorVersion: string;
}

export function getSignalDate(
  now = new Date(),
  timeZone = process.env.SIGNAL_TIME_ZONE ?? 'Asia/Kolkata'
): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function resolveSignalRunOptions(
  env: Record<string, string | undefined> = process.env
): SignalRunOptions {
  const isRepair = env.SIGNAL_REGENERATE === 'true';

  return {
    isRepair,
    requireGroq: env.SIGNAL_REQUIRE_GROQ === 'true',
    generatorVersion: 'v2.0.0',
  };
}
