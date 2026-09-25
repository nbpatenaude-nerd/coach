# Handoff: Grant Coaching Privileges & Unlock Coaching Tools

**Status:** Implemented on `feat/coach-privileges-access` (2026-09-25)  
**Date:** 2026-09-25  
**Audience:** Primary coding agent  
**Goal:** Let admins flip a user to coach (`User.isCoach = true`) and have that user immediately see and use Coaching tools (Athletes, Calendar, etc.) **without** already having athletes — fixing the current chicken-and-egg lockout.

---

## 1. Problem (what Nick hit)

1. Admin sets DB flags on a user: `isCoach = true`, optionally `coachProfileEnabled = true`.
2. User signs out and back in.
3. **Coaching suite still missing** (or only “My Coaches”).
4. Because they cannot open Athletes / invite flows, they never get athletes — and without athletes the suite stays hidden.

`coachProfileEnabled` is a red herring for this issue: it only gates **public** coach profile pages, not in-app Coaching nav/tools.

---

## 2. Root causes (two independent bugs)

### A. Session never exposes `isCoach`

**File:** `server/api/auth/[...].ts` → `callbacks.session`

Copies `isAdmin`, `role`, subscription fields, `deactivatedAt`, etc. onto `session.user`.

**Does not** set:

```ts
session.user.isCoach = user.isCoach || false
```

**Consumers that fail as a result:**

| Consumer                           | Behavior when session lacks `isCoach`          |
| ---------------------------------- | ---------------------------------------------- |
| `app/composables/useNavigation.ts` | `isCoach` is only true for admins              |
| `app/middleware/coach.ts`          | Redirects non-admins to `/dashboard`           |
| `app/pages/coaching/crm.vue`       | Uses `middleware: ['auth', 'coach']` → blocked |

Sign-out / sign-in cannot fix this until the session callback is updated. Database-only edits are invisible to the client.

Also update typings in `app/types/auth.d.ts` so `Session.user` / `User` include `isCoach: boolean`.

### B. Nav ignores `isCoach` and hides suite for “pure athletes”

**Files:**

- `app/components/navigation/useCoachingRole.ts` — `resolveCoachingRole`
- `app/layouts/default.vue` — builds Coaching nav from `showFullCoachingSuite`

**Current logic (CW-103):**

```ts
isCoachForAnyone = coachedAthletesCount > 0 || pendingCoachRequestsCount > 0
isPureAthlete = ownCoachesCount > 0 && !isCoachForAnyone
showFullCoachingSuite = !isPureAthlete
```

| User state                                                | Suite shown?               |
| --------------------------------------------------------- | -------------------------- |
| No coaches, no athletes (brand-new)                       | Yes                        |
| Has athletes or pending coach-requests                    | Yes                        |
| Has own coach(es), **zero** athletes / pending requests   | **No** — “My Coaches” only |
| `User.isCoach === true` but zero athletes + has own coach | **No** (flag ignored)      |

That last row is the chicken-and-egg: an athlete-turned-coach cannot reach **Athletes → invite/connect** to create the relationships the nav currently requires.

Most coaching pages themselves only use `middleware: 'auth'` (Overview, Athletes, Calendar, Team). The **sidebar** is what blocks discovery; CRM is additionally blocked by session `isCoach` (bug A).

---

## 3. Desired product behavior

1. **Admin grant:** Setting `User.isCoach = true` (and re-login / session refresh) is enough to unlock the full Coaching suite and coach-gated routes.
2. **Empty roster OK:** Coaches with zero athletes still see Overview / Athletes / Calendar / etc., so they can invite or connect athletes.
3. **Pure athletes unchanged:** Users with `isCoach === false`, who only have coaches of their own and no coaching of others, keep the simplified “My Coaches” nav (CW-103 intent preserved).
4. **`coachProfileEnabled`:** Remains optional for public coach pages; not required for in-app tools.
5. **Admins:** Continue to see coach tools via existing `isAdmin` paths.

---

## 4. Recommended fix (code)

### Phase 1 — Surface `isCoach` on the session (required)

**`server/api/auth/[...].ts`** — inside `session` callback, alongside `isAdmin`:

```ts
session.user.isAdmin = user.isAdmin || false
session.user.isCoach = user.isCoach || false
```

**`app/types/auth.d.ts`:**

```ts
interface Session {
  user: {
    id: string
    isAdmin: boolean
    isCoach: boolean
    // …
  } & DefaultSession['user']
}

interface User {
  isAdmin: boolean
  isCoach: boolean
  deactivatedAt: Date | null
}
```

**Verify:** Logged-in coach hits `GET /api/auth/session` → JSON includes `"isCoach": true`.

No JWT-strategy change needed if using the database adapter (session callback already receives the Prisma `user` row with all columns).

### Phase 2 — Honor `isCoach` in coaching nav (required)

Extend `resolveCoachingRole` so the **flag** unlocks the suite even with an empty roster:

```ts
export interface CoachingRoleSignals {
  coachedAthletesCount: number
  pendingCoachRequestsCount: number
  ownCoachesCount: number
  /** From session / User.isCoach (admins can be treated as true by caller). */
  isCoachFlag?: boolean
}

export function resolveCoachingRole(signals: CoachingRoleSignals): CoachingRoleResult {
  const isCoachForAnyone =
    signals.coachedAthletesCount > 0 ||
    signals.pendingCoachRequestsCount > 0 ||
    signals.isCoachFlag === true

  const isPureAthlete = signals.ownCoachesCount > 0 && !isCoachForAnyone

  return {
    isCoachForAnyone,
    isPureAthlete,
    showFullCoachingSuite: !isPureAthlete
  }
}
```

Wire in `useCoachingRole()`:

```ts
const { data: session } = useAuth()
const isCoachFlag = computed(
  () =>
    (session.value?.user as any)?.isCoach === true || (session.value?.user as any)?.isAdmin === true
)

// pass isCoachFlag: isCoachFlag.value into resolveCoachingRole
```

**Update unit tests** in `tests/unit/composables/useCoachingRole.test.ts`:

- New case: `ownCoachesCount: 1`, zero athletes/requests, `isCoachFlag: true` → `showFullCoachingSuite === true`.
- Existing pure-athlete case stays: same counts, `isCoachFlag` false/undefined → suite hidden.
- Existing brand-new / active-coach cases unchanged.

### Phase 3 — Ops / admin grant path (docs + optional script)

**Minimum DB grant (in-app tools):**

```sql
UPDATE "User"
SET "isCoach" = true
WHERE email = 'coach@example.com';
```

Or Prisma / admin UI equivalent. Re-login (or any full session refresh) after Phase 1 so the cookie session picks up the flag.

**Optional (public coach page only):**

```sql
UPDATE "User"
SET "coachProfileEnabled" = true,
    "coachProfileSlug" = 'their-slug'  -- if required by public routes
WHERE email = 'coach@example.com';
```

**Optional script** (mirror `scripts/make-admin.ts`):

```ts
// scripts/make-coach.ts
await prisma.user.update({
  where: { email: process.argv[2] },
  data: { isCoach: true }
})
```

Do **not** require seeding a fake `CoachingRelationship` just to unlock nav once Phase 2 lands.

### Phase 4 — Hardening (nice-to-have)

- Admin user detail UI: toggle “Is coach” that PATCHes `isCoach` (if an admin users API already exists, extend it).
- Ensure impersonation (`server/utils/session.ts`) copies `isCoach` from the **target** user when admins impersonate (today it mainly remaps identity + `isAdmin`).
- Audit other `isCoach` session consumers after Phase 1.

---

## 5. What not to do

- Do not tell coaches to “add an athlete first” as the only unlock — that is the bug.
- Do not use `coachProfileEnabled` as the in-app privilege gate.
- Do not set `role = ADMIN` / `isAdmin = true` just to unlock coaching.
- Do not invent OAuth `coaching:read` / `coaching:write` grants for browser sessions — `requireAuth` already treats sessions as full-scope; those scopes matter for OAuth tokens only.

---

## 6. Implementation order

| Step | Work                                                                        | Verify                                                           |
| ---- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1    | Session callback + auth typings for `isCoach`                               | `/api/auth/session` shows `isCoach: true` after grant + re-login |
| 2    | `resolveCoachingRole` + `useCoachingRole` honor flag; update unit tests     | Pure athlete with `isCoach` sees full Coaching nav               |
| 3    | Manual: grant `isCoach` on a user who has a coach and zero athletes         | Can open `/coaching/athletes`, create invite / connect           |
| 4    | Optional `scripts/make-coach.ts` + short ops note in this doc or admin docs |                                                                  |

---

## 7. Acceptance criteria

- [ ] DB `isCoach = true` → after re-login, session JSON includes `isCoach: true`.
- [ ] That user sees full Coaching nav (Overview, Calendar, Athletes, Analytics, My Coaches) even with **zero** athletes and even if they still have their own coach.
- [ ] User with `isCoach = false`, has own coach(es), no athletes → still only “My Coaches” (CW-103 preserved).
- [ ] Brand-new user (no relationships, `isCoach` false) still sees full suite (existing onboarding path).
- [ ] `/coaching/crm` (coach middleware) works for non-admin coaches.
- [ ] `coachProfileEnabled` alone does **not** unlock the suite.
- [ ] Unit tests for `resolveCoachingRole` cover the new flag case.

---

## 8. File checklist

**Must touch**

- `server/api/auth/[...].ts` — session callback
- `app/types/auth.d.ts` — `isCoach` on Session/User
- `app/components/navigation/useCoachingRole.ts` — signals + resolve + composable wiring
- `tests/unit/composables/useCoachingRole.test.ts`

**Likely touch**

- `scripts/make-coach.ts` (new, optional)
- `server/utils/session.ts` — impersonation / act-as should not strip coach flag incorrectly

**Read-only reference**

- `app/composables/useNavigation.ts`
- `app/middleware/coach.ts`
- `app/layouts/default.vue`
- `scripts/make-admin.ts`
- `tests/unit/composables/useCoachingRole.test.ts` (existing cases)

---

## 9. Interim workaround (until code ships)

Only useful as a temporary ops hack — **do not** treat as the product fix:

1. Set `isCoach = true` on the user.
2. Either remove their athlete-side coaching relationships so `ownCoachesCount === 0` (brand-new path shows suite), **or** insert a dummy ACTIVE `CoachingRelationship` where they are the coach.
3. They still **cannot** pass `middleware: 'coach'` / `useNavigation().isCoach` until Phase 1 lands (unless they are also admin).

Preferred path: implement Phases 1–2, then grant with a single `isCoach` flip.

---

## 10. One-paragraph brief for Linear / PR

> Coaching tools are gated by session `isCoach` (never copied in the auth session callback) and by CW-103 nav logic that hides the suite for users who have their own coach but no athletes. Granting `User.isCoach` therefore does nothing visible, and new coaches cannot reach Athletes to add a roster. Fix by surfacing `isCoach` on the session and treating that flag as sufficient for `showFullCoachingSuite`, while keeping pure athletes (`isCoach` false) on the simplified “My Coaches” nav.
