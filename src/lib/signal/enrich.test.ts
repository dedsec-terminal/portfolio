import { afterEach, describe, expect, it, vi } from 'vitest';
import { curateSignalCandidates } from './enrich';
import { SIGNAL_SLOTS, type SignalItem } from './types';

const candidates: SignalItem[] = SIGNAL_SLOTS.map((slot) => ({
  id: `${slot}-candidate`,
  title: `${slot} title`,
  description: `${slot} description with enough detail for an editorial cue.`,
  source: 'Test source',
  category: 'Test',
  slot,
  tier: 'Curated',
}));

afterEach(() => {
  delete process.env.GROQ_API_KEY;
  vi.unstubAllGlobals();
});

describe('curateSignalCandidates', () => {
  it('uses the Groq strict-schema contract with reasoning disabled', async () => {
    process.env.GROQ_API_KEY = 'test-key';
    const response = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              selections: SIGNAL_SLOTS.map((slot) => ({
                slot,
                id: `${slot}-candidate`,
                curiosity: `A grounded curiosity cue for the ${slot} selection.`,
              })),
            }),
          },
        },
      ],
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => response });
    vi.stubGlobal('fetch', fetchMock);

    const selected = await curateSignalCandidates(candidates, {
      requireComplete: true,
    });
    const request = JSON.parse(String(fetchMock.mock.calls[0][1].body));

    expect(selected).toHaveLength(SIGNAL_SLOTS.length);
    expect(request).toMatchObject({
      temperature: 0.2,
      max_completion_tokens: 1_500,
      reasoning_effort: 'none',
      include_reasoning: false,
      response_format: { type: 'json_schema' },
    });
  });
});
