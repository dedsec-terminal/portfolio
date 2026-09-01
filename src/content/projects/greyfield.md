---
title: "Greyfield"
date: "2026-09-02"
description: "A defensive cloud honeypot and privacy-governed public threat observatory."
tags:
  - "cloud-security"
  - "honeypot"
  - "threat-intelligence"
technologies:
  - "python"
  - "cowrie"
  - "oracle-cloud"
  - "mitre-attack"
  - "github-pages"
published: true
featured: true
liveUrl: "https://dedsec-terminal.github.io/greyfield/"
codeUrl: "https://github.com/dedsec-terminal/greyfield"
---

## Problem
Internet-facing systems receive constant SSH and Telnet discovery, credential attempts, command activity, and payload-retrieval requests. Studying that traffic safely requires separating the decoy from real services while preventing raw logs, operator details, secrets, and sensitive session artifacts from becoming public.

## How it works
Greyfield deploys Cowrie on an isolated Oracle Cloud Infrastructure instance, redirects public SSH and Telnet traffic to the unprivileged honeypot, and keeps administrator SSH restricted to a separate port and approved address. A Python telemetry pipeline removes non-public and operator sources, redacts sensitive patterns, aggregates the retained events, and validates a two-file publication contract before an outbound-only workflow updates the static GitHub Pages observatory. The public view presents network context, attempted credentials, inert command evidence, payload-transfer indicators, and evidence-backed MITRE ATT&CK mappings without treating enrichment as attribution.

## Impact
The project demonstrates a governed path from cloud deception and SOC telemetry collection to public threat-intelligence reporting. Its staged verification gates protect administrative access, while the publication boundary makes the resulting evidence useful for external analysis without exposing raw Cowrie records, captured files, TTY recordings, session identifiers, or reusable credentials.

## Future direction
Future improvements could extend the observation history, add further independently validated enrichment sources, and deepen analytical views while preserving the same evidence, privacy, and attribution limits.
