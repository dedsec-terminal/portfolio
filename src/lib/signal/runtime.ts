export interface SignalRunOptions {
  isRepair: boolean;
  requireGroq: boolean;
  generatorVersion: string;
}

export function resolveSignalRunOptions(
  env: Record<string, string | undefined> = process.env
): SignalRunOptions {
  const isRepair = env.SIGNAL_REGENERATE === 'true';

  return {
    isRepair,
    requireGroq: isRepair && env.SIGNAL_REQUIRE_GROQ === 'true',
    generatorVersion: isRepair ? 'v1.1.0' : 'v1.0.0',
  };
}
