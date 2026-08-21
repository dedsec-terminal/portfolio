import { expect, test, describe } from 'vitest';
import { parseContent } from './mdx';
import { projectSchema, writeupSchema } from './schemas';
import path from 'path';

describe('MDX Parser and Validator', () => {
  test('should parse and validate project markdown correctly', () => {
    const dir = path.join(
      process.cwd(),
      'src',
      'content',
      'professional',
      'projects'
    );
    const parsed = parseContent(dir, projectSchema);
    expect(parsed).toBeInstanceOf(Array);
    // At least one sample fixture must be present
    expect(parsed.length).toBeGreaterThan(0);
    // All parsed projects must have required fields
    parsed.forEach((project) => {
      expect(typeof project.title).toBe('string');
      expect(typeof project.date).toBe('string');
      expect(typeof project.description).toBe('string');
      expect(Array.isArray(project.tags)).toBe(true);
      expect(typeof project.slug).toBe('string');
    });
    // Sample fixture must use the __ prefix convention
    expect(parsed[0].slug).toMatch(/^__/);
  });

  test('should parse and validate writeup markdown correctly', () => {
    const dir = path.join(
      process.cwd(),
      'src',
      'content',
      'professional',
      'writeups'
    );
    const parsed = parseContent(dir, writeupSchema);
    expect(parsed).toBeInstanceOf(Array);
    expect(parsed.length).toBeGreaterThan(0);
    // All parsed writeups must have required fields
    parsed.forEach((writeup) => {
      expect(typeof writeup.title).toBe('string');
      expect(typeof writeup.date).toBe('string');
      expect(Array.isArray(writeup.tags)).toBe(true);
    });
    // Sample fixtures must use the __ prefix convention
    expect(parsed[0].slug).toMatch(/^__/);
  });
});
