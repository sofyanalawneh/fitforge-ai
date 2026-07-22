---

description: "Task list for FitForge AI MVP"
---

# Tasks: FitForge AI MVP

**Input**: Design documents from `specs/001-fitforge-mvp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not included — the specification does not request tests and the constitution does
not mandate Test-First for this project, so test-writing tasks are omitted per the task
generation rules. Testing frameworks were still selected in `research.md`
(Vitest/RTL, Vitest/Supertest, pytest) for whenever tests are added later.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths are included in every description

## Path Conventions

Per plan.md's Project Structure: `frontend/src/`, `backend/src/`, `agents/src/` — a web
application plus a separate Python agent service, with Firebase project config
(`firestore.rules`, `firebase.json`) at the repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create repository top-level structure (`frontend/`, `backend/`, `agents/`) per plan.md's Project Structure
- [X] T002 [P] Initialize frontend project (React + Vite + TypeScript) with Bootstrap 5 dependency in `frontend/`, with `strict: true` enabled in `frontend/tsconfig.json` per constitution Development Workflow & Quality Gates
- [X] T003 [P] Initialize backend project (Node.js + Express + TypeScript) in `backend/`, with `strict: true` enabled in `backend/tsconfig.json` per constitution Development Workflow & Quality Gates
- [X] T004 [P] Initialize agents project (Python + `uagents`, `requirements.txt`) in `agents/`
- [X] T005 [P] Configure ESLint + Prettier for the frontend in `frontend/.eslintrc.cjs` and `frontend/.prettierrc`, and add a `typecheck` script (`tsc --noEmit`) to `frontend/package.json` that CI/pre-merge MUST run per constitution Development Workflow & Quality Gates
- [X] T006 [P] Configure ESLint + Prettier for the backend in `backend/.eslintrc.cjs` and `backend/.prettierrc`, and add a `typecheck` script (`tsc --noEmit`) to `backend/package.json` that CI/pre-merge MUST run per constitution Development Workflow & Quality Gates
- [X] T007 [P] Add `.env.example` files documenting required environment variables in `frontend/.env.example`, `backend/.env.example`, `agents/.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Configure the Firebase project (enable email/password Authentication provider, enable Firestore) and add `firebase.json` at the repository root — `firebase.json` created; enabling the Auth provider and Firestore itself is a one-time manual step in the Firebase Console (external account action, documented in quickstart.md) that cannot be performed from this environment
- [X] T009 Write Firestore Security Rules (default-deny; `users/{uid}` and `users/{uid}/plans/{planId}` readable/writable only when `request.auth.uid == uid`, per constitution Principle III) in `firestore.rules`
- [X] T010 [P] Initialize Firebase Admin SDK config/loader (reads service account credentials from environment) in `backend/src/config/firebase.ts`
- [X] T011 [P] Initialize Firebase Web SDK client (Auth only) in `frontend/src/services/firebase.ts`
- [X] T012 Implement Firebase ID token verification middleware (rejects missing/invalid tokens with 401) in `backend/src/middleware/auth.ts` (depends on T010)
- [X] T013 [P] Implement structured request-logging middleware with a correlation/request id, per constitution Principle II, in `backend/src/middleware/logging.ts`
- [X] T014 [P] Define shared TypeScript types for `FitnessProfile` and `Plan` (per data-model.md) in `backend/src/models/types.ts`
- [X] T015 [P] Define shared Pydantic request/response models for agent generation (per contracts/agent-api.md) in `agents/src/shared/models.py`
- [X] T016 [P] Implement Auth context/provider (current user, ID token) in `frontend/src/contexts/AuthContext.tsx` (depends on T011)
- [X] T017 [P] Implement backend API client wrapper that attaches the `Authorization: Bearer <idToken>` header in `frontend/src/services/apiClient.ts`
- [X] T018 Implement the Fetch.ai agent HTTP client helper (calls `WORKOUT_AGENT_URL`/`MEAL_AGENT_URL`, per contracts/agent-api.md, tags each call with a request id per constitution Principle II, and enforces a 30s request timeout that aborts and surfaces as an agent-unavailable failure so slow-but-not-down agents still meet SC-002/SC-003) in `backend/src/services/agentClient.ts`
- [X] T019 Set up the agents `Bureau` entrypoint (process that will host both agents) in `agents/src/bureau.py`
- [X] T020 Implement `profileService` (Firestore read/write at `users/{uid}`, per data-model.md) in `backend/src/services/profileService.ts` (depends on T010, T014) — shared by User Story 1 (profile CRUD) and User Stories 2/3 (profile-completeness gate, FR-011), so it lives here rather than inside a single story

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Register, Log In, and Complete Fitness Profile (Priority: P1) 🎯 MVP

**Goal**: A visitor can create an account, log in, and complete a fitness profile that
persists across sessions.

**Independent Test**: Register a new account, log in, complete the profile form, refresh and
confirm the profile persists; attempt registration with a duplicate email and confirm
rejection.

### Implementation for User Story 1

- [X] T021 [P] [US1] Build the Register page (email/password form) in `frontend/src/pages/Register.tsx`
- [X] T022 [P] [US1] Build the Login page (email/password form) in `frontend/src/pages/Login.tsx`
- [X] T023 [US1] Implement register/login/logout calls against Firebase Authentication in `frontend/src/services/authService.ts` (depends on T011)
- [X] T024 [US1] Implement a route guard that redirects unauthenticated visitors to sign-in (FR-003) in `frontend/src/components/RequireAuth.tsx` (depends on T016)
- [X] T025 [US1] Add duplicate-email error handling and a clear error message on the Register page (FR-004) in `frontend/src/pages/Register.tsx` (depends on T021, T023)
- [X] T026 [P] [US1] Build the Fitness Profile form (age, gender, height, weight, fitness goal, activity level, dietary preferences, workout experience) in `frontend/src/pages/Profile.tsx`
- [X] T027 [US1] Implement `GET /api/profile` route (per contracts/backend-api.md) in `backend/src/api/profile.ts` (depends on T012, T020)
- [X] T028 [US1] Implement `PUT /api/profile` route with input validation (FR-008: age/height/weight range checks) in `backend/src/api/profile.ts` (depends on T020, T027)
- [X] T029 [US1] Wire the Profile page to `GET`/`PUT /api/profile` via the API client in `frontend/src/pages/Profile.tsx` (depends on T026, T017, T028)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Generate a Personalized Workout Plan (Priority: P1)

**Goal**: A user with a completed fitness profile can request a workout plan tailored to
their goal, activity level, and experience.

**Independent Test**: Complete a profile, request a workout plan, confirm the returned plan
reflects the profile; stop the workout agent and confirm a clear error with retry.

### Implementation for User Story 2

- [X] T030 [P] [US2] Implement the workout agent's REST handler (`@agent.on_rest_post("/workout/generate", ...)` — a shared Bureau port means paths, not ports, disambiguate agents; per contracts/agent-api.md) in `agents/src/workout_agent.py` (depends on T015)
- [X] T031 [US2] Register the workout agent with the Bureau in `agents/src/bureau.py` (depends on T030, T019)
- [X] T032 [US2] Implement `POST /api/plans/workout/generate` (blocks on incomplete profile per FR-011, calls the agent via `agentClient`, maps agent failure/timeout to `502 agent_unavailable` per FR-015) in `backend/src/api/plans.ts` (depends on T018, T020, T012)
- [X] T033 [P] [US2] Build the Generate Workout page with review/loading/error/retry states in `frontend/src/pages/GenerateWorkout.tsx`
- [X] T034 [US2] Wire the Generate Workout page to `POST /api/plans/workout/generate` via the API client in `frontend/src/pages/GenerateWorkout.tsx` (depends on T033, T017, T032)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Generate a Personalized Meal Plan (Priority: P2)

**Goal**: A user with a completed fitness profile can request a meal plan tailored to their
goal and dietary preferences.

**Independent Test**: Set a specific dietary preference, request a meal plan, confirm the
result respects it; stop the meal agent and confirm a clear error with retry.

### Implementation for User Story 3

- [X] T035 [P] [US3] Implement the meal agent's REST handler (`@agent.on_rest_post("/meal/generate", ...)`, per contracts/agent-api.md) in `agents/src/meal_agent.py` (depends on T015)
- [X] T036 [US3] Register the meal agent with the Bureau in `agents/src/bureau.py` (depends on T035, T019)
- [X] T037 [US3] Implement `POST /api/plans/meal/generate` (same pattern as workout generation: profile-complete check, agent call, error mapping) in `backend/src/api/plans.ts` (depends on T018, T020, T012, T032 — same file, applied after workout generation route)
- [X] T038 [P] [US3] Build the Generate Meal page with review/loading/error/retry states in `frontend/src/pages/GenerateMeal.tsx`
- [X] T039 [US3] Wire the Generate Meal page to `POST /api/plans/meal/generate` via the API client in `frontend/src/pages/GenerateMeal.tsx` (depends on T038, T017, T037)

**Checkpoint**: All three of User Stories 1, 2, and 3 should now work independently

---

## Phase 6: User Story 4 - View, Save, and Manage Plans from a Dashboard (Priority: P2)

**Goal**: A user can save a generated plan, view all saved plans on a dashboard, open one for
full detail, and delete it — with saved plans persisting across sessions and devices.

**Independent Test**: Generate a workout or meal plan, save it, navigate to the dashboard,
confirm it appears labeled by type, open it, delete it, and confirm it disappears.

### Implementation for User Story 4

- [X] T040 [US4] Implement `planService` (create/list/get/delete under `users/{uid}/plans`, per data-model.md) in `backend/src/services/planService.ts` (depends on T010, T014)
- [X] T041 [US4] Implement `POST /api/plans` (save a generated plan, FR-016/FR-017) in `backend/src/api/plans.ts` (depends on T040, T012, T037 — same file, applied after generation routes)
- [X] T042 [US4] Implement `GET /api/plans` (list saved plans, most recent first, FR-018/FR-022) in `backend/src/api/plans.ts` (depends on T041)
- [X] T043 [US4] Implement `GET /api/plans/:planId` (full plan detail, FR-019) in `backend/src/api/plans.ts` (depends on T041)
- [X] T044 [US4] Implement `DELETE /api/plans/:planId` (FR-020) in `backend/src/api/plans.ts` (depends on T041)
- [X] T045 [P] [US4] Add a "Save Plan" action to the Generate Workout review screen in `frontend/src/pages/GenerateWorkout.tsx` (depends on T034, T041)
- [X] T046 [P] [US4] Add a "Save Plan" action to the Generate Meal review screen in `frontend/src/pages/GenerateMeal.tsx` (depends on T039, T041)
- [X] T047 [P] [US4] Build the Dashboard page listing saved plans with type labels and an empty state (FR-022) in `frontend/src/pages/Dashboard.tsx` (depends on T042, T017)
- [X] T048 [US4] Build the Plan Detail view for opening a saved plan in `frontend/src/pages/PlanDetail.tsx` (depends on T043, T017)
- [X] T049 [US4] Add a delete action to the Dashboard/Plan Detail views in `frontend/src/pages/Dashboard.tsx` (depends on T044, T047)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T050 [P] Add structured logging (entry, error, correlation id) across all backend routes and middleware, per constitution Principle II, in `backend/src/` — also added an `asyncHandler` wrapper + final `errorHandler` middleware after testing revealed unhandled promise rejections would otherwise hang requests
- [X] T051 [P] Add structured logging in both agents' REST handlers in `agents/src/workout_agent.py` and `agents/src/meal_agent.py`
- [X] T052 [P] Write a README with setup and run instructions for `frontend/`, `backend/`, and `agents/`
- [X] T053 Run the quickstart.md validation scenarios end-to-end and record the results — see quickstart.md's "Validation results (T053)" section

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories. Includes
  `profileService` (T020), since both US1 (profile CRUD) and US2/US3 (profile-completeness
  gate) depend on it — it is shared infrastructure, not owned by a single story.
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (P1) and US2 (P1) have no dependency on each other and can proceed in parallel
  - US3 (P2) reuses the `agentClient` from Foundational and the `backend/src/api/plans.ts` file
    started in US2 — implement after US2 to avoid file conflicts
  - US4 (P2) reuses `backend/src/api/plans.ts` (started in US2/US3) and the review screens
    built in US2/US3 — implement after US2 and US3
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Shares `backend/src/api/plans.ts` with US2, so implement sequentially after US2 despite being logically independent
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on US2/US3's generation routes and review screens existing to attach save/dashboard/delete behavior to

### Within Each User Story

- Models/services before routes; routes before frontend wiring
- Story complete before moving to next priority (or run US1/US2 in parallel per above)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T007)
- All Foundational tasks marked [P] can run in parallel (T010, T011, T013, T014, T015, T016, T017); T020 depends on T010/T014 so it runs after those complete
- Once Foundational completes, US1 and US2 can proceed in parallel (fully independent — both only depend on Foundational, not on each other)
- Within US1: T021, T022, T026 (different files) can run in parallel
- Within US2/US3: the agent handler (T030/T035) and the frontend review page (T033/T038) can run in parallel
- Within US4: T045, T046, T047 (different files) can run in parallel
- All Polish tasks marked [P] can run in parallel (T050-T052)

---

## Parallel Example: User Story 1

```bash
# Launch independent User Story 1 file creation together:
Task: "Build the Register page in frontend/src/pages/Register.tsx"
Task: "Build the Login page in frontend/src/pages/Login.tsx"
Task: "Build the Fitness Profile form in frontend/src/pages/Profile.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (auth + profile) and Phase 4: User Story 2 (workout plan
   generation) — these can be built in parallel since neither depends on the other
4. **STOP and VALIDATE**: Together, US1 + US2 deliver the core AI value proposition — a user
   can sign up, describe themselves, and get a personalized workout plan. US1 alone is
   independently testable but does not yet demonstrate the product's core value, so treat
   US1 + US2 as the true MVP walking skeleton.
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently (account + profile persistence)
3. Add User Story 2 → Test independently → Deploy/Demo (MVP!)
4. Add User Story 3 → Test independently (meal plan generation)
5. Add User Story 4 → Test independently (save/dashboard/delete) → Deploy/Demo (full MVP scope)
6. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No test tasks are included (see Tests note at top) — add contract/integration/unit test
  tasks before implementation in each phase if TDD is adopted later
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- `backend/src/api/plans.ts` is shared across US2, US3, and US4 — those tasks are ordered
  sequentially even though the stories are otherwise independent, to avoid same-file conflicts
- `profileService` (T020) lives in the Foundational phase because both US1 and the
  US2/US3 profile-completeness gate depend on it — keeping it there (rather than inside a
  single story) is what makes the US1/US2 parallel-build claim above actually true
