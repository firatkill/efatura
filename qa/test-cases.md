# QA test cases

## Repository setup (before M0)

Sources: AGENTS.md §7 Repository setup and Authorship. These are setup acceptance checks, not parser tests; TRD §16 has no test ID for repository initialization.

| TC ID | AC reference | TRD test ID | Title | Priority | Automatable | Expected result |
| --- | --- | --- | --- | --- | --- | --- |
| TC-SETUP-001 | AGENTS.md §7 | N/A (repository setup) | Initialize with owner identity and active hook | Critical | yes | main branch; executable hook; owner is author and committer |
| TC-SETUP-002 | AGENTS.md §7 | N/A (repository setup) | Enforce authorship and remove attribution | Critical | yes | Owner accepted; invalid author and committer rejected; attribution stripped |

### TC-SETUP-001

Precondition: documents-only folder, matching git identity.

1. Check git user.name and user.email before initialization.
2. Initialize main once, configure core.hooksPath, and check hook executability.
3. Inspect git author and committer identities.

Expected: identities match the owner exactly and the hook is active.

### TC-SETUP-002

Precondition: configured repository with the supplied hook.

1. Create a temporary message under .git with a valid subject and attribution lines.
2. Invoke the hook with the owner identity and inspect the message.
3. Invoke it separately with an invalid author and invalid committer using process-local environment overrides.
4. Remove the temporary files.

Expected: the valid invocation succeeds and removes attribution; each invalid identity is rejected. No git identity configuration changes.

## M0

Milestone test-case design will be completed before T-01 code begins, from PRD NFR-05, NFR-11, NFR-13–NFR-18, FR-56 and FR-60, TRD §§2–3 and §§16–18, and T-01–T-04 acceptance criteria.
