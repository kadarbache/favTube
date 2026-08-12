# favTube

## Workflow

**After completing a task, commit the change.** Don't leave finished work sitting
uncommitted in the working tree.

- Verify before committing: run `pnpm lint` and `pnpm build`. Type-checking alone is not
  enough here — `tsc` has passed while `next build` failed (a `"use server"` file may only
  export async functions), and a CSS transition silently broke the theme toggle with no
  error anywhere.
- Keep each commit scoped to one task rather than batching unrelated changes together.
- Never commit `.env` — it holds the real Neon, better-auth, and YouTube credentials. It is
  gitignored; `.env.example` is the committed placeholder.
