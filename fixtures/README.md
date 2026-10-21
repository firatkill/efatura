# Synthetic fixtures

Never commit real invoices or real personal or company data. All committed XML, ZIP and XSLT fixtures belong in `fixtures/generated/` and are produced by `pnpm fixtures:generate` once T-31–T-33 implement the generator and its checks.

Use only the identities in TRD §15.2; these become `fixtures/identities.ts` in T-31. E-mail and website hosts must end in `.invalid`. Every generated invoice carries the prescribed synthetic-data comment and marker note (S19 omits notes). Never include signatures.

Temporary test files are written outside the repository at runtime. Local real invoices belong only in the git-ignored `private/` folder, read only by the aggregate corpus command after T-45. Do not log or share their contents.

T-31–T-32 add identity details and the generator tutorial. Report parsing problems with a synthetic scenario definition, never an original invoice.
