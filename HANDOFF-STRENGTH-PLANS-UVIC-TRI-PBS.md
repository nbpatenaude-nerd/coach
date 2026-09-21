# Agent Handoff: Coach Watts / Journey Endurance Platform

**Date:** September 17, 2026  
**Repository:** `coach` (Nuxt 3, Nuxt UI, Prisma, PostgreSQL, Trigger.dev, Tailwind v4)  
**Primary Branch:** `develop` / `feat/splash-page-rework`  
**Purpose:** Context transfer document for an incoming AI agent to continue feature development, training plan generation, and data integration without loss of state.

---

## 1. Key Accounts, Entities & Database Context

- **Database:** PostgreSQL on Railway (configured via `DATABASE_URL` in `.env`).
- **Primary User / Coach Profile:**
  - **Email:** `info@trinerds.com`
  - **User ID:** `2dd94868-f861-459d-8b83-b9f75b4b9a16`
  - **Name:** Coach Nick
  - **Role:** Coach / Club Administrator
- **Primary Athlete Profile:**
  - **Email:** `n.b.patenaude@gmail.com`
  - **User ID:** `28cc8e17-9d2a-483b-a884-a1ed6b529e6c`
  - **Intervals.icu Athlete ID:** `i652040`
  - **Connected Integration:** Intervals.icu (with Garmin sync)

---

## 2. Recent Accomplishments & Current Status

### A. Performance Page & Trophy Case (`/performance/bests`)
- **Resolved Blank Page Bug:** Fixed Nuxt auto-import prefixing in `app/pages/performance/bests.vue` (`<TrophyCase>` was resolving to an unrecognized custom element; updated to `<ProfileTrophyCase>`).
- **Standardized Distance/Power Records:** Filtered out legacy arbitrary records (e.g., elevation gains, non-standard power splits) to strictly feature canonical targets:
  - *Run:* 400m, 800m, 1km, 1mi, 5km, 10km, Half Marathon, Marathon.
  - *Bike:* 5s, 1m, 3m, 6m, 20m, 60m, 90m peak power.
  - *Swim:* 50m, 100m, 400m, 1500m, 2km, 5km.
- **Segment-Specific Averages:** Updated `pbDetectionService.ts` and `scripts/recalculate-pbs.ts` so Avg HR and Cadence represent the *exact segment* of the effort, not whole-workout averages.
- **Card Layout Compression:** Overhauled `app/components/profile/TrophyCase.vue` to place primary metric and secondary stats inline on a single row, cutting card height by ~50%.

### B. Intervals.icu 10-Year Historical Ingestion
- **CLI Ingestion Fixes:** Resolved module resolution (`~~/` alias) in `package.json` (`"cw:cli"`) and `cli/import/intervals.ts` by explicitly binding `--tsconfig .nuxt/tsconfig.json` to `tsx`. Added `shell: true` for Windows `child_process.spawn`.
- **Bulk Import Command:**
  ```bash
  pnpm cw:cli import intervals n.b.patenaude@gmail.com --years 10 --skip-existing
  ```
- **Live State:** Ingests 262 two-week chunks (Sept 2016 &rarr; present). Historical workouts, streams, and wellness data are chunked into the database.

### C. 12-Week Progressive Strength Plans (Base Phase)
- **Created & Verified:** 3 complete periodized strength training plans for `info@trinerds.com` tailored for endurance athletes in the base building phase:
  1. **2 Days/Week:** 24 planned workouts (Full Body A / B)
  2. **3 Days/Week:** 36 planned workouts (Undulating Squat/Push, Hinge/Pull, Unilateral Stability)
  3. **4 Days/Week:** 48 planned workouts (Upper/Lower periodized split)
- **Workout Structure:** Every session is built with the user's mandatory 60-minute 5-part architecture:
  1. Dynamic Warm-Up (5–7 min)
  2. Joint Mobility & Activation (5 min)
  3. Primary Compound Work Set (20–25 min, 3-0-1-0 tempo, RPE 7–8.5)
  4. Accessory & Core Stability (15–20 min, supersets, anti-rotation/carries)
  5. Static Stretching & Parasympathetic Downregulation (5 min)
- **Periodization:** 3 mesocycles progressing every 4 weeks:
  - *Block 1 (Weeks 1–4):* Anatomical Adaptation & Movement Grooving (W4 Deload)
  - *Block 2 (Weeks 5–8):* Functional Hypertrophy & Unilateral Force (W8 Deload)
  - *Block 3 (Weeks 9–12):* Maximum Strength & Power Transfer (W12 Taper/Test)
- **Database Presence:**
  - `TrainingPlanFolder`: `"Strength Plans"` (holds the 3 blueprints)
  - `WorkoutTemplateFolder`: `"12-Week Progressive Strength Collection"` (holds 12 modular master session templates)
  - Seed script: `scripts/create-strength-plans.ts` (runnable & idempotent)
  - Verification script: `scripts/verify-strength-plans.ts`

### D. UVic Triathlon Club Program Design
- **Target Event:** UBC Triathlon & Duathlon (Early March at UBC Point Grey campus, Vancouver, BC).
- **Format:** 18-week collegiate Bike & Run program (integrating with 2x independent weekly swim sessions).
- **Weekly Schedule:**
  - *Tuesday:* Track Run (Centennial Stadium — stride mechanics, VO2, threshold)
  - *Thursday:* Indoor Spin (CARSA Spin Studio — RPM ladders, climb simulations)
  - *Saturday:* Long Outdoor Ride (Saanich Peninsula / Lochside)
  - *Sunday:* Long Aerobic Run / Progressive Brick with T2 Drills
- **Academic Adaptations Built-In:**
  - *Fall Exam Block (Mid-Dec):* -45% volume drop for study stress relief.
  - *Winter Break (Late Dec – Early Jan):* Flexible, travel-ready maintenance.
  - *Reading Break (Mid-Feb):* Mid-season mini-camp overload & full dress-rehearsal brick.
  - *Late Feb – Early March:* 2-week race-specific sharpening & taper.
- **Documentation:** Fully drafted in project artifact `uvic_tri_club_program.md`.

---

## 3. Pending Tasks & Recommended Next Steps

### 1. Seed UVic Tri Club Team & 18-Week Program into Database
- The user requested: *"build a triathlon program with our UVic Tri Club team we recently built."*
- **Next Step:**
  - Check if a `Team` record for "UVic Triathlon Club" exists or create it under `info@trinerds.com`:
    ```typescript
    await prisma.team.create({
      data: {
        name: 'UVic Triathlon Club',
        ownerId: '2dd94868-f861-459d-8b83-b9f75b4b9a16'
      }
    })
    ```
  - Create a migration/seed script (e.g., `scripts/create-uvic-tri-plan.ts`, modelled after `scripts/create-strength-plans.ts`) to ingest the 18-week Bike/Run plan from `uvic_tri_club_program.md` into `TrainingPlan` and link it to the UVic Tri Club team / Coach Nick's library.
  - Include both Level 1 (Sprint / Beginner) and Level 2 (Olympic / Intermediate) workout options or notes.

### 2. Recalculate Personal Bests Post-Import
- Once Nicholas Patenaude's (`n.b.patenaude@gmail.com`) 10-year Intervals.icu sync has fully settled in the database:
  - Run `scripts/recalculate-pbs.ts` to scan all newly ingested historical workouts:
    ```bash
    npx tsx --tsconfig .nuxt/tsconfig.json scripts/recalculate-pbs.ts
    ```
  - Verify that all-time lifetime PBs (marathon, 10k, 5k, 800m, peak cycling watts) populate cleanly in the Trophy Case.

### 3. Review / Commit Staged Changes
- Ensure any new scripts (`scripts/create-strength-plans.ts`, `scripts/verify-strength-plans.ts`, `scripts/recalculate-pbs.ts`) are either committed to git or stored cleanly.

---

## 4. Key CLI Commands & References

```bash
# Start dev server (in main checkout, port 3099)
pnpm dev

# Run TypeScript check
pnpm typecheck:fast

# Run custom script with Nuxt path alias support (CRITICAL: always include --tsconfig)
npx tsx --tsconfig .nuxt/tsconfig.json scripts/<script-name>.ts

# Intervals.icu CLI Import
pnpm cw:cli import intervals <email-or-userId> --years 10 --skip-existing

# Run PB recalculation across all user workouts
npx tsx --tsconfig .nuxt/tsconfig.json scripts/recalculate-pbs.ts

# Verify strength plans in database
npx tsx --tsconfig .nuxt/tsconfig.json scripts/verify-strength-plans.ts
```

---

## 5. Architectural Gotchas & Non-Negotiables

1. **Nuxt Component Auto-Imports:**
   - Files in subdirectories like `app/components/profile/TrophyCase.vue` resolve to `<ProfileTrophyCase>` in templates. Using `<TrophyCase>` fails silently in production by rendering an unrecognized HTML element.
2. **Prisma Driver Adapter:**
   - Prisma 7 in this repo requires the `@prisma/adapter-pg` driver adapter. Scripts must instantiate Prisma via:
     ```typescript
     import { prisma } from '../server/utils/db' // or with new PrismaPg(pool)
     ```
3. **Running TSX Scripts:**
   - Because `server/utils/` files import using `~~/server/...`, running `tsx` without `--tsconfig .nuxt/tsconfig.json` will fail with `ERR_MODULE_NOT_FOUND: Cannot find package '~~'`. Always pass the `.nuxt/tsconfig.json` flag.
4. **Structured Workouts (Strength & Endurance):**
   - A `PlannedWorkout` or `WorkoutTemplate` stores its structure in `structuredWorkout` (JSON). For Strength sessions, it adheres to `{ schemaVersion: 1, source: 'TEMPLATE', blocks: [...], exercises: [...] }` compatible with `app/utils/strengthWorkout.ts`.
