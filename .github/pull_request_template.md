## Summary

<!-- What does this change and why? Link the issue if there is one. -->

## Testing

<!-- How did you verify it? Commands run, flows clicked through. -->

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`

## Screenshots

<!-- For UI changes: before / after. Delete this section otherwise. -->

## Checklist

- [ ] Includes a database migration (new numbered file in `supabase/migrations/`, existing files untouched)
- [ ] Migration must be applied to production (`supabase db push`) before or alongside deploy
- [ ] New or changed environment variables are added to `.env.example` and Vercel
- [ ] User-facing copy (especially privacy claims) matches what the code actually does
- [ ] `changelog.md` updated under **Unreleased**
