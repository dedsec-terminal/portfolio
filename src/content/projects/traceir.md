---
title: "TraceIR"
slug: "traceir"
date: "2026-09-05"
description: "An incident investigation toolkit that turns endpoint telemetry into a timeline and a verifiable evidence package."
tags:
  - dfir
  - incident-response
  - security-automation
technologies:
  - python
  - json-schema
  - sqlite
codeUrl: "https://github.com/dedsec-terminal/TraceIR"
liveUrl: "https://dedsec-terminal.github.io/TraceIR/"
published: true
---

## The investigation

I built TraceIR to make the work after a security alert easier to reproduce and review. It selects a bounded investigation profile, normalizes exported endpoint evidence such as Windows Sysmon and Linux audit logs, and assembles an analyst timeline with links back to source records.

## How it works

The case format distinguishes observations from derived findings and keeps missing telemetry visible. Schema and cross-document checks validate case structure. A hash manifest allows an analyst to verify the integrity of the exported package.

## What the demo shows

The public case explorer presents four synthetic investigations, including a case with incomplete endpoint telemetry. Each case lets a reader inspect the timeline, see the evidence behind a finding, and review where visibility ends.

## Further reading

For a separate worked investigation with explicit evidence limits, read [From Alert to Timeline](/writeups/from-alert-to-timeline). Browse [security writeups](/writeups) for other analytical methods.
