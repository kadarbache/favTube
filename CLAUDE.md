# favTube

## Workflow

**After completing a task, commit the change.** Don't leave finished work sitting
uncommitted in the working tree.

- Verify before committing: run `pnpm lint` and `pnpm build`. Type-checking alone is not
  enough here — `tsc` has passed while `next build` failed, because a `"use server"` file
  may only export async functions.
- CSS transitions never advance in the agent browser pane (it does not composite frames),
  so any transitioned property reads as stuck at its starting value. That is a tooling
  artifact, not a bug: check whether the cascade is right by setting `transition: none`
  and re-reading the computed style, rather than deleting the transition.
- Keep each commit scoped to one task rather than batching unrelated changes together.
- Never commit `.env` — it holds the real Neon, better-auth, and YouTube credentials. It is
  gitignored; `.env.example` is the committed placeholder.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
