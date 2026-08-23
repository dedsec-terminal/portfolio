<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Default implementation workflow

For every implementation request that changes repository files, Codex is the
control plane and Antigravity (`agy`) is the implementation agent. Use the
`antigravity-portfolio-implementation` skill with
`gemini-3.1-pro-high`; do not use it for planning-only or review-only tasks.

- Before delegating, inspect the relevant code and create a local
  `agent/<task-slug>` branch from `master`. Do not delegate over an unrelated
  dirty working tree.
- Give Antigravity a bounded implementation brief: allowed paths, acceptance
  criteria, required checks, and explicit exclusions. Codex retains ownership
  of architecture, diff review, validation, and correction prompts.
- Antigravity must not commit, push, create or merge pull requests, deploy,
  change credentials, read or modify `.env*`, or run Git publication commands.
  It may not alter dependencies, configuration, or unrelated files unless the
  task brief explicitly permits them.
- After each implementation pass, Codex must inspect the diff and run the
  applicable validation gates: `npm run lint`, `npm run typecheck`,
  `npm test`, `npm run content:check`, and `npm run build`. For visual changes,
  also verify a local preview in a browser.
- Feed concrete review failures back to the same implementation task for at
  most two correction rounds. If the result remains unresolved, stop and
  report the evidence instead of broadening scope.
- After every review gate passes, Codex must create a short imperative commit,
  fast-forward the reviewed branch into local `master`, and push `master` to
  `origin`. Stop rather than creating a merge commit if the remote has
  advanced, the fast-forward is unavailable, or any validation is incomplete.
- Do not open a PR, make a deployment API call, or use any Git command beyond
  the reviewed fast-forward and `git push origin master`. Production deployment
  is the hosting provider's consequence of that verified production-branch
  push.
