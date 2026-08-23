<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent workflow

### Always true

- Agy is the default implementation executor via the native launcher (`scripts/start-agy.ps1`).
- Codex remains responsible for scope, review, validation, and publication.
- For a file-changing task, work from `master` on `agent/<task-slug>`. Do not delegate over unrelated changes.
- Disallow `.env`, credentials, dependency, or configuration changes unless the brief explicitly allows it.
- After validated work, Codex makes a short imperative commit, fast-forwards into `master`, and pushes `origin/master`. Stop if remote state prevents a fast-forward or any required check is incomplete.

### Route work deliberately

- Prefer the launcher (`scripts/start-agy.ps1`) for implementations.
- Use Flash for bounded discovery, file scanning, and trivial edits.
- Use Pro only for complex implementation, architecture, and final diff review.
- Before a Pro implementation, confirm `agy` is available. Do not spend a separate model call on a read-test, credit check, or workspace-trust probe.

### Delegate brief

Use this concise form; do not restate this policy in task updates. Ensure concise allowed/forbidden briefs.

```text
Goal: ...
Allowed: ...
Forbidden: ...
Model: flash | pro
Acceptance: ...
Checks: ...
Delivery: diff summary | commit and push master
```

### Validate and recover

- Adopt lean validation: for scoped UI/content work run `npm run build` then request manual review instead of broad tests/browser checks unless risk or user request warrants them.
- Allow one implementation pass and one evidence-based Agy correction. Tooling, authentication, sandbox, and missing-output failures do not consume that correction; do not retry them blindly.
- After the correction, Codex may make only a typing, formatting, or lint fix affecting fewer than five lines. Rerun the affected checks. Stop for anything else.
- On Windows, use single-line Agy prompts. If headless output is missing, inspect the diff; continue only when the intended change is present and independently verifiable.
- Report only the task result, changed files, checks, and blockers—never repeat the workflow.
