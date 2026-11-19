import { pageMetadata } from '@/lib/page-metadata';
import type { Metadata } from "next";
import { resumeSchema } from "@/lib/schemas";
import resumeData from "@/content/resume.json";
import { AgentEndpoints } from "@/components/resume/AgentEndpoints";
import { PageEdge } from "@/components/resume/PageEdge";
import { ResumeScaler } from "@/components/resume/ResumeScaler";
import { BaselineTemplate, shell } from "@/components/resume/BaselineTemplate";

export const metadata: Metadata = pageMetadata({
  title: "Resume",
  description:
    "Professional resume of Swaraj Singh, cybersecurity practitioner. Review experience in SOC analysis, GRC audit compliance, security tools, and certifications.",
  alternates: {
    canonical: "/resume",
    types: {
      "application/json": "/resume.json",
      "text/markdown": "/resume.md",
    },
  },
});

export default function ResumePage() {
  const parsed = resumeSchema.safeParse(resumeData);
  
  if (!parsed.success) {
    return (
      <main className="min-h-screen bg-red-50 p-8 font-mono text-sm text-red-900 dark:bg-red-950/50 dark:text-red-100">
        <h1 className="mb-4 text-lg font-bold">resume.json failed schema validation</h1>
        <pre className="whitespace-pre-wrap">{JSON.stringify(parsed.error.issues, null, 2)}</pre>
      </main>
    );
  }

  const { header, sections } = parsed.data;

  return (
    <main id="main-content" tabIndex={-1} data-resume-theme="baseline" className={shell.mainClassName}>
      <a href="#resume-content" className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:bg-background focus-visible:p-3 focus-visible:text-foreground print:hidden">Skip to resume</a>
      <ResumeScaler />
      <article id="resume-content" tabIndex={-1} className={shell.articleClassName}>
        {process.env.NODE_ENV === "development" && <PageEdge />}
        <BaselineTemplate resume={{ header, sections }} />
      </article>
      <AgentEndpoints />
    </main>
  );
}
