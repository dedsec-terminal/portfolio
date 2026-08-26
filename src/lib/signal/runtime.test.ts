import { describe, expect, it } from 'vitest';
import { resolveSignalRunOptions } from './runtime';

describe('resolveSignalRunOptions', () => {
  it('keeps scheduled generation immutable and Groq-optional', () => {
    expect(resolveSignalRunOptions({})).toEqual({
      isRepair: false,
      requireGroq: false,
      generatorVersion: 'v1.0.0',
    });
  });

  it('enables a verified manual repair only when explicitly requested', () => {
    expect(
      resolveSignalRunOptions({
        SIGNAL_REGENERATE: 'true',
        SIGNAL_REQUIRE_GROQ: 'true',
      })
    ).toEqual({
      isRepair: true,
      requireGroq: true,
      generatorVersion: 'v1.1.0',
    });
  });
});
