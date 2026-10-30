---
status: Accepted
owner: "Oleksandr Pushkar"
reviewers: []
updated_at: "2026-10-30"
feature_size: ""
ticket: ""
---

# 0003 — No backend: submit leads from the browser to the existing HubSpot form, with copied form code

- **Status:** Accepted
- **Date:** 2026-10-30
- **Deciders:** Oleksandr Pushkar (owner), with Claude during `survey` (greenfield)

## Context

Every trial-lesson lead must land in the existing HubSpot form "Trial lesson request"
(`2226dfee-47d4-406f-ae1a-2e8c0952dec2`, portal `149535757`), because the Leads Bot, the HubSpot
deal pipeline and the Monday report read from it (brief §5). The app already posts to it from the
browser through HubSpot's public Forms submission API, with no key, sending the `hubspotutk`
cookie for attribution (`app-englishpusher/src/shared/trialForm/hubspot.ts`).

## Decision drivers

- Keep the whole lead chain unchanged.
- No server, no database, no secrets in this repo (static hosting, ADR-0002).
- One maintainer: the smallest thing that works.

## Considered options

1. **Browser → HubSpot Forms API, form logic copied from the app** — no backend; two copies of
   the form code.
2. **Browser → HubSpot Forms API, form logic in a shared package** used by both repos — no
   duplication, but a package to publish and version for a handful of files.
3. **Own backend or n8n webhook in front of HubSpot** — more control (spam, extra steps), but a
   server to run and a new failure point.

## Decision outcome

**Chosen:** Option 1, confirmed by the owner on 2026-10-30. Copied files carry a header comment
naming their source in `app-englishpusher`.

## Consequences

**Positive**
- Nothing new to run; leads, deals, Telegram cards and reports keep working as they do.
- No datastore, so no migrations.

**Negative**
- Duplicated code: a change to HubSpot fields or validation must be made in both repos.
- Spam protection is limited to the honeypot field the app already uses.
