# Quickstart: FitForge AI MVP

Validates the MVP end-to-end against the acceptance scenarios in [spec.md](./spec.md).

## Prerequisites

- Node.js 20+ (developed/tested against Node 22), Python 3.9+ (developed/tested against 3.9;
  3.11 as planned works equally well — nothing in `agents/` is version-specific)
- A Firebase project with Authentication (email/password provider) and Firestore enabled —
  or the Firebase Emulator Suite for local-only testing (`npx firebase-tools emulators:start
  --only auth,firestore`, matching the `emulators` block in `firebase.json`)
- Environment variables (see each project's `.env.example`):
  - `backend`: Firebase Admin service account credentials, `WORKOUT_AGENT_URL`,
    `MEAL_AGENT_URL` (both point at the same Bureau port with different paths — see
    contracts/agent-api.md)
  - `frontend`: Firebase Web SDK config (API key, project id, etc.), `VITE_API_BASE_URL`
  - `agents`: `BUREAU_PORT` (defaults to 8000)

## Run locally

```bash
# 1. Agents (starts both workout and meal agents behind one shared Bureau port)
cd agents && python -m venv .venv && source .venv/Scripts/activate && pip install -r requirements.txt && python -m src.bureau

# 2. Backend
cd backend && npm install && npm run dev

# 3. Frontend
cd frontend && npm install && npm run dev
```

## Validation scenarios

Each scenario below maps to acceptance scenarios in spec.md's User Stories.

### 1. Register, log in, complete profile (US1)

1. Open the frontend, register with a new email/password.
2. Confirm you land on the dashboard signed in (empty state, per FR-022).
3. Navigate to the profile form, submit all required fields.
4. Refresh the page — confirm the profile values persist (FR-006, FR-007).
5. Try registering again with the same email — confirm a clear rejection (FR-004).

### 2. Generate a workout plan (US2)

1. As a user with a completed profile, request a workout plan.
2. Confirm a plan appears for review within 30s (SC-002), reflecting the profile's fitness
   goal, activity level, and workout experience (FR-012).
3. Stop the workout agent process and repeat the request — confirm a clear error with a
   retry option (FR-015), then restart the agent.
4. Generate a plan, navigate away without saving, then check the dashboard — confirm it does
   not appear (FR-017, edge case).

### 3. Generate a meal plan (US3)

1. Set a specific dietary preference on the profile (e.g., `vegetarian`).
2. Request a meal plan; confirm the result reflects that preference (FR-013).
3. Repeat the agent-down scenario from above for the meal agent.

### 4. Save and manage plans from the dashboard (US4)

1. Generate a workout plan and a meal plan; save both.
2. Open the dashboard — confirm both appear, clearly labeled by type (FR-018).
3. Open one saved plan and confirm full details render (FR-019).
4. Delete a saved plan and confirm it disappears from the dashboard (FR-020).
5. Log out and back in (or open a second browser session) — confirm the remaining saved
   plan(s) are still visible (FR-021, SC-004).

### 5. Access control

1. While signed out, attempt to open the profile form, a plan generation page, or the
   dashboard directly by URL — confirm each redirects to sign-in (FR-003).

## Contract references

- Backend REST API: [contracts/backend-api.md](./contracts/backend-api.md)
- Backend ↔ agent API: [contracts/agent-api.md](./contracts/agent-api.md)
- Data shapes: [data-model.md](./data-model.md)

## Validation results (T053)

Executed during implementation against the Firebase Emulator Suite (Auth + Firestore) and
the real `agents/` Bureau process (both agents, real HTTP calls, no mocks), driving the same
backend REST endpoints the frontend calls. Frontend pages were built and typechecked/built
successfully but not click-tested in an actual browser in this environment (no browser
available here) — everything below is API/agent-level, which exercises the identical
request path the frontend's `apiClient`/`authService` code takes.

| # | Scenario | Result |
|---|---|---|
| 1 | Register (Auth emulator `accounts:signUp`) | ✅ account created, ID token issued |
| 1 | Duplicate email registration | ✅ emulator returns `EMAIL_EXISTS` (maps to Firebase Web SDK's `auth/email-already-in-use`, handled by FR-004) |
| 1 | Unauthenticated request to a protected route | ✅ `401 unauthenticated` |
| 1 | `GET`/`PUT /api/profile` | ✅ empty profile returns `null`; valid submission persists and round-trips correctly via Firestore emulator |
| 2 | `POST /api/plans/workout/generate` (profile complete) | ✅ tailored plan returned (verified goal/experience reflected in content) |
| 2 | Workout generation with incomplete profile | ✅ `409 profile_incomplete` |
| 2 | Workout agent down | ✅ `502 agent_unavailable` (no hang, no unhandled rejection) |
| 3 | `POST /api/plans/meal/generate` with `vegan` preference | ✅ plan content reflects the vegan substitution and note |
| 4 | `POST /api/plans` (save), `GET /api/plans` (list) | ✅ saved plan appears in list with correct type/content |
| 4 | `GET /api/plans/:planId` | ✅ full detail returned |
| 4 | `DELETE /api/plans/:planId` | ✅ `204`, subsequent list is empty |
| — | Frontend typecheck/build/lint | ✅ all three clean (see repo root `README.md` Quality Gates) |
| — | Backend typecheck/build/lint | ✅ all three clean |
| — | Agent Python files | ✅ `py_compile` clean; both agents importable and running under the Bureau |

**Not executed** (require a real browser or a provisioned, non-emulator Firebase project):
manual click-through of the React UI; cross-device/cross-session dashboard check (SC-004) —
covered logically by Firestore persistence being verified directly.
