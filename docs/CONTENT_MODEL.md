# Content Model

This document outlines the content architecture and frontmatter schemas for all markdown/MDX and JSON data used in the personal website.

## 1. Professional Content

### Projects

Located in: `src/content/professional/projects/`
Format: MDX
Frontmatter Schema:

- `title` (string): The project title.
- `date` (string, YYYY-MM-DD): The date of completion or launch.
- `description` (string): A short summary.
- `tags` (array of strings): Technologies or concepts used.
- `url` (string, optional): External link to the project.
- `github` (string, optional): Link to source code.

### Writeups

Located in: `src/content/professional/writeups/`
Format: MDX
Frontmatter Schema:

- `title` (string): Writeup title (e.g., CTF challenge name).
- `date` (string, YYYY-MM-DD): Date of publication.
- `description` (string): Brief summary of the vulnerability or challenge.
- `tags` (array of strings): Categories (e.g., pwn, web, crypto).
- `event` (string, optional): Name of the CTF or event.

### Blog

Located in: `src/content/professional/blog/`
Format: MDX
Frontmatter Schema:

- `title` (string): Post title.
- `date` (string, YYYY-MM-DD): Date of publication.
- `description` (string): Post excerpt.
- `tags` (array of strings): Topics covered.

## 2. Personal Content

### Journal

Located in: `src/content/personal/journal/`
Format: MDX
Frontmatter Schema:

- `title` (string): Entry title.
- `date` (string, YYYY-MM-DD): Date of entry.
- `mood` (string, optional): Emotional context.

### Art

Located in: `src/content/personal/art/`
Format: MDX
Frontmatter Schema:

- `title` (string): Title of the piece.
- `date` (string, YYYY-MM-DD): Date created.
- `description` (string): Description of the medium/inspiration.
- `image` (string): Path to the artwork image.

## 3. Data Structures (JSON)

### The Signal

Located in: `src/content/signal/history/YYYY-MM-DD.json`
Format: JSON
Schema:

```json
{
  "date": "YYYY-MM-DD",
  "discoveries": [
    {
      "tier": "PERSONAL" | "CURATED" | "CHAOTIC",
      "title": "Item title",
      "description": "Short explanation of why it was saved.",
      "url": "Optional link",
      "category": "String category (e.g., music, tool, thought)"
    }
  ]
}
```

### Resume

Located in: `src/content/resume.json`
Format: JSON
Schema:

```json
{
  "basics": {
    "name": "Swaraj Singh",
    "label": "Software Engineer",
    "email": "example@example.com",
    "url": "https://example.com",
    "summary": "Brief summary",
    "profiles": [{ "network": "GitHub", "username": "...", "url": "..." }]
  },
  "work": [
    {
      "company": "Company Name",
      "position": "Role",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "highlights": ["Did X", "Achieved Y"]
    }
  ],
  "education": [],
  "skills": []
}
```
