# Implementation Plan: FitForge AI MVP

**Branch**: `001-fitforge-mvp` | **Date**: 2026-07-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-fitforge-mvp/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

FitForge AI's MVP lets a user register/log in with Firebase Authentication, complete a
fitness profile, generate a personalized workout plan and a personalized meal plan through
Fetch.ai agents, and save/view/delete those plans from a personal dashboard. The frontend
(React/Vite) never talks to Firestore writes for plans or to the Fetch.ai agent layer
directly — the Express backend is the sole gateway, verifying Firebase ID tokens, calling the
Python uAgents over HTTP, and reading/writing Firestore with the Firebase Admin SDK.

## Technical Context

**Language/Version**: TypeScript (frontend & backend, Node.js 20 LTS), Python 3.11 (AI agents)

**Primary Dependencies**: React + Vite + Bootstrap 5 (frontend); Express.js + firebase-admin
(backend); uagents (Fetch.ai agent framework, Python)

**Storage**: Firebase Firestore (user profiles, saved plans); Firebase Authentication (identity)

**Testing**: Vitest + React Testing Library (frontend); Vitest + Supertest (backend contract/
integration tests); pytest (agent unit tests)

**Target Platform**: Web (modern evergreen browsers), backend deployed as a Node server,
agents deployed as long-running Python processes (local Bureau for MVP; Agentverse-hosted
optional later)

**Project Type**: Web application with an additional AI agent service (frontend + backend +
agents — three deployable units)

**Performance Goals**: 95% of workout/meal plan generations return within 30s (SC-002, SC-003);
dashboard plan lookup under 10s (SC-006); standard interactive web latency (<1s) for all
non-AI-generation pages (profile, dashboard list, login)

**Constraints**: Backend MUST be the only caller of the Fetch.ai agent layer (constitution
Principle IV, FR-014); all user-scoped Firestore access MUST go through a verified Firebase
ID token (constitution Principle III); no secrets in source control

**Scale/Scope**: Initial MVP launch scope — single-region deployment, no defined concurrent
user target beyond standard early-stage traffic (dozens to low hundreds of concurrent users);
5 core capabilities per spec.md (auth, profile, workout generation, meal generation, dashboard)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Simplicity & YAGNI | MVP scope excludes progress tracking, social, notifications, payments, wearables per spec.md; no speculative abstractions planned (single Express service, no microservices split beyond the agent layer already mandated by the constitution) | PASS |
| II. Observability & Logging | Backend routes and agent handlers will emit structured logs with a correlation id (request id passed backend→agent); errors surfaced with context, no empty catch blocks (see quickstart/tasks for logging middleware) | PASS |
| III. Security & Data Privacy | Firebase Authentication is the sole identity boundary; backend verifies ID tokens via firebase-admin on every request; Firestore Security Rules default-deny, scoped to `request.auth.uid`; secrets via environment variables only | PASS |
| IV. Modular Architecture & Separation of Concerns | Frontend → backend → {Firestore via Admin SDK, Fetch.ai agents via HTTP} is the only path; frontend uses Firebase client SDK only for auth state, not for plan/profile data | PASS |

No violations identified. Complexity Tracking table below is intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-fitforge-mvp/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── backend-api.md
│   └── agent-api.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/        # Login/register forms, profile form, plan cards, dashboard list
│   ├── pages/              # Login, Register, Profile, GenerateWorkout, GenerateMeal, Dashboard
│   ├── services/           # Firebase client init (auth only), backend API client
│   └── contexts/           # Auth context (current user, ID token)
└── tests/
    ├── integration/         # Page-level flows (register→profile→generate→save)
    └── unit/

backend/
├── src/
│   ├── models/              # TypeScript types for Profile, Plan
│   ├── services/            # Firestore access, Fetch.ai agent HTTP client
│   ├── api/                 # Express routes: auth-verify, profile, plans
│   └── middleware/           # Firebase ID token verification, request logging
└── tests/
    ├── contract/            # API request/response contract tests
    └── integration/          # Route → service → (mocked) agent/Firestore tests

agents/
├── src/
│   ├── workout_agent.py     # uAgent exposing a REST handler for workout generation
│   ├── meal_agent.py        # uAgent exposing a REST handler for meal generation
│   └── shared/               # Shared Pydantic request/response models
└── tests/
    └── unit/                # Per-agent generation logic tests
```

**Structure Decision**: Web application plus a separate AI agent service (three deployable
units), matching the constitution's four-layer architecture (frontend / backend / Firebase /
Fetch.ai agents — Firebase is a managed service, not a directory in this repo).
`frontend/` and `backend/` are conventional client/server projects; `agents/` is a standalone
Python service the backend calls over HTTP and that never talks to the frontend or Firestore
directly.

## Complexity Tracking

No constitution violations were identified during the Constitution Check above, so this
table is intentionally left empty.

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 (data-model.md, contracts/, quickstart.md) were generated.*

The design artifacts introduce no new services, layers, or cross-layer shortcuts beyond what
the initial Constitution Check assumed: `agents/` remains reachable only from `backend/`
(contracts/agent-api.md), all Firestore paths are scoped to `users/{uid}` (data-model.md), and
the quickstart's error-path validation (agent-down scenarios) confirms the observability and
error-surfacing requirements are exercised end-to-end. All four principles remain PASS; no
Complexity Tracking entries are needed.
