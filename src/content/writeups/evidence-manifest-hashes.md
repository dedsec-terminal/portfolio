---
title: "Evidence Manifest and Hashes"
slug: "evidence-manifest-hashes"
date: "2026-11-22"
description: "A fictional defensive evidence handoff shows what hashes establish and what provenance still needs to explain."
category: "forensics"
tags:
  - evidence-handling
  - integrity
  - incident-response
published: true
---

A cryptographic hash is useful for checking whether bytes match a previously recorded value. It does not establish who collected a file, whether the source was trustworthy, or whether the collection process was complete. A defensible evidence handoff needs both integrity checks and a record of provenance.

The manifest example uses fictional records.

## Preserve the source and record the collection

Imagine a responder receives exported log files from a fictional service owner. Keep the original exports unchanged in the approved evidence repository, retain a working copy for analysis, and document the transfer through the organization’s authorized process. Record a case or ticket identifier, collector, source system and owner, collection method, relevant time window, export timestamp, original filename, file size, and any known limitations. Record normalized UTC alongside the original timestamp and offset.

Create a manifest that maps each evidence item to its recorded metadata and digest. For example:

```text
case: CASE-EXAMPLE-014
item: EV-002
source: fictional identity service export
filename: signins-2026-11-12.json
collected: 2026-11-12T16:40:00Z
collector: analyst-07
size_bytes: 18422
algorithm: SHA-256
digest: <computed value recorded in the controlled case manifest>
```

Compute the digest from the collected bytes with an approved tool and store it with the evidence record. Follow organizational policy for algorithm selection and handling. [NIST Secure Hash Standard](https://csrc.nist.gov/pubs/fips/180-4/upd1/final)

## Verify at meaningful handoffs

Recompute the digest after transfer into the evidence repository and before analysis of a copied item. Compare the result with the value recorded at collection. If it differs, stop treating the copy as verified: preserve both versions, document where the mismatch was found, and investigate the transfer or processing history. Do not overwrite the original manifest to make the values agree.

A matching digest gives strong evidence that the checked file matches the bytes associated with the reference digest. Check export accuracy, collection completeness, and clock accuracy through independent evidence. Explain these limits in the case notes rather than implying that a hash certifies the full investigation.

## Make provenance reviewable

Keep the manifest access-controlled, versioned, and linked to the case record. Record any transformation as a new item: for example, a filtered or parsed derivative should point back to its source, name the tool and version, and state the parameters used. Preserve the raw source alongside it when policy and retention rules allow. Separate factual observations from interpretation, and note who performed each action and when.

These practices align with the evidence integrity and documentation concerns in [NIST SP 800-86](https://csrc.nist.gov/pubs/sp/800/86/final) and [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final). For an example of keeping source record IDs beside derived working notes, see [From Alert to Timeline](/writeups/from-alert-to-timeline). Hashes make certain changes detectable. Provenance records the handling history for the next reviewer.
