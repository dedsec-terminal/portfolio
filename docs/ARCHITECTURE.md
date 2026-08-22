# Architecture Document: Swaraj Singh Personal Website

## 1. Application Architecture

- **Framework**: Next.js (App Router preferred for modern React features, Server Components, and static generation).
- **Language**: TypeScript for end-to-end type safety.
- **Styling**: Tailwind CSS for utility-first, maintainable styling.
- **Content Parsing**: MDX for rich markdown rendering.
- **Rendering Strategy**: Static Site Generation (SSG) via Next.js for maximum performance and security. Dynamic segments (like Signal history) will also be statically generated at build time using `generateStaticParams`.

## 2. Directory Structure

```text
├── .github/
│   └── workflows/         # GitHub Actions for Signal generation & deployment
├── docs/                  # Project documentation (Architecture, Implementation Plan)
├── public/                # Static assets (fonts, images, icons)
├── src/
│   ├── app/               # Next.js App Router pages and layouts
│   │   ├── (professional)/# Route group for professional content
│   │   ├── (personal)/    # Route group for personal content
│   │   └── signal/        # Signal feature routes
│   ├── components/        # Reusable React components
│   │   ├── ui/            # Base UI components (buttons, cards)
│   │   ├── layout/        # Layout components (navbar, footer)
│   │   └── features/      # Feature-specific components (Signal display)
│   ├── content/           # MDX and Markdown files (Professional & Personal)
│   ├── lib/               # Utility functions (MDX parsers, date formatters)
│   ├── styles/            # Global CSS and Tailwind directives
│   └── types/             # TypeScript interface definitions
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 3. Content Architecture

- **Professional Content**: MDX files located in `src/content/professional/` (e.g., projects, writeups, blog, about).
- **Personal Content**: MDX files located in `src/content/personal/` (e.g., art, journal, music insights).
- **Frontmatter**: Standard YAML frontmatter for metadata (title, date, tags, description).
- **Processing**: A custom `content-layer` or MDX processing pipeline in `src/lib/mdx.ts` to read, parse, and supply content to Next.js pages.

## 4. Component Architecture

- **Server Components (Default)**: Used for data fetching, reading MDX, reading Signal JSON files.
- **Client Components**: Used for interactive elements (e.g., music player toggle, Discord presence fetching, mobile menu).
- **Design System**: Muted, mature aesthetic. Near-black backgrounds, charcoal surfaces, muted gray typography, subtle green/blue accents, thin borders. No heavy gradients or excessive glow.
- **Atmospheric Visual Subsystem**: Atmospheric WebGL background is deferred until the rest of the portfolio is complete.


## 5. Signal Architecture

- **Concept**: A daily-changing curation constellation (Personal, Curated, Chaotic).
- **Storage**: JSON files in `src/content/signal/history/YYYY-MM-DD.json`.
- **Data Model**:
  ```typescript
  interface SignalDay {
    date: string;
    discoveries: Array<{
      tier: 'PERSONAL' | 'CURATED' | 'CHAOTIC';
      title: string;
      description: string;
      url?: string;
      category: string; // e.g., 'films', 'Wikipedia', 'music'
    }>;
  }
  ```
- **Display**: The current day's signal on the homepage. Historical archive at `/signal` and `/signal/archive`.

## 6. GitHub Action Architecture

- **Purpose**: Automate the generation of the daily Signal JSON without client-side API calls.
- **Workflow**:
  1. Trigger daily via CRON (`schedule`).
  2. Run a Node.js/Python script to aggregate data (from external APIs, RSS feeds, or manual input queues).
  3. Generate `YYYY-MM-DD.json` and save to `src/content/signal/history/`.
  4. Commit the new file back to the repository.
  5. The commit triggers a Vercel production build.

## 7. Obsidian Workflow

- **Authoring**: Swaraj authors CTF writeups and journal entries in a local Obsidian vault.
- **Sync Mechanism**: A specific folder in the Obsidian vault is symlinked to the repository's `src/content/` directory, or a simple sync script/git workflow is used to push markdown files from Obsidian to the GitHub repository.
- **Processing**: The site's MDX parser is configured to handle Obsidian-flavored markdown features (like double bracket links `[[ ]]` or callouts) using remark/rehype plugins.

## 8. Discord Integration

- **Service**: Lanyard API (https://github.com/Phineas/lanyard).
- **Implementation**: A Client Component fetches the Lanyard API WebSocket or REST endpoint to display real-time status (online, idle, DND, offline) and activities (Spotify).
- **Fallback**: Graceful fallback to a static "offline" state if the API fails or is blocked by tracking protection.

## 9. Music Integration

- **Phase 1**: Static links or simple embeds of favorite albums/tracks within personal content.
- **Phase 2 (Final)**: A compact, expandable music player component.
- **Data Source**: A local JSON catalogue (`src/content/music/catalogue.json`) playing local audio files. No external music APIs or external authentication are used, ensuring a fast, private, and persistent playback experience.

## 10. Resume Architecture

- **Approach**: Data-driven rendering based on a structured JSON resume format (e.g., inspired by `resume-renderer`).
- **Storage**: `src/content/resume.json`.
- **Rendering**: A dedicated `/resume` page that maps the JSON data to React components matching the site's design system.
- **Print/PDF**: Specific `@media print` CSS rules in Tailwind to ensure the page formats perfectly as a PDF when the user prints it from the browser.

## 11. Vercel Deployment

- **Integration**: Direct integration with the GitHub repository.
- **Builds**: Triggered automatically on pushes to the `main` branch (including automated commits by the Signal GitHub Action).
- **Optimization**: Vercel's Edge Network handles static asset delivery, caching, and image optimization (via `next/image`).

## 12. Accessibility (a11y)

- **Semantic HTML**: Proper use of `<nav>`, `<main>`, `<article>`, `<header>`, `<footer>`.
- **Color Contrast**: Ensuring the muted gray typography against near-black backgrounds meets WCAG AA standards.
- **Keyboard Navigation**: Focus states customized to match the subtle, thin-border aesthetic.
- **Screen Readers**: ARIA labels for icon-only links (Socials) and complex components (Signal constellation).

## 13. Performance

- **Static Generation**: 99% of the site is statically generated HTML/CSS.
- **Image Optimization**: `next/image` for WebP conversion and responsive sizing.
- **Font Loading**: `next/font` for optimal self-hosting and zero layout shift.
- **Bundle Size**: Minimal client-side JavaScript. Only specific islands (Discord status, mobile menu) are shipped to the client.

## 14. Security

- **Static Nature**: As an SSG site, the attack surface is virtually zero.
- **Headers**: Implement strict security headers in `next.config.js` (Content Security Policy, X-Frame-Options, X-Content-Type-Options).
- **API Keys**: Any API keys used for Signal generation live strictly in GitHub Secrets, never exposed to the client or the Next.js build.

## 15. Mobile Strategy

- **Responsive Design**: Mobile-first Tailwind CSS.
- **Layout Adjustments**: The hero section (PFP on left, text on right) stacks cleanly on small screens. The Signal constellation adapts from a complex grid to a readable list.
- **Touch Targets**: Ensure minimum 44x44px touch targets for navigation and interactive elements.

## 16. Testing

- **Unit Testing**: Vitest and React Testing Library for utility functions and complex components (like the Signal data parser).
- **E2E Testing**: Playwright for critical user journeys (navigating between professional and personal content, viewing the resume).
- **Linting & Formatting**: ESLint (Next.js core web vitals strict config) and Prettier.
