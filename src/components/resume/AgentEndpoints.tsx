"use client";

import { Download, FileJson, FileText } from "lucide-react";
import Link from "next/link";

export function AgentEndpoints() {
  const linkCls = "inline-flex items-center gap-1.5 hover:text-foreground transition-colors";
  
  return (
    <footer data-resume-actions className="mt-6 flex flex-wrap justify-center gap-6 pb-12 text-[8.5pt] text-muted-foreground print:hidden">
      <Link href="/resume.json" className={linkCls} prefetch={false}>
        <FileJson size={14} />
        <span>JSON</span>
      </Link>
      
      <Link href="/resume.md" className={linkCls} prefetch={false}>
        <FileText size={14} />
        <span>Markdown</span>
      </Link>
      
      <a href="/resume.pdf" download="Swaraj_Singh_Resume.pdf" className={linkCls}>
        <Download size={14} />
        <span>PDF</span>
      </a>
    </footer>
  );
}
