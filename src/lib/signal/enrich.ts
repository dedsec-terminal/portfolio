import type { SignalDay } from './types';

const GROQ_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-20b';

type GroqCompletion = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

type CuriosityResponse = {
  notes?: Array<{ id?: unknown; curiosity?: unknown }>;
};

export interface SignalEnrichmentOptions {
  requireComplete?: boolean;
}

function failOrFallback(
  day: SignalDay,
  message: string,
  requireComplete: boolean
): SignalDay {
  if (requireComplete) throw new Error(message);
  console.warn(`[Signal Engine] Groq enrichment skipped: ${message}`);
  return day;
}

function parseCuriosityResponse(value: string): Map<string, string> {
  const parsed = JSON.parse(value) as CuriosityResponse;
  const notes = new Map<string, string>();

  for (const note of parsed.notes ?? []) {
    if (typeof note.id !== 'string' || typeof note.curiosity !== 'string') continue;

    const curiosity = note.curiosity.replace(/\s+/g, ' ').trim();
    if (curiosity.length > 0 && curiosity.length <= 180) {
      notes.set(note.id, curiosity);
    }
  }

  return notes;
}

export async function enrichSignalCuriosity(
  day: SignalDay,
  { requireComplete = false }: SignalEnrichmentOptions = {}
): Promise<SignalDay> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return failOrFallback(day, 'GROQ_API_KEY is missing.', requireComplete);
  }

  const entries = day.nodes.map(({ id, title, description }) => ({
    id,
    title,
    description,
  }));

  try {
    const response = await fetch(GROQ_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        max_tokens: 500,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Write restrained curiosity cues for a daily personal collage. Use only facts in the supplied title and description. Do not add facts, labels, recommendations, or markdown. Return valid JSON only.',
          },
          {
            role: 'user',
            content: `For every entry, return {"notes":[{"id":"entry id","curiosity":"6-15 word cue"}]}. Keep each cue grounded in its entry. Entries: ${JSON.stringify(entries)}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      return failOrFallback(day, `Groq responded with ${response.status}.`, requireComplete);
    }

    const completion = (await response.json()) as GroqCompletion;
    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      return failOrFallback(day, 'Groq returned no message content.', requireComplete);
    }

    const notes = parseCuriosityResponse(content);
    const missingNotes = day.nodes.filter((node) => !notes.has(node.id));
    if (missingNotes.length > 0) {
      return failOrFallback(
        day,
        `Groq omitted curiosity cues for ${missingNotes.length} item(s).`,
        requireComplete
      );
    }

    return {
      ...day,
      nodes: day.nodes.map((node) => ({
        ...node,
        curiosity: notes.get(node.id),
      })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Groq error.';
    return failOrFallback(day, message, requireComplete);
  }
}
