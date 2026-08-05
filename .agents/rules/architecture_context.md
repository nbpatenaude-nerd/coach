# Agent Handover: Journey Endurance Platform

## 1. Project Context & Vision

You are stepping into the ongoing development of the Journey Endurance coaching platform. In early 2026, the company pivoted to focus strictly on multisport endurance coaching.

Our current major initiative is the Unified Codebase Merge. We are actively porting a legacy React/Firebase application (`_legacy_journey_app`) into a modern, unified Nuxt 3 monorepo. This monorepo already houses the "Coach Watts" AI engine, creating a single "Digital Twin" coaching platform powered by PostgreSQL and the Gemini API.

**Current Environment:**

- Windows OS using the Antigravity IDE (Agent Manager runs as a standalone desktop app).
- Framework: Nuxt 3, Vue 3 (Composition API), Nuxt UI, Tailwind CSS.
- Database: PostgreSQL via Prisma.

## 2. Core Architecture & Infrastructure

### 2.1 Backend & Database (Phase 1-2 Completed)

We have completely migrated away from Firebase NoSQL to a relational PostgreSQL database.

**Prisma ESM Workaround:** Due to Node 24 ESM/CJS boundary issues with Nuxt Nitro, we rely on a strictly local ESM Prisma client.

- **CRITICAL RULE:** Never import directly from `@prisma/client`.
- **CRITICAL RULE:** Never use relative imports to the generated client inside API routes (e.g., `import { PrismaClient } from '../../utils/generated-prisma/client'`).
- **Standard Operation:** We rely exclusively on Nuxt's auto-import feature. A single Prisma instance is exported from `server/utils/db.ts`. API routes must use the auto-imported `prisma` object without explicit import statements. Prisma Enums/Types must be imported using `import type ...`.

### 2.2 UI & Component Migration (Phase 4-5 Completed)

We have successfully ported key legacy React components into Vue 3.

- The Daily/Weekly Check-In forms and Coach Feedback displays are active.
- The "Road of Trials" historical data chart was built using `vue-chartjs` with Nuxt UI dataset toggles.
- A responsive "Town Hall" Community Calendar is live with RSVP tracking.
- We maintain a strict "Star Voyager / Sci-Fi HUD" aesthetic (dark mode, glassmorphism, neon cyan/pink accents).

### 2.3 Tiered RBAC System

Access to UI features and AI analysis is strictly gated by the `Role` enum in Prisma:

- **FREE:** Tri Nerds Guild (Basic sync, pre-made plans, community calendar).
- **UNCOVER:** Foundational Team Program (Weekly check-ins, team dashboards).
- **UNLOCK:** Custom 1:1 Coaching (Daily Digital Twin check-ins, AI chat, glycogen fuel tank).
- **UNLEASH:** Elite (Advanced physiological telemetry, Live Energy Availability).

### 2.4 Automation (Phase 6 Completed)

Telegram bot broadcasting and daily athlete summaries have been consolidated directly into the Nuxt app using Nitro Scheduled Tasks (`nitro.scheduledTasks`).
A dedicated Admin Cron Management UI (`/admin/cron`) allows the head coach to toggle and execute tasks manually.

## 3. Active Initiative: Identity & Auth Migration (Phase 8)

We are currently decoupling from Firebase Authentication and moving to `@sidebase/nuxt-auth` (Auth.js) backed by our PostgreSQL database (`@next-auth/prisma-adapter`).

### 3.1 Migration Strategy: "Method A" (Password Reset)

Because Firebase passwords (scrypt hashes) cannot be migrated, legacy users must claim their pre-migrated PostgreSQL profiles by setting a new password.

- **Status:** The core flow is built and verified locally.
- **Database:** `PasswordResetToken` model is active in Prisma.
- **Email:** Integrated with Resend SDK (`server/utils/email.ts`). Do not use `@vue-email/nuxt` (incompatible with Nuxt 4.5.0); use raw HTML strings for templates.
- **API:**
  - `forgot-password.post.ts`: Generates `crypto.randomUUID()`, saves token, triggers Resend.
  - `reset-password.post.ts`: Validates token, hashes with bcrypt, updates user, deletes token.
- **Security:** The "Forgot Password" flow has been hardened against Email Enumeration. It returns a generic 200 Success regardless of whether the email exists in the database.

## 4. Immediate Next Steps & Roadmap

### 4.1 Plant-Based Nutrition Planner (Pending)

We need to transition the head coach's static PDF meal plans (categorized in 50-100kcal increments) into an interactive, native application feature.

- **Goal:** Build a drag-and-drop meal builder for athletes, particularly those on the Free/Uncover tiers.
- **Next Action:** Await sample recipe/meal plan data from the user to architect the Prisma schema models (Recipe, Meal, MealPlan) and design the Vue component logic using `vuedraggable`.

### 4.2 TrainingPeaks Sunset (Pending)

- Finalize direct-to-Garmin pushes.
- Port the Legacy CRM features.
- Fully replace TrainingPeaks as the primary workout delivery mechanism using Intervals.icu integrations.
