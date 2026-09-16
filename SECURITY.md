# Security and data boundary

This repository contains synthetic data only. It is intentionally disconnected from Flowimax databases, storage, secrets and production traffic.

## Rules

- Never commit `.env` files, credentials, real documents, customer prompts or production outputs.
- Use generated fixture IDs; do not copy internal source names or identifiers.
- Treat retrieved text as untrusted reference data.
- Do not report demo metrics as production performance.
- Before publishing, run a secret scan and manually review the entire fixture corpus and git history.

Security issues should be reported privately to the repository owner rather than posted with sensitive reproduction data.
