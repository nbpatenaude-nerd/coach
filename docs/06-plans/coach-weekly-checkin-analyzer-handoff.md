# Handoff: Coach Weekly Check-In Analyzer + Athlete Groups

**Status:** Implemented (2026-09-25) — Manage Groups `value-key` fix, analyzer date presets, expandable group sidebar  
**Date:** 2026-09-25  
**Audience:** Primary coding agent  
**Goal:** Keep the existing “Road of Trials” check-in analyzer layout, add **date filtering**, replace the flat athlete sidebar with **expandable/collapsible groups**, and **fix Manage Groups → Add member** (prod 400).
---

## 1. Executive answer

### What already exists (do not rebuild)

The Journey Legacy App screenshot is already largely implemented in the **current** app:

| Surface                  | Path                                                                              | Notes                                                                    |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Coach analyzer page      | `app/pages/coaching/check-in-analysis.vue`                                        | Left athlete list + main “The Road of Trials” panel                      |
| Stat strip + trend chart | `app/components/coaching/CheckInTrendChart.vue`                                   | Metric cards (avg / min–max), series toggles, Chart.js line              |
| Reply / video UI         | `app/components/coaching/AthleteCheckIns.vue`                                     | Used with `:show-trends="false"` on the analyzer page                    |
| Nav link                 | `app/components/coaching/CoachingNavbarLinks.vue` → `/coaching/check-in-analysis` | Label: “Check-ins”                                                       |
| Check-in data API        | `GET /api/coaching/athletes/[id]/check-ins`                                       | Last **52** weeks, newest first                                          |
| Athlete list (analyzer)  | `GET /api/coaching/crm/athletes`                                                  | Flat `User[]` for coaches                                                |
| Shared metrics helpers   | `shared/check-in.ts`                                                              | `aggregateCheckInFieldStats`, `buildCheckInTimeline`, field colors, etc. |
| Groups (roster)          | `app/components/coaching/GroupManager.vue` + `/api/coaching/groups*`              | Used on Athletes / Team pages — **not** on check-in analyzer             |

The screenshot’s empty chart (“Need at least two weekly check-ins…”) is **expected** when `< 2` rows exist — not a missing feature.

### What is missing vs the request

1. **Date filter** on the analyzer (not present today).
2. **Sidebar by expandable Groups** (today: flat scrollable list of every athlete).
3. **Manage Groups add-member is broken** in Coaching → Athletes (toast “Failed to add member”, network **400**).

### Bug (Groups add member) — root cause

**Observed (prod):**  
`POST https://app.journeyendurance.ca/api/coaching/groups/{id}/members` → **400 Bad Request**, toast “Failed to add member”.

**Server contract** (`server/api/coaching/groups/[id]/members.post.ts`):

```ts
const addMemberSchema = z.object({
  athleteId: z.string().uuid()
})
// …
if (!groupId || !result.success) {
  throw createError({ statusCode: 400, message: 'Invalid input' })
}
```

**400 is only returned when Zod fails** (or `groupId` missing). Permission failures are **403**; missing group is **404**. So the request body is not a UUID string.

**UI** (`app/components/coaching/GroupManager.vue`):

```vue
<USelect v-model="selectedAthleteId" :items="availableAthleteOptions" … />
```

`availableAthleteOptions` builds `{ label, value: athlete.id }` objects, but the select is **missing `value-key="value"`**.

Elsewhere in the repo (correct pattern):

- `app/components/coaching/CoachCalendarPanel.vue` — `USelectMenu` + `value-key="value"`
- `app/components/plans/PlanWizard.vue` — `USelect` + `value-key="value"`
- `app/components/workouts/analyzer/WorkoutAnalyzerExtendedPanels.vue` — same

Without `value-key`, Nuxt UI Select often binds the **whole item object** into `v-model`. The POST then sends `{ athleteId: { label, value } }` (or similar), Zod rejects it → **400 Invalid input**.

**Same footgun** on the create-group team scope `USelect` in the same file (`newGroup.teamId`) — fix both while touching the component.

**Secondary hardening (recommended):**

- In `addMember()`, coerce: if model is object, use `.value`.
- Improve API 400 payload to include `result.error.flatten()` so future failures are diagnosable.
- Unit test: POST with non-string / object body → 400; POST with valid UUID + relationship → 201.

**Not the primary cause:** relationship / team checks (those are 403). Upsert in `teamRepository.addAthleteToGroup` would not return 400.

---

## 2. Desired product (what Nick wants)

1. **Keep** the current Road of Trials layout (stat cards → trend toggles/chart → recent submissions → reply/video).
2. **Filter by athlete** (already) **and by date** (new).
3. **Tighten the sidebar:** organize athletes under **expandable / collapsible Groups** (reuse existing AthleteGroup data), not one long flat list.
4. **Fix Manage Groups** so adding a member works (unblocks populating groups for the sidebar).

Out of scope unless ticket expands:

- Redesigning AthleteCheckIns reply UX
- Changing weekly check-in form schema / athlete submit flow
- CRM pipelines

---

## 3. Current inventory (owned paths)

### Analyzer UI

| File                                            | Role                                                |
| ----------------------------------------------- | --------------------------------------------------- |
| `app/pages/coaching/check-in-analysis.vue`      | Page shell: flat sidebar + fetch athletes/check-ins |
| `app/components/coaching/CheckInTrendChart.vue` | Metrics strip + trends (pass **filtered** rows)     |
| `app/components/coaching/AthleteCheckIns.vue`   | Per-check-in reply/video (loads its own data today) |

### Groups

| File                                                            | Role                                                                                                 |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `app/components/coaching/GroupManager.vue`                      | Manage Groups UI + add/remove members (**bug here**)                                                 |
| `app/pages/coaching/athletes/index.vue`                         | Passes `:groups` / `:athletes` (relationships) into GroupManager; flat group **tabs**, not accordion |
| `server/api/coaching/groups/index.get.ts`                       | Coach groups + `members: [{ athleteId }]`                                                            |
| `server/api/coaching/groups/[id]/members.post.ts`               | Add member                                                                                           |
| `server/api/coaching/groups/[id]/members/[athleteId].delete.ts` | Remove member                                                                                        |
| `server/utils/repositories/teamRepository.ts`                   | `getGroupsForCoach`, `addAthleteToGroup`, …                                                          |

### Check-in APIs

| File                                                 | Role                                          |
| ---------------------------------------------------- | --------------------------------------------- |
| `server/api/coaching/athletes/[id]/check-ins.get.ts` | List (no date query params today; `take: 52`) |
| `server/api/coaching/crm/athletes.get.ts`            | Flat athlete users for analyzer sidebar       |
| `shared/check-in.ts`                                 | Form fields, stats, timeline builders         |

---

## 4. Implementation plan

### Phase 0 — Fix Manage Groups add member (do first)

**Why first:** Sidebar groups are useless if coaches cannot populate membership.

1. In `GroupManager.vue`, add `value-key="value"` to both athlete and team `USelect`s.
2. Optionally normalize `selectedAthleteId` before POST.
3. Optionally enrich API 400 with Zod details.
4. Manual verify on `/coaching/athletes`: Manage Groups → pick athlete → `+` → member appears; no 400.
5. Add a focused unit/API test if patterns exist for coaching group routes; otherwise a small Vitest on the handler with mocked repos is enough.

**Acceptance:** Adding “Drew Kilback” (or any ACTIVE coached athlete) to “UNLEASH Run (Nick)” returns **201** and lists under Current Members.

---

### Phase 1 — Analyzer date filter

**UX (match existing design language):**

- Place controls in the analyzer header row (next to Refresh): e.g. **From** / **To** week pickers, or presets (`Last 4 weeks` / `Last 12 weeks` / `Last year` / `All loaded`).
- Filtering applies to:
  - `CheckInTrendChart` `:rows`
  - “Recent submissions” list
  - Stat strip averages (derived inside the chart from `rows`)

**Preferred approach (minimal risk):**

1. Keep fetching via existing check-ins API (`take: 52`).
2. Client-side filter on `weekStartDate` / `submittedAt` with a computed `filteredCheckIns`.
3. Pass `filteredCheckIns` into chart + recent list.

**Optional API follow-up** (only if product needs >52 weeks or server-side enforcement):

```http
GET /api/coaching/athletes/:id/check-ins?from=YYYY-MM-DD&to=YYYY-MM-DD
```

Add `weekStartDate: { gte, lte }` to the Prisma `where` in `check-ins.get.ts`. Not required for v1 if client filter is enough.

**Note:** `AthleteCheckIns` currently **refetches** its own list and ignores page-level date filter. Either:

- Pass filtered ids / date range as props and skip duplicate fetch when embedded, **or**
- Leave reply section unfiltered for v1 (document as known limitation).

Recommend: prop `dateFrom` / `dateTo` (or prefiltered rows) so reply list stays consistent.

**Date UI:** Reuse `UCalendar` + `UPopover` patterns from `app/pages/coaching/calendar.vue` / `app/pages/analytics/index.vue` — do not invent a new date library.

---

### Phase 2 — Grouped expandable sidebar

**Data:**

```ts
// Parallel fetch on check-in-analysis.vue
useFetch('/api/coaching/crm/athletes') // or /api/coaching/athletes if you prefer relationship shape
useFetch('/api/coaching/groups') // includes members[].athleteId + _count
```

Prefer **one** athlete source. CRM returns flat users; Groups membership uses **User ids**. Map:

```ts
group.members.map(m => m.athleteId) → athletes.find(a => a.id === athleteId)
```

If switching to `/api/coaching/athletes` (relationships), use `rel.athlete.id` consistently (same as Athletes page `filteredAthletes`).

**Sidebar UX:**

```
SELECT ATHLETE
▾ UNLEASH Run (Nick)     (n)
    ○ Athlete A
    ● Athlete B   ← selected
▸ Another Group          (m)
▾ Ungrouped              (k)   ← athletes in no group
    ○ …
```

Behavior:

- Click **group header** → expand/collapse (local `Set` / record of open group ids; default: expand groups that contain the selected athlete, or all groups with members).
- Click **athlete row** → set `selectedAthleteId` (same as today).
- Persist expand state in `sessionStorage` optional nicety.
- Show empty group collapsed by default or hide empty groups (product choice — recommend show empty collapsed so coaches see structure).
- Keep sidebar width ~`w-64`; denser rows (`py-1.5`, smaller avatar) to “tighten” vs current blocky list.

**Do not** reuse GroupManager’s horizontal tab strip inside the analyzer — that is roster filtering, not navigation. Build a small dedicated component, e.g.:

`app/components/coaching/CheckInAthleteGroupSidebar.vue`

Props: `athletes`, `groups`, `modelValue` (selected athlete id).  
Emits: `update:modelValue`.

**Ungrouped:** athletes whose id is not in any `group.members[].athleteId`.

**Deep link (optional):** `?athleteId=` query sync so coaches can bookmark.

---

### Phase 3 — Polish / parity with screenshot

Mostly already done via `CheckInTrendChart`. Verify:

- Metric cards show colored dots + large avg + `avg · min–max` (already).
- Series pills default first N visible (`defaultVisibleCount: 5`) (already).
- Recent submissions show week + short rating chips (already).
- Empty states unchanged.

Only adjust copy/spacing if product wants pixel-closer Legacy feel — **not** a rewrite.

---

## 5. Suggested implementation order

| Step | Work                                                                       | Verify                                             |
| ---- | -------------------------------------------------------------------------- | -------------------------------------------------- |
| 0    | Fix `GroupManager` `value-key` (+ optional API error detail)               | Add member in prod/staging/local → 201             |
| 1    | Date filter computed + header controls on `check-in-analysis.vue`          | Changing range updates chart + list                |
| 2    | Extract `CheckInAthleteGroupSidebar`; wire groups fetch                    | Expand/collapse; select athlete; ungrouped section |
| 3    | Align `AthleteCheckIns` with date filter (if in scope)                     | Reply list matches filtered weeks                  |
| 4    | Tests: groups members POST body; optional page composable filter unit test | CI green                                           |

---

## 6. Acceptance criteria

- [ ] Manage Groups: add member succeeds (201); member listed; roster group filter includes them.
- [ ] Check-in analyzer sidebar shows **groups** that expand/collapse; athletes nested underneath; ungrouped section present.
- [ ] Selecting an athlete still loads Road of Trials (stats + trends + recent + reply).
- [ ] Date filter narrows stats, chart, and recent submissions (and reply list if Phase 3).
- [ ] With &lt; 2 check-ins in range, chart still shows the existing empty message.
- [ ] No regression to Athletes page group tabs / create group / delete group.
- [ ] Do not break Railway/auth/Prisma import rules (this work is UI + existing coaching APIs only).

---

## 7. Explicit non-goals / pitfalls

- **Do not** rebuild CheckInTrendChart from `RoadOfTrialsChart.vue` (older athlete-facing card) — coach analyzer already uses the coaching component.
- **Do not** invent a second grouping model — use `AthleteGroup` / `AthleteGroupMember`.
- **Do not** treat 400 as “not coached”: that path is 403. Fix the Select binding first.
- **Do not** run `prisma migrate dev` for this work — no schema change required.
- Worktree protocol: one ticket → `bin/worktree-up.sh CW-…` (see `AGENTS.md`).

---

## 8. Quick file checklist for the coding agent

**Must touch**

- `app/components/coaching/GroupManager.vue` — `value-key="value"` (add member fix)
- `app/pages/coaching/check-in-analysis.vue` — groups fetch, date filter, new sidebar
- New: `app/components/coaching/CheckInAthleteGroupSidebar.vue` (recommended)

**Likely touch**

- `server/api/coaching/groups/[id]/members.post.ts` — clearer 400 errors
- `app/components/coaching/AthleteCheckIns.vue` — optional date-range props
- `server/api/coaching/athletes/[id]/check-ins.get.ts` — optional `from`/`to` query
- Tests under `tests/unit/server/api/coaching/groups/` (create if missing)

**Read-only reference**

- `app/components/coaching/CheckInTrendChart.vue`
- `shared/check-in.ts`
- `app/pages/coaching/athletes/index.vue` (how groups + athletes join today)
- `server/utils/repositories/teamRepository.ts` (`getGroupsForCoach`)

---

## 9. One-paragraph brief for Linear / PR

> Fix Manage Groups add-member 400 (USelect missing `value-key`, body not a UUID). Enhance `/coaching/check-in-analysis` to keep Road of Trials layout, add week/date range filtering, and replace the flat athlete sidebar with expandable AthleteGroup sections (plus Ungrouped), reusing existing `/api/coaching/groups` membership data.
