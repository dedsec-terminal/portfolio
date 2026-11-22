---
title: "Service Account Access Review"
slug: "service-account-access-review"
date: "2026-11-22"
description: "A fictional least-privilege review identifies stale service-account grants and retires them with accountable checks."
category: "cloud"
tags:
  - service-accounts
  - least-privilege
  - access-review
published: true
---

Service accounts tend to outlive the project that created them. A scheduled job, integration, or application may still rely on a grant that no one remembers approving. Reviewing these identities is a maintenance task: establish ownership and purpose, compare effective permissions with current need, and remove unused access through a controlled change.

The example is fictional. The account names, grants, and review outcome below are illustrative, not findings from a real environment.

## Build a reviewable inventory

Start with the authoritative identity and cloud or application permission sources. For each non-human identity, record its owner, business purpose, service or workload, authentication method, last-seen activity where available, assigned roles, effective permissions, and next review date. Include inherited access and permissions granted through groups. Use last-used timestamps to guide follow-up, accounting for jobs that run monthly or annually.

In the fictional review, `svc-reporting` belongs to the finance data pipeline. Its current role permits reading the reporting dataset, which matches the documented job. A second grant permits reading an unrelated archive. The owner cannot identify a dependency, and the audit source shows no use during the review period. The team records that uncertainty and checks scheduled jobs, deployment configuration, and service documentation before changing access.

## Reduce access in controlled steps

Map each permission to a workload action and resource. Ask whether the identity needs to read, write, administer, or impersonate another identity, and whether the same task can use a narrower role or resource scope. [OWASP's Secrets Management guidance](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) emphasizes limiting secret access and managing service credentials deliberately. [NIST SP 800-53 Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) includes least privilege and account management controls.

For an uncertain grant, use the organization's approved change and rollback process. Notify the owner, document the expected impact, and remove or narrow the permission at a time when the workload can be observed. Avoid disabling an identity or rotating credentials as an unplanned test. Monitor the relevant job and authorization logs for a defined period, and restore access only through a reviewed change if a verified dependency fails.

In the fictional case, the owner confirms no archive dependency after checking the quarterly job schedule and deployment records. The archive grant is removed, the change ticket records the before-and-after role, and the pipeline completes its next scheduled run. That is evidence for this change, not a guarantee that the identity will never need broader access.

## Close the loop

Record the reviewer, owner response, evidence sources, decision, approver, change reference, validation result, and next review date. Escalate identities with no accountable owner or clear business purpose for a documented decision. Retire an identity only after confirming that the associated workload has been decommissioned and dependencies have been checked.

Recurring reviews turn least privilege into an operational habit. They also make the reasoning inspectable: each remaining grant has a purpose and owner, while removed grants have a change record and an outcome that another reviewer can verify.
