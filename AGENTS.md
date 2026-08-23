<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent workflow

### Always true

- Codex owns planning, validation, review, and publication; Antigravity edits
  only. Safe discovery (`git status`, `git diff`, `git log`, directory and
  source reads) is always allowed.
- For a file-changing task, work from `master` on `agent/<task-slug>`. Do not
  delegate over unrelated changes.
- Antigravity never commits, pushes, deploys, accesses `.env*`, changes
  credentials, or changes dependencies/configuration unless the brief allows
  it.
- After validated work, Codex makes a short imperative commit, fast-forwards
  into `master`, and pushes `origin/master`. Stop if remote state prevents a
  fast-forward or any required check is incomplete; do not open a PR or call a
  deployment API.

### Route work deliberately

- Use a fast available Flash tier for branch setup, scanning, file discovery,
  test execution, and trivial edits.
- Use `gemini-3.1-pro-high` for architecture, ambiguous UI behavior, failed
  validation diagnosis, substantial implementation, and final diff review.
- Before a Pro implementation, confirm `agy` is available and its model list
  includes `gemini-3.1-pro-high`. Do not spend a separate model call on a
  read-test, credit check, or workspace-trust probe.

### Delegate brief

Use this compact form; do not restate this policy in task updates.

```text
Goal: ...
Allowed: ...
Forbidden: ...
Model: flash | gemini-3.1-pro-high
Acceptance: ...
Checks: ...
Delivery: diff summary | commit and push master
```

### Validate and recover

- Run static gates first: `npm run lint`, `npm run typecheck`, `npm test`,
  `npm run content:check`, and `npm run build`. Run browser checks only after
  they pass, and only for UI changes; check mobile and desktop when layout is
  affected.
- Allow one implementation pass and one evidence-based Antigravity correction.
  Tooling, authentication, sandbox, and missing-output failures do not consume
  that correction; do not retry them blindly.
- After the correction, Codex may make only a typing, formatting, or lint fix
  affecting fewer than five lines. Rerun the failed and affected checks. Stop
  for anything else.
- On Windows, use single-line Antigravity prompts. If headless output is
  missing, inspect the diff; continue only when the intended change is present
  and independently verifiable, otherwise report the failed task. Do not make
  an interactive fallback a prerequisite. For browser audio, follow gesture
  rules: start only after first interaction, never by silent autoplay.
- Report only the task result, changed files, checks, and blockers—never repeat
  the workflow.
