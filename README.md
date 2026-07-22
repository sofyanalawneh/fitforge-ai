# FitForge AI

An AI-powered fitness and nutrition platform. Users register, complete a fitness profile,
and generate personalized workout and meal plans via Fetch.ai agents, then save and manage
those plans from a personal dashboard.

See [specs/001-fitforge-mvp/spec.md](specs/001-fitforge-mvp/spec.md) for the full feature
specification, [plan.md](specs/001-fitforge-mvp/plan.md) for the technical design, and
[quickstart.md](specs/001-fitforge-mvp/quickstart.md) for end-to-end validation scenarios.

## Architecture

Three deployable units, per the project constitution's four-layer architecture
(`.specify/memory/constitution.md`):

- **`frontend/`** — React + TypeScript + Vite + Bootstrap 5. Talks to Firebase only for
  authentication; all profile/plan data goes through the backend.
- **`backend/`** — Node.js + Express + TypeScript. The sole gateway to Firestore (via the
  Firebase Admin SDK) and to the Fetch.ai agent layer.
- **`agents/`** — Python + `uagents`. Two agents (workout, meal) that generate plans,
  reachable only from the backend.

Firebase (Authentication + Firestore) is a managed service, not a directory in this repo.

## Prerequisites

- Node.js 20+ and npm
- Python 3.9+ and pip
- A Firebase project with the **email/password** Authentication provider and **Firestore**
  enabled (Firebase Console → Authentication → Sign-in method, and → Firestore Database).
  This one-time setup step must be done manually in the Firebase Console.
- (Optional, for local testing without a real Firebase project) the Firebase Emulator Suite:
  `npx firebase-tools emulators:start --only auth,firestore`

## Setup

Each project has its own `.env.example` — copy it to `.env` and fill in real values:

```bash
cp frontend/.env.example frontend/.env   # Firebase Web SDK config + backend URL
cp backend/.env.example backend/.env     # Firebase Admin credentials + agent URLs
cp agents/.env.example agents/.env       # Bureau port
```

Install dependencies:

```bash
cd frontend && npm install
cd ../backend && npm install
cd ../agents && python -m venv .venv && source .venv/Scripts/activate && pip install -r requirements.txt
```

## Run locally

Start all three in separate terminals (in this order — agents and backend before frontend):

```bash
# 1. Agents — runs both workout and meal agents behind one shared port (see agents/.env)
cd agents && source .venv/Scripts/activate && python -m src.bureau

# 2. Backend
cd backend && npm run dev

# 3. Frontend
cd frontend && npm run dev
```

Then open the frontend's dev server URL (typically http://localhost:5173).

## Quality gates

Per the project constitution's Development Workflow & Quality Gates, both `frontend/` and
`backend/` must pass before merging:

```bash
npm run lint
npm run typecheck
npm run build
```

## Notes on the AI agents

The workout and meal agents in this MVP use deterministic, template-based generation logic
(keyed off fitness goal, activity level, experience, and dietary preference) rather than a
call to a hosted LLM — this keeps the agent layer fully offline-runnable for local
development and testing. The `uagents` REST contract (`contracts/agent-api.md`) is the
integration point; swapping in a model-backed generator later does not require changing the
backend or frontend, only the agents' internal `_build_plan` implementations.
