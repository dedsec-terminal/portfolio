---
title: "Validate First, Decode Later (And Other Ways Filters Quietly Fail)"
slug: "check-before-decode-normalization-traps"
date: "2026-11-27"
description: "How validation ordering, double URL-decoding, and user-controlled Content-Type headers turn strict-looking web filters into bypasses."
category: "web"
difficulty: "medium"
tags:
  - appsec
  - normalization
  - waf
  - input-validation
published: true
---

A lot of input filters fail for a remarkably boring reason: the check itself works fine, it just runs at the wrong point in the pipeline.

You put a WAF rule or a middleware check at the edge to reject `..`, `<script`, or suspicious file paths. Everything looks tidy in unit tests. Then in production, a reverse proxy decodes once, the app framework decodes a second time, or a static-file helper lets a query string pick the response `Content-Type`—and suddenly the "blocked" payload glides straight past.

## The setup

Take a classic three-line path check that looks completely reasonable when you're skimming a codebase quickly:

```js
function checkPath(raw) {
  if (raw.includes("..")) {
    throw new Error("Path traversal blocked");
  }
  return decodeURIComponent(raw);
}
```

And right alongside it, a surprisingly common "helpful" pattern in custom asset servers:

```ts
// Set Content-Type from ?contentType=... if supplied, otherwise send the file
if (typeof req.query.contentType === "string") {
  res.setHeader("Content-Type", req.query.contentType);
}
```

At first glance, the path check literally throws on `..`, and the `Content-Type` helper only serves files from an allowed directory or API response. What's the harm?

## Initial thoughts (and dead ends)

If you send `../../secrets`, `raw.includes("..")` throws immediately. If you send `%2e%2e%2fsecrets`, wait—`raw.includes("..")` is `false`! Already broken on single encoding if the check ran before `decodeURIComponent`.

Suppose someone catches that and fixes it to decode *once* before checking `..`. Done, right? Not quite, if there is another decoder downstream (a framework router, a proxy, or a second `decodeURIComponent` inside a helper):

```js
const raw = "%252e%252e%252fsecrets";
const once = decodeURIComponent(raw);   // "%2e%2e%2fsecrets" -> no ".."
const twice = decodeURIComponent(once); // "../secrets"       -> has ".."
```

Look how clean that miss is:

- At the edge / WAF: `raw` (`%252e...`) has no `..`. Passed.
- After one decode: `once` (`%2e%2e%2fsecrets`) still has no `..`. Passed.
- When the downstream handler decodes `%2e%2e%2f` a second time: `../secrets`. Now it traverses.

## The second trap: letting inputs choose how the browser reads them

The `Content-Type` trick is even sneakier because *no HTML injection on the page is even required* to make it hurt.

Imagine an app that runs strict sanitization (like DOMPurify) on its HTML views—so `<img src=x onerror=alert()>` is dead on `/posts/1`—and locks down scripts with a strict Content Security Policy (`script-src 'self'`). Dead end on the view route.

Now suppose there is also a JSON API endpoint `/api/posts/1/body` that returns raw user text in JSON, *and* a global middleware somewhere that honors `?contentType=text/javascript` (or forgets `X-Content-Type-Options: nosniff`). If a user stores valid JavaScript inside a plain text post and loads:

```html
<script src="/api/posts/1/body?contentType=text/javascript"></script>
```

Suddenly `'self'` in the CSP allows the `<script>` tag because the request is same-origin, and the browser executes the response as JavaScript because the server happily labeled it `text/javascript`. The sanitizer on the HTML route never even got called—we just asked a different route to serve raw bytes with an executable label.

## Why this matters in SOC and AppSec work

When you're tuning WAF rules or reviewing logs (something I run into constantly when pairing AppSec checks with operational telemetry), double-encoded paths like `%252e%252e` or weird query parameters like `?contentType=` are easy to dismiss if you only inspect the decoded URI in one layer.

A good rule of thumb when auditing any filter:

1. **Canonicalize before validating**: Resolve the full path (`path.resolve`) and verify it stays strictly inside the base directory with `path.relative(base, resolved)`—never rely on substring checks for `..` before decoding.
2. **Reject double encoding explicitly** if your edge doesn't expect literal `%` characters in paths, rather than decoding in a loop until nothing changes.
3. **Pin response `Content-Type`s server-side** and always send `X-Content-Type-Options: nosniff`. Never let a query parameter override how a browser interprets an API or asset response.

If your security check runs on string A and your application acts on string B, you don't have a filter—you have a timing gap between two representations.

## References

- [OWASP — Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
- [MDN — X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)
- [CWE-180: Incorrect Behavior Order: Validate Before Canonicalize](https://cwe.mitre.org/data/definitions/180.html)
