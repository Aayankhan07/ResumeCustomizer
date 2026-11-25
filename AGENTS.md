<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project conventions

- **TypeScript for new files.** New files under `src/` are `.ts`/`.tsx`; remaining `.js`/`.jsx` files are migrated as they are touched.
- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:` ...).
- **Branch + PR into `main`.** No direct pushes to `main`.
- **Before opening a PR**, run `npm run lint`, `npm run typecheck` and `npm test`.
- **Never claim privacy behaviour in copy that the code does not do.** Landing, FAQ, privacy and terms copy must match what is actually stored, sent and deleted.
- **Migrations are append-only.** Add a new numbered file in `supabase/migrations/` (`NNN_description.sql`); never edit one that has been applied.
