# Website review and refinement

The supplied website review was checked against the source and combined with independent assessments from Codex GPT-6.1 Sol (medium), OpenCode Tidepool Alpha Free and Hy4 Flash Free (high), and Gemini 3.8 Flash (high) as adversarial jester. Findings were verified individually; agreement and scores were not treated as proof.

Paid GLM/DeepSeek seats could not run without an OpenCode Go subscription. DeepSeek Free then hit its usage limit. The user authorized working free OpenCode models and named Tidepool. Four models through three providers supplied the initial reviews.

## Changes supported by the evidence

- Content collection pages now explain their purpose visibly and cross-link Projects, Writeups, Journal and Art. Static pages use their own descriptions in search and social metadata. The existing unique article descriptions remain in place, with misleading summaries corrected.
- Home features Greyfield, TraceIR and KubeSentinel. Desktop navigation exposes Writeups and Journal. Mobile navigation remains available instead of disappearing after 1.4 seconds. The web resume links back to the portfolio and project case studies.
- Text tokens have higher contrast. The Today detail panel uses a native modal dialog, Escape dismissal and focus restoration. Signal tiles no longer nest headings in buttons. Music starts through its controls and has a pause control after leaving Home.
- Archived editions have stable date anchors and all stored editions remain accessible. Narrow-screen editions use a readable list with source links. Historical details use date-neutral wording. Sample markers remain visible in old editions, and samples are excluded from future personal-catalogue candidates.
- Article structured data describes the authored page rather than claiming that Swaraj created historical artworks or classifying every project report as software. The redirect-only blog index is omitted from the sitemap. The archive uses the configured site URL.
- The Python sandbox article is now an explicitly conceptual study and explains why its original example did not establish a bypass. The padding-oracle article distinguishes an illustrative server contract from observed challenge evidence, handles ambiguous padding, and uses readable code notation rather than unrendered TeX.
- SEO validation now examines built HTML for every sitemap page instead of validating duplicated sample metadata. The misleading directory-existence “immutability” assertion was removed.

## Suggestions not adopted

- Missing Signal data was an omission in the initial review packet, not a confirmed deployment defect. The repository contains current/history artifacts and a daily generation/build workflow. The complete data was included in the fresh packet; static rendering was retained.
- Museum and Wikimedia catalog links already exist in artwork bodies. Outbound attribution links are useful references, not backlinks from those institutions.
- Employer-specific PDFs and verification files were not deleted or promoted without establishing their purpose. Existing application assets and URLs were preserved. Their continued public availability remains an owner decision.
- Student status does not invalidate credentials. Public verification links could help readers assess certifications, but no allegation or invented credential detail was added.
- Redirects were retained for compatibility; no dependency, environment, credential or configuration changes were needed.

## Verification and limits

Production build and generated-page SEO validation pass; the latter covers 35 sitemap pages. Content validation covers 26 published entries. Focused checks passed: eight existing content tests, sixteen music tests, five Signal tests, and sixteen local padding-oracle cases. Local oracle checks validate the algorithm, not a remote challenge.

The core n8n node-isolation and patch behavior in the existing advisory article was checked against the [vendor advisory](https://github.com/n8n-io/n8n/security/advisories/GHSA-9p7v-45m2-wxgj) and its [CVE-linked record](https://github.com/advisories/GHSA-48fh-2c4x-8wcm).

The web fetch tool failed, but direct HTTP retrieval succeeded: all 36 URLs in the existing live sitemap returned 200 after redirects; one was the blog redirect. This was a reachability check of the existing deployment, not a verification of the unpublished changes. No interactive mobile, assistive-technology, Lighthouse or penetration test is claimed. Manual review should cover mobile navigation/reflow, archive selection, dialog keyboard behavior, music controls, and contrast over the animated background. Richer architecture diagrams, real screenshots and measured outcomes should be added only from verifiable project artifacts.

[The content and backlink plan](seo-content-plan.md) lists specific next publishing opportunities. No outreach or external backlink publication was performed.

## Fresh assessment status

A fresh, neutral source packet includes generated Signal data and configuration context. Sol returned conditional readiness with no confirmed build/routing blocker; its evidence-framing, metadata and archive-sizing findings were corrected. Hy4 also returned conditional readiness with no verified blocker. Its resume landmark, skip-target focus, social-metadata override and prose-width findings were corrected. Tidepool returned ready with no blockers. Its tablet-header discovery suggestion was adopted; the pages were already reachable via homepage, footer and collection links, so the reported “unreachable” consequence was overstated. Unused-component removal was left outside this refinement. Gemini returned a conditional pass. Its high-severity redirect claim was disproved with the installed Next matcher and live requests: both `/projects/traceir` and `/writeups/n8n-cve-2026-119408` reached the correct canonical deep URLs without encoded slashes; the verification-file exception remained excluded. The global keyboard outline already existed, but an explicit inset outline was added to avoid clipping. Redundant flex/grid classes were removed and backdrop dismissal was added. The mobile archive sizing concern was already addressed by its list layout. Resume renderer limitations concern hypothetical future data, not a demonstrated failure of the current resume; application formatting and dependency cleanup were deferred. All findings have been triaged; no substantiated build or routing blocker remains.
