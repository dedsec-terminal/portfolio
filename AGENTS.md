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

- Codex may always run safe read-only discovery commands, including `git
  status`, `git diff`, `git log`, directory inspection, and source-file reads.
- Before delegating, inspect the relevant code and create a local
  `agent/<task-slug>` branch from `master`. Do not delegate over an unrelated
  dirty working tree.
- Complete an Antigravity preflight before implementation: confirm the account
  is authenticated and has available credits, the workspace is trusted, and
  `agy models` lists `gemini-3.1-pro-high`. Then run one sandboxed, plan-mode,
  single-line read test that returns a short response without changing files.
  Stop if any preflight check fails.
- Give Antigravity a bounded implementation brief: allowed paths, acceptance
  criteria, required checks, and explicit exclusions. Codex retains ownership
  of architecture, diff review, validation, and correction prompts.
- Antigravity must not commit, push, create or merge pull requests, deploy,
  change credentials, read or modify `.env*`, or run Git publication commands.
  It may not alter dependencies, configuration, or unrelated files unless the
  task brief explicitly permits them.
- After each implementation pass, Codex must inspect the diff and run the
  applicable validation gates: `npm run lint`, `npm run typecheck`,
  `npm test`, `npm run content:check`, and `npm run build`. Run browser
  verification for visual changes only after every static gate passes.
- The two correction rounds count only Antigravity calls that request changes
  to the delegated implementation. Authentication, model, sandbox, or output
  capture failures are preflight/tooling failures: do not retry blindly or
  consume a correction round. On Windows, use only single-line prompts; if
  headless output is absent, stop and request an interactive Antigravity
  terminal fallback.
- After both implementation correction rounds are exhausted, Codex may repair
  only a validation-only typing, formatting, or lint issue that changes fewer
  than five lines. It may not alter behavior, tests, dependencies, or
  configuration under this exception. Rerun the failed check and the affected
  validation gates before accepting the result.
- After every review gate passes, Codex must create a short imperative commit,
  fast-forward the reviewed branch into local `master`, and push `master` to
  `origin`. Stop rather than creating a merge commit if the remote has
  advanced, the fast-forward is unavailable, or any validation is incomplete.
- Do not open a PR, make a deployment API call, or use any Git command beyond
  the reviewed fast-forward and `git push origin master`. Production deployment
  is the hosting provider's consequence of that verified production-branch
  push. This project rule is standing authorization for Codex—not
  Antigravity—to publish validated implementation changes to `origin/master`.
