# Agent Handoff Document

## 🏗️ Current State of the Repository

We have just resolved a major branch bifurcation issue. The repository had split into two alternate timelines:
1. A backend-heavy branch (`feat/fullscreen-plan-workout-editor-ui`) containing ~276 recent stability fixes, Nuxt Auth loop fixes, and API updates.
2. A frontend-heavy branch (`feat/splash-page-rework`) containing the new Journey Endurance branding, Amix 3D glassmorphism cards, and the `tri-nerds.vue` splash page that the user built recently.

**Action Taken:** We surgically cherry-picked the UI components from the frontend branch and laid them over the stable backend branch. The old "Coach Watts" UI assets and components have been trimmed.

**Active Working Branch:** `feat/unified-journey-build`
*(All future work must happen on this branch, and Railway is currently deploying this branch to production).*

---

## ✅ Completed Work in This Session

1. **Fixed the Railway Deployment Crash:** Resolved a recursive Nuxt Auth loop caused by Sidebase parsing the `AUTH_ORIGIN` variable incorrectly behind a Hairpin NAT proxy. 
2. **Re-integrated the Frontend:** Successfully pulled the Journey Endurance marketing UI (HeroJourneyV2, CosmicBackground, Tri-Nerds splash) into the active backend branch.
3. **Legacy Branding Scrub:** Executed a global find-and-replace across 108 translation files (`app/i18n/**/*.json`) to replace "Coach Watts" with "Journey Endurance" and "Train By Watts" with "Train By Journey". Trimmed legacy assets.

---

## 🚀 Outstanding Tasks for Next Agent

The following tasks were requested by the user but have not yet been started. Please pick these up in order of priority:

### 1. Database Prisma Migration (Clean up Legacy Coach Watts)
- **Goal:** Run the pending database migrations and ensure the schema correctly reflects the transition from legacy Coach Watts to Journey Endurance.
- **Context:** We paused database migrations while fixing the Nuxt Auth loop and re-integrating the branches. 
- **Rule Reminder:** According to `AGENTS.md`, never use `prisma db push` or `prisma migrate reset` in local dev. If there is schema drift on Railway, carefully resolve it using `prisma migrate resolve`.

### 2. AI Workout Generator Intensities
- **User Request:** "The AI generation still isn't quite there... generate the intensities that I want it to."
- **Goal:** Investigate the AI generation logic for structured workouts and ensure the prompt correctly targets the user's requested intensity zones.

### 3. Coaching Platform Bugs
- **Apply Plan/Athlete Selection:** "I still can't apply a plan to an athlete. It looks to me as though I can't do that on any of the plans." (Investigate the coaching dashboard / plan application UI).
- **Plan Summary Dates Bug:** "When I go into the Uvic Tri Club plan... week one says January 1st to January 1st..." (Investigate the date rendering logic in the training plan summary view).

### 4. Database Administration & Access
- **User Questions:** The user needs to know how to manually adjust their account credentials in the database to grant themselves access to the "UNCOVER" program, and how to grant themselves Coach/Admin privileges.
- **Action:** Provide the SQL commands or Prisma Studio instructions for the user to update their `role` or `permissions` in the live Railway PostgreSQL database.

---

## ⚠️ Important Rules for the Next Agent
- Read `AGENTS.md` before executing commands.
- We are working on a Windows machine. Use PowerShell commands.
- **DO NOT** attempt to merge `master` into the current branch. `master` is severely outdated on backend logic and will cause 50+ merge conflicts. Stick to `feat/unified-journey-build`.
