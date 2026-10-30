---
status: Draft
owner: "Oleksandr Pushkar (xander.pushkar@gmail.com)"
updated_at: "2026-10-30"
depth: "medium"
---

# Idea brief — landing-englishpusher

## 1. Raw idea

The owner invoked `/sdd:interview` in the empty repo `landing-englishpusher` with no further text.
Asked "What's the idea for landing-englishpusher?", the owner chose the option:

> "Marketing landing page"

(The option's description was written by the interviewer, not the owner: "A new public sales page
for Tetiana's lessons that brings in trial-lesson leads, separate from the app and Moodle".)

## 2. Problem

- **Reported problem (owner-reported):** a stranger who reaches Englishpusher today lands on the
  app (`app.englishpusher.in.ua`) or the Moodle site (`englishpusher.in.ua`). Both are built for
  existing students. Neither explains who Tetiana is, what lessons cost, or why to choose her, so
  too few strangers book a trial lesson.
- **Existing workaround (source-verified, brain notes):** the app already has a branded
  "Book a trial lesson" form (link `#trial-lesson`) that creates a HubSpot contact and deal,
  fires GA4 `generate_lead`, and sends a card to the Leads Bot. Capturing leads works; persuading
  strangers is the gap.
- **Observed traffic (source-verified, Clarity, 2026-10-28 → 10-30):** ~90 non-bot sessions,
  almost all internal: 49 from `www.englishpusher.in.ua`, 14 from `app.englishpusher.in.ua`, 26
  with no referrer, 1 referral. No search, social or ad sessions appeared. Limit: Clarity only
  covers 3 days.
- **Desired outcome:** more strangers turn into trial-lesson leads. Target number not
  established.

## 3. Users

- **Prospective students the page must persuade (owner-reported):** two segments.
  - IT/office professionals: Ukrainian adults who need English for work, calls and interviews.
  - General adults: people learning for travel, life abroad, relocation or personal goals.
- **How they arrive (owner-reported plan):** links in Tetiana's social posts (LinkedIn phrase
  videos, Instagram), Google search, and word of mouth / links shared directly. No paid ads.
- **Tetiana Pushkar:** the teacher and business owner. She takes the trial lessons and decides
  on positioning, prices and what the page promises. Her own view of this idea has not been
  captured (see §8).
- **Oleksandr (idea owner, operator):** builds and maintains the page, tracking and lead
  handling (HubSpot, Leads Bot).
- **Existing students:** not the audience. Today they make up most of the observed traffic
  (§2), moving between Moodle and the app.

## 4. Why now

No trigger established. The owner reports no deadline, capacity gap or seasonal driver. A
supporting (not urgent) fact: the lead-handling chain behind a landing page already exists and is
live (HubSpot form → deal → Leads Bot → weekly report, since 2026-10-24; source-verified, brain
notes), so a page could plug into it rather than building lead capture from scratch.

## 5. Out of scope

- **Kids/teens (parents as buyers) and exam preparation (IELTS, NMT):** not addressed by the page
  (owner decision: only IT/office professionals and general adults).
- **Paid advertising:** not planned (owner decision); traffic comes from social posts, search
  and word of mouth.
- **Changing the Moodle site:** the page lives at a separate address, and `englishpusher.in.ua`
  (Moodle, its visitor front page and the student home page) stays as it is (owner decision).
- **A new lead-capture or CRM flow:** not needed. Constraint to preserve: leads must keep landing
  in the existing HubSpot form "Trial lesson request" so the Leads Bot, the HubSpot deal pipeline
  and the Monday analytics report keep working, and tracking stays in GTM container GTM-KJVX8GRG
  (source-verified, brain notes [[Personal-EnglishpusherAnalytics]], [[Personal-LeadsBot]]).
  How the page connects to them is a design question, not settled here.

## 6. Risks

Critique was done inline by the interviewer, not by an independent reviewer. The idea is
reversible (separate address, Moodle untouched, existing HubSpot form reused), so no separate
critic was dispatched.

1. **Weakest assumption: the page will get stranger traffic.** A page persuades visitors but
   does not bring them. Clarity for 28–30 Oct showed no social, search or ad sessions, even
   though Tetiana publishes LinkedIn phrase videos. Either those posts carry no link, or nobody
   clicks it. A new separate address also starts with no search ranking, and search traffic
   builds over months. If the traffic does not come, a well-written page still yields ~0 leads.
2. **Tetiana has not been consulted.** Positioning, prices and formats, what the page promises,
   her story, testimonials and photos are hers to decide or supply. Building first risks
   rewriting the page or publishing claims she would not make.
3. **Two segments on one page** (IT/office professionals and general adults) can blur the
   message. Whether to use one page with two sections or a separate message per segment is a
   specify/design question that depends on what Tetiana wants to sell.
4. **Separate address vs. search:** by owner decision, `englishpusher.in.ua` (Moodle) stays as
   it is, so brand searches may still land on the old Moodle visitor front page. Accepted
   tradeoff for safety. Easy to revisit later.
5. **Ownership after launch:** Oleksandr builds it, but prices, availability and testimonials
   go stale unless someone owns updates. Not discussed.

Evidence ledger:

| Claim / question | Class | Source / origin | Finding / limit |
|---|---|---|---|
| Strangers find no page that sells lessons | owner-reported | interview answer 2026-10-30 | Not observed in data. Clarity recordings not reviewed |
| Current traffic is almost all internal | source-verified | Clarity MCP query "sessions by referrer/channel", 2026-10-28 → 10-30 | ~90 sessions: 49 Moodle, 14 app, 26 no referrer, 1 referral, 0 social/search/ads. Only 3 days |
| Trial-lesson capture chain already exists | source-verified | `D:\brain\wiki\projects\Personal-EnglishpusherAnalytics.md` ("Update 2026-10-24"), `Personal-LeadsBot.md` | HubSpot form `2226dfee-…` → deal → Leads Bot → Monday report, live since 2026-10-24 |
| Current stranger-lead baseline | unknown | brain note of 2026-10-26 mentions 3 leads in a test report (2 Unknown, 1 Direct, incl. a test lead) | Too few and too mixed to act as a baseline |
| Traffic will come from social posts, search, word of mouth | assumption (owner plan) | interview answer | No evidence yet that posts drive clicks |
| Tetiana's agreement, content and positioning | unknown | interview answer: "not discussed yet" | Blocking (§8) |

## 7. Recommendation

**Direction (owner decisions, 2026-10-30):** a public marketing landing page for Tetiana's
lessons at its own address (Moodle untouched). It addresses IT/office professionals and general
adults, gets visitors from social posts, search and word of mouth (no paid ads), and sends trial
requests into the existing HubSpot "Trial lesson request" form. Intended result: around 2–4
trial requests a month from strangers, attributed to the page in HubSpot, within ~3 months of
launch.

**Accepted next step (owner accepted the interviewer's recommendation):** gather evidence before
specifying.

1. **Talk to Tetiana:** does she want this, which segments and offers to lead with, prices and
   formats she will publish, her story and credentials, testimonials and photos she can supply,
   and who keeps them up to date.
2. **Traffic test, 2–3 weeks:** put UTM-tagged links to the existing `app.englishpusher.in.ua#trial-lesson`
   in her LinkedIn and Instagram posts and bios (the UTM patterns already exist, see
   [[Personal-EnglishpusherAnalytics]]). Read clicks in GA4 and leads by source in the Monday
   report. This shows whether her posts bring any visitors at all before a page is built for
   them.
3. Then rerun `interview` to update this brief, and move to `specify` if both checks pass.

**Main tradeoff:** a few weeks of delay buys a page built on her real offer, plus evidence
that people will actually reach it.

**Alternatives considered:**
- *Improve the app hub instead of a new site* (an "about Tetiana / prices / why me" block around
  the existing form): less work and the same tracking. Not chosen now, but still credible if
  the traffic test shows little volume.
- *Specify now with assumptions:* rejected because Tetiana's decisions would stay as blocking
  unknowns in the spec.
- *Stop:* rejected because the owner wants to pursue it.

**Outcome: needs-evidence**

## 8. Open questions

| Unknown | Consequence | Blocking? | Verification action | Owner |
|---|---|---|---|---|
| Does Tetiana want this page, and what will she offer, price and promise? | Without it the page's content and positioning are guesses and may be rewritten | blocking | Conversation with Tetiana; record answers in this brief | Oleksandr (with Tetiana) |
| Do her social posts drive any clicks? | If not, the page gets ~0 visitors and the success bar cannot be met | blocking | 2–3 week UTM link test to `#trial-lesson`; check GA4 sessions by source + HubSpot leads by source | Oleksandr |
| Testimonials and photos available? | A sales page without social proof persuades less | nonblocking | Ask Tetiana; ask current students for permission to quote | Tetiana |
| Current baseline of stranger leads per month | Without it, "2–4 a month" cannot be compared with before | nonblocking | Count HubSpot deals by Original Source for Oct–Nov, excluding the test lead | Oleksandr |
| Which separate address (subdomain or new domain)? | Affects branding and links in bios | nonblocking | Decide at design stage | unassigned |
| Who keeps prices and availability up to date after launch? | The page goes stale and misleads leads | nonblocking | Agree with Tetiana | unassigned |
