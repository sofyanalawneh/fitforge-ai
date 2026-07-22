# Data Model: FitForge AI MVP

Derived from spec.md's Key Entities and Functional Requirements. Storage is Firebase
Firestore unless noted; identity fields come from Firebase Authentication.

## UserAccount

Not a Firestore document on its own — represented by the Firebase Authentication user record.
Referenced everywhere by `uid`.

| Field | Type | Notes |
|---|---|---|
| uid | string | Firebase Auth user id; primary key for all owned data |
| email | string | From Firebase Auth; unique per FR-004 (enforced by Firebase Auth itself) |

## FitnessProfile

**Path**: `users/{uid}` (profile fields stored directly on the user's root document)

| Field | Type | Required | Validation (FR-005, FR-008) |
|---|---|---|---|
| age | number | yes | integer, 13–100 |
| gender | string (enum) | yes | one of: `male`, `female`, `other`, `prefer_not_to_say` |
| heightCm | number | yes | 100–250 |
| weightKg | number | yes | 30–300 |
| fitnessGoal | string (enum) | yes | one of: `lose_weight`, `build_muscle`, `improve_endurance`, `general_fitness` |
| activityLevel | string (enum) | yes | one of: `sedentary`, `lightly_active`, `moderately_active`, `very_active` |
| dietaryPreferences | string (enum) | yes | one of: `none`, `vegetarian`, `vegan`, `other` |
| workoutExperience | string (enum) | yes | one of: `beginner`, `intermediate`, `advanced` |
| profileCompletedAt | timestamp | yes (system-set) | set when all required fields first present |
| updatedAt | timestamp | yes (system-set) | updated on every profile write |

**Relationships**: one `FitnessProfile` per `UserAccount` (1:1, embedded in the user document).

**State transitions**: `incomplete` → `complete` once every required field has a value
(gates FR-011, "block generation until profile complete"). `complete` → `complete` on any
subsequent edit (profile is always editable per FR-007; no separate draft state).

## Plan (Workout / Meal)

**Path**: `users/{uid}/plans/{planId}` — only written once a user explicitly saves a
generated plan (FR-016, FR-017). Generated-but-unsaved plans are never persisted here.

| Field | Type | Required | Notes |
|---|---|---|---|
| planId | string | yes | Firestore auto-id |
| type | string (enum) | yes | `workout` or `meal` |
| content | object | yes | Structured plan content returned by the agent (see contracts/) |
| profileSnapshot | object | yes | Copy of the FitnessProfile fields used at generation time (FR-012, FR-013, edge case: profile changes don't retroactively affect saved plans) |
| createdAt | timestamp | yes (system-set) | Set on save, used for dashboard ordering |

**Relationships**: many `Plan` documents per `UserAccount` (1:N); each `Plan` has exactly one
owning user (enforced by subcollection path + Security Rules).

**State transitions**:
- `generated` (transient, held only in frontend/backend memory during the request) →
  `saved` (persisted to Firestore) on explicit user save action (FR-016, FR-017).
- `generated` → `discarded` (nothing persisted) if the user navigates away without saving.
- `saved` → *(deleted)* when the user deletes it from the dashboard (FR-020); no soft-delete
  or trash state in the MVP.

## Agent Request / Response (internal, not persisted)

Exchanged between backend and the Fetch.ai agent layer only (constitution Principle IV,
FR-014); never stored as-is, only the resulting `content` is persisted if the user saves.

| Field | Type | Notes |
|---|---|---|
| requestId | string | Correlation id for logging (constitution Principle II) |
| profile | object | The FitnessProfile fields relevant to the requested plan type |
| planType | string (enum) | `workout` or `meal` |

Response mirrors this with a `content` object (agent-generated plan body) or an `error` object
on failure (FR-015).
