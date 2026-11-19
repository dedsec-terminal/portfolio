"use client";

import { Download, FileJson, FileText } from "lucide-react";
import Link from "next/link";

export function AgentEndpoints() {
  const linkCls = "inline-flex items-center gap-1.5 hover:text-foreground transition-colors";
  
  return (
    <nav aria-label="Resume formats" data-resume-actions className="mt-4 flex flex-wrap justify-center gap-6 text-[8.5pt] text-muted-foreground print:hidden">
      <Link href="/" className={linkCls}>Back to portfolio</Link>
      <Link href="/projects" className={linkCls}>Project case studies</Link>
      <a href="/resume.pdf" download="Swaraj_Singh_Resume.pdf" className={linkCls}>
        <Download size={14} aria-hidden />
        <span>Download PDF</span>
      </a>

      <Link href="/resume.json" className={linkCls} prefetch={false}>
        <FileJson size={14} aria-hidden />
        <span>JSON</span>
      </Link>
      
      <Link href="/resume.md" className={linkCls} prefetch={false}>
        <FileText size={14} aria-hidden />
        <span>Markdown</span>
      </Link>
    </nav>
  );
}
