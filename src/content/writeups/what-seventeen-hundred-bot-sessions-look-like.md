---
title: "What 1,700 Bot Sessions Actually Look Like at 2 AM"
slug: "what-seventeen-hundred-bot-sessions-look-like"
date: "2026-11-27"
description: "Running a cloud honeypot sounds dramatic until you read the logs and realize 95% of the internet is scripts pasting busybox one-liners into thin air."
category: "forensics"
difficulty: "easy"
tags:
  - honeypot
  - greyfield
  - soc
  - threat-intel
published: true
---

Before you deploy an internet-facing honeypot, it's easy to picture a quiet cat-and-mouse game: someone probes a port, pauses to inspect the banner, types carefully, realizes something feels off, and backs out.

Then you actually deploy [Greyfield](/projects/greyfield), check the first thousand sessions, and realize the real internet is mostly two scripts colliding in the dark.

Across 1,728 Cowrie SSH and Telnet sessions from 128 source IPs in August–September 2026, almost nobody paused to look around. The overwhelming majority of traffic didn't even care whether the previous command succeeded. It was pure muscle memory encoded in Go or Python: connect, spray `root` / `123456` / `admin` / `ubnt`, land in a shell, dump a three-line `uname -a && cat /proc/cpuinfo && busybox` probe, try `wget` or `curl` against a dead staging IP, and disconnect before the prompt had time to cool down.

## The weird comfort of boring noise

On one hand, it's mildly hilarious watching an automated scanner ask a fake shell for `/bin/busybox ECCHI` or try the same router payload twelve times in four minutes from the same subnet. Nothing fancy here—just the background hum of port 22 and port 23 on any public cloud box.

On the other hand, that noise is exactly why detection engineering and SOC triage are harder than they look on slides. When 95% of your feed is loud, repetitive garbage, two things happen very quickly:

1. **You stop reading closely** (famous last words when a weird session actually shows up).
2. **You start mistaking volume for severity**, when the high-volume IP is just a noisy scanner and the interesting behavior is the one session that waited two seconds, checked `id`, looked at `uname -m`, and didn't fire the default Mirai copy-paste.

## Why the boundary mattered more than the bait

The part of Greyfield that took the most effort wasn't catching the bots—honestly, bots will walk right up to anything listening on port 22. The real work was building the fence around it: keeping admin SSH separated on a restricted port and source range, stripping operator IPs and reusable secrets in Python before anything hits the public observatory, and never treating GeoIP or ASN enrichment as "attribution."

A lot of security problems look dramatic from across the street and completely mundane up close. Reading honeypot telemetry at 2 AM teaches you both sides of that at once: most noise is tedious and automated, which is precisely why keeping your logs clean and reproducible is the only way you notice the odd line when it finally scrolls past.
