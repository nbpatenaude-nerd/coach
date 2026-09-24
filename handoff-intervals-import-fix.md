# Journey Endurance - Agent Handoff

## 1. Current State & Recent Work
- **Project Rebranding Context**: The internal codebase, `AGENTS.md`, and backend services (like Prisma `managedBy` properties) heavily reference "Coach Watts". However, the user-facing product and focus of this project is **Journey Endurance**. Always refer to it as Journey Endurance in conversation.
- **Plan Import & Cleanup**: Imported the "1 Year Training Plan [UNCOVER] 2026 (Short)" plan from Intervals.icu into the Journey Endurance database as a `TrainingPlan` template. 
- **Script Update**: Updated `scripts/import-intervals-plan.ts` to automatically strip out the `- - - - Imported with tp2intervals` tags and raw `trainingPeaksId` lines from workout descriptions during the import process.
- **Database Fix**: Encountered a Prisma client crash because the local database contained a legacy `SubscriptionTier` enum value (`UNLEASH`) that no longer existed in `prisma/schema.prisma`. Updated the user's tier in the DB to `FREE` to resolve the conflict.

## 2. Calendar Bug Fix (Pushed)
- **The Issue**: When importing a template training plan, the script generated placeholder `PlannedWorkout` records with `date: new Date()`. The Journey Endurance calendar API (`plannedWorkoutRepository.list`) was fetching **all** workouts matching the user's ID and date range, meaning hundreds of template workouts were flooding the user's live calendar for today's date.
- **The Fix**: Modified `server/utils/repositories/plannedWorkoutRepository.ts` to explicitly filter out any workouts that belong to a training plan where `isTemplate: true`. 
- **Status**: The fix has been committed and pushed to GitHub on the active branch: `feat/fullscreen-plan-workout-editor-ui`.

## 3. Next Steps & Instructions for the Next Agent
- Ensure you pull the latest changes from the `feat/fullscreen-plan-workout-editor-ui` branch if continuing work on the same PR, or branch off of it.
- When creating or applying `TrainingPlan` templates, bear in mind that `PlannedWorkout` records tied to templates now correctly remain hidden from the active calendar API.
- If importing any future plans using `scripts/import-intervals-plan.ts`, no manual text-scrubbing is needed for the `tp2intervals` tags, as the script handles it natively now.
