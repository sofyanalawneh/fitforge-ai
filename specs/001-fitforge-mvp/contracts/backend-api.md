# Contract: Backend REST API (frontend ↔ backend)

All routes except registration/login require `Authorization: Bearer <Firebase ID token>`.
The backend verifies the token before handling the request (FR-003). Unauthenticated or
invalid-token requests return `401 Unauthorized`.

## Profile

### `GET /api/profile`

Returns the caller's fitness profile.

- **200**: `{ profile: FitnessProfile | null }` — `null` if not yet created (FR-005 not yet met)
- **401**: not authenticated

### `PUT /api/profile`

Creates or updates the caller's fitness profile (FR-006, FR-007).

- **Body**: `{ age, gender, heightCm, weightKg, fitnessGoal, activityLevel, dietaryPreferences, workoutExperience }`
- **200**: `{ profile: FitnessProfile }` (with `profileCompletedAt`/`updatedAt` set)
- **400**: `{ error, fields: { [field]: reason } }` — validation failure (FR-008)
- **401**: not authenticated

## Plan generation

### `POST /api/plans/workout/generate`

Generates a workout plan from the caller's current fitness profile (FR-009, FR-012, FR-014).
Does not persist anything.

- **200**: `{ type: "workout", content: WorkoutPlanContent }`
- **409**: `{ error: "profile_incomplete" }` — profile missing required fields (FR-011)
- **502**: `{ error: "agent_unavailable" }` — agent call failed or timed out (FR-015)
- **401**: not authenticated

### `POST /api/plans/meal/generate`

Generates a meal plan from the caller's current fitness profile (FR-010, FR-013, FR-014).
Does not persist anything.

- **200**: `{ type: "meal", content: MealPlanContent }`
- **409**: `{ error: "profile_incomplete" }`
- **502**: `{ error: "agent_unavailable" }`
- **401**: not authenticated

## Saved plans (dashboard)

### `POST /api/plans`

Persists a previously generated plan the user chose to save (FR-016, FR-017).

- **Body**: `{ type: "workout" | "meal", content: WorkoutPlanContent | MealPlanContent }`
- **201**: `{ plan: Plan }` (includes generated `planId`, `createdAt`, `profileSnapshot`)
- **401**: not authenticated

### `GET /api/plans`

Lists all of the caller's saved plans, most recent first (FR-018, FR-022).

- **200**: `{ plans: Plan[] }` — empty array if none saved yet
- **401**: not authenticated

### `GET /api/plans/:planId`

Returns full details of one saved plan (FR-019).

- **200**: `{ plan: Plan }`
- **404**: plan does not exist or does not belong to the caller
- **401**: not authenticated

### `DELETE /api/plans/:planId`

Deletes a saved plan (FR-020).

- **204**: no content
- **404**: plan does not exist or does not belong to the caller
- **401**: not authenticated

## Shared types referenced above

- `FitnessProfile`, `Plan` — see [../data-model.md](../data-model.md)
- `WorkoutPlanContent`, `MealPlanContent` — see
  [agent-api.md](./agent-api.md#response-content-shapes)
