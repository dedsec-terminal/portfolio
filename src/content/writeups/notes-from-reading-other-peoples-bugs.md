---
title: "Reading Other People's Bugs (And Why Rabbit Holes Are Half the Work)"
slug: "reading-other-peoples-bugs"
date: "2026-11-27"
description: "Notes on why polished writeups hide the messy part of debugging, why dead ends deserve a line in the notebook, and how I keep track of walls I've already walked into."
category: "misc"
difficulty: "easy"
tags:
  - security-research
  - notes
  - debugging
  - learning
published: true
---

If you read enough security writeups, you can start to believe everyone else just opens `app.ts`, scrolls straight to line 42, whispers "aha, parser differential," and goes outside to touch grass.

In reality? Half my time reading someone else's codebase goes something like this: spend ten minutes feeling clever about the Dockerfile (there is almost never anything in the Dockerfile), convince myself an endpoint is definitely vulnerable to SQLi, read three more helper files, realize they are using parameterized queries everywhere, sigh, and go back to square one.

The annoying part—and honestly the useful part—is that those dead ends rarely make it into final notes. By the time something gets cleaned up for a report or a post, all the wrong turns get edited out so the author looks 40% smarter than they felt at 1:30 AM.

## Notes are mostly bookmarks for yesterday-me

I keep coming back to a simple reason for writing technical notes down at all: yesterday-me had no idea a particular quirk existed, today-me just spent an hour tripping over it, and next-month-me will definitely forget unless it lives somewhere searchable. And if somebody else happens to wander onto the page and skip a wall I already walked into headfirst, even better.

That sounds obvious until you actually try to write a note while a bug is still fresh. When I'm debugging a lab or an alert, my rough notes look terrible:

- `check /api/export — looks sus, takes raw filename??`
- `(never mind, path.basename strips it)`
- `wait why is the validator returning raw string instead of the parsed int`

Clean prose comes later. Keeping the "wait, why did I check that first?" breadcrumbs intact is what makes a note worth re-reading later, because it records the *assumption* that failed, not just the line of code that won.

## The three files everyone skims too fast

Whenever I open a new project or challenge repo—whether it's an appsec review or one of the smaller tools in my own [writeups](/writeups)—I've noticed the bugs almost never live where the dramatic code is. They live in the boring glue:

1. **The schema or validator layer** that checks a field, decides "yep, looks like a number," and then quietly hands the original unparsed string to the next function.
2. **The config and routing glue** where a proxy, a framework router, and a custom middleware all have slightly different opinions about what `%2F` or a duplicate query key means.
3. **The helper someone wrote in a hurry** ("just for dev convenience") that stayed in production.

Whenever a piece of code looks *too* clean on the surface—say, a strict allow-list right at the front door or a battle-tested sanitizer like DOMPurify—that's usually the signal to stop staring at the front door and check what else reads the same database row or file path without going through that door at all.

## Keeping the workbench small

Working on tools like [Ghostwire](/projects/ghostwire) and [TraceIR](/projects/traceir) pushed me into the same habit from the defensive side. When something breaks or looks weird in a log, you don't want a black-box answer that says "trust me, it's fine." You want to see the exact intermediate step where the bytes, timestamps, or assumptions drifted.

So that's the rule I'm trying to stick to in these posts: show the setup, show the obvious thing that *didn't* work (because that's usually what everyone tries first), and point straight at the weird line that actually broke the boundary. Less textbook polish, more honest terminal scratchpad.
