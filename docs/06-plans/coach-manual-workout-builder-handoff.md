# Handoff: Coach Manual Workout Builder (TrainingPeaks-style)

**Status:** Research complete — implementation not started  
**Date:** 2026-09-23  
**Audience:** Primary coding agent  
**Goal:** Let a coach build endurance workouts block-by-block (no AI), including on an athlete calendar, with TrainingPeaks-like length and intensity controls (duration _or_ distance; relative _or_ absolute targets).

---

## 1. Executive answer (current product)

### Can a coach create athlete calendar workouts without AI today?

**Partially yes.**

| Action                                                           | Without AI?                 | Where                             |
| ---------------------------------------------------------------- | --------------------------- | --------------------------------- |
| Schedule a library template onto an athlete day                  | Yes                         | Coaching calendar                 |
| Move / copy / delete / reschedule planned workouts               | Yes                         | Coaching calendar                 |
| Build structure in **coach library**, then place on athlete      | Yes                         | Library → Calendar                |
| Edit structure **in place** on the athlete’s calendar (TP-style) | **No**                      | Missing coach UX + owner-only API |
| Use AI structure generation from coach calendar                  | Hidden / not the coach path | `show-structure-actions="false"`  |

**Practical coach workflow today (manual, no AI):**

1. Open **Library → Workouts** (`app/pages/library/workouts/`).
2. Create/edit a template with the step editor (and/or Intervals text).
3. Open **Coaching → Calendar**, drag/schedule that template onto the athlete.

That copies `structuredWorkout` onto the athlete’s `PlannedWorkout`. It is **not** an in-calendar structure editor.

### Why in-calendar structure edit is blocked

- Athlete/owner structure save: `PATCH /api/workouts/planned/:id/structure`  
  File: `server/api/workouts/planned/[id]/structure.patch.ts`  
  **Owner check:** `workout.userId !== session.user.id` → 403. Coaches cannot use this API on athlete rows.
- Coach calendar modal explicitly disables structure-generation actions:  
  `app/pages/coaching/calendar.vue` → `PlannedWorkoutModal` with `:show-structure-actions="false"`.
- There is **no** “Act as athlete” UI for coaches (`content/documentation/2.coaches/2.acting-as-athlete.md`).

Coach write APIs **do** exist for create/patch planned workouts (including `structuredWorkout` in the service layer), but **no coach UI** drives a full steps editor against those endpoints.

---

## 2. Desired product (what Nick wants)

1. **Coach credentials** can create/edit workouts on an **athlete calendar** without AI.
2. **Block-by-block** builder (not AI builder).
3. TrainingPeaks-like controls:
   - Length mode per step: **Duration** _or_ **Distance**
   - Distance units: **m / km / miles** (and keep canonical storage in meters)
   - Intensity metric: **RPE**, **% LTHR**, **% FTP**, **% Pace**
   - **Absolute** targets: e.g. `300 W`, `3:30 /km` pace (not only %)

---

## 3. Current builder inventory (do not reinvent blindly)

### Data model (canonical)

| Concern                 | Location                                                                                                             | Notes                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Envelope                | `shared/structured-workout-contract.ts`                                                                              | `schemaVersion`, `source`, `targetUnits` (`pace: m/s`, `duration: seconds`, `distance: meters`), `zoneProfileSnapshot`, `steps` |
| Persistence             | `PlannedWorkout.structuredWorkout` / `WorkoutTemplate.structuredWorkout` (Prisma JSON)                               | Always go through adapt/normalize helpers                                                                                       |
| Normalize               | `server/utils/structured-workout-persistence.ts`, `shared/structured-workout-contract.ts` (`adaptStructuredWorkout`) |                                                                                                                                 |
| Intervals text ↔ steps  | `server/utils/workout-parser.ts`, `server/utils/canonical-workout-serializer.ts`                                     | Absolute watts (`w`), distance `m`/`km` in parser; miles weak                                                                   |
| Target policy           | `server/utils/workout-target-policy.ts`, `shared/workout-support-matrix.ts`                                          | Mentions power / HR / pace / **rpe** at policy level                                                                            |
| Manual edit → Intervals | `server/utils/planned-workout-manual-structure-edit.ts`                                                              | Auto-sync if already SYNCED                                                                                                     |

### UI editors (uneven quality)

| Editor                    | Path                                                                            | What it supports today                                                                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary visual editor** | `app/components/workouts/planned/WorkoutStepsEditor.vue` + `WorkoutStepRow.vue` | Metrics toggle: Power **% FTP**, HR **% LTHR**, Pace **% threshold**; duration in **minutes**; cadence; nested repeats; ramps. Absolute W/BPM shown as converted display, **not first-class edit mode**. No duration↔distance toggle. No RPE on endurance rows. |
| Intervals text modal      | Planned detail page                                                             | Power `%`, `% LTHR`, repeats, duration tokens; advanced users                                                                                                                                                                                                   |
| Simple library modal      | `app/components/workouts/WorkoutTemplateEditor.vue`                             | Flat steps: duration (min) + **% FTP only** — weaker; do not extend this as the long-term builder                                                                                                                                                               |
| Strength                  | `StrengthExercisesEditor` / `StrengthView`                                      | RPE + distance unit modes already exist for gym — **do not confuse with endurance step grammar**                                                                                                                                                                |
| Planned detail (owner)    | `app/pages/workouts/planned/[id]/index.vue`                                     | Real athlete/owner structure edit UX                                                                                                                                                                                                                            |
| Library template          | `app/pages/library/workouts/[id].vue`                                           | Template structure edit                                                                                                                                                                                                                                         |

### Coach calendar / APIs

| Piece             | Path                                                                               |
| ----------------- | ---------------------------------------------------------------------------------- |
| Coach calendar UI | `app/pages/coaching/calendar.vue`                                                  |
| Docs              | `content/documentation/2.coaches/4.coaching-calendar.md`, `.../5.coach-library.md` |
| Auth              | `server/utils/coaching-auth.ts`, `app/middleware/coach.ts`                         |
| Create on athlete | `server/api/coaching/athletes/[id]/planned-workouts/index.post.ts`                 |
| Patch on athlete  | `server/api/coaching/athletes/[id]/planned-workouts/[workoutId].patch.ts`          |
| Shared service    | `server/utils/planned-workout-service.ts`                                          |

### AI path (do not break)

| Piece              | Path                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| Generate task      | `trigger/generate-structured-workout.ts`                                          |
| Adjust task        | `trigger/adjust-structured-workout.ts`                                            |
| Schemas / prompts  | `trigger/utils/structure-generation-schemas.ts`, `structure-generation-prompt.ts` |
| Owner generate API | `server/api/workouts/planned/[id]/generate-structure.post.ts`                     |
| Run lifecycle      | `server/utils/structure-generation-run*.ts`                                       |

Manual save already 409s if a structure generation run is active — preserve that.

---

## 4. Gaps vs TrainingPeaks (explicit)

| Capability                     | Model / export today                             | Visual editor today                                                     |
| ------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------------- |
| Duration-based steps           | Yes (seconds)                                    | Yes (minutes UI)                                                        |
| Distance-based steps           | Yes (meters in contract; parser m/km)            | Weak — no clear OR switch; swim shows meters                            |
| Distance units m/km/mi         | Canonical meters; **mi not in Intervals parser** | Missing endurance UX                                                    |
| % FTP                          | Yes                                              | Yes                                                                     |
| Absolute watts                 | Parser/export (`units: 'w'`)                     | Display/convert only                                                    |
| % LTHR                         | Yes                                              | Yes                                                                     |
| Absolute HR (bpm)              | Partial                                          | Display/convert                                                         |
| % Pace                         | Yes                                              | Yes (% threshold)                                                       |
| Absolute pace (e.g. 3:30/km)   | Contract helpers for m/s                         | Not first-class edit                                                    |
| RPE                            | Policy / matrix / strength / converter           | **Not in WorkoutStepRow**                                               |
| Coach edit on athlete calendar | Service can store JSON                           | **No coach structure editor UX**; owner `structure.patch` forbids coach |

---

## 5. Recommended implementation plan (phased)

Work in a **dedicated branch / worktree**. Do **not** mix with unrelated branding/auth branches. Prefer small PRs.

### Phase A — Unlock coach manual structure on athlete calendar (no AI)

**Outcome:** Coach can open a planned workout from coaching calendar and edit steps using the existing `WorkoutStepsEditor`, saving via a **coach-scoped** API that writes as the **athlete** owner row (using athlete thresholds/zones).

**Suggested work:**

1. **API:** Add something like  
   `PATCH /api/coaching/athletes/:athleteId/planned-workouts/:workoutId/structure`
   - Gate with `requireCoachAccessToAthlete` + `coaching:write`.
   - Reuse logic from `structure.patch.ts` + `planned-workout-manual-structure-edit.ts` / `writeCanonicalPlannedWorkoutStructure`.
   - Persist against **athlete** `userId` / athlete sport settings (FTP, LTHR, pace threshold) — **not** the coach’s personal thresholds.
   - Keep active-generation-run 409 behavior.
   - Keep Intervals auto-sync-if-SYNCED behavior if already used for owner edits.

2. **UI:**
   - Enable structure editing in coach calendar modal / deep-link to an editor view.
   - Wire `WorkoutStepsEditor` to the new coach structure endpoint.
   - Keep AI generate buttons off unless product explicitly wants them later (`show-structure-actions`).

3. **Blank workout:** Allow coach to create an empty/minimal planned workout on a day, then build steps (not only drag-from-library). Confirm `planned-workouts/index.post.ts` supports this; extend if needed.

4. **Tests:** Mirror `tests/unit/server/api/workouts/planned/structure.patch.test.ts` for coach access (allowed relationship vs forbidden).

**Out of scope for Phase A:** TP intensity/distance UX upgrades (Phase B).

### Phase B — TrainingPeaks-like step editor (shared athlete + coach)

Upgrade **`WorkoutStepsEditor` / `WorkoutStepRow`** (single shared component — coach and athlete both benefit). Avoid forking a second editor.

**Per step UI controls:**

1. **Length mode:** `Duration` | `Distance`
   - Duration: keep minutes (store seconds).
   - Distance: input + unit select `m | km | mi` → store **meters** in canonical JSON.
   - Clear the unused length field on mode switch (same pattern as clearing other intensity metrics).

2. **Intensity metric:** `RPE | % FTP | Absolute W | % LTHR | Absolute bpm | % Pace | Absolute pace`
   - Or grouped: metric family + relative/absolute toggle (cleaner UX).
   - Persist using existing step target objects (`power` / `heartRate` / `pace` / `rpe`) with explicit `units` where the contract already supports them.
   - Absolute pace UI: `m:ss` per km or per mile → convert to **m/s** via `structured-workout-contract` helpers.
   - Absolute power: watts with `units: 'w'`.
   - RPE: add fields already used elsewhere in policy/converter; keep range validation consistent.

3. **Serializer / parser / export:**
   - Extend `workout-parser.ts` + `canonical-workout-serializer.ts` so Intervals text round-trips absolute targets and distance-primary steps where Intervals format allows.
   - Document Intervals limitations (miles may need convert-to-km on export).
   - Update `workout-converter.ts` / FIT/ZWO paths carefully; use `workout-support-matrix.ts` as the support source of truth.

4. **Upgrade or deprecate** `WorkoutTemplateEditor.vue` so library create isn’t stuck on “% FTP + minutes only.” Prefer embedding `WorkoutStepsEditor`.

5. **Tests:** unit tests for unit conversions, mode switching clearing fields, serializer round-trip, and a few editor component tests if the repo pattern supports them.

### Phase C — Polish / docs

- Update coach docs: `content/documentation/2.coaches/4.coaching-calendar.md`, `5.coach-library.md`, athlete structured workouts doc.
- Analytics events if the product tracks structure edits.
- Manual QA checklist (below).

---

## 6. Hard constraints / “don’t mess up the codebase”

1. **Do not** change AI generation prompts/schemas unless required for compatibility with new step fields; prefer editor + persistence + coach API first.
2. **Do not** introduce session impersonation (“Act as”) unless product explicitly reopens that — use coach-scoped APIs instead.
3. **Always** write structures through `adaptStructuredWorkout` / `normalizeStructuredWorkoutForPersistence` / `writeCanonicalPlannedWorkoutStructure`.
4. **Athlete zones for athlete workouts** when coach edits — never silently rebase to coach FTP/LTHR.
5. **Preserve** active `WorkoutStructureGenerationRun` conflict handling.
6. **Intervals sync** is easy to break — keep `syncManualPlannedWorkoutStructureToIntervalsIfSynced` behavior and add regression tests.
7. **Pace conversions are duplicated** across charts (`WorkoutRunChart`, `RunView`, `WorkoutChart`) — prefer shared helpers from `structured-workout-contract.ts` / `app/utils/structuredWorkout.ts`.
8. **One editor** (`WorkoutStepsEditor`) — don’t create a parallel coach-only builder.
9. Touch only owned paths for the ticket; if coach calendar + structure API + editor files aren’t enough, stop and expand scope explicitly.

---

## 7. Suggested owned paths (for a Linear-style ticket)

```
app/pages/coaching/calendar.vue
app/components/PlannedWorkoutModal.vue
app/components/workouts/planned/WorkoutStepsEditor.vue
app/components/workouts/planned/WorkoutStepRow.vue
app/components/workouts/WorkoutTemplateEditor.vue   # optional align/deprecate
app/pages/library/workouts/[id].vue                 # if wiring shared editor
server/api/coaching/athletes/[id]/planned-workouts/**
server/utils/planned-workout-manual-structure-edit.ts
server/utils/planned-workout-service.ts
server/utils/workout-parser.ts
server/utils/canonical-workout-serializer.ts
shared/structured-workout-contract.ts
shared/workout-support-matrix.ts
tests/unit/server/api/**/structure*
tests/unit/server/utils/planned-workout-manual-structure-edit*
content/documentation/2.coaches/**
```

**Avoid unless necessary:** `trigger/generate-structured-workout.ts`, broad `server/utils/intervals.ts` rewrites, Prisma schema changes (JSON fields should be enough).

---

## 8. Verification checklist

### Phase A

- [ ] Coach with ACTIVE relationship can create a blank planned workout on athlete calendar.
- [ ] Coach can edit steps and save; athlete sees structure.
- [ ] Non-coach / no relationship → 403.
- [ ] Owner athlete can still edit via existing `structure.patch`.
- [ ] No AI call when saving manual steps.
- [ ] If Intervals already SYNCED, structure pushes or fails gracefully with existing patterns.

### Phase B

- [ ] Duration step + % FTP still works (regression).
- [ ] Distance step in m/km/mi stores meters and displays correctly.
- [ ] Absolute 300 W persists and exports sensibly.
- [ ] Absolute 3:30/km persists as m/s and displays as pace.
- [ ] RPE step persists and doesn’t break power/HR charts.
- [ ] Switching metric clears conflicting targets.
- [ ] Library template editor matches planned editor capabilities (or clearly routes to the shared editor).

### Commands (adjust to ticket)

```bash
pnpm exec vitest run tests/unit/server/api/workouts/planned/structure.patch.test.ts
pnpm exec vitest run tests/unit/server/utils/planned-workout-manual-structure-edit.test.ts
pnpm exec vitest run shared/structured-workout-contract.test.ts
# plus any new coach structure + editor tests
```

---

## 9. Related reading (already in repo)

- `content/documentation/1.athletes/26.structured-workouts.md`
- `content/documentation/2.coaches/4.coaching-calendar.md`
- `content/documentation/2.coaches/5.coach-library.md`
- `content/documentation/2.coaches/2.acting-as-athlete.md`
- `plans/structured-workout-intervals-coaching-upgrade.md`
- `plans/planned-workout-generation-review-and-hardening.md`
- `plans/workout-library.md`
- `shared/workout-support-matrix.ts`

---

## 10. One-paragraph summary for the implementing agent

Today a coach can schedule manual (non-AI) structure onto an athlete only by building it in the **library** first; they cannot edit structure in place because `structure.patch` is owner-only and the coaching calendar hides structure actions. Implement a **coach-scoped structure PATCH** that reuses owner persistence/Intervals sync against the athlete’s workout and thresholds, wire `WorkoutStepsEditor` into the coaching calendar, then extend that shared editor for duration↔distance, RPE, and absolute power/pace—without forking AI generation or inventing a second builder.
