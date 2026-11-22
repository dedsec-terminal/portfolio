---
title: "Restore Drill Acceptance"
slug: "restore-drill-acceptance"
date: "2026-11-22"
description: "A fictional recovery exercise turns backup restoration into a testable RPO and RTO decision."
category: "misc"
tags:
  - backup
  - disaster-recovery
  - restore-testing
published: true
---

A backup job marked successful is evidence that a process completed. It does not show that the organization can restore the service, recover the required data, or do so within an agreed time. A restore drill tests those claims in an isolated environment before an outage makes the answer urgent.

The scenario below is fictional. The service, dates, and measurements are examples, not a report of a real incident or personal exercise.

## Define what success means first

Suppose a fictional order service has a recovery point objective (RPO) of four hours and a recovery time objective (RTO) of six hours. RPO expresses tolerated data loss in time. RTO is the target time to restore the service. These are business requirements to confirm with service owners, not universal values. NIST recommends that contingency planning account for system impact and recovery priorities in its [Contingency Planning Guide](https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final).

Before the drill, write down the service boundary, chosen backup, restore dependencies, test data, start and stop conditions, and people authorized to approve the result. Use a separate account and isolated network or cloud project. Block routes and credentials that could reach production, and verify those boundaries before restoring. The exercise should not send real customer notifications, process live payments, or write to production systems.

## Record the clock and the recovery point

In this example, disruption time is set to 14:00 UTC. The backup job completed at 12:50 UTC. After restoration, the team verifies that records through the 12:30 UTC checkpoint are present and consistent. The demonstrated data gap is 90 minutes, inside the four-hour RPO. Record the validated recovery point, the integrity checks, and the application records used to establish it.

Start the RTO clock at the agreed disruption point and stop only when the acceptance checks pass. For the example, the isolated service becomes usable at 18:20 UTC, four hours and twenty minutes later. The checks might confirm that the service starts, a representative read-only transaction can be retrieved, dependent components are healthy, and expected permissions remain in place. A process that merely copies files before the deadline has not yet demonstrated service recovery.

## Keep the result useful

The fictional drill meets both objectives, but the record should still capture the operator, system version, backup identifier, elapsed time, validation performed, deviations, and evidence location. Note any difference between the drill setup and the documented recovery plan. An untested dependency or manual approval can be the step that changes a future recovery estimate.

If a check fails, preserve the result and assign an owner and due date to the corrective action. Retest the changed step, and revise the recovery plan when the evidence shows that its assumptions are wrong. A repeatable, isolated drill gives service owners a defensible answer about recoverability and gives responders a more useful starting point than a green backup status alone.
