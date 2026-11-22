---
title: "Detection Coverage Starts with the Feed"
slug: "detection-coverage-from-telemetry"
date: "2026-11-22"
description: "A fictional defensive check tests whether expected telemetry is fresh and complete before a detection rule is trusted."
category: forensics
tags:
  - detection-engineering
  - telemetry
  - data-quality
published: true
---

A detection rule can be logically correct and still fail silently when its source feed is stale or incomplete. Coverage therefore has two questions: does the rule recognize the behavior it was designed for, and did the required events reach the rule in usable form?

In this fictional example, a team monitors administrative sign-ins from an identity provider. The rule's unit tests pass, but the latest successful ingestion timestamp is thirty-five minutes old. A daily source count is also lower than usual. The alert dashboard appears quiet, yet the evidence does not distinguish a quiet environment from a quiet pipeline.

Start with a small source contract. For each event type, list the expected fields, allowed timestamp formats, source identity, and acceptable delivery delay. Track the latest event time separately from the latest ingestion time. A recent event with a delayed arrival and an old source event are different failures. Compare counts by source and event type against a baseline, and flag missing required fields rather than silently discarding those records.

A practical coverage check uses synthetic fixtures and pipeline health signals:

1. Send a known-good synthetic event through the approved test path and verify it reaches the expected index with its required fields.
2. Send a malformed or incomplete fixture and verify the pipeline reports a parse or quality failure without counting it as usable coverage.
3. Check source heartbeat, ingestion delay, event volume, and rejected-record counts against documented thresholds.
4. Confirm the detection can query the destination data and that a test event produces the expected result.

These checks test collection and processing, not whether every real event is present. A successful synthetic event cannot prove that a provider exported all activity or that a permissions change did not narrow the feed. Record known blind spots, ownership, and the last successful verification alongside the rule. Alert on stale telemetry as a separate condition so missing data cannot masquerade as a clean bill of health.

OWASP's logging guidance recommends treating logging as an application and operational concern, including testing what is recorded and protecting the resulting data ([Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)). NIST's incident response guidance places response in a continuous risk-management cycle, which makes data quality an ongoing operational responsibility rather than a one-time rule review ([SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)).
