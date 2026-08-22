import { NextResponse } from "next/server";
import resumeData from "@/content/resume.json";
import { resumeSchema } from "@/lib/schemas";

export async function GET() {
  const parsed = resumeSchema.safeParse(resumeData);
  
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid resume data" }, { status: 500 });
  }

  return new NextResponse(JSON.stringify(parsed.data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
