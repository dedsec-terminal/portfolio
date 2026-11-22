---
title: "Session Sign-Out Acceptance: Local vs Account-Wide Logout"
slug: "session-signout-acceptance"
date: "2026-11-22"
description: "Defensive acceptance checks for sign-out semantics using synthetic sessions: local logout versus account-wide logout, against documented expectations."
category: "web"
tags:
  - session-management
  - logout
  - acceptance-testing
  - defensive-verification
published: true
---

## Documented expectations

Write down the application’s documented sign-out behavior before testing. The fictional application below offers separate local and account-wide controls.

- OWASP Session Management Cheat Sheet: applications must provide a visible, easily accessible logout mechanism and must invalidate the session at least on the server side. Deleting a cookie alone does not invalidate a stolen copy of the session ID.
- NIST SP 800-63-4: subscribers should have a readily accessible mechanism to terminate (log off) their session, and session termination must actually end the session.

Two semantics need separate acceptance checks:

- **Local logout** — Signing out ends that browser session. Other active sessions for the same account stay signed in.
- **Account-wide logout** (global sign-out, revoke all sessions) — terminates every session for the account, on every device.

## Acceptance procedure with synthetic sessions

Test with fictional accounts and separate browser sessions in a non-production environment.

1. Create synthetic accounts A and B. Sign account A into device 1 and device 2. Keep each synthetic browser session separate.
2. **Local logout on device 1.** Refresh a harmless protected view in each browser. Device 1 should require sign-in, while device 2 should stay signed in under this product’s local-only policy.
3. **Account-wide logout from device 2.** Both browsers should require sign-in on their next protected request. Confirm that starting a new session does not restore either ended session.
4. **Server-side invalidation.** Use the application’s own integration tests or session audit records to verify server-side rejection of ended sessions. Browser state confirms only part of the flow.
5. Cross-check account B is untouched by account A's logout events.

Record whether the application rejected each ended session within its documented revocation window. The mechanism may be a session store, token revocation, or another server-side control. Keep session credentials out of test logs.

Record expected result versus observed result for each case, with timestamps and tester. Any gap becomes a finding owned by the team and tracked before release.

[Primary source: OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
[Primary source: NIST SP 800-63-4, Session Lifecycle](https://pages.nist.gov/800-63-4/sp800-63b.html#sessionmgmt)
