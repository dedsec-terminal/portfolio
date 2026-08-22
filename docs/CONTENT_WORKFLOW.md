# Content publishing workflow

This repository is the CMS. The normal workflow is:

**Write → save → preview → commit → push → publish.**

There is no separate editor, database, upload service, or publishing command.

## 1. Obsidian setup

Open `D:\portfolio` as an Obsidian vault, or open `D:\portfolio\src\content` if you prefer to keep the vault limited to posts. Use Obsidian as an editor only; the files in this repository remain the source of truth.

Each content type has one canonical folder:

| Type | Folder | Public route |
| --- | --- | --- |
| Writeup | `src/content/writeups/` | `/writeups/<slug>` |
| Blog | `src/content/blog/` | `/blog/<slug>` |
| Journal | `src/content/journal/` | `/journal/<slug>` |
| Art | `src/content/art/` | `/art/<slug>` |
| Project | `src/content/projects/` | `/projects/<slug>` |

Use `.md` for ordinary writing. Use `.mdx` only when a post genuinely needs JSX/React content. Standard Markdown is the default.

For pasted images, Obsidian cannot reliably create the exact public URL used by the site. The dependable approach is to set **Settings → Files and links → Default location for new attachments** to a predictable repository folder, then move each finished image into its post-specific folder before committing. Do not leave article assets in Obsidian's default attachment folder.

## 2. Create a post

Use a lowercase kebab-case filename, for example `kerberos-enumeration.md`. A frontmatter `slug` is preferred; if omitted, the filename becomes the slug. Dates must be quoted `YYYY-MM-DD` values. Tags are lowercase kebab-case.

### Writeup

```md
---
title: "Kerberos Enumeration Notes"
slug: "kerberos-enumeration"
date: "YYYY-MM-DD"
description: "A concise summary of the challenge and approach."
platform: "Hack The Box"
challenge: "Challenge name"
category: "web"
difficulty: "medium"
tags:
  - kerberos
  - active-directory
published: false
---

Writeup body.
```

`platform`, `challenge`, `category`, and `difficulty` are optional. `category`, when used, is one of `web`, `pwn`, `crypto`, `reverse`, `forensics`, `misc`, `network`, or `cloud`.

### Blog

```md
---
title: "A Security Learning Note"
slug: "security-learning-note"
date: "YYYY-MM-DD"
description: "A concise technical summary."
tags:
  - threat-intelligence
  - automation
coverImage: "/content/blog/security-learning-note/cover.webp"
published: false
---

Post body.
```

`coverImage` is optional.

### Journal

```md
---
title: "A Personal Note"
slug: "a-personal-note"
date: "YYYY-MM-DD"
description: "A short description for the journal index."
tags:
  - culture
mood: "reflective"
published: false
---

Entry body.
```

`mood` is optional. Journal is intentionally separate from Blog and is not promoted on the professional homepage.

### Art

```md
---
title: "Visual Reference Set"
slug: "visual-reference-set"
date: "YYYY-MM-DD"
description: "Optional notes about the collection."
tags:
  - film
media:
  - src: "/content/art/visual-reference-set/image-01.webp"
    alt: "A useful description of the image"
    caption: "Optional caption"
    type: "image"
source: "Optional source or attribution"
published: false
---

Optional notes.
```

At least one `media` item is required. Only `image` is currently supported.

### Project

```md
---
title: "Project Name"
slug: "project-name"
date: "YYYY-MM-DD"
description: "What the project is and why it matters."
technologies:
  - typescript
  - nextjs
tags:
  - security
codeUrl: "https://github.com/account/repository"
liveUrl: "https://example.com"
featured: false
status: "active"
coverImage: "/content/projects/project-name/cover.webp"
published: false
---

Project notes.
```

`codeUrl`, `liveUrl`, `status`, and `coverImage` are optional. `technologies` and `featured` default to an empty list and `false` if omitted.

## 3. Add images and media

Create a post-specific public folder:

```text
public/content/blog/kerberos-enumeration/
├── diagram.webp
└── screenshot.png
```

Use an absolute public URL in Markdown:

```md
![Kerberos flow](/content/blog/kerberos-enumeration/diagram.webp)
```

The same convention applies to every collection: `public/content/<type>/<slug>/`. Blog/project cover images and Art media URLs are checked during `npm run content:check`; a referenced file must exist.

## 4. Preview and validate

Install dependencies once, then run:

```powershell
npm install
npm run content:check
npm run dev
```

Open the relevant collection and detail route, for example `/blog` and `/blog/kerberos-enumeration`. The validation command reports the exact file, field, and problem for malformed frontmatter, invalid dates, duplicate slugs, or missing media.

In development, drafts may be shown to make local authoring easier. In a production build, `published: false` is not generated, listed, or publicly routable.

## 5. Commit and push

When the preview is correct:

```powershell
git status
git add src/content/blog/kerberos-enumeration.md public/content/blog/kerberos-enumeration/
git commit -m "Add Kerberos enumeration notes"
git push
```

If this repository is connected to Vercel, the GitHub push starts a deployment. The deployment reads the Markdown/MDX during its build and produces static routes; no external CMS is involved.

## 6. Publish, edit, and unpublish

Set `published: true` when the post is ready to become public. Keep `published: false` to hide a post without deleting its source.

To edit an existing entry, update the Markdown, save, preview, commit, and push. Keeping the same slug preserves the URL. Changing a slug changes the URL and can break inbound links.

To unpublish, set `published: false` and push. To remove the source entirely, delete the Markdown/MDX file and its matching `public/content/<type>/<slug>/` asset folder, then commit the deletion.

## 7. Troubleshooting

Run `npm run content:check` first.

| Problem | Usual fix |
| --- | --- |
| Invalid frontmatter | Check the reported field against the template above. |
| Duplicate slug | Give each post in that collection a unique lowercase kebab-case slug. |
| Bad date | Use a quoted real calendar date such as `"2026-08-22"`. |
| Missing image | Put the file under `public/content/<type>/<slug>/` and match the URL exactly. |
| Bad image URL | Use a URL beginning with `/content/`; Art media must begin `/content/art/`. |
| MDX syntax error | Correct the Markdown/JSX syntax, then restart the preview if needed. |
| Draft appears unexpectedly | Check `published`; production only publishes `true`. |
| Build failure | Run `npm run content:check`, then `npm run typecheck` and `npm run build` locally for the full error. |
