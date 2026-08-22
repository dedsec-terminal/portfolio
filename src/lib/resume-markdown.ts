import type {
  EducationSection,
  ExperiencesSection,
  ProjectsSection,
  Resume,
  Section,
  SkillsSection,
} from "@/lib/schemas";

export function resumeToMarkdown(resume: Resume): string {
  const blocks = [renderHeader(resume.header), ...resume.sections.map(renderSection)];
  return blocks.join("\n\n") + "\n";
}

function renderHeader(header: Resume["header"]): string {
  const lines: string[] = [`# ${header.name}`];

  if (header.subtitle.length > 0) {
    lines.push("", header.subtitle.join("  \n"));
  }

  const contactLines: string[] = [`<${header.contact.email}>`];
  for (const link of header.contact.links ?? []) {
    contactLines.push(`[${link.label}](${link.url})`);
  }
  lines.push("", contactLines.join("  \n"));

  return lines.join("\n");
}

function renderSection(section: Section): string {
  const head = `## ${section.label}`;
  switch (section.kind) {
    case "skills":
      return joinBlocks(head, renderSkills(section));
    case "projects":
      return joinBlocks(head, ...section.entries.map(renderProjectEntry));
    case "experiences":
      return joinBlocks(head, ...section.entries.map(renderExperienceEntry));
    case "education":
      return joinBlocks(head, ...section.entries.map(renderEducationEntry));
  }
}

function renderSkills(section: SkillsSection): string {
  return bulletList(section.bullets);
}

function renderProjectEntry(entry: ProjectsSection["entries"][number]): string {
  return joinBlocks(entryHead(entry.title, entry.dateRange), bulletList(entry.bullets));
}

function renderExperienceEntry(entry: ExperiencesSection["entries"][number]): string {
  const headline = entry.organization ? `${entry.title} at ${entry.organization}` : entry.title;
  const head = entryHead(headline, entry.dateRange);

  const body: string[] = [];
  if (entry.summary) body.push(entry.summary);
  if (entry.bullets.length > 0) body.push(bulletList(entry.bullets));

  return body.length > 0 ? joinBlocks(head, ...body) : head;
}

function renderEducationEntry(entry: EducationSection["entries"][number]): string {
  const head = entryHead(entry.title, entry.dateRange);
  return entry.bullets && entry.bullets.length > 0 ? joinBlocks(head, bulletList(entry.bullets)) : head;
}

function entryHead(title: string, dateRange?: string): string {
  return dateRange ? `### ${title}\n\n*${dateRange}*` : `### ${title}`;
}

function bulletList(bullets: string[]): string {
  return bullets.map((bullet) => `- ${bullet}`).join("\n");
}

function joinBlocks(...blocks: string[]): string {
  return blocks.filter((block) => block.length > 0).join("\n\n");
}
