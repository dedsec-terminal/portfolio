---
title: "Evidence That Makes an Access Review Reproducible"
slug: "access-review-evidence"
date: "2026-11-22"
description: "What a periodic human access review must record so another reviewer can reproduce it, including ownership and revocation follow-through."
category: "misc"
tags:
  - access-review
  - identity
  - evidence
  - governance
published: true
---

A periodic human access review is only as good as its record. Reproducibility means a different reviewer, given the same record, can redo the review and reach the same decisions. The evidence below is what that record should contain.

## Evidence the review record must hold

1. **Scope.** System or application reviewed, the entitlement population (accounts, roles, groups), the review period, and the named reviewers. Without scope, a later reviewer cannot tell whether an account was in scope or missed.
2. **Entitlement source.** The export used as the baseline, with source system, export timestamp, and the fields captured (account, entitlement, manager, last sign-in). Matching against memory is not evidence.
3. **Per-entitlement decision.** Retain, remove, or escalate, each with a reason, decided by the account or resource owner. Record the person authorized to decide and the person responsible for implementing the change.
4. **Reviewer sign-off.** Reviewer name and timestamp, so the judgment is attributable.
5. **Exceptions.** Entitlements retained past normal policy, with the compensating control and expiry date recorded.

## Ownership and revocation follow-through

A removal decision is not evidence that access ended. The record needs the revocation ticket ID, the removal timestamp, and a re-check confirming the entitlement is gone, plus owner confirmation. Access that survives the review window must appear in the next review as a carry-over item, not silently persist.

## Fictional worked example

The accounts and dates below are fictional.

In this fictional example, a finance-system access review ran from November 3 to 10, 2026. The analyst recorded the asset owner’s decisions against the original export. Fourteen entitlements were in scope. Twelve were retained with owner sign-off. Two were removed: one for an employee transferred out of finance (ticket IT-4412), and one for a contractor whose contract ended 2026-10-23 but whose access remained (ticket IT-4413). Both removals were verified revoked on 2026-11-11, and the owner confirmed each in the change record. The contractor case became a finding: offboarding workflow did not revoke access on contract end date, with remediation owned by IT operations and due 2026-12-01.

The review record — scope, export, decisions, sign-offs, tickets, re-checks — is retained so the Q1 2027 reviewer can reproduce it. NIST SP 800-53 Rev. 5, control AC-2 Account Management, calls for a review at an organization-defined frequency. Keeping the export, decision, and recheck together lets another reviewer reproduce the result.

[Primary source: NIST SP 800-53 Rev. 5, Access Control family](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
