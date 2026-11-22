---
title: "Reviewing a CSP in Report-Only Mode"
slug: "csp-report-only-review"
date: "2026-11-22"
description: "A fictional staged review uses benign user flows to assess CSP reports, delivery, and privacy before an enforcement decision."
category: web
tags:
  - content-security-policy
  - web-security
  - privacy
published: true
---

A Content Security Policy can break ordinary product behavior when it blocks a script, image, or connection that a page relies on. Report-only mode offers a way to observe policy violations while the site continues to operate under its existing behavior. It is a measurement stage, not proof that a proposed policy is ready to enforce.

In this fictional rollout, a team drafts a policy for a customer portal and sends it through a report-only header to a dedicated endpoint. Before broad exposure, engineers exercise benign flows: sign in with a test account, open account settings, submit a harmless profile edit, and complete a support form with synthetic data. They repeat those flows across supported browsers and record the page, expected resource, browser, and time for each report.

A report is a clue to investigate. It can reflect an intended third-party integration, a browser extension, a stale page, or an actual policy gap. Group duplicate reports, compare them with the application dependency inventory, and ask the owning team to explain each legitimate source. Adjust the draft only when the reason is understood. Keep the observed report, the review decision, and the policy change linked so a reviewer can see why a source was allowed.

The reporting endpoint needs its own privacy and reliability review. Reports can include a document URL and other context that may expose identifiers or sensitive paths. Minimize what is collected, restrict access and retention, avoid query strings containing user data, and communicate the collection appropriately. Verify that the endpoint accepts valid reports, rejects or safely handles malformed input, and stores events where reviewers can inspect them. A missing report may mean no violation, blocked delivery, or endpoint failure, so monitor endpoint health and test delivery deliberately.

After representative benign flows produce understood results over an agreed observation period, review the remaining exceptions and decide whether a separate enforcement change is justified. W3C specifies that a `Content-Security-Policy-Report-Only` header reports violations without enforcing the policy ([CSP Level 3](https://www.w3.org/TR/CSP3/#csp-report-only-header)). The team still has to judge coverage, privacy, and delivery quality before treating the reports as a sound basis for change.
