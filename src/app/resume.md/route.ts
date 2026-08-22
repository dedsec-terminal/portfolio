import { NextResponse } from "next/server";
import resumeData from "@/content/resume.json";
import { resumeSchema } from "@/lib/schemas";
import { resumeToMarkdown } from "@/lib/resume-markdown";

export async function GET() {
  const parsed = resumeSchema.safeParse(resumeData);
  
  if (!parsed.success) {
    return new NextResponse("Invalid resume data", { status: 500 });
  }

  const markdown = resumeToMarkdown(parsed.data);

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
