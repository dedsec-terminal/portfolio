# Implementation Plan: Swaraj Singh Personal Website

## Phase 1: Foundation & Setup (Completed)

- **Goal**: Initialize the Next.js project and configure the core design system.
- **Tasks**:
  - [x] 1. Initialize Next.js project with App Router, TypeScript, and Tailwind CSS.
  - [x] 2. Setup code quality tools (ESLint, Prettier, Husky).
  - [x] 3. Define the Tailwind design tokens (near-black background, charcoal surfaces, muted gray text, steel/blue accents).
  - [x] 4. Configure `next/font` with the chosen typography (Inter + JetBrains Mono pairing).
  - [x] 5. Establish the base directory structure.

## Phase 2 & 2.1: Core Layout, Visual System & Hero Polish (Completed)

- **Goal**: Build the primary application shell, atmospheric hero, and visual identity.
- **Tasks**:
  - [x] 1. Create global layout (`src/app/layout.tsx`) including minimalist navigation bar, footer, and App Router metadata/favicon integration.
  - [x] 2. Build the Homepage Hero component (Asymmetrical layout, real PFP anchor, identity tags, FA6 brand social links, compact music shell).
  - [ ] 3. Atmospheric WebGL background (Deferred until the rest of the portfolio is complete).
  - [x] 4. Integrate desktop top bar with favicon, "DedSec" brand mark, and email connector; configure mobile bottom navigation.
  - [x] 5. Implement responsive stacking and full viewport QA across 1440px, 1024px, 768px, and 375px.
  - [x] 6. Implement `@media (prefers-reduced-motion: reduce)` accessibility across animations and shader effects.
  - [x] 7. Validate entire build pipeline (`typecheck`, `lint`, `test`, `build`).

## Phase 3: Content Architecture (MDX)

- **Goal**: Setup the infrastructure for parsing and rendering Markdown/MDX.
- **Tasks**:
  - [ ] 1. Install and configure MDX processing libraries (e.g., `next-mdx-remote` or `contentlayer`).
  - [ ] 2. Configure remark/rehype plugins (especially for Obsidian compatibility).
  - [ ] 3. Create base MDX layout components (typography styling for prose).
  - [ ] 4. Create placeholder MDX files for `/projects`, `/writeups`, `/about`, `/art`, and `/journal`.
  - [ ] 5. Build the dynamic routing for both Professional and Personal content segments.

## Phase 4: Resume Architecture

- **Goal**: Implement the structured JSON resume.
- **Tasks**:
  - [ ] 1. Define the resume JSON schema.
  - [ ] 2. Create `src/content/resume.json` with sample data.
  - [ ] 3. Build the `/resume` page to parse and display the JSON.
  - [ ] 4. Implement `@media print` CSS rules to ensure the page formats perfectly for PDF generation.

## Phase 5: The Signal (Data & Display)

- **Goal**: Build the core data structures and UI for The Signal feature (static JSON integration).
- **Tasks**:
  - [ ] 1. Define the TypeScript interfaces for the Signal data model.
  - [ ] 2. Create sample historical JSON files in `src/content/signal/history/`.
  - [ ] 3. Build the UI components for the daily Signal constellation.
  - [ ] 4. Implement the `/signal/archive` page with date browsing and historical reconstruction.

## Phase 6: GitHub Action (The Signal Generator)

- **Goal**: Automate the daily curation generation.
- **Tasks**:
  - [ ] 1. Write a Node.js/Python script (`scripts/generate-signal.js`) to fetch or aggregate daily discoveries.
  - [ ] 2. Create a GitHub Actions workflow (`.github/workflows/signal.yml`).
  - [ ] 3. Configure the CRON schedule to run every 24 hours.
  - [ ] 4. Configure the action to commit the generated JSON file back to the repository.

## Phase 7: Future Integrations (Discord & Music)

- **Goal**: Add Lanyard and Music features (To be implemented later).
- **Tasks**:
  - [ ] 1. Integrate the Lanyard API for Discord presence.
  - [ ] 2. Build the compact music player UI.
  - [ ] 3. Connect the music player to Spotify/Lanyard data or local JSON fallback.

## Phase 8: Final Review & Deployment

- **Goal**: Ensure quality, performance, and accessibility before going live.
- **Tasks**:
  - [ ] 1. Perform an accessibility audit (keyboard navigation, screen readers, contrast).
  - [ ] 2. Test print layouts for the resume.
  - [ ] 3. Review performance (Lighthouse scores, bundle size analysis).
  - [ ] 4. Deploy to Vercel and configure the production domain.
