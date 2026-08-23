---
title: "Fools Mate, Revenge: When Configuration Becomes Code"
slug: "fools-mate-revenge"
date: "2026-08-23"
description: "A spoiler-conscious analysis of how unsafe object merging turns a harmless settings API into a prototype-pollution trust-boundary failure."
platform: "TryHackMe"
challenge: "Fools Mate, Revenge"
category: "web"
difficulty: "medium"
tags:
  - prototype-pollution
  - javascript
  - api-security
  - web
published: true
---

## The position on the board

[Fools Mate, Revenge](https://tryhackme.com/room/foolsm8v2) presents a chess application whose first line of defence has already been improved. That detail matters: the interesting question is no longer whether a browser-side restriction can be bypassed, but whether the server has actually stopped trusting data controlled by the browser.

The useful starting point is ordinary reconnaissance. Observe the requests made when the board loads, when a move is submitted, and when preferences change. Compare accepted and rejected requests, enumerate JSON fields, and look for values that are read later but never explicitly initialized. A settings endpoint deserves particular attention because configuration objects are often merged into defaults instead of being copied field by field.

## The broken trust boundary

JavaScript objects inherit properties through a prototype chain. If an application recursively merges attacker-controlled JSON without rejecting special keys such as `__proto__`, `constructor`, or `prototype`, the attacker may alter properties inherited by other objects. This is prototype pollution.

The important bug is not merely that an unexpected key reaches the application. It is that untrusted configuration is allowed to influence object behaviour outside the intended settings record. A later authorization or reward check may read a property it assumes came from trusted server state. If that property is absent on the object itself, JavaScript continues up the prototype chain and may find the attacker's value.

That produces a compact attack chain:

1. Map the client and API to find the settings or merge surface.
2. Identify a property used by the reward logic but not safely initialized as an own property.
3. Test whether nested special keys survive parsing and merging.
4. Confirm impact through application behaviour, without relying on the browser's UI as proof.

The chessboard is presentation. The vulnerability is a confused boundary between user preferences, shared object structure, and authorization state.

## Why this class of bug matters

Prototype pollution can appear deceptively local while changing behaviour across an entire Node.js process. Depending on what later consumes the polluted object, consequences can include authorization bypass, altered application configuration, denial of service, or injection into a more dangerous execution path. The same mistake also creates difficult incident-response conditions because the malicious value may not exist as an obvious own property on the object being inspected.

## Engineering the fix

The best remediation is to avoid generic recursive merging for security-sensitive input. Parse requests into a strict allow-list schema, reject unknown fields, and construct a new object containing only expected primitive values. Special keys should be rejected at every depth, not filtered only at the top level.

Defence in depth includes using objects without prototypes where dictionary semantics are required, checking critical values with `Object.hasOwn()`, freezing trusted defaults, keeping preferences separate from authorization state, and updating merge libraries with known pollution flaws. Tests should submit nested malicious keys and verify both the target object and unrelated fresh objects remain unchanged.

The broader lesson is simple: client-side controls improve usability, not authority. A patched interface is not a patched trust boundary.

## References

- [TryHackMe — Fools Mate, Revenge](https://tryhackme.com/room/foolsm8v2)
- [PortSwigger — Client-side prototype pollution](https://portswigger.net/web-security/prototype-pollution)
