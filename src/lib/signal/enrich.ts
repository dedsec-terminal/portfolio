import {
  SIGNAL_SLOT_LABELS,
  SIGNAL_SLOTS,
  type SignalItem,
  type SignalSlot,
} from './types';

const GROQ_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

type GroqCompletion = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

type EditorialResponse = {
  selections?: Array<{ slot?: unknown; id?: unknown; curiosity?: unknown }>;
};

const EDITORIAL_RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: {
    name: 'signal_editorial_selection',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        selections: {
          type: 'array',
          minItems: SIGNAL_SLOTS.length,
          maxItems: SIGNAL_SLOTS.length,
          items: {
            type: 'object',
            properties: {
              slot: { type: 'string', enum: SIGNAL_SLOTS },
              id: { type: 'string' },
              curiosity: { type: 'string' },
            },
            required: ['slot', 'id', 'curiosity'],
            additionalProperties: false,
          },
        },
      },
      required: ['selections'],
      additionalProperties: false,
    },
  },
} as const;

export interface SignalEnrichmentOptions {
  requireComplete?: boolean;
}

function deterministicFallback(candidates: SignalItem[]): SignalItem[] {
  return SIGNAL_SLOTS.map((slot) => {
    const candidate = candidates.find((item) => item.slot === slot);
    if (!candidate) throw new Error(`Signal shortlist has no ${slot} candidate.`);
    return candidate;
  });
}

function failOrFallback(
  candidates: SignalItem[],
  message: string,
  requireComplete: boolean
): SignalItem[] {
  if (requireComplete) throw new Error(message);
  console.warn(`[Signal Engine] Groq editorial pass skipped: ${message}`);
  return deterministicFallback(candidates);
}

function parseEditorialResponse(
  value: string,
  candidates: SignalItem[]
): SignalItem[] | null {
  const parsed = JSON.parse(value) as EditorialResponse;
  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const selected = new Map<SignalSlot, SignalItem>();

  for (const choice of parsed.selections ?? []) {
    if (
      typeof choice.slot !== 'string' ||
      !SIGNAL_SLOTS.includes(choice.slot as SignalSlot) ||
      typeof choice.id !== 'string' ||
      typeof choice.curiosity !== 'string'
    ) {
      continue;
    }

    const slot = choice.slot as SignalSlot;
    const candidate = candidateById.get(choice.id);
    const curiosity = choice.curiosity.replace(/\s+/g, ' ').trim();
    if (
      !candidate ||
      candidate.slot !== slot ||
      selected.has(slot) ||
      curiosity.length < 12 ||
      curiosity.length > 180
    ) {
      continue;
    }
    selected.set(slot, { ...candidate, curiosity });
  }

  return selected.size === SIGNAL_SLOTS.length
    ? SIGNAL_SLOTS.map((slot) => selected.get(slot)!)
    : null;
}

async function groqErrorMessage(response: Response): Promise<string> {
  const fallback = `Groq responded with ${response.status}.`;
  try {
    const body = (await response.json()) as { error?: { code?: unknown } };
    const code = body.error?.code;
    return typeof code === 'string' && code.length <= 80 ? `${fallback} (${code})` : fallback;
  } catch {
    return fallback;
  }
}

export async function curateSignalCandidates(
  candidates: SignalItem[],
  { requireComplete = false }: SignalEnrichmentOptions = {}
): Promise<SignalItem[]> {
  deterministicFallback(candidates);

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return failOrFallback(candidates, 'GROQ_API_KEY is missing.', requireComplete);
  }

  const entries = candidates.map(({ id, slot, title, description, source, category, timestamp }) => ({
    id,
    slot,
    title,
    description: description.replace(/\s+/g, ' ').trim().slice(0, 520),
    source,
    category,
    timestamp,
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
        temperature: 0.2,
        max_completion_tokens: 1_500,
        reasoning_effort: 'medium',
        include_reasoning: false,
        response_format: EDITORIAL_RESPONSE_FORMAT,
        messages: [
          {
            role: 'system',
            content:
              'You edit a high-quality daily curiosity page. Select only supplied candidate IDs. Every factual word in a cue must be directly supported by that candidate title, description, source, category, or timestamp. Never add dates, rankings, sales status, reception, credentials, plot facts, or technical claims that are not explicitly supplied. Favor specificity, substance, primary or technical sources, and genuine curiosity over popularity. For the frontier slot, prefer timely cybersecurity or significant AI research/model news when present, but reject sensational framing when a more substantive candidate exists. Avoid hype, repetition, generic praise, invented context, and markdown.',
          },
          {
            role: 'user',
            content: `Choose exactly one candidate for each required slot (${SIGNAL_SLOTS.map((slot) => `${slot}: ${SIGNAL_SLOT_LABELS[slot]}`).join(', ')}). For every choice, write a restrained 8-18 word curiosity cue using only the supplied evidence. Before returning, silently verify every claim against that candidate and remove anything unsupported. Candidates: ${JSON.stringify(entries)}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      return failOrFallback(candidates, await groqErrorMessage(response), requireComplete);
    }

    const completion = (await response.json()) as GroqCompletion;
    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      return failOrFallback(candidates, 'Groq returned no message content.', requireComplete);
    }

    const selected = parseEditorialResponse(content, candidates);
    return selected ?? failOrFallback(
      candidates,
      'Groq returned incomplete or mismatched editorial selections.',
      requireComplete
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Groq error.';
    return failOrFallback(candidates, message, requireComplete);
  }
}
