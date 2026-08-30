import fs from 'fs';
import path from 'path';
import {
  PersonalCatalogueAdapter,
  AnilistAdapter,
  WikimediaAdapter,
  HackerNewsAdapter,
  OpenLibraryAdapter,
  TmdbAdapter,
  WildcardAdapter,
  ArtInstituteAdapter,
  WordsAdapter,
} from '../src/lib/signal/adapters';
import { SignalGenerator, GeneratorConfig } from '../src/lib/signal/generator';
import { curateSignalCandidates } from '../src/lib/signal/enrich';
import { getSignalDate, resolveSignalRunOptions } from '../src/lib/signal/runtime';
import { SignalItem } from '../src/lib/signal/types';
import { signalDaySchema } from '../src/lib/signal/schemas';
import * as dotenv from 'dotenv';

dotenv.config();

const SIGNAL_DIR = path.join(process.cwd(), 'signal');
const HISTORY_DIR = path.join(SIGNAL_DIR, 'history');
const CURRENT_FILE = path.join(SIGNAL_DIR, 'current.json');

function writeFileAtomically(filePath: string, contents: string) {
  const temporaryPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temporaryPath, contents, 'utf8');
  fs.renameSync(temporaryPath, filePath);
}

async function main() {
  const now = new Date();
  const dateStr = getSignalDate(now);
  const historyFile = path.join(HISTORY_DIR, `${dateStr}.json`);
  const { isRepair, requireGroq, generatorVersion } = resolveSignalRunOptions();

  // Ensure directories exist
  if (!fs.existsSync(SIGNAL_DIR)) fs.mkdirSync(SIGNAL_DIR);
  if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR);

  // 1. Immutable History Check
  if (fs.existsSync(historyFile) && !isRepair) {
    console.log(
      `[Signal Engine] History for ${dateStr} already exists. Validating and skipping generation.`
    );
    const existingContent = fs.readFileSync(historyFile, 'utf-8');
    const parsed = JSON.parse(existingContent);
    const valid = signalDaySchema.safeParse(parsed);
    if (!valid.success) {
      console.error(
        `[Signal Engine] Existing history for ${dateStr} is invalid!`,
        valid.error
      );
      process.exit(1);
    }
    // Update current.json to ensure it matches today's history
    writeFileAtomically(CURRENT_FILE, JSON.stringify(parsed, null, 2));
    console.log(
      `[Signal Engine] current.json updated to match ${dateStr}. Exiting safely.`
    );
    return;
  }

  if (isRepair) {
    console.log(`[Signal Engine] Repairing the existing artifact for ${dateStr}.`);
  }

  console.log(`[Signal Engine] Starting generation for ${dateStr}`);

  // 2. Load historical IDs for cooldown (e.g. past 30 days)
  const historicalIds: string[] = [];
  try {
    const files = fs.readdirSync(HISTORY_DIR);
    // Sort descending and take last 30
    const recentFiles = files
      .filter((f) => f.endsWith('.json'))
      .filter((f) => path.join(HISTORY_DIR, f) !== historyFile)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 30);

    for (const f of recentFiles) {
      const content = fs.readFileSync(path.join(HISTORY_DIR, f), 'utf-8');
      const day = signalDaySchema.safeParse(JSON.parse(content));
      if (day.success) {
        historicalIds.push(...day.data.nodes.map((node) => node.id));
      }
    }
  } catch (err) {
    console.warn(`[Signal Engine] Could not load history for cooldown:`, err);
  }

  // 3. Fetch Candidates from Adapters
  const adapters = [
    new PersonalCatalogueAdapter(),
    new ArtInstituteAdapter(),
    new AnilistAdapter(),
    new WikimediaAdapter(),
    new HackerNewsAdapter(),
    new OpenLibraryAdapter(),
    new TmdbAdapter(),
    new WildcardAdapter(),
    new WordsAdapter(),
  ];

  let candidates: SignalItem[] = [];

  for (const adapter of adapters) {
    try {
      console.log(`[Signal Engine] Fetching from ${adapter.id}...`);
      const items = await adapter.fetchCandidates();
      candidates = candidates.concat(items);
      console.log(
        `[Signal Engine] ${adapter.id} returned ${items.length} candidates.`
      );
    } catch (error) {
      console.error(
        `[Signal Engine] Adapter ${adapter.id} completely failed:`,
        error
      );
      // We continue with other adapters
    }
  }

  console.log(`[Signal Engine] Total candidates pool: ${candidates.length}`);

  if (candidates.length === 0) {
    console.error(`[Signal Engine] FATAL: 0 candidates available. Aborting.`);
    process.exit(1);
  }

  // 4. Generate Signal
  const generator = new SignalGenerator();
  const config: GeneratorConfig = {
    date: dateStr,
    generatorVersion,
    historicalIds,
  };

  const shortlist = generator.shortlist(candidates, config);
  const curatedCandidates = await curateSignalCandidates(shortlist, {
    requireComplete: requireGroq,
  });
  const signalDay = generator.generate(curatedCandidates, config);

  // 5. Validate Output
  const validation = signalDaySchema.safeParse(signalDay);
  if (!validation.success) {
    console.error(
      `[Signal Engine] FATAL: Generated data failed schema validation!`,
      validation.error
    );
    process.exit(1);
  }

  // 6. Write Artifacts
  const jsonOutput = JSON.stringify(validation.data, null, 2);

  writeFileAtomically(historyFile, jsonOutput);
  writeFileAtomically(CURRENT_FILE, jsonOutput);

  console.log(
    `[Signal Engine] Generation complete! Artifacts written for ${dateStr}.`
  );
}

main().catch((err) => {
  console.error('[Signal Engine] Unhandled error:', err);
  process.exit(1);
});
