# Resume Architecture

This document describes the implementation of the Resume Experience (Phase 5C).

## Canonical Content Path
- Data is stored in `src/content/resume.json`.
- This is the single source of truth for both the browser HTML resume and the generated PDF.

## Schema
- Validated via `resumeSchema` in `src/lib/schemas.ts`.
- Structured as: `identity`, `contact`, `experience`, `projects`, `skills`, `education`, `credentials`.

## Renderer Architecture
- **Browser Output**: `src/app/resume/page.tsx` renders the resume visually. It parses `resume.json` and uses semantic UI components inside `src/components/resume/`.
- **Isolated CSS**: The page uses a `.resume-page` scope, opting for a clean, typographic "light mode" / "paper" experience separate from the site's dark aesthetic.

## How to Update Content
- **Experience**: Add/edit objects in the `experience` array of `resume.json`.
- **Projects**: Add/edit objects in the `projects` array of `resume.json`. Ensure they match the schema (e.g., `details` is optional for supporting facts).
- **Skills**: Add/edit categories in the `skills` array.

## Print Behavior
- Styled using Tailwind's `print:` modifiers and standard `@page` CSS scoped closely to `.resume-page`.
- The print layout hides action controls (e.g., back, print, download buttons) using a `.resume-no-print` class.
- Optimized for a single US Letter page where content permits.

## PDF Generation
- We use a headless Puppeteer script: `scripts/generate-pdf.mjs`.
- Run `npm run resume:pdf` to generate the PDF.
- The script automatically handles starting a temporary local server (if needed), navigating to the `/resume` route, waiting for web fonts to load (`document.fonts.ready`), and generating `public/resume.pdf` accurately using the `@page` CSS layout.

## Factual Source of Truth Rules
- See `docs/RESUME_SOURCE_AUDIT.md` for editorial constraints and explicitly excluded/included projects.
