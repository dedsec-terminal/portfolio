---
title: "A Clear Incident Handoff"
slug: "incident-handoff-checklist"
date: "2026-11-22"
description: "A fictional handoff format separates observed facts, decisions, ownership, and uncertainty so the next responder can continue safely."
category: forensics
tags:
  - incident-response
  - handoff
  - evidence
published: true
---

A shift change should transfer the state of the investigation, not just its urgency. A note that says “suspicious sign-in, likely compromised” blends an observation with a conclusion. The next responder may repeat the conclusion as fact or miss the unanswered question underneath it.

The example below is fictional. Imagine an identity alert linked to a VPN session by a transaction reference. The records show a sign-in and a matching session, but the device owner has not confirmed whether the activity was expected. A useful handoff keeps four things distinct:

- **Observations:** the identity record and VPN record share reference `auth-demo-042`; both source records and their timestamps are attached.
- **Decision:** preserve the session evidence and keep the account under review. This is a containment choice, not a finding that the account was compromised.
- **Owner:** the incoming responder, Maya (fictional), will check the device inventory and contact the account owner through the established channel by 10:00 UTC.
- **Uncertainty:** device ownership and user intent remain unverified. The records establish a technical link, not who was at the keyboard.

This structure makes the decision reviewable. State who made it, when, and what evidence was available at that point. If the action changes, add a new decision with its own reason instead of silently rewriting the earlier note. Keep source records, derived timelines, and analyst interpretations labeled separately. When timestamps or identifiers are ambiguous, make the uncertainty visible and say what would resolve it.

The handoff also needs a next action with a clear owner and deadline. “Investigate further” has neither. “Maya will compare the device identifier with inventory and record the result by 10:00 UTC” can be accepted, reassigned, or escalated. If no safe conclusion is possible yet, say so plainly and leave the evidence intact.

For a worked fictional reconstruction, see [From Alert to Timeline](/writeups/from-alert-to-timeline). Its competing session example shows why a plausible match should be tested against source fields before it becomes part of a handoff. NIST's incident response guidance treats response as part of broader cybersecurity risk management, where records support continuing analysis and improvement ([SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)). A concise handoff can preserve that continuity without turning uncertainty into certainty.
