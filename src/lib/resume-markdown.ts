import type {
  EducationSection,
  ExperiencesSection,
  ProjectsSection,
  Resume,
  Section,
} from "@/lib/schemas";

export function resumeToMarkdown(resume: Resume): string {
  const summary = resume.header.subtitle.length
    ? joinBlocks("## Summary", resume.header.subtitle.join("  \n"))
    : "";
  return joinBlocks(renderHeader(resume.header), summary, ...resume.sections.map(renderSection)) + "\n";
}

function renderHeader(header: Resume["header"]): string {
  const lines: string[] = [`# ${header.name}`];

  const contactLines: string[] = [`<${header.contact.email}>`];
  for (const link of header.contact.links ?? []) {
    contactLines.push(`[${link.display ?? link.label}](${link.url})`);
  }
  lines.push("", contactLines.join("  \n"));

  return lines.join("\n");
}

function renderSection(section: Section): string {
  const head = `## ${section.label}`;
  switch (section.kind) {
    case "skills":
    case "contributions":
    case "credentials":
      return joinBlocks(head, bulletList(section.bullets));
    case "projects":
      return joinBlocks(head, ...section.entries.map(renderProjectEntry), section.summary ?? "");
    case "experiences":
      return joinBlocks(head, ...section.entries.map(renderExperienceEntry));
    case "education":
      return joinBlocks(head, ...section.entries.map(renderEducationEntry));
  }
}

function renderProjectEntry(entry: ProjectsSection["entries"][number]): string {
  const title = entry.sourceUrl ? `[${entry.title}](${entry.sourceUrl})` : entry.title;
  const link = entry.link ? `[${entry.link.label}](${entry.link.url})` : "";
  const metadata = entry.metadata ? `*${entry.metadata}*` : "";
  return joinBlocks(entryHead(title, entry.dateRange), metadata, link, bulletList(entry.bullets));
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
  const metadata = entry.metadata ? `*${entry.metadata}*` : "";
  return joinBlocks(head, entry.summary ?? "", entry.dateDetail ?? "", metadata, bulletList(entry.bullets ?? []));
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
