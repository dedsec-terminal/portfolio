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
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0].title).toBe('Fictional Project');
    expect(parsed[0].slug).toBe('fictional-project');
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
    expect(parsed[0].title).toBe('Sample Writeup');
  });
});
