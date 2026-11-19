import type { ReactNode } from "react";
import { Globe2, Mail, Phone } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import type { Resume, Section as ResumeSection } from "@/lib/schemas";

const PAGE_GUTTER = "px-5 sm:px-[0.5in] print:px-[0.28in]";
const ENTRY_SPACING = "space-y-[6pt] print:space-y-[3.5pt]";
const textLinkClassName = "underline underline-offset-2 hover:text-(--t-baseline-heading)";

/**
 * `print:w-[8.5in]` and `print:min-h-[11in]` are load-bearing: the oversized
 * sheet is what corrects WebKit's print scaling.
 */
export const shell = {
  mainClassName: "flex min-h-screen flex-col items-center bg-(--t-baseline-backdrop) px-3 py-6 print:block print:p-0 sm:px-6 md:px-8",
  articleClassName: `relative min-h-0 w-full max-w-[8.5in] rounded-sm bg-(--t-baseline-paper) py-6 text-[9pt] leading-[1.3] text-(--t-baseline-ink) shadow-md [font-family:var(--t-baseline-font)] [zoom:var(--resume-scale)] sm:py-[0.45in] print:min-h-[11in] print:w-[8.5in] print:max-w-[8.5in] print:rounded-none print:pt-[0.27in] print:pb-[0.17in] print:leading-[1.16] print:shadow-none print:[zoom:1] md:min-h-[11in] md:rounded-none`,
} as const;

function renderRichText(text: string) {
  return text.split(/(\*\*.+?\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g).map((part, index) => {
    if (index % 2 === 0) return part;
    if (part.startsWith("**")) {
      return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
    }

    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    return link ? (
      <a key={index} href={link[2]} className={textLinkClassName}>{link[1]}</a>
    ) : part;
  });
}

type SectionKind = "skills" | "projects" | "experiences" | "education";

function BulletList({ bullets, kind }: { bullets: string[]; kind: SectionKind }) {
  return (
    <ul className="list-disc space-y-[2.5pt] pl-[14pt] print:space-y-[1.25pt] print:pl-[10pt]">
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
      className={`grid grid-cols-1 gap-y-[4pt] border-t-[1.75pt] ${PAGE_GUTTER} mt-[10pt] pt-[6pt] md:grid-cols-[1in_minmax(0,1fr)] md:gap-x-[8pt] md:gap-y-0 print:mt-[6pt] print:grid-cols-[0.98in_minmax(0,1fr)] print:gap-x-[8pt] print:gap-y-0 print:pt-[4pt]`}
      style={{ borderTopColor: `var(--t-baseline-${kind}-line)` }}>
      <h2 className="text-[9pt] font-bold uppercase leading-tight tracking-[0.05em] print:text-[8pt]" style={{ color: `var(--t-baseline-${kind}-heading)` }}>
        {label}
      </h2>
      <div className="min-w-0">
        {children}
      </div>
    </section>
  );
}

type EntryHeading = {
  title: string;
  organization?: string;
  dateRange?: string;
  metadata?: string;
  sourceUrl?: string;
  link?: { url: string; label: string };
};

function EntryHead({ title, organization, dateRange, metadata, sourceUrl, link }: EntryHeading) {
  const headline = organization ? `${title} at ${organization}` : title;

  return (
    <div className="flex items-baseline justify-between gap-x-4">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h3 className="text-[9.5pt] font-bold leading-tight text-(--t-baseline-heading)">
          {sourceUrl ? <a href={sourceUrl} className={textLinkClassName}>{headline}</a> : headline}
        </h3>
        {metadata && <p className="text-[7.75pt] leading-tight text-(--t-baseline-muted)">{metadata}</p>}
      </div>
      {link ? (
        <a href={link.url} target="_blank" rel="noopener noreferrer" className={`shrink-0 whitespace-nowrap text-[8.5pt] ${textLinkClassName}`}>
          {link.label}
        </a>
      ) : dateRange && <p className="shrink-0 whitespace-nowrap text-[8.5pt]">{dateRange}</p>}
    </div>
  );
}

function Entry({ summary, bullets, kind, ...heading }: EntryHeading & { summary?: string; bullets?: string[]; kind: SectionKind }) {
  return (
    <article className="space-y-[2.5pt] print:break-inside-avoid print:space-y-[1pt]">
      <EntryHead {...heading} />
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
    case "contributions":
    case "credentials": {
      const kind = section.kind === "contributions" ? "experiences" : section.kind === "credentials" ? "education" : "skills";
      return (
        <SectionShell key={key} label={section.label} kind={kind}>
          <BulletList bullets={section.bullets} kind={kind} />
        </SectionShell>
      );
    }
    case "projects":
      return (
        <SectionShell key={key} label={section.label} kind="projects">
          <div className={ENTRY_SPACING}>
            {section.entries.map((entry, index) => <Entry key={index} {...entry} kind="projects" />)}
            {section.summary && <p>{renderRichText(section.summary)}</p>}
          </div>
        </SectionShell>
      );
    case "experiences":
      return (
        <SectionShell key={key} label={section.label} kind="experiences">
          <div className={ENTRY_SPACING}>
            {section.entries.map((entry, index) => <Entry key={index} {...entry} kind="experiences" />)}
          </div>
        </SectionShell>
      );
    case "education":
      return (
        <SectionShell key={key} label={section.label} kind="education">
          <div className={ENTRY_SPACING}>
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
      <div className="mt-[5pt] flex flex-wrap justify-center gap-x-3 gap-y-1 text-[8.5pt]">
        <a href={`mailto:${header.contact.email}`} className="inline-flex items-center gap-1 hover:underline" aria-label="Email Swaraj Singh">
          <Mail aria-hidden size={11} strokeWidth={1.8} />
          {header.contact.email}
        </a>
        {(header.contact.links ?? []).map((link) => (
          <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline" aria-label={link.label}>
            {contactIcon(link.label)}
            {link.display ?? link.label}
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
      {resume.header.subtitle.length > 0 && (
        <SectionShell label="Summary" kind="experiences">
          <div className="space-y-[2.5pt]">
            {resume.header.subtitle.map((line) => <p key={line}>{line}</p>)}
          </div>
        </SectionShell>
      )}
      {resume.sections.map(renderSection)}
    </>
  );
}
