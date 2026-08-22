import type { ReactNode } from "react";
import { Globe2, Mail, Phone } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import type { Resume, Section as ResumeSection } from "@/lib/schemas";

const PAGE_GUTTER = "px-5 sm:px-[0.5in] print:px-[0.5in]";

/**
 * `print:w-[8.5in]` and `print:min-h-[11in]` are load-bearing: the oversized
 * sheet is what corrects WebKit's print scaling.
 */
export const shell = {
  mainClassName: "flex min-h-screen flex-col items-center bg-(--t-baseline-backdrop) px-3 py-6 print:block print:bg-white print:p-0 sm:px-6 md:px-8",
  articleClassName: `relative min-h-0 w-full max-w-[8.5in] rounded-sm bg-(--t-baseline-paper) py-6 text-[9pt] leading-[1.3] text-(--t-baseline-ink) shadow-md [font-family:var(--t-baseline-font)] [zoom:var(--resume-scale)] sm:py-[0.45in] print:min-h-[11in] print:w-[8.5in] print:max-w-[8.5in] print:rounded-none print:pt-[0.42in] print:pb-[0.2in] print:shadow-none print:[zoom:1] md:min-h-[11in] md:rounded-none`,
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

type SectionKind = "skills" | "projects" | "experiences" | "education";

function BulletList({ bullets, kind }: { bullets: string[]; kind: SectionKind }) {
  return (
    <ul className="list-disc space-y-[2.5pt] pl-[14pt]">
      {bullets.map((bullet, index) => (
        <li key={index} className="pl-[1pt] print:break-inside-avoid" style={{ color: `var(--t-baseline-${kind}-bullet)` }}>
          <span className="text-(--t-baseline-ink)">{renderRichText(bullet)}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionShell({ label, kind, children }: { label: string; kind: SectionKind; children: ReactNode }) {
  return (
    <section
      className={`grid grid-cols-1 gap-y-[4pt] border-t-[1.75pt] ${PAGE_GUTTER} mt-[10pt] pt-[6pt] md:grid-cols-[0.92in_minmax(0,1fr)] md:gap-x-[8pt] md:gap-y-0`}
      style={{ borderTopColor: `var(--t-baseline-${kind}-line)` }}>
      <h2 className="text-[9pt] font-bold uppercase leading-tight tracking-[0.05em]" style={{ color: `var(--t-baseline-${kind}-heading)` }}>
        {label}
      </h2>
      <div className="min-w-0">
        {children}
      </div>
    </section>
  );
}

function EntryHead({ title, organization, dateRange, metadata, link }: { title: string; organization?: string; dateRange?: string; metadata?: string; link?: { url: string; label: string } }) {
  const headline = organization ? `${title} at ${organization}` : title;

  return (
    <div className="flex items-baseline justify-between gap-x-4">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h3 className="text-[9.5pt] font-bold leading-tight text-(--t-baseline-heading)">{headline}</h3>
        {metadata && <p className="text-[7.75pt] leading-tight text-(--t-baseline-muted)">{metadata}</p>}
      </div>
      {link ? (
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="shrink-0 whitespace-nowrap text-[8.5pt] underline underline-offset-2 hover:text-(--t-baseline-heading)">
          {link.label}
        </a>
      ) : dateRange && <p className="shrink-0 whitespace-nowrap text-[8.5pt]">{dateRange}</p>}
    </div>
  );
}

function Entry({ title, organization, dateRange, summary, metadata, link, bullets, kind }: { title: string; organization?: string; dateRange?: string; summary?: string; metadata?: string; link?: { url: string; label: string }; bullets?: string[]; kind: SectionKind }) {
  return (
    <article className="space-y-[2.5pt] print:break-inside-avoid">
      <EntryHead title={title} organization={organization} dateRange={dateRange} metadata={metadata} link={link} />
      {summary && (
        <p className={kind === "experiences" ? "text-[8.5pt] leading-[1.3] text-(--t-baseline-muted)" : "leading-[1.4]"}>
          {summary}
        </p>
      )}
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
          <div className="space-y-[6pt]">
            {section.entries.map((entry, index) => <Entry key={index} {...entry} kind="projects" />)}
          </div>
        </SectionShell>
      );
    case "experiences":
      return (
        <SectionShell key={key} label={section.label} kind="experiences">
          <div className="space-y-[6pt]">
            {section.entries.map((entry, index) => <Entry key={index} {...entry} kind="experiences" />)}
          </div>
        </SectionShell>
      );
    case "education":
      return (
        <SectionShell key={key} label={section.label} kind="education">
          <div className="space-y-[6pt]">
            {section.entries.map((entry, index) => <Entry key={index} {...entry} kind="education" />)}
          </div>
        </SectionShell>
      );
  }

  section satisfies never;
}

function ResumeHeader({ header }: { header: Resume["header"] }) {
  const contactIcon = (label: string) => {
    if (label === "Portfolio") return <Globe2 aria-hidden size={11} strokeWidth={1.8} />;
    if (label === "GitHub") return <FaGithub aria-hidden size={11} />;
    if (label === "LinkedIn") return <FaLinkedin aria-hidden size={11} />;
    return <Phone aria-hidden size={11} strokeWidth={1.8} />;
  };

  return (
    <header className={`${PAGE_GUTTER} text-center`}>
      <h1 className="text-[23pt] font-bold leading-none text-(--t-baseline-heading)">{header.name}</h1>
      {header.subtitle && header.subtitle.length > 0 && (
        <div className="mt-[3pt] text-[9.5pt] leading-[1.3]">
          {header.subtitle.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
      <div className="mt-[5pt] flex flex-wrap justify-center gap-x-3 gap-y-1 text-[8.5pt]">
        <a href={`mailto:${header.contact.email}`} className="inline-flex items-center gap-1 hover:underline" aria-label="Email Swaraj Singh">
          <Mail aria-hidden size={11} strokeWidth={1.8} />
          {header.contact.email}
        </a>
        {(header.contact.links ?? []).map((link) => (
          <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline" aria-label={link.label}>
            {contactIcon(link.label)}
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
