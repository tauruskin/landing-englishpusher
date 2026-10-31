# Tracker — landing-page

> Status of every task in the epic. `implement` updates **Status** and **Step** after every
> subagent it runs (and commits them with the task), so this table shows where the run is right now.
> Status: `todo` · `in_progress` · `blocked` · `review` · `done`.
> Step: `SELECT` · `RED` · `GREEN` · `REFACTOR` · `GATE` · `REVIEW` · `COMMIT` (`—` before the task starts).
> A `blocked` row carries its reason in Step, e.g. `GATE — lint red after 3 retries`.

| # | Task | Layer | Owner | Estimate | Blocked by | Status | Step |
|---|---|---|---|---|---|---|---|
| T1 | site.ts: live host, isPublished, form IDs, INTERIM_COPY | domain | Oleksandr Pushkar (Operator) | S | — | done | COMMIT |
| T2 | Copy validate.ts + options.ts, pin parity, add LinkedIn | domain | Oleksandr Pushkar (Operator) | S | — | done | COMMIT |
| T3 | Copy hubspot.ts: entry address, 15 s cut-off, failure kind | domain | Oleksandr Pushkar (Operator) | M | — | done | COMMIT |
| T4 | events.ts: three dataLayer payloads | domain | Oleksandr Pushkar (Operator) | S | — | done | COMMIT |
| T5 | seo.ts: robots meta, robots.txt, sitemap.xml | domain | Oleksandr Pushkar (Operator) | S | T1 | done | COMMIT |
| T6 | BaseLayout head + robots/sitemap routes | wiring | Oleksandr Pushkar (Operator) | M | T1, T5 | done | COMMIT |
| T7 | Static sections + index.astro with Interim copy | ui | Oleksandr Pushkar (Operator) | S | T2, T6 | todo | — |
| T8 | TrialForm: fields, validation, trap field, sending | ui | Oleksandr Pushkar (Operator) | M | T1, T2, T3 | done | COMMIT |
| T9 | TrialForm: thank-you, failure banner, events | ui | Oleksandr Pushkar (Operator) | M | T4, T8 | todo | — |
| T10 | TrialDialog + client:idle mount | ui | Oleksandr Pushkar (Operator) | M | T4, T7, T9 | todo | — |
| T11 | Release checklist | docs | Oleksandr Pushkar (Operator) | S | T6, T10 | todo | — |

**Total:** 11 tasks, ~5 person-days (S ≈ 0.25 d, M ≈ 0.5–0.75 d).
