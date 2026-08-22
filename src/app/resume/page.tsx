import type { Metadata } from "next";
import { resumeSchema } from "@/lib/schemas";
import resumeData from "@/content/resume.json";
import { AgentEndpoints } from "@/components/resume/AgentEndpoints";
import { PageEdge } from "@/components/resume/PageEdge";
import { ResumeScaler } from "@/components/resume/ResumeScaler";
import { BaselineTemplate, shell } from "@/components/resume/BaselineTemplate";

export const metadata: Metadata = {
  title: "Resume",
  description: "Swaraj Singh's professional resume.",
  alternates: {
    types: {
      "application/json": "/resume.json",
      "text/markdown": "/resume.md",
    },
  },
};

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
    <div data-resume-theme="baseline" className={shell.mainClassName}>
      <ResumeScaler />
      <article className={shell.articleClassName}>
        {process.env.NODE_ENV === "development" && <PageEdge />}
        <BaselineTemplate resume={{ header, sections }} />
      </article>
      <AgentEndpoints />
    </div>
  );
}
