import { describe, expect, it } from 'vitest';
import { getSignalDate, resolveSignalRunOptions } from './runtime';

describe('resolveSignalRunOptions', () => {
  it('keeps scheduled generation immutable and Groq-optional', () => {
    expect(resolveSignalRunOptions({})).toEqual({
      isRepair: false,
      requireGroq: false,
      generatorVersion: 'v2.0.0',
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
      generatorVersion: 'v2.0.0',
    });
  });

  it('publishes against the configured editorial timezone', () => {
    const boundary = new Date('2026-08-30T18:35:00.000Z');
    expect(getSignalDate(boundary, 'Asia/Kolkata')).toBe('2026-08-31');
    expect(getSignalDate(boundary, 'UTC')).toBe('2026-08-30');
  });
});
