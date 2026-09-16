# Publication checklist

This repository is a public candidate, not an automatic publication target. Run the following immediately before creating a remote or pushing:

```bash
npm run verify
git status --short
git log --all --format='%h %an <%ae>'
```

## Required review

- Only fictional fixtures and synthetic evaluation cases are present.
- No environment file, credential, token, private key or database URL is tracked.
- No personal email, local computer path, private IP, employer, customer or internal project name is present.
- Claims describe this evaluation kit, not production accuracy or customer outcomes.
- The generated report states its synthetic-data limitation.
- Commit author identity and license attribution are intentionally approved for public display.
- The repository has no remote until the owner gives explicit publication approval.

## Local private-term protection

Create `.publication-denylist.local` with one private term per line. The file is ignored by Git but is loaded by both safety checks. It may contain employer names, customer names, internal domains and other terms that must never appear in a public commit.

Passing the automated audit is necessary but not sufficient. A human diff and history review remains required before the first push.
