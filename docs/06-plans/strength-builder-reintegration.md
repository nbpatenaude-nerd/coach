# Strength Workout Builder — Inventory & Re-integration Guide

**Date:** 2026-09-24  
**Audience:** Agents / eng continuing Journey strength + coach calendar work  
**Related:** `docs/06-plans/strength-exercise-catalog-integration.md`, `docs/06-plans/coach-manual-workout-builder-handoff.md`, `content/documentation/2.coaches/15.strength-programming.md`

---

## 1. Executive answer

**Yes — we already built a strength workout builder.** It is **not** the TrainingPeaks-style endurance step editor (`WorkoutStepsEditor`). It is a separate **block / set-row** system with an exercise library.

| Piece                                 | Status today                                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Exercise library UI                   | **Live** — `Library → Exercises`                                                                                           |
| Gym template builder                  | **Live** — `Library → Workouts` type Gym / WeightTraining → `StrengthView` + `StrengthExercisesEditor`                     |
| Athlete planned Gym edit              | **Live** on planned detail via `StrengthView`                                                                              |
| Coach calendar in-place strength edit | **Not wired** — modal shows a **read-only** strength summary; structure save is endurance-steps oriented                   |
| Load modes: absolute kg/lb            | **Live** in editor                                                                                                         |
| Load modes: `%1RM`, RIR               | **Partially designed** — appear in plan seed types / intensity helpers; **not** first-class in editor/normalize allow-list |
| System-wide imported catalog (1.3k)   | **Planned** — see catalog integration plan; per-user library exists                                                        |

**Do not rebuild strength inside `WorkoutStepRow`.** Keep endurance steps and strength blocks as two grammars sharing the same `structuredWorkout` JSON envelope and the same coach structure PATCH path.

---

## 2. Where it lives (code map)

### UI

| Path                                                          | Role                                                                        |
| ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `app/pages/library/exercises/index.vue`                       | Browse / create / edit / delete `StrengthExerciseLibraryItem`               |
| `app/components/workouts/planned/StrengthExercisesEditor.vue` | Main builder: blocks, library pick, set rows, prescription + load dropdowns |
| `app/components/workouts/planned/StrengthView.vue`            | View + Edit tab wrapper; emits save payload for Gym workouts                |
| `app/utils/strengthWorkout.ts`                                | Client types, block normalize, labels                                       |
| `app/utils/strengthExerciseLibrary.ts`                        | Client helpers for library items                                            |
| `app/pages/library/workouts/[id].vue`                         | Routes Gym templates to `StrengthView`                                      |
| `content/documentation/2.coaches/15.strength-programming.md`  | Coach product docs                                                          |
| `content/documentation/1.athletes/25.strength-training.md`    | Athlete product docs                                                        |

### Server / data

| Path                                                     | Role                                                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `prisma` → `StrengthExerciseLibraryItem`                 | Per-user exercise catalog (title, aliases, muscles, prescription defaults, `setRows` JSON) |
| `server/api/library/strength-exercises/*`                | CRUD for library items                                                                     |
| `server/utils/strength-exercise-library.ts`              | `normalizeStructuredStrengthWorkout`, load/prescription allow-lists                        |
| `server/utils/strength-exercise-matching.ts`             | Match free-text names → `libraryExerciseId` (post AI / import)                             |
| `server/utils/strength-intensity.ts`                     | e1RM from history, RIR estimate from RPE, fill blank loads                                 |
| `server/utils/planned-workout-manual-structure-edit.ts`  | Manual structure save already accepts **strength** `blocks` / `exercises`                  |
| `scripts/create-strength-plans.ts`                       | Seeded periodized Gym plans (mentions `rir` / `percent_1rm` in local types)                |
| `docs/06-plans/strength-exercise-catalog-integration.md` | Plan to import hasaneyldrm exercises-dataset as **system** catalog                         |

### Structure shape (canonical)

```text
structuredWorkout
├── schemaVersion / source / zoneProfileSnapshot   ← shared envelope
├── blocks[]                                       ← strength canonical
│   ├── type: warmup | single_exercise | superset | circuit | cooldown
│   ├── title, notes, durationSec?
│   └── steps[]   ← one exercise each
│       ├── name, libraryExerciseId?
│       ├── prescriptionMode   ← what the "value" column means
│       ├── loadMode           ← what the "load" column means
│       ├── defaultRest
│       └── setRows[]          ← { index, value, loadValue, restOverride }
└── exercises[]                                    ← flattened compat projection
```

Endurance uses `steps[]` interval grammar. Strength uses `blocks[]`. Normalization must keep them distinct (see open issue **259** — strength normalize must not leave endurance `steps` hanging).

---

## 3. What the builder already customizes

### Block types (`StrengthExercisesEditor`)

Warm Up · Single Exercise · Superset · Circuit · Cooldown

### Prescription modes (left column / “work” amount)

| Mode                                                 | Meaning               |
| ---------------------------------------------------- | --------------------- |
| `reps`                                               | Rep count             |
| `reps_per_side`                                      | Per-side reps         |
| `duration`                                           | Hold / time           |
| `distance_meters` / `_km` / `_ft` / `_yd` / `_miles` | Carry / move distance |

### Load modes (right column) — **implemented in UI today**

| Mode                         | Meaning                        |
| ---------------------------- | ------------------------------ |
| `none`                       | Bodyweight / no load field     |
| `generic`                    | Free-text load cue             |
| `weight_lb` / `weight_kg`    | Absolute load                  |
| `weight_per_side_lb` / `_kg` | Dumbbell / unilateral absolute |

### Intensity helpers (server, not full editor UX)

`server/utils/strength-intensity.ts`:

- Estimates **e1RM** from recent completed sets (Hevy / logged lifts)
- Derives **RIR** from latest RPE (`RIR ≈ 10 − RPE`)
- Can **pre-fill blank `loadValue`s** with a conservative % of e1RM adjusted by RIR

AI generation prompts also accept weight strings like `'70% 1RM'`, but persistence still funnels through normalize allow-lists.

### Library import / matching

- Users build **their** library in UI (not automatically the full external dataset).
- AI / free-text names are matched afterward via `applyStrengthLibraryDefaultsToWorkout`.
- Catalog plan (`strength-exercise-catalog-integration.md`) adds a **system** catalog so generation picks stable IDs up front.

---

## 4. Gap vs what you remember (%1RM / RIR / absolute)

You recalled load prescription as **%1RM · RIR · absolute**. Absolute is live. **%1RM and RIR are the missing first-class modes.**

Evidence:

- `scripts/create-strength-plans.ts` local type includes `'rir' | 'percent_1rm'`.
- `STRENGTH_LOAD_MODES` in `strength-exercise-library.ts` **does not** include them → normalize **strips** unknown modes to `none`.
- `StrengthExercisesEditor` `loadModeOptions` only lists absolute / generic / none.
- `strength-intensity.ts` already has the math to **resolve** %1RM-style targets from history.

So re-integration is less “rediscover a lost UI” and more **finish the load-mode product surface** and **surface the existing editor on the coach calendar**.

---

## 5. How this relates to the new endurance / coach calendar builder

Recent work (`feat/tp-workout-builder`) unlocked:

- Coach structure PATCH (athlete zones)
- TP-ish endurance step controls (duration|distance, relative|absolute, RPE)
- Wider coach modal + blank create

Strength was called out in the endurance handoff as **separate grammar**. Current coach modal:

- Detects Gym / WeightTraining
- Shows **read-only** block summary when `blocks` exist
- Does **not** mount `StrengthExercisesEditor`
- Save path for structure already supports strength payloads in `applyManualPlannedWorkoutStructureEdit` (blocks / exercises)

### Re-integration target UX

```text
Coach calendar → PlannedWorkoutModal (wide)
  ├── type Gym/WeightTraining
  │     └── StrengthExercisesEditor (allow edit)
  │           save → PATCH .../structure { blocks, exercises, durationSec }
  └── type Ride/Run/Swim
        └── WorkoutChart / WorkoutStepsEditor
              save → PATCH .../structure { steps }
```

Same API, different editor by workout type.

---

## 6. Recommended re-integration plan (phased)

### Phase S0 — Wire what already works (smallest PR)

**Outcome:** Coach can edit Gym structure on athlete calendar without AI.

1. In `PlannedWorkoutModal`, when `allowStructureEdit && isStrengthWorkout`, render `StrengthExercisesEditor` (not only charts / read-only cards).
2. On save, POST body `{ blocks, exercises, durationSec }` (same shape `StrengthView` already emits) to existing coach `structure` PATCH.
3. Blank create: allow type `WeightTraining` / `Gym` (or type picker), not only `Ride`.
4. Pass coach library scope (`ownerScope: 'coach'`) into the editor so “Add from library” hits the coach exercise library.
5. Tests: coach structure PATCH with strength blocks allowed; owner regression.

**Files:** `PlannedWorkoutModal.vue`, `app/pages/coaching/calendar.vue`, existing structure tests.

### Phase S1 — First-class %1RM and RIR load modes

**Outcome:** Per-set load can be prescribed as absolute, `%1RM`, or RIR (and still resolve to suggested kg when history exists).

1. Extend allow-lists in:
   - `app/utils/strengthWorkout.ts` → `StrengthLoadMode`
   - `server/utils/strength-exercise-library.ts` → `STRENGTH_LOAD_MODES`
   - `StrengthExercisesEditor` → `loadModeOptions` + placeholders/labels
2. Persist `loadValue` as:
   - `%1RM` → `"70"` or `"70%"` with `loadMode: 'percent_1rm'`
   - RIR → `"2"` or `"2-3"` with `loadMode: 'rir'`
   - Absolute → existing weight modes
3. Optional display: call into `strength-intensity` helpers to show **resolved kg** under the cell when athlete history / e1RM is available (coach calendar must load athlete intensity refs or accept “unresolved until athlete logs”).
4. AI / seed scripts: stop inventing modes the normalize layer rejects; or teach normalize to accept them (this phase).
5. Unit tests for normalize round-trip of `percent_1rm` / `rir`.

### Phase S2 — Library + catalog quality

**Outcome:** “Massive library” is reliable for coaches and generation.

1. Execute / refresh `docs/06-plans/strength-exercise-catalog-integration.md` (system catalog + optional “Add to my library”).
2. Keep user/coach `StrengthExerciseLibraryItem` as override layer (video, aliases, default set rows).
3. Fix open strength bugs that block trust:
   - **259** — normalize retaining endurance `steps`
   - **261** — library matching failing whole Trigger run
   - **262** — distance prescription inflating duration/TSS

### Phase S3 — Product polish (TrainingPeaks-adjacent for gym)

Not a clone of TP endurance UI; gym-specific polish:

| Improvement                                 | Notes                                                      |
| ------------------------------------------- | ---------------------------------------------------------- |
| Tempo / rest as first-class set fields      | Today rest is per-row override; tempo often lives in notes |
| Intent / movement pattern filters in picker | Already on library page; deepen in editor picker           |
| Projected session tonnage / e1RM summary    | Use `strength-intensity` on planned detail + coach modal   |
| Athlete “today’s loads” resolve             | Show kg from %1RM once athlete has logged that lift        |
| Coach vs athlete library scope clarity      | Document which library is searched when coaching           |
| In-calendar blank Gym create                | Type picker: Ride / Run / Gym                              |

---

## 7. Explicit non-goals / pitfalls

1. **Do not** fold strength set rows into `WorkoutStepRow` endurance targets.
2. **Do not** treat distance prescription values as reps (issue 262).
3. **Do not** assume Intervals.icu round-trips full strength blocks (endurance sync path is separate; strength is often local / Hevy-completed).
4. Coach structure save must keep using **athlete** `userId` for ownership; coach library is only for **picking exercises**, not for stealing athlete thresholds.
5. `%1RM` without athlete e1RM history should still **save as relative prescription** (like endurance `%pace`); resolve to kg when possible, don’t 422 solely because history is empty.

---

## 8. Manual QA checklist (after S0 + S1)

- [ ] Library → Exercises: create exercise with default sets / load mode.
- [ ] Library → Workouts → Gym: add warmup + primary + accessory blocks; save; reopen.
- [ ] Athlete planned Gym: Edit → change a set load → save → persists.
- [ ] Coach calendar: open athlete Gym planned workout → edit blocks → save → athlete sees update.
- [ ] Set `loadMode` to `%1RM` / RIR → values survive normalize and reload.
- [ ] With Hevy history for Back Squat, blank loads optionally suggest kg; without history, relative values still save.
- [ ] Endurance Ride/Run structure edit still works (no regression).
- [ ] Distance carry mode does not explode planned duration/TSS.

---

## 9. Suggested Linear-style owned paths (S0 + S1)

```
app/components/PlannedWorkoutModal.vue
app/components/workouts/planned/StrengthExercisesEditor.vue
app/components/workouts/planned/StrengthView.vue
app/pages/coaching/calendar.vue
app/utils/strengthWorkout.ts
server/utils/strength-exercise-library.ts
server/utils/strength-intensity.ts
server/api/coaching/athletes/[id]/planned-workouts/**
tests/unit/server/utils/strength-*
tests/unit/server/api/coaching/athletes/planned-workouts/structure*
content/documentation/2.coaches/15.strength-programming.md
```

Avoid unless needed: Prisma schema changes (JSON `loadMode` string is enough), Trigger prompt rewrites (S2+).

---

## 10. One-paragraph summary

The strength builder is already in product as `StrengthExercisesEditor` + per-user exercise library + block/set-row JSON; absolute loads work, while `%1RM` / RIR were sketched in seeds/intensity math but never allow-listed in normalize/UI. Re-integrate by mounting that editor in the coach calendar modal on Gym workouts (reuse the new structure PATCH), then finish `%1RM`/`rir` load modes and catalog/matching hardening — without merging strength into the endurance TrainingPeaks step grammar.
