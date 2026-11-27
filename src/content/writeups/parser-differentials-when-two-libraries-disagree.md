---
title: "When Two Parsers Disagree: URL, Query, and Routing Differentials"
slug: "parser-differentials-when-two-libraries-disagree"
date: "2026-11-27"
description: "Why checking an input with one parser and forwarding the raw string to another keeps creating SSRF, routing, and authorization bypasses."
category: "web"
difficulty: "medium"
tags:
  - appsec
  - parser-differential
  - web
  - javascript
published: true
---

If I had to pick one bug pattern that refuses to die—in real web apps, reverse proxies, and CTF challenges alike—it isn't some exotic memory-corruption chain. It's two perfectly reasonable pieces of code reading the exact same string and coming away with two different answers.

On paper, nothing looks wrong. You have a guard at the front that parses the URL or query string and says "yep, looks safe." Three lines later, a router, HTTP client, or query parser reads the *raw* input again, applies its own rules, and quietly routes the request somewhere the guard never checked.

## The setup

Consider a fairly ordinary Node handler that tries to inspect incoming parameters or target URLs before forwarding a request. Nothing fancy here—just the usual validation wrapper you see in Express or custom middleware:

```ts
function validateId(raw: string): string {
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error("Invalid report ID");
  }
  // Looks validated... except we just returned the original string.
  return raw;
}
```

And right next to it, a route or helper that trusts single-valued parameters:

```ts
const url = new URL("https://example.local/item?role=viewer&role=admin");
const firstRole = url.searchParams.get("role"); // "viewer"
const allRoles = url.searchParams.getAll("role"); // ["viewer", "admin"]
```

At first glance, both snippets look harmless. One checks `parseInt` and throws on `NaN`. The other uses the standard WHATWG `URL` API. Surely there's nothing weird going on here?

## Initial thoughts (and why the obvious tricks fail)

If you poke at `validateId("admin")` or `validateId("../../../etc/passwd")`, `parseInt` returns `NaN` immediately and throws `Invalid report ID`. Dead end. You can't pass plain letters or a leading `../`, so any naive traversal test gets shut down on the spot.

Same story if you test `url.searchParams.get("role")` with `?role=admin` when a middleware blocks `admin`: the single-value lookup sees `"admin"` and rejects it. Looks tight enough until you ask a slightly more annoying question: *what happens after the check passes?*

## The quirk: parsing without coercing (and reading twice)

Look again at `validateId`. `parseInt("1/../../api/posts/1/body", 10)` does **not** return `NaN`. In JavaScript, `parseInt` reads leading digits until it hits a non-digit character and stops—so it happily returns `1`!

Because the function never replaces `raw` with `String(parsed)`, the caller gets the entire un-coerced string back. Pass that into `path.posix.join`:

```js
const path = require("node:path");

const rawInput = decodeURIComponent("1%2F..%2F..%2Fapi%2Fposts%2F1%2Fbody");
console.log(parseInt(rawInput, 10)); // 1
console.log(path.posix.join("/posts", rawInput, "view"));
// -> "/api/posts/1/body/view"
```

Just like that, a numeric ID check let a full path traversal walk right through the front door—not because `parseInt` is broken, but because the code *checked* the integer and *kept* the string.

The query-parameter version works the exact same way when two libraries disagree on repeated keys or bracket syntax:

1. **Duplicate keys (`?role=viewer&role=admin`)**: Middleware A calls `url.searchParams.get("role")`, gets `"viewer"`, and waves it through. Downstream Handler B uses a parser (`qs`-style or `getAll`) that takes the *last* value or an array `["viewer", "admin"]`—and suddenly `role.includes("admin")` is true.
2. **Bracket & dot syntax (`?filter[a]=1`)**: The WHATWG `URLSearchParams` parser treats `filter[a]` as a literal key name; a framework body/query parser like `qs` turns it into a nested object `{ filter: { a: "1" } }`. Any check written against flat string keys completely misses the nested object the handler actually receives.
3. **Host & authority splits**: Regexes or custom string splitters looking for `@`, `\`, or port numbers routinely disagree with `new URL()` or an HTTP client like `curl` / `fetch` on which half of `http://allowed.internal\@attacker.example/` is the hostname.

## Putting the boundary back together

None of these bugs require clever zero-days to prevent. They come down to one rule: **parse once, normalize once, and pass the parsed value forward—never the raw string.**

- **Coerce, don't just check**: If an ID must be an integer, return `parsed` (an actual `number` validated with `/^\d+$/` or `Number.isSafeInteger`), never `raw`.
- **Reject ambiguous inputs**: If a parameter should appear once, check `searchParams.getAll(key).length <= 1` and return `400` on duplicates instead of silently picking first or last.
- **Share the parser between gate and handler**: Whatever library parses the URL, path, or query string for your authorization check should produce the exact object your business logic reads.

If two components in your stack look at the same input string twice, assume they will eventually disagree—and assume an attacker will live right inside that gap. For a closely related mismatch between validation and decoding order, see [Validate First, Decode Later](/writeups/check-before-decode-normalization-traps).

## References

- [WHATWG URL Standard](https://url.spec.whatwg.org/)
- [MDN — parseInt() behavior](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt)
- [PortSwigger — HTTP request smuggling & parser differentials](https://portswigger.net/web-security/request-smuggling)
