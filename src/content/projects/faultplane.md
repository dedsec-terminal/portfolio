---
title: "Faultplane"
date: "2026-05-20"
description: "An automated threat-intelligence platform."
tags:
  - "threat-intelligence"
technologies:
  - "python"
  - "groq"
  - "github-actions"
  - "nvd-2-0"
  - "cisa-kev"
published: true
featured: true
liveUrl: "https://dedsec-terminal.github.io/Faultplane/"
codeUrl: "https://github.com/dedsec-terminal/Faultplane"
---

## Problem
Security teams face a high volume of disconnected security advisories requiring manual review. Without normalized data, it is difficult to prioritize patching efforts.

## How it works
Faultplane aggregates authoritative advisory data and enriches it with NVD and CISA KEV context. The system produces Groq summaries and schedules publication with GitHub Actions.

## Impact
The platform delivers enriched vulnerability insights on a daily schedule. This allows teams to review prioritized advisory data rather than collecting it manually.

## Future direction
Aspirational goals include integrating additional threat intelligence feeds and adding a web-based dashboard for interactive querying.
