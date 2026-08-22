# Deployment

## 1. Architecture

The production model is deliberately small:

```text
GitHub push -> Vercel build -> static Next.js output -> Vercel CDN
GitHub Actions -> Signal JSON generation -> GitHub push -> Vercel rebuild
Browser -> Lanyard -> Discord presence
```

There is no database, CMS, dedicated backend, custom server, or music-service integration. Repository content is read at build time. Local media is served from `public/`:

- Content: `src/content/{projects,writeups,blog,journal,art}/` with related media in `public/content/`
- Signal: `signal/current.json` and `signal/history/`
- Music catalogue: `src/content/music/catalogue.json`
- Music audio: `public/audio/`
- Music artwork: `public/images/music/`
- Resume source: `src/content/resume.json`; generated file: `public/resume.pdf`

The portfolio routes and content detail routes are build-time/static. The Lanyard presence card is the only client-side live integration; an unavailable connection renders a non-blocking fallback. Signal is read from committed JSON at build time, so a failed daily refresh leaves the previously committed data deployable.

## 2. Local development

```powershell
npm install
npm run content:check
npm run dev
```

Use these production checks before pushing:

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

## 3. GitHub setup

Use the production branch configured for the repository (normally `main`) as the Vercel production branch. The Signal workflow at `.github/workflows/signal.yml` runs daily at `00:00 UTC` (`05:30` India Standard Time) and supports **Run workflow** for a manual refresh.

The workflow uses `contents: write` because it commits generated Signal JSON with the built-in `GITHUB_TOKEN`. It uses `npm ci`, runs Signal tests, generates and schema-validates output, then commits only changed files under `signal/`. It does not need a personal access token.

Optional GitHub Actions secret:

- `TMDB_API_KEY` — enables the optional film source in the Signal generator. Omit it to skip that source without failing the generator.

Generation validates output before replacing either committed JSON file. A failure exits the workflow without committing generated data, leaving the last known good Signal files in Git intact.

## 4. Vercel setup

1. Import the GitHub repository into Vercel.
2. Select the **Next.js** framework preset.
3. Keep the root directory as the repository root.
4. Use the default install command or `npm install`.
5. Set the build command to `npm run build`.
6. Do not configure a custom output directory; Next.js manages it.
7. Add the production environment variable below.
8. Deploy from the Vercel dashboard after reviewing the deployment preview.

This document assumes the GitHub repository is connected to Vercel; that remote connection was not inspected locally. A normal flow is local change -> commit -> push -> GitHub -> Vercel preview or production deployment.

## 5. Environment variables

| Name                   | Required              | Local                          | Vercel   | GitHub Actions  | Visibility | Purpose                                                                                                                           |
| ---------------------- | --------------------- | ------------------------------ | -------- | --------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Yes before production | Optional                       | Required | No              | Public     | Final canonical origin for metadata, `robots.txt`, and `sitemap.xml`. Example: `https://your-domain.example` (no trailing slash). |
| `TMDB_API_KEY`         | No                    | Optional for Signal generation | No       | Optional secret | Secret     | Enables the optional TMDB Signal source. The generator skips it when absent.                                                      |

Keep `.env.example` as placeholders only. Local `.env*` files and private key files are ignored by Git. No music-service environment variables are required.

## 6. Signal workflow

`npm run signal:generate` produces validated JSON in `signal/history/YYYY-MM-DD.json` and `signal/current.json`. If the current day already exists, it validates the archived copy and safely refreshes `current.json` from it. Files are written through a temporary file before replacement so a write failure does not corrupt the previously usable target.

The workflow's generated commit triggers the normal GitHub-to-Vercel deployment path. Review failed workflow logs in GitHub Actions; do not manually delete the previous Signal JSON to recover from a source outage.

## 7. Discord presence

Discord presence is client-side through Lanyard. Set the public user ID in `siteConfig.discordId` in `src/lib/site.ts`. The setup requires joining Lanyard if its service requires it and a public Discord user ID. It does not use a Discord bot token, OAuth token, password, or server endpoint.

The card displays online, idle, do-not-disturb, and offline status, plus eligible custom or game activity. If Lanyard is unavailable, static page rendering remains unaffected.

## 8. Music

Playback uses the browser's native `HTMLAudioElement` with the local catalogue in `src/content/music/catalogue.json`. Audio and artwork are static files. There is no authentication, environment variable, backend, or external music API.

The current audio bundle contains 9 FLAC files totaling approximately 212.2 MiB. The largest file is `07-tobenai-tsubasa.flac` at approximately 31.1 MiB. FLAC browser support can vary by device; failed files are skipped by the player. This footprint is acceptable for a personal archive only if its Git, deployment-size, and bandwidth cost is intentional; do not recompress or convert it without an explicit content decision.

## 9. Resume update process

1. Edit `src/content/resume.json`.
2. Run `npm run typecheck` and preview `/resume`.
3. Run `npm run build`.
4. Run `npm run resume:pdf` to update `public/resume.pdf`.
5. Verify the one-page PDF and the `/resume`, `/resume.json`, `/resume.md`, and `/resume.pdf` endpoints.
6. Commit the JSON and generated PDF together, then push.

The normal Vercel build is `npm run build`; it intentionally does not run Puppeteer or generate the PDF. `puppeteer` is a development-only dependency used only by `npm run resume:pdf`.

## 10. Content publishing

The repository is the CMS:

```text
Obsidian -> Markdown or MDX -> npm run content:check -> preview -> commit -> push -> Vercel
```

Canonical folders are `src/content/{writeups,blog,journal,art,projects}/`. Article media belongs in `public/content/<collection>/<slug>/`. Published content is statically generated; drafts are excluded from production routes. Journal remains isolated from the professional homepage. See [CONTENT_WORKFLOW.md](./CONTENT_WORKFLOW.md) for authoring templates and validation rules.

## 11. Metadata and SEO

`src/lib/site.ts` centralizes the production URL. Set `NEXT_PUBLIC_SITE_URL` before production so canonical metadata is not derived from a preview deployment URL.

- Root metadata includes title template, description, creator, publisher, Open Graph, and X card fields.
- The current Open Graph image uses the existing profile image at `/images/avatar/pfp.jpg`; replace it with a dedicated 1200×630 asset when branding artwork is available.
- `/sitemap.xml` includes static public pages and published content only. It deliberately omits draft content and machine-readable resume artifacts.
- `/robots.txt` allows normal crawling and references the sitemap once the production URL is configured.
- App Router favicon and Apple icon files are present at `src/app/favicon.ico` and `src/app/apple-icon.png`; `/manifest.webmanifest` provides basic install metadata without adding a service worker.

Published Journal content remains indexable. If that policy changes, add a deliberate route-level `robots` decision rather than silently hiding it.

## 12. Production checklist

- [ ] `NEXT_PUBLIC_SITE_URL` is set to the final production origin in Vercel.
- [ ] GitHub-to-Vercel integration and the production branch are confirmed.
- [ ] Any optional GitHub Actions secrets are set.
- [ ] The Signal workflow is enabled and its schedule is accepted.
- [ ] The favicon, Apple icon, manifest, Open Graph preview, sitemap, and robots route are checked on the deployed origin.
- [ ] `public/resume.pdf` matches `src/content/resume.json`.
- [ ] `npm run content:check` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.
- [ ] A production preview is smoke-tested at desktop and mobile widths.
