import { describe, it, expect } from 'vitest';
import { resumeSchema, type Resume } from './schemas';
import fs from 'fs';
import path from 'path';

describe('Resume Data Canonical Integrity', () => {
  const getResumeData = (): Resume => {
    const filePath = path.join(process.cwd(), 'src/content/resume.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return resumeSchema.parse(JSON.parse(fileContent));
  };

  it('validates against the strict resumeSchema', () => {
    const raw = getResumeData();
    const result = resumeSchema.safeParse(raw);
    expect(result.success).toBe(true);
  });

  it('contains exactly 3 experience entries', () => {
    const raw = getResumeData();
    const expSection = raw.sections.find(
      (section) => section.kind === 'experiences'
    );
    if (!expSection) throw new Error('Experience section is missing');
    expect(expSection.entries.length).toBe(3);
  });

  it('contains exactly 4 selected project entries in specific order', () => {
    const raw = getResumeData();
    const projSection = raw.sections.find(
      (section) => section.kind === 'projects'
    );
    if (!projSection) throw new Error('Projects section is missing');
    expect(projSection.entries.length).toBe(4);

    expect(projSection.entries[0].title).toContain('Faultplane');
    expect(projSection.entries[1].title).toContain('LedgerCast');
    expect(projSection.entries[2].title).toContain('Greyfield');
    expect(projSection.entries[3].title).toContain(
      'Agentic IaC Vulnerability Detection & Remediation'
    );
  });

  it('explicitly excludes rejected projects (NIDS, Ghostwire)', () => {
    const raw = getResumeData();
    const projSection = raw.sections.find(
      (section) => section.kind === 'projects'
    );
    if (!projSection) throw new Error('Projects section is missing');
    const allProjectTitles = projSection.entries.map((entry) =>
      entry.title.toLowerCase()
    );

    expect(allProjectTitles.some((t: string) => t.includes('ghostwire'))).toBe(
      false
    );
    expect(
      allProjectTitles.some((t: string) =>
        t.includes('network intrusion detection system')
      )
    ).toBe(false);
    expect(allProjectTitles.some((t: string) => t.includes('nids'))).toBe(
      false
    );
  });

  it('includes required explicitly approved skills', () => {
    const raw = getResumeData();
    const skillsSection = raw.sections.find(
      (section) => section.kind === 'skills'
    );
    if (!skillsSection) throw new Error('Skills section is missing');
    const allSkillsStr = skillsSection.bullets.join(' ');

    expect(allSkillsStr).toContain('SentinelOne');
    expect(allSkillsStr).toContain('ServiceNow GRC / IRM');
  });
});
