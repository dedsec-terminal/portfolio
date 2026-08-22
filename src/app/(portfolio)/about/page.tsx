import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, FileText, Mail } from 'lucide-react';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About Swaraj Singh, a cybersecurity practitioner focused on security operations, governance, and security research.',
};

const focusAreas = [
  {
    number: '01',
    title: 'Security operations',
    description:
      'Threat hunting, alert triage, incident response, and translating technical findings into useful escalation context.',
  },
  {
    number: '02',
    title: 'Governance and risk',
    description:
      'Practical policy, control mapping, audit support, and risk documentation grounded in how systems are actually operated.',
  },
  {
    number: '03',
    title: 'Security engineering',
    description:
      'Small, reusable tools that make vulnerability research, evidence collection, and remediation workflows easier to repeat.',
  },
] as const;

const toolkit = [
  'MITRE ATT&CK',
  'Microsoft Sentinel',
  'Splunk',
  'NIST CSF 2.0',
  'ISO 27001',
  'Python',
  'PowerShell',
  'Terraform',
  'Docker',
  'Checkov',
] as const;

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
      <article className="glass-surface overflow-hidden rounded-2xl">
        <header className="grid gap-10 border-b border-border/30 px-6 py-14 md:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)] md:px-12 md:py-20">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
              About
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-medium tracking-tight text-foreground sm:text-5xl md:text-6xl">
              I work where security operations, governance, and engineering
              meet.
            </h1>
          </div>

          <div className="flex flex-col justify-end gap-5 text-sm leading-7 text-muted">
            <p>
              I&apos;m Swaraj Singh, a cybersecurity practitioner interested in
              making security work clearer, more repeatable, and easier to act
              on.
            </p>
            <p>
              My current work spans threat investigation, risk and compliance
              programmes, and automation for security teams.
            </p>
          </div>
        </header>

        <section
          aria-labelledby="focus-heading"
          className="px-6 py-14 md:px-12 md:py-16"
        >
          <div className="grid gap-8 md:grid-cols-[0.45fr_1.55fr]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
                Current direction
              </p>
              <h2 id="focus-heading" className="mt-3 text-2xl text-foreground">
                Areas of focus
              </h2>
            </div>

            <ol className="divide-y divide-border/30 border-y border-border/30">
              {focusAreas.map((area) => (
                <li
                  key={area.number}
                  className="grid gap-3 py-7 sm:grid-cols-[3rem_1fr]"
                >
                  <span className="font-mono text-[10px] tracking-wider text-subtle">
                    {area.number}
                  </span>
                  <div>
                    <h3 className="text-base text-foreground">{area.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
                      {area.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="grid border-t border-border/30 md:grid-cols-2">
          <div className="border-b border-border/30 px-6 py-12 md:border-b-0 md:border-r md:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
              Toolkit
            </p>
            <ul className="mt-6 flex list-none flex-wrap gap-2 p-0">
              {toolkit.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-border/40 bg-black/20 px-3 py-1.5 font-mono text-[10px] tracking-wide text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="px-6 py-12 md:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
              Elsewhere
            </p>
            <div className="mt-6 flex flex-col items-start gap-4">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
              >
                Selected projects
                <ArrowUpRight
                  className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <a
                href="/resume"
                className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
              >
                <FileText className="size-3.5" aria-hidden="true" />
                Resume
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
              >
                <Mail className="size-3.5" aria-hidden="true" />
                {siteConfig.email}
              </a>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
