# Content Model Specification & Checklist

This document outlines the complete content architecture, schema specifications, and implementation tracking for all markdown/MDX and JSON data used across the portfolio website.

## Content Model Verification Checklist

### 1. Professional Content
- [x] **Projects Schema (`src/content/professional/projects/`)**
  - [x] Schema defined via Zod (`projectSchema` in `src/lib/schemas.ts`)
  - [x] Sample MDX fixture created (`__sample-project.mdx`)
  - [x] Homepage component integration (`ProjectsGrid.tsx`)
  - [x] Validation tests passing in Vitest (`src/lib/mdx.test.ts`)
- [x] **Writeups Schema (`src/content/professional/writeups/`)**
  - [x] Schema defined via Zod (`writeupSchema` in `src/lib/schemas.ts`)
  - [x] CTF and security challenge fixtures created (`__sample-writeup.mdx`, `__sample-htb-web.mdx`, `__sample-ctf-crypto.mdx`)
  - [x] Homepage list component integration (`WriteupRow.tsx`)
  - [x] Frontmatter parsing & category tagging verified
- [x] **Blog Schema (`src/content/professional/blog/`)**
  - [x] Schema defined via Zod (`blogSchema` in `src/lib/schemas.ts`)
  - [x] Editorial post fixtures created (`__sample-blog.mdx`, `__sample-blog-2.mdx`)
  - [x] Homepage teaser component integration (`BlogTeaser.tsx`)
  - [x] Excerpt extraction and date formatting verified

---

### 2. Personal Content
- [x] **Journal Schema (`src/content/personal/journal/`)**
  - [x] Schema defined via Zod (`journalSchema` in `src/lib/schemas.ts`)
  - [x] Directory structure initialized
  - [x] Mood and date frontmatter attributes specified
- [x] **Art Schema (`src/content/personal/art/`)**
  - [x] Schema defined via Zod (`artSchema` in `src/lib/schemas.ts`)
  - [x] Visual preview component integrated (`ArtPreview.tsx`)
  - [x] Artwork title, description, and image path fields defined

---

### 3. Structured Data Models (JSON)
- [x] **The Signal (`src/content/signal/history/YYYY-MM-DD.json`)**
  - [x] Schema defined via Zod (`signalDaySchema` in `src/lib/schemas.ts`)
  - [x] 3-tier discovery model (Personal, Curated, Chaotic) specified
  - [x] Homepage visual constellation shell (`SignalShell.tsx`)
  - [x] Reduced-motion compliant SVG node rendering
- [x] **Resume (`src/content/resume.json`)**
  - [x] Schema defined & sample resume data created (`resume.json`)
  - [x] Header identity & email connector integration (`TopNav.tsx`)
  - [x] Social links & professional summary integration (`Hero.tsx`)

---

## Detailed Schema Definitions

### Projects
- **Location**: `src/content/professional/projects/`
- **Format**: MDX
- **Fields**:
  - `title` (string, required): The project title
  - `date` (string, YYYY-MM-DD, required): Date of completion or launch
  - `description` (string, required): Short summary
  - `tags` (array of strings, required): Technologies or concepts
  - `url` (string, optional): External live URL
  - `github` (string, optional): Source code URL

### Writeups
- **Location**: `src/content/professional/writeups/`
- **Format**: MDX
- **Fields**:
  - `title` (string, required): Challenge/machine name
  - `date` (string, YYYY-MM-DD, required): Date published
  - `description` (string, required): Vulnerability or walkthrough summary
  - `tags` (array of strings, required): Categories (pwn, web, crypto, etc.)
  - `event` (string, optional): CTF name or platform

### Blog
- **Location**: `src/content/professional/blog/`
- **Format**: MDX
- **Fields**:
  - `title` (string, required): Post title
  - `date` (string, YYYY-MM-DD, required): Publication date
  - `description` (string, required): Post excerpt
  - `tags` (array of strings, required): Topics covered

### Journal
- **Location**: `src/content/personal/journal/`
- **Format**: MDX
- **Fields**:
  - `title` (string, required): Entry title
  - `date` (string, YYYY-MM-DD, required): Entry date
  - `mood` (string, optional): Emotional context

### Art
- **Location**: `src/content/personal/art/`
- **Format**: MDX
- **Fields**:
  - `title` (string, required): Piece title
  - `date` (string, YYYY-MM-DD, required): Creation date
  - `description` (string, required): Medium/concept summary
  - `image` (string, required): Asset path

### The Signal (JSON)
- **Location**: `src/content/signal/history/YYYY-MM-DD.json`
- **Format**: JSON
- **Schema**:
  ```json
  {
    "date": "YYYY-MM-DD",
    "discoveries": [
      {
        "tier": "PERSONAL | CURATED | CHAOTIC",
        "title": "Item title",
        "description": "Short explanation",
        "url": "Optional URL",
        "category": "Category name"
      }
    ]
  }
  ```

### Resume (JSON)
- **Location**: `src/content/resume.json`
- **Format**: JSON
- **Schema**: Standard JSON resume format (`basics`, `work`, `education`, `skills`).
