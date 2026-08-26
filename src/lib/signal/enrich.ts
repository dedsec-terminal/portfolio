import type { SignalDay } from './types';

const GROQ_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-20b';

type GroqCompletion = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

type CuriosityResponse = {
  notes?: Array<{ id?: unknown; curiosity?: unknown }>;
};

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

export async function enrichSignalCuriosity(day: SignalDay): Promise<SignalDay> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return day;

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
      console.warn(`[Signal Engine] Groq enrichment skipped: ${response.status}`);
      return day;
    }

    const completion = (await response.json()) as GroqCompletion;
    const content = completion.choices?.[0]?.message?.content;
    if (!content) return day;

    const notes = parseCuriosityResponse(content);
    return {
      ...day,
      nodes: day.nodes.map((node) => ({
        ...node,
        curiosity: notes.get(node.id),
      })),
    };
  } catch (error) {
    console.warn('[Signal Engine] Groq enrichment skipped:', error);
    return day;
  }
}
