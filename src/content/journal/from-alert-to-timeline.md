---
title: "From Alert to Timeline"
slug: "from-alert-to-timeline"
date: "2026-11-19"
description: "A tabletop sign-in alert and the small decisions that make its timeline easy for another analyst to verify."
tags:
  - incident-response
  - log-analysis
  - tabletop
published: true
---

A sign-in alert is a good place to start a shift handoff. It is a poor substitute for a timeline. In this fictional exercise, the alert fires just after midnight local time. The identity provider says November 12, the VPN says November 11, and the analyst has to decide whether both records describe the same session.

## Give each time a job

The identity export records the successful sign-in as `2026-11-12T00:01:42+05:30`. Subtracting five hours and thirty minutes gives `2026-11-11T18:31:42Z`. Keep both values. The original shows what the source reported. The UTC value means someone can sort the events beside records from another system. An export with no offset needs a verified time-zone setting or an explicit note that the time is unresolved.

Here is the working timeline. Each ID points back to a record in the fictional exercise.

- **18:31:42 UTC** — The identity provider accepted a sign-in for `demo-014` (`idp-1042`) and recorded the VPN authentication reference `auth-042`.
- **18:31:47 UTC** — The VPN opened session `vpn-0871` and recorded the same `auth-042` reference.
- **18:34:05 UTC** — The detection system created alert `alert-016` for a sign-in from a new network.
- **18:37:00 UTC** — The analyst exported the two source records and attached them to exercise case `case-007`.

The authentication reference connects the sign-in to the session. Two entries five seconds apart could belong to different users or separate attempts. If either clock has drifted by several seconds, that gap may also be too small to establish order by time alone. Record any measured clock skew and when it was measured alongside the source timestamps.

The alert timestamp says when the rule created a record. An ingestion timestamp, if available, would tell us when the detection system received the event. Without it, the interval between sign-in and alert creation cannot be attributed to any one step.

## Leave a question the next shift can answer

I would write the handoff this way.

> The identity and VPN exports tie `demo-014` to VPN session `vpn-0871` through `auth-042`. The device and the user's intent are still unverified. Check the session's device identifier against the managed-device inventory and confirm whether the network change was expected.

That gives the next analyst somewhere to start. It also gives them something they can correct. If the device inventory contradicts the sign-in record, they can add a finding with its own timestamp and source. The original entry and the evidence behind it are still there to review.

## References

- [RFC 3339, section 4.2 — Local offsets](https://www.rfc-editor.org/rfc/rfc3339.html#section-4.2)
- [NIST SP 800-61 Rev. 3 — Incident response and investigation records](https://csrc.nist.gov/pubs/sp/800/61/r3/final)
