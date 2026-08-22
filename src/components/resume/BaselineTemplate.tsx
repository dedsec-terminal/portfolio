import type { ReactNode } from "react";
import type { Resume, Section as ResumeSection } from "@/lib/schemas";

const PAGE_GUTTER = "px-5 sm:px-[0.6in] print:px-[0.6in]";

/**
 * `print:w-[8.5in]` and `print:min-h-[11in]` are load-bearing: the oversized
 * sheet is what corrects WebKit's print scaling.
 */
export const shell = {
  mainClassName: "flex min-h-screen flex-col items-center bg-(--t-baseline-backdrop) px-3 py-6 print:block print:bg-white print:p-0 sm:px-6 md:px-8",
  articleClassName: `relative min-h-0 w-full max-w-[8.5in] rounded-sm bg-(--t-baseline-paper) pt-[0.2in] pb-[0.3in] text-[8.5pt] leading-[1.4] text-(--t-baseline-ink) shadow-md [font-family:var(--t-baseline-font)] [zoom:var(--resume-scale)] sm:py-[0.45in] print:min-h-[11in] print:w-[8.5in] print:max-w-[8.5in] print:rounded-none print:py-[0.42in] print:shadow-none print:[zoom:1] md:min-h-[11in] md:rounded-none`,
} as const;

function renderRichText(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-semibold">
        {part}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

function BulletList({ bullets, kind }: { bullets: string[], kind: "skills" | "projects" | "experiences" | "education" }) {
  return (
    <ul className="space-y-[2.5pt] pl-[2pt]">
      {bullets.map((bullet, index) => (
        <li key={index} className="grid grid-cols-[14px_1fr] items-start gap-x-1.5 print:break-inside-avoid">
          <span aria-hidden="true" className="select-none pt-[0.1em] text-center text-[7.5pt] leading-[1.4]" style={{ color: `var(--t-baseline-${kind}-bullet)` }}>•</span>
          <span className="min-w-0 leading-[1.4]">{renderRichText(bullet)}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionShell({ label, kind, children }: { label: string; kind: "skills" | "projects" | "experiences" | "education"; children: ReactNode }) {
  return (
    <section className={`border-t-[1.75pt] ${PAGE_GUTTER} mt-[8pt] pt-[8pt] last:pb-0`} style={{ borderTopColor: `var(--t-baseline-${kind}-line)` }}>
      <h2 className="mb-[4pt] text-[9pt] font-bold uppercase tracking-[0.05em] leading-tight" style={{ color: `var(--t-baseline-${kind}-heading)` }}>{label}</h2>
      {children}
    </section>
  );
}

function EntryHead({ title, organization, dateRange }: { title: string; organization?: string; dateRange?: string }) {
  return (
    <div className="space-y-[1pt]">
      <div className="flex items-baseline justify-between gap-x-4">
        <h3 className="text-[9.5pt] font-bold leading-tight text-(--t-baseline-heading)">{title}</h3>
        {dateRange && <p className="shrink-0 whitespace-nowrap text-[8.5pt] font-medium">{dateRange}</p>}
      </div>
      {organization && <p className="text-[9pt] italic">{organization}</p>}
    </div>
  );
}

function Entry({ title, organization, dateRange, summary, bullets, kind }: { title: string; organization?: string; dateRange?: string; summary?: string; bullets?: string[]; kind: "skills" | "projects" | "experiences" | "education" }) {
  return (
    <article className="space-y-[2.5pt] print:break-inside-avoid">
      <EntryHead title={title} organization={organization} dateRange={dateRange} />
      {summary && <p className="leading-[1.4]">{summary}</p>}
      {bullets && bullets.length > 0 && <BulletList bullets={bullets} kind={kind} />}
    </article>
  );
}

function renderSection(section: ResumeSection, key: number) {
  switch (section.kind) {
    case "skills":
      return (
        <SectionShell key={key} label={section.label} kind="skills">
          <BulletList bullets={section.bullets} kind="skills" />
        </SectionShell>
      );
    case "projects":
      return (
        <SectionShell key={key} label={section.label} kind="projects">
          <div className="space-y-[5pt]">
            {section.entries.map((entry, index) => <Entry key={index} {...entry} kind="projects" />)}
          </div>
        </SectionShell>
      );
    case "experiences":
      return (
        <SectionShell key={key} label={section.label} kind="experiences">
          <div className="space-y-[5pt]">
            {section.entries.map((entry, index) => <Entry key={index} {...entry} kind="experiences" />)}
          </div>
        </SectionShell>
      );
    case "education":
      return (
        <SectionShell key={key} label={section.label} kind="education">
          <div className="space-y-[5pt]">
            {section.entries.map((entry, index) => <Entry key={index} {...entry} kind="education" />)}
          </div>
        </SectionShell>
      );
  }

  section satisfies never;
}

function ResumeHeader({ header }: { header: Resume["header"] }) {
  return (
    <header className={`${PAGE_GUTTER} text-center pb-[6pt]`}>
      <h1 className="text-[23pt] font-bold leading-none text-(--t-baseline-heading)">{header.name}</h1>
      {header.subtitle && header.subtitle.length > 0 && (
        <div className="mt-[3pt] text-[9.5pt] leading-[1.3]">
          {header.subtitle.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
      <div className="mt-[4pt] flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[8.5pt]">
        <a href={`mailto:${header.contact.email}`} className="hover:underline">
          {header.contact.email}
        </a>
        {(header.contact.links ?? []).map((link) => (
          <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {link.label}
          </a>
        ))}
      </div>
    </header>
  );
}

export function BaselineTemplate({ resume }: { resume: Resume }) {
  return (
    <>
      <ResumeHeader header={resume.header} />
      {resume.sections.map(renderSection)}
    </>
  );
}
