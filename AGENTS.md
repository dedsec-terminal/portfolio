<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent workflow

### Always true

- Codex is responsible for implementation, scope, review, validation, and publication.
- For a file-changing task, work from `master` on `agent/<task-slug>`. Do not delegate over unrelated changes.
- Disallow `.env`, credentials, dependency, or configuration changes unless the brief explicitly allows it.
- After validated work, Codex makes a short imperative commit, fast-forwards into `master`, and pushes `origin/master`. Stop if remote state prevents a fast-forward or any required check is incomplete.

### Validate and recover

- Adopt lean validation: for scoped UI/content work run `npm run build` then request manual review instead of broad tests/browser checks unless risk or user request warrants them.
- Report only the task result, changed files, checks, and blockers—never repeat the workflow.
